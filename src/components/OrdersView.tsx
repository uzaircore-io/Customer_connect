import React from 'react';
import { Calendar, ShoppingBag, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { Appointment, Reservation } from '../types';

interface OrdersViewProps {
  appointments: Appointment[];
  reservations: Reservation[];
  onCancelAppointment: (id: string) => void;
  onCancelReservation: (id: string) => void;
  onExploreMore: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  appointments,
  reservations,
  onCancelAppointment,
  onCancelReservation,
  onExploreMore,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onExploreMore}
            className="inline-flex items-center gap-1 text-xs text-[#80503A] hover:text-[#BF7149] mb-2 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </button>
          <h1 className="font-serif text-3xl font-bold text-[#4A3024]">
            My Orders, Reservations & Appointments
          </h1>
          <p className="text-xs text-[#80503A]">
            Real-time tracking of SlotGuard bookings and ReserveNow locked inventory
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Booked Appointments */}
        <div>
          <h2 className="font-serif text-xl font-bold text-[#4A3024] mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#BF7149]" />
            Confirmed Appointments ({appointments.length})
          </h2>

          {appointments.length === 0 ? (
            <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-6 text-center text-xs text-[#80503A]">
              No active appointments. Book a salon slot, clinical consult, or tutoring session.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-[#BF7149]">
                        {apt.bookingReference}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          apt.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#4A3024] mb-1">
                      {apt.serviceName}
                    </h3>
                    <p className="text-xs text-[#80503A] mb-2">{apt.businessName}</p>

                    <div className="text-xs text-[#4A3024] bg-[#F8E8D0]/50 p-2.5 rounded-xl border border-[#D7C4AF]/50 space-y-1 mb-3">
                      <div>
                        📅 <strong>Date:</strong> {apt.bookingDate} at {apt.bookingTime}
                      </div>
                      <div>
                        👤 <strong>Guest:</strong> {apt.customerName} ({apt.customerPhone})
                      </div>
                      <div>
                        💰 <strong>Price:</strong> ₹{apt.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {apt.status === 'Confirmed' && (
                    <button
                      onClick={() => onCancelAppointment(apt.id)}
                      className="w-full py-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancel Appointment & Free Slot
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Reservations */}
        <div>
          <h2 className="font-serif text-xl font-bold text-[#4A3024] mb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#BF7149]" />
            ReserveNow Pre-Bookings & Orders ({reservations.length})
          </h2>

          {reservations.length === 0 ? (
            <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-6 text-center text-xs text-[#80503A]">
              No active reservations. Reserve a watch, pashmina, or gadget before visiting the shop.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs font-bold text-[#BF7149]">
                        {res.reservationCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          res.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#4A3024] mb-1">
                      {res.productName}
                    </h3>
                    <p className="text-xs text-[#80503A] mb-2">{res.businessName}</p>

                    <div className="text-xs text-[#4A3024] bg-[#F8E8D0]/50 p-2.5 rounded-xl border border-[#D7C4AF]/50 space-y-1 mb-3">
                      <div>
                        📦 <strong>Quantity:</strong> {res.quantity} unit(s)
                      </div>
                      <div>
                        💳 <strong>Payment:</strong> {res.paymentPreference} · {res.fulfillmentType}
                      </div>
                      <div>
                        🏷️ <strong>Total:</strong> ₹{res.totalPrice.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {res.status === 'Confirmed' && (
                    <button
                      onClick={() => onCancelReservation(res.id)}
                      className="w-full py-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Cancel Reservation & Restore Stock
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
