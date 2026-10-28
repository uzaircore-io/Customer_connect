import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ReserveModalProps {
  product: Product;
  onClose: () => void;
  onConfirmReservation: (data: {
    productId: number;
    quantity: number;
    fulfillmentType: 'Pickup' | 'Delivery';
    paymentPreference: 'Pay at Pickup' | 'Demo Paid' | 'Pending COD';
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }) => { success: boolean; message: string; resCode?: string };
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  product,
  onClose,
  onConfirmReservation,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [fulfillmentType, setFulfillmentType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [paymentPreference, setPaymentPreference] = useState<'Pay at Pickup' | 'Demo Paid' | 'Pending COD'>('Pay at Pickup');
  const [customerName, setCustomerName] = useState('Zubair Ahmad');
  const [customerPhone, setCustomerPhone] = useState('+91 94190 11002');
  const [customerEmail, setCustomerEmail] = useState('zubair.ahmad@demo.local');
  const [result, setResult] = useState<{ success: boolean; message: string; resCode?: string } | null>(null);

  const availableStock = Math.max(0, product.stock - product.reservedStock);
  const totalPrice = product.price * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity > availableStock) return;

    const res = onConfirmReservation({
      productId: product.id,
      quantity,
      fulfillmentType,
      paymentPreference,
      customerName,
      customerPhone,
      customerEmail,
    });
    setResult(res);
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

        {result ? (
          <div className="text-center py-6">
            {result.success ? (
              <>
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#4A3024] mb-2">
                  Item Reserved Exclusively!
                </h3>
                <p className="text-xs text-[#80503A] mb-4">{result.message}</p>
                <div className="bg-[#F8E8D0] p-4 rounded-2xl border border-[#D7C4AF] text-xs max-w-sm mx-auto mb-6">
                  <div className="text-[#80503A] mb-1">Reservation Code</div>
                  <div className="font-mono text-base font-bold text-[#BF7149]">
                    {result.resCode}
                  </div>
                  <div className="mt-2 text-[#4A3024] font-medium">
                    {product.name} (Qty: {quantity})
                  </div>
                  <div className="text-[#80503A]">
                    Payment: {paymentPreference} · {fulfillmentType}
                  </div>
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Stock is locked for 48 hours. Show code at pickup.
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
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#4A3024] mb-2">Reservation Failed</h3>
                <p className="text-xs text-red-700 mb-6">{result.message}</p>
                <button
                  onClick={() => setResult(null)}
                  className="px-6 py-2.5 bg-[#BF7149] text-[#FFFDF8] font-semibold text-xs rounded-full hover:bg-[#80503A] transition-colors"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#BF7149] uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                ReserveNow Inventory Lock
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#4A3024] mt-1">
                {product.name}
              </h3>
              <p className="text-xs text-[#80503A]">
                Offered by {product.businessName} · SKU: {product.sku}
              </p>
            </div>

            {/* Disclaimer Banner (Required Part 13 & 21) */}
            <div className="bg-[#F4E7DA] border-l-4 border-[#BF7149] p-2.5 rounded-r-xl text-[11px] text-[#80503A] leading-relaxed">
              <strong>Simulated Demo Commerce:</strong> No real bank charges or UPI transactions occur.
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3024] mb-1">
                  Quantity (Available: {availableStock})
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, availableStock)}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-xl px-3 py-2 text-xs font-bold text-[#4A3024]"
                />
              </div>

              {/* Fulfillment */}
              <div>
                <label className="block text-xs font-semibold text-[#4A3024] mb-1">Fulfillment</label>
                <select
                  value={fulfillmentType}
                  onChange={(e) => setFulfillmentType(e.target.value as any)}
                  className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-xl px-3 py-2 text-xs font-medium text-[#4A3024]"
                >
                  <option value="Pickup">Store Pickup (ReserveNow)</option>
                  <option value="Delivery">Local Srinagar Delivery</option>
                </select>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-[#4A3024] mb-1">
                Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Pay at Pickup', label: 'Pay at Pickup' },
                  { id: 'Pending COD', label: 'Cash on Delivery' },
                  { id: 'Demo Paid', label: 'Demo Pay Now' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentPreference(opt.id as any)}
                    className={`p-2 rounded-xl text-center text-xs font-semibold border transition-all ${
                      paymentPreference === opt.id
                        ? 'bg-[#BF7149] text-[#FFFDF8] border-[#BF7149]'
                        : 'bg-[#FFFDF8] border-[#D7C4AF] text-[#4A3024] hover:border-[#BF7149]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Contact */}
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
                    Phone
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
            </div>

            {/* Total and Submit */}
            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#80503A]">Total Amount</span>
                <div className="text-lg font-bold text-[#BF7149]">
                  ₹{totalPrice.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="submit"
                disabled={availableStock < quantity}
                className="px-6 py-2.5 bg-[#BF7149] hover:bg-[#80503A] disabled:bg-stone-300 text-[#FFFDF8] font-semibold text-xs rounded-full transition-colors shadow-xs"
              >
                Confirm Pre-Booking
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
