import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ShoppingCart,
  FileDown,
  Truck,
  CheckCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCartModalOpen, setPdfModalOpen } from '../store/cartSlice';
import { calculatePricing } from '../services/pricingService';

export const PricingSummaryBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.configurator.config);
  const pricing = calculatePricing(config);

  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);

  const handleAddToCart = () => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#0284c7', '#38bdf8', '#34d399', '#f59e0b'],
    });

    dispatch(setCartModalOpen(true));
  };

  const handleOpenPdf = () => {
    dispatch(setPdfModalOpen(true));
  };

  return (
    <div className="relative border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl shrink-0 z-20">
      {/* EXPANDABLE ITEMIZATION DRAWER */}
      {isBreakdownOpen && (
        <div className="border-b border-slate-800 p-4 max-h-64 overflow-y-auto bg-slate-950/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200">
            <span>Itemized Bill of Materials</span>
            <span>Est. Lead Time: 3-5 Days</span>
          </div>

          <div className="divide-y divide-slate-800/80 text-xs">
            {pricing.lineItems.map((item) => (
              <div key={item.id} className="py-1.5 flex items-center justify-between text-slate-300">
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-slate-500 ml-1.5 font-normal">
                      ({item.quantity}x @ ${item.unitPrice.toFixed(2)})
                    </span>
                  )}
                </div>
                <span className="font-mono text-slate-100">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">${pricing.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Estimated Sales Tax (8.25%):</span>
              <span className="font-mono text-slate-200">${pricing.estimatedTax.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-400" /> Freight Ground Shipping:
              </span>
              <span className="font-mono text-emerald-400 font-semibold">
                {pricing.shipping === 0 ? 'FREE' : `$${pricing.shipping.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BAR */}
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Price & Expand button */}
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                ${pricing.total.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">USD</span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" /> Free Freight
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Includes heavy-duty frame, custom roof canopy & all selected options
            </p>
          </div>

          <button
            onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1 border border-slate-800"
            title="Toggle Price Breakdown"
          >
            {isBreakdownOpen ? (
              <>
                <span className="hidden md:inline text-[11px]">Hide Breakdown</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span className="hidden md:inline text-[11px]">View Breakdown</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Download Spec Sheet PDF */}
          <button
            onClick={handleOpenPdf}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <FileDown className="w-4 h-4 text-sky-400" />
            <span>Download Spec PDF</span>
          </button>

          {/* Add to Cart (Shopify) */}
          <button
            onClick={handleAddToCart}
            className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition transform active:scale-95 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
