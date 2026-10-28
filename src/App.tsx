import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { HeroLanding } from './components/HeroLanding';
import { ExploreGrid } from './components/ExploreGrid';
import { MultiMatchView } from './components/MultiMatchView';
import { ComparisonView } from './components/ComparisonView';
import { AppointmentModal } from './components/AppointmentModal';
import { ReserveModal } from './components/ReserveModal';
import { OrdersView } from './components/OrdersView';
import { StudioView } from './components/StudioView';
import { AnalyticsView } from './components/AnalyticsView';
import { CodeViewerModal } from './components/CodeViewerModal';

import {
  INITIAL_BUSINESSES,
  INITIAL_PRODUCTS,
  INITIAL_SERVICES,
  INITIAL_SLOTS,
  SRINAGAR_AREAS,
} from './data/mockData';
import { Business, Product, Appointment, Reservation, AppointmentSlot } from './types';
import { haversineDistance, evaluateOpeningHours } from './utils/engine';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [userArea, setUserArea] = useState<string>('Lal Chowk');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [comparisonIds, setComparisonIds] = useState<number[]>([]);

  // Persistent-like in-memory state for appointments, reservations, products, and slots
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [slots, setSlots] = useState<AppointmentSlot[]>(INITIAL_SLOTS);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'apt-seed-1',
      bookingReference: 'CC-APT-901B34',
      businessId: 9,
      businessName: 'Velvet Chinar Grooming Lounge',
      serviceId: 1,
      serviceName: 'Royal Beard Sculpt & Hot Towel Shave',
      slotId: 1,
      customerName: 'Aadil Hussain',
      customerPhone: '+91 94190 11001',
      customerEmail: 'aadil.hussain@demo.local',
      bookingDate: '2026-10-29',
      bookingTime: '10:00',
      price: 450,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'res-seed-1',
      reservationCode: 'CC-RES-88A12F',
      businessId: 1,
      businessName: 'Kashmir Chrono Studio',
      productId: 1,
      productName: 'Classic Automatic Heritage Watch',
      quantity: 1,
      unitPrice: 8500,
      totalPrice: 8500,
      customerName: 'Zubair Ahmad',
      customerPhone: '+91 94190 11002',
      customerEmail: 'zubair.ahmad@demo.local',
      fulfillmentType: 'Pickup',
      paymentPreference: 'Pay at Pickup',
      status: 'Confirmed',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    },
  ]);

  // Modal active states
  const [bookingBiz, setBookingBiz] = useState<Business | null>(null);
  const [reservingProd, setReservingProd] = useState<Product | null>(null);

  // Compute enriched businesses based on selected user location
  const enrichedBusinesses = useMemo(() => {
    const refCoords = SRINAGAR_AREAS[userArea] || SRINAGAR_AREAS['Lal Chowk'];
    return INITIAL_BUSINESSES.map((b) => {
      const dist = haversineDistance(refCoords.lat, refCoords.lon, b.latitude, b.longitude);
      const hoursStatus = evaluateOpeningHours(b);
      return {
        ...b,
        distanceKm: dist,
        isOpenNow: hoursStatus.isOpen,
        openStatusText: hoursStatus.statusText,
      };
    });
  }, [userArea]);

  // Comparison toggle
  const handleToggleCompare = (id: number) => {
    if (comparisonIds.includes(id)) {
      setComparisonIds(comparisonIds.filter((item) => item !== id));
    } else {
      if (comparisonIds.length >= 4) {
        alert('You can compare a maximum of 4 businesses simultaneously.');
        return;
      }
      setComparisonIds([...comparisonIds, id]);
    }
  };

  const handleRemoveCompare = (id: number) => {
    setComparisonIds(comparisonIds.filter((item) => item !== id));
  };

  const handleClearCompare = () => {
    setComparisonIds([]);
  };

  // SlotGuard Appointment Booking
  const handleConfirmBooking = (bookingData: {
    serviceId: number;
    serviceName: string;
    slotId: number;
    date: string;
    time: string;
    price: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) => {
    // SlotGuard check: check if slot is already booked
    const targetSlot = slots.find((s) => s.id === bookingData.slotId);
    if (!targetSlot || targetSlot.isBooked) {
      return {
        success: false,
        message: 'This slot is no longer available. SlotGuard prevented double booking.',
      };
    }

    // Atomic update
    setSlots((prev) =>
      prev.map((s) => (s.id === bookingData.slotId ? { ...s, isBooked: true } : s))
    );

    const refCode = `CC-APT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      bookingReference: refCode,
      businessId: bookingBiz!.id,
      businessName: bookingBiz!.name,
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      slotId: bookingData.slotId,
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerEmail: bookingData.customerEmail,
      bookingDate: bookingData.date,
      bookingTime: bookingData.time,
      price: bookingData.price,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    return {
      success: true,
      message: 'Your slot has been secured with zero conflict.',
      refCode,
    };
  };

  const handleCancelAppointment = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    // Free slot
    setSlots((prev) =>
      prev.map((s) => (s.id === apt.slotId ? { ...s, isBooked: false } : s))
    );

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Cancelled' } : a))
    );
  };

  // ReserveNow Pre-booking
  const handleConfirmReservation = (resData: {
    productId: number;
    quantity: number;
    fulfillmentType: 'Pickup' | 'Delivery';
    paymentPreference: 'Pay at Pickup' | 'Demo Paid' | 'Pending COD';
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) => {
    const targetProd = products.find((p) => p.id === resData.productId);
    if (!targetProd) return { success: false, message: 'Product not found.' };

    const avail = targetProd.stock - targetProd.reservedStock;
    if (avail < resData.quantity) {
      return {
        success: false,
        message: `Insufficient inventory. Only ${avail} items available.`,
      };
    }

    // Lock stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === resData.productId
          ? { ...p, reservedStock: p.reservedStock + resData.quantity }
          : p
      )
    );

    const resCode = `CC-RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      reservationCode: resCode,
      businessId: targetProd.businessId,
      businessName: targetProd.businessName || 'Local Merchant',
      productId: targetProd.id,
      productName: targetProd.name,
      quantity: resData.quantity,
      unitPrice: targetProd.price,
      totalPrice: targetProd.price * resData.quantity,
      customerName: resData.customerName,
      customerPhone: resData.customerPhone,
      customerEmail: resData.customerEmail,
      fulfillmentType: resData.fulfillmentType,
      paymentPreference: resData.paymentPreference,
      status: 'Confirmed',
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newReservation, ...prev]);
    return {
      success: true,
      message: 'Reserved successfully! Stock is held exclusively for you.',
      resCode,
    };
  };

  const handleCancelReservation = (id: string) => {
    const res = reservations.find((r) => r.id === id);
    if (!res) return;

    // Restore reserved stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === res.productId
          ? { ...p, reservedStock: Math.max(0, p.reservedStock - res.quantity) }
          : p
      )
    );

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Cancelled' } : r))
    );
  };

  // Studio handlers
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const p: Product = {
      ...newProd,
      id: Date.now(),
    };
    setProducts((prev) => [p, ...prev]);
  };

  const handleUpdateStock = (productId: number, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(p.reservedStock, p.stock + delta) } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8E8D0] text-[#4A3024] flex flex-col font-sans">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userArea={userArea}
        setUserArea={setUserArea}
        compareCount={comparisonIds.length}
      />

      <main className="flex-1">
        {currentTab === 'home' && (
          <HeroLanding
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={(q) => {
              setSearchQuery(q);
              setCurrentTab('explore');
            }}
            products={products}
            onSelectProduct={(p) => setReservingProd(p)}
            onExploreAll={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'explore' && (
          <ExploreGrid
            businesses={enrichedBusinesses}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            userArea={userArea}
            comparisonIds={comparisonIds}
            onToggleCompare={handleToggleCompare}
            onBookAppointment={(b) => setBookingBiz(b)}
            onReserveProduct={(b) => {
              const bProd = products.find((p) => p.businessId === b.id) || products[0];
              setReservingProd(bProd);
            }}
          />
        )}

        {currentTab === 'multimatch' && (
          <MultiMatchView
            businesses={enrichedBusinesses}
            userArea={userArea}
            comparisonIds={comparisonIds}
            onToggleCompare={handleToggleCompare}
            onBookAppointment={(b) => setBookingBiz(b)}
            onReserveProduct={(b) => {
              const bProd = products.find((p) => p.businessId === b.id) || products[0];
              setReservingProd(bProd);
            }}
          />
        )}

        {currentTab === 'compare' && (
          <ComparisonView
            comparisonBusinesses={enrichedBusinesses.filter((b) => comparisonIds.includes(b.id))}
            onRemoveFromCompare={handleRemoveCompare}
            onClearAll={handleClearCompare}
            onExploreMore={() => setCurrentTab('explore')}
            onBookAppointment={(b) => setBookingBiz(b)}
            onReserveProduct={(b) => {
              const bProd = products.find((p) => p.businessId === b.id) || products[0];
              setReservingProd(bProd);
            }}
          />
        )}

        {currentTab === 'appointments' && (
          <div className="py-8">
            <ExploreGrid
              businesses={enrichedBusinesses.filter(
                (b) => b.category === 'Salons' || b.category === 'Clinics' || b.category === 'Tutors'
              )}
              selectedCategory="All"
              setSelectedCategory={() => {}}
              searchQuery=""
              setSearchQuery={() => {}}
              userArea={userArea}
              comparisonIds={comparisonIds}
              onToggleCompare={handleToggleCompare}
              onBookAppointment={(b) => setBookingBiz(b)}
              onReserveProduct={() => {}}
            />
          </div>
        )}

        {currentTab === 'orders' && (
          <OrdersView
            appointments={appointments}
            reservations={reservations}
            onCancelAppointment={handleCancelAppointment}
            onCancelReservation={handleCancelReservation}
            onExploreMore={() => setCurrentTab('explore')}
          />
        )}

        {currentTab === 'studio' && (
          <StudioView
            businesses={enrichedBusinesses}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            businesses={enrichedBusinesses}
            products={products}
            appointments={appointments}
            reservations={reservations}
          />
        )}

        {currentTab === 'codebase' && <CodeViewerModal />}
      </main>

      {/* Appointment Booking Modal */}
      {bookingBiz && (
        <AppointmentModal
          business={bookingBiz}
          services={INITIAL_SERVICES.filter((s) => s.businessId === bookingBiz.id)}
          availableSlots={slots.filter((s) => s.businessId === bookingBiz.id && !s.isBooked)}
          onClose={() => setBookingBiz(null)}
          onConfirmBooking={handleConfirmBooking}
        />
      )}

      {/* Reserve Product Modal */}
      {reservingProd && (
        <ReserveModal
          product={reservingProd}
          onClose={() => setReservingProd(null)}
          onConfirmReservation={handleConfirmReservation}
        />
      )}

      {/* Botanical Footer */}
      <footer className="bg-[#FFFDF8] border-t border-[#D7C4AF] py-8 text-center text-xs text-[#80503A]">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="font-serif text-base font-bold text-[#4A3024]">CustomerConnect</div>
          <p>Intelligent Local Business Discovery, Comparison, Booking & Commerce Platform</p>
          <p className="text-[11px] text-[#80503A]/70">
            Developed for B.Tech AI & Data Science Capstone · Demo Simulation with Zero Real Payments
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
