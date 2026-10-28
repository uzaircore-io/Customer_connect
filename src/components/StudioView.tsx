import React, { useState } from 'react';
import { Store, Plus, Package, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { Business, Product, AppointmentSlot } from '../types';

interface StudioViewProps {
  businesses: Business[];
  products: Product[];
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onUpdateStock: (productId: number, delta: number) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  businesses,
  products,
  onAddProduct,
  onUpdateStock,
}) => {
  const [selectedBizId, setSelectedBizId] = useState<number>(businesses[0]?.id || 1);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('2500');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdDesc, setNewProdDesc] = useState('');

  const currentBiz = businesses.find((b) => b.id === selectedBizId) || businesses[0];
  const bizProducts = products.filter((p) => p.businessId === selectedBizId);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;

    onAddProduct({
      businessId: selectedBizId,
      businessName: currentBiz.name,
      name: newProdName,
      category: currentBiz.category,
      price: Number(newProdPrice) || 500,
      stock: Number(newProdStock) || 5,
      reservedStock: 0,
      description: newProdDesc || 'Premium catalog item from local vendor.',
      image: currentBiz.image,
      sku: `SKU-${currentBiz.category.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
    });

    setNewProdName('');
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Store Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full bg-[#BF7149]/10 text-[#BF7149] text-xs font-bold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            Merchant Operations Portal
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#4A3024]">Business Owner Studio</h1>
          <p className="text-xs text-[#80503A]">
            Manage live inventory, opening schedules, customer reservations, and appointments.
          </p>
        </div>

        {/* Demo Business Selector (Required Part 4 & 15) */}
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-2 px-3 shadow-xs flex items-center gap-2">
          <span className="text-xs font-semibold text-[#80503A]">Active Store:</span>
          <select
            value={selectedBizId}
            onChange={(e) => setSelectedBizId(Number(e.target.value))}
            className="bg-transparent text-xs font-bold text-[#4A3024] focus:outline-none cursor-pointer"
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.category} · {b.area})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-[#80503A] font-medium">Catalog Products</span>
          <div className="font-serif text-2xl font-bold text-[#4A3024] mt-1">{bizProducts.length}</div>
        </div>
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-[#80503A] font-medium">Total Physical Units</span>
          <div className="font-serif text-2xl font-bold text-[#BF7149] mt-1">
            {bizProducts.reduce((sum, p) => sum + p.stock, 0)}
          </div>
        </div>
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-[#80503A] font-medium">Reserved Stock</span>
          <div className="font-serif text-2xl font-bold text-amber-700 mt-1">
            {bizProducts.reduce((sum, p) => sum + p.reservedStock, 0)}
          </div>
        </div>
        <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] text-[#80503A] font-medium">Merchant Rating</span>
          <div className="font-serif text-2xl font-bold text-[#4A3024] mt-1">
            ★ {currentBiz.avgRating.toFixed(1)} ({currentBiz.reviewCount})
          </div>
        </div>
      </div>

      {/* Store Hours Schedule */}
      <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-6 shadow-xs mb-8">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9DDCB] mb-4">
          <h2 className="font-serif text-xl font-bold text-[#4A3024] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#BF7149]" />
            Operating Schedule (Asia/Kolkata)
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {currentBiz.openStatusText}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
            const h = currentBiz.hours?.[idx];
            return (
              <div
                key={day}
                className="bg-[#F8E8D0]/40 border border-[#D7C4AF]/60 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <div className="font-bold text-[#4A3024] mb-1">{day}</div>
                {h?.isClosed ? (
                  <span className="text-red-700 font-medium">Closed</span>
                ) : (
                  <span className="text-[#80503A] text-[11px]">
                    {h?.openTime} - {h?.closeTime}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Management */}
      <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9DDCB] mb-6">
          <h2 className="font-serif text-xl font-bold text-[#4A3024] flex items-center gap-2">
            <Package className="w-5 h-5 text-[#BF7149]" />
            Product Inventory & Pricing
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 bg-[#BF7149] text-[#FFFDF8] font-semibold text-xs rounded-full hover:bg-[#80503A] flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Item
          </button>
        </div>

        {bizProducts.length === 0 ? (
          <p className="text-xs text-[#80503A] text-center py-8">
            No products in catalog. Click 'Add New Item' to list inventory.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9DDCB] text-[#80503A]">
                  <th className="pb-3 font-semibold">Product Name</th>
                  <th className="pb-3 font-semibold">SKU</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Total Stock</th>
                  <th className="pb-3 font-semibold">Reserved</th>
                  <th className="pb-3 font-semibold">Available</th>
                  <th className="pb-3 font-semibold text-right">Quick Stock Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9DDCB]/50">
                {bizProducts.map((p) => {
                  const avail = Math.max(0, p.stock - p.reservedStock);
                  return (
                    <tr key={p.id} className="hover:bg-[#F8E8D0]/30 transition-colors">
                      <td className="py-3 font-bold text-[#4A3024]">{p.name}</td>
                      <td className="py-3 font-mono text-[11px] text-[#80503A]">{p.sku}</td>
                      <td className="py-3 font-semibold text-[#BF7149]">
                        ₹{p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-[#4A3024]">{p.stock}</td>
                      <td className="py-3 text-amber-800">{p.reservedStock}</td>
                      <td className="py-3 font-bold text-emerald-800">{avail}</td>
                      <td className="py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => onUpdateStock(p.id, -1)}
                            className="w-6 h-6 rounded-md bg-[#E9DDCB] hover:bg-[#D7C4AF] text-[#4A3024] font-bold text-xs"
                          >
                            -
                          </button>
                          <button
                            onClick={() => onUpdateStock(p.id, 1)}
                            className="w-6 h-6 rounded-md bg-[#BF7149] hover:bg-[#80503A] text-[#FFFDF8] font-bold text-xs"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#4A3024]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDF8] border border-[#D7C4AF] rounded-3xl max-w-md w-full p-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-[#4A3024] mb-3">Add Product to Catalog</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#4A3024] mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kashmiri Walnut Wood Tray"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-3 py-1.5 text-xs text-[#4A3024]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#4A3024] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-3 py-1.5 text-xs text-[#4A3024]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#4A3024] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-3 py-1.5 text-xs text-[#4A3024]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-[#4A3024] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Key craftsmanship, warranty, and specifications..."
                  className="w-full bg-[#F8E8D0]/40 border border-[#D7C4AF] rounded-lg px-3 py-1.5 text-xs text-[#4A3024]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#D7C4AF] rounded-full font-semibold text-[#4A3024]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#BF7149] text-[#FFFDF8] rounded-full font-semibold hover:bg-[#80503A]"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
