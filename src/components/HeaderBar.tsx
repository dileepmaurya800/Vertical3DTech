import React from 'react';
import {
  RotateCcw,
  FileDown,
  ShoppingCart,
  Share2,
  Tent,
  CheckCircle2,
  Maximize,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { resetConfig, setTentSize } from '../store/configuratorSlice';
import { setCartModalOpen, setPdfModalOpen, setToastMessage } from '../store/cartSlice';
import { calculatePricing } from '../services/pricingService';
import { TENT_SIZE_OPTIONS, TentSize } from '../types/configurator';

interface HeaderBarProps {
  isEmbed?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({ isEmbed }) => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.configurator.config);
  const pricing = calculatePricing(config);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    dispatch(setToastMessage('Configurator link copied to clipboard!'));
    setTimeout(() => dispatch(setToastMessage(null)), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset tent configuration back to factory default?')) {
      dispatch(resetConfig());
    }
  };

  if (isEmbed) {
    return null;
  }

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Brand & Model Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-sky-600 flex items-center justify-center text-white shadow-glow">
          <Tent className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide font-sans">
              Custom Canopy Tent 3D
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" /> Commercial CPAI-84
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Loaded GLB: {TENT_SIZE_OPTIONS[config.size]?.label} • Dye-Sublimation Print Ready
          </p>
        </div>
      </div>

      {/* Model Size Switcher Pills */}
      <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-950/70 border border-slate-800">
        <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
          <Maximize className="w-3 h-3 text-sky-400" /> Size:
        </span>
        {(Object.keys(TENT_SIZE_OPTIONS) as TentSize[]).map((sizeKey) => {
          const opt = TENT_SIZE_OPTIONS[sizeKey];
          const isSelected = config.size === sizeKey;

          return (
            <button
              key={sizeKey}
              onClick={() => dispatch(setTentSize(sizeKey))}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset button */}
        <button
          onClick={handleReset}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-medium flex items-center gap-1.5 border border-transparent hover:border-slate-700"
          title="Reset to Default"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset</span>
        </button>

        {/* Share link button */}
        <button
          onClick={handleShare}
          className="p-2 sm:px-3 sm:py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs font-medium flex items-center gap-1.5 border border-transparent hover:border-slate-700"
          title="Share Design"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* Download Spec Sheet PDF */}
        <button
          onClick={() => dispatch(setPdfModalOpen(true))}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm"
        >
          <FileDown className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Spec Sheet PDF</span>
        </button>

        {/* Shopify Cart Trigger */}
        <button
          onClick={() => dispatch(setCartModalOpen(true))}
          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/20 transition transform active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>${pricing.total.toFixed(2)}</span>
          <span className="hidden sm:inline text-sky-100 font-normal">| Checkout</span>
        </button>
      </div>
    </header>
  );
};
