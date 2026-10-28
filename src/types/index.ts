export type BusinessCategory =
  | 'Watches'
  | 'Jewelry'
  | 'Electronics'
  | 'Clothing'
  | 'Salons'
  | 'Clinics'
  | 'Restaurants'
  | 'Home Services'
  | 'Tutors'
  | 'Repair Services';

export interface BusinessHours {
  dayOfWeek: number; // 0=Mon, 6=Sun
  openTime: string; // HH:MM
  closeTime: string; // HH:MM
  isClosed: boolean;
  isOvernight?: boolean;
}

export interface Business {
  id: number;
  name: string;
  category: BusinessCategory;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp: string;
  email: string;
  verified: boolean;
  hasWarranty: boolean;
  hasReturnPolicy: boolean;
  supportsOnlinePay: boolean;
  supportsCod: boolean;
  supportsPayAtPickup: boolean;
  avgRating: number;
  reviewCount: number;
  description: string;
  startingPrice: number;
  hours: BusinessHours[];
  image: string;
  // Computed client-side
  distanceKm?: number;
  isOpenNow?: boolean;
  openStatusText?: string;
}

export interface Product {
  id: number;
  businessId: number;
  businessName?: string;
  name: string;
  category: BusinessCategory;
  price: number;
  stock: number;
  reservedStock: number;
  description: string;
  image: string;
  sku: string;
}

export interface ServiceItem {
  id: number;
  businessId: number;
  businessName?: string;
  name: string;
  category: BusinessCategory;
  price: number;
  durationMinutes: number;
  description: string;
}

export interface AppointmentSlot {
  id: number;
  businessId: number;
  slotDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  bookingReference: string;
  businessId: number;
  businessName: string;
  serviceId: number;
  serviceName: string;
  slotId: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  bookingDate: string;
  bookingTime: string;
  price: number;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface Reservation {
  id: string;
  reservationCode: string;
  businessId: number;
  businessName: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillmentType: 'Pickup' | 'Delivery';
  paymentPreference: 'Pay at Pickup' | 'Demo Paid' | 'Pending COD';
  status: 'Confirmed' | 'Ready for Pickup' | 'Collected' | 'Cancelled';
  expiresAt: string;
  createdAt: string;
}

export interface Review {
  id: number;
  businessId: number;
  customerName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  businessId: number;
  businessName: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalAmount: number;
  fulfillmentType: 'Pickup' | 'Delivery';
  paymentMethod: 'Demo Online' | 'Cash on Delivery' | 'Pay at Pickup';
  paymentStatus: 'Demo Paid' | 'Pending COD' | 'Pending at Pickup';
  orderStatus: 'Confirmed' | 'Processing' | 'Delivered' | 'Ready for Pickup';
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
  createdAt: string;
}

export interface MultiMatchWeights {
  rating: number;
  distance: number;
  price: number;
  trust: number;
}
