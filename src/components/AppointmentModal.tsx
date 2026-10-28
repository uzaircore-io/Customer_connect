import React, { useState } from 'react';
import { X, Calendar, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Business, ServiceItem, AppointmentSlot } from '../types';

interface AppointmentModalProps {
  business: Business;
  services: ServiceItem[];
  availableSlots: AppointmentSlot[];
  onClose: () => void;
  onConfirmBooking: (booking: {
    serviceId: number;
    serviceName: string;
    slotId: number;
    date: string;
    time: string;
    price: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) => { success: boolean; message: string; refCode?: string };
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  business,
  services,
  availableSlots,
  onClose,
  onConfirmBooking,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<number>(services[0]?.id || 0);
  const [selectedSlotId, setSelectedSlotId] = useState<number>(availableSlots[0]?.id || 0);
  const [customerName, setCustomerName] = useState('Aadil Hussain');
  const [customerPhone, setCustomerPhone] = useState('+91 94190 11001');
  const [customerEmail, setCustomerEmail] = useState('aadil.hussain@demo.local');
  const [bookingResult, setBookingResult] = useState<{
    success: boolean;
    message: string;
    refCode?: string;
  } | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) || services[0];
  const selectedSlot = availableSlots.find((s) => s.id === selectedSlotId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;

    const res = onConfirmBooking({
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      slotId: selectedSlot.id,
      date: selectedSlot.slotDate,
      time: selectedSlot.startTime,
      price: selectedService.price,
      customerName,
      customerPhone,
      customerEmail,
    });
    setBookingResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#4A3024]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#80503A] hover:text-[#4A3024] p-1 rounded-full hover:bg-[#F8E8D0] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {bookingResult ? (
          <div className="text-center py-6">
            {bookingResult.success ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#4A3024] mb-2">
                  Appointment Confirmed!
                </h3>
                <p className="text-xs text-[#80503A] mb-4">{bookingResult.message}</p>
                <div className="bg-[#F8E8D0] p-4 rounded-2xl border border-[#D7C4AF] text-xs max-w-sm mx-auto mb-6">
                  <div className="text-[#80503A] mb-1">Booking Reference</div>
                  <div className="font-mono text-base font-bold text-[#BF7149]">
                    {bookingResult.refCode}
                  </div>
                  <div className="mt-2 text-[#4A3024]">
                    {business.name} · {selectedService?.name}
                  </div>
                  <div className="text-[#80503A]">
                    {selectedSlot?.slotDate} at {selectedSlot?.startTime}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#BF7149] text-[#FFFDF8] font-semibold text-xs rounded-full hover:bg-[#80503A] transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#4A3024] mb-2">
                  SlotGuard Conflict Detected
                </h3>
                <p className="text-xs text-red-700 mb-6">{bookingResult.message}</p>
                <button
                  onClick={() => setBookingResult(null)}
                  className="px-6 py-2.5 bg-[#BF7149] text-[#FFFDF8] font-semibold text-xs rounded-full hover:bg-[#80503A] transition-colors"
                >
                  Pick Another Slot
                </button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BF7149] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                SlotGuard Protected Booking
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4A3024] mt-1">
                Book with {business.name}
              </h3>
              <p className="text-xs text-[#80503A]">
                {business.category} · {business.area} · Real-time schedule verification
              </p>
            </div>

            {/* Select Service */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3024] mb-1">
                Select Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-xl px-3 py-2 text-xs font-medium text-[#4A3024] focus:outline-none"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (₹{s.price} · {s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Slot */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3024] mb-1">
                Available Appointment Slot
              </label>
              {availableSlots.length === 0 ? (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
                  No slots currently available for this provider.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setSelectedSlotId(slot.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-[#BF7149] text-[#FFFDF8] border-[#BF7149]'
                            : 'bg-[#FFFDF8] border-[#D7C4AF] text-[#4A3024] hover:border-[#BF7149]'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-semibold">
                          <Calendar className="w-3 h-3" />
                          {slot.slotDate}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] opacity-90">
                          <Clock className="w-3 h-3" />
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Inputs */}
            <div className="space-y-2 pt-2 border-t border-[#E9DDCB]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3024] mb-0.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-2.5 py-1.5 text-xs text-[#4A3024]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A3024] mb-0.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-2.5 py-1.5 text-xs text-[#4A3024]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4A3024] mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-2.5 py-1.5 text-xs text-[#4A3024]"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#80503A]">Pay at clinic/studio</span>
                <div className="text-base font-bold text-[#BF7149]">
                  ₹{selectedService?.price.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="submit"
                disabled={availableSlots.length === 0}
                className="px-6 py-2.5 bg-[#BF7149] hover:bg-[#80503A] disabled:bg-stone-300 text-[#FFFDF8] font-semibold text-xs rounded-full transition-colors shadow-xs"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
