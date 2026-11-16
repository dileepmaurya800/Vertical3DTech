import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ShoppingBag,
  Code2,
  Send,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setCartModalOpen, setToastMessage } from '../store/cartSlice';
import {
  calculatePricing,
  buildShopifyCartPayload,
} from '../services/pricingService';

export const ShopifyCartModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.cart.isCartModalOpen);
  const config = useAppSelector((state) => state.configurator.config);
  const screenshot = useAppSelector((state) => state.cart.capturedScreenshot);

  const [copied, setCopied] = useState(false);
  const [isSimulatingPost, setIsSimulatingPost] = useState(false);
  const [simulatedResponse, setSimulatedResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const pricing = calculatePricing(config);
  const shopifyPayload = buildShopifyCartPayload(config, pricing, screenshot || undefined);
  const jsonString = JSON.stringify(shopifyPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateCartPost = () => {
    setIsSimulatingPost(true);
    setTimeout(() => {
      setIsSimulatingPost(false);
      setSimulatedResponse(
        JSON.stringify(
          {
            status: 200,
            message: 'Shopify AJAX Cart API: Line item added successfully to session cart!',
            cart_token: 'shp_ct_' + Math.random().toString(36).substring(2, 12),
            item_count: 1,
            total_price: Math.round(pricing.total * 100),
            currency: 'USD',
          },
          null,
          2
        )
      );
      dispatch(setToastMessage('Shopify Cart API simulated successfully!'));
      setTimeout(() => dispatch(setToastMessage(null)), 3000);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-glass overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Shopify AJAX Cart API Integration
              </h2>
              <p className="text-xs text-slate-400">
                Structured JSON schema for <code className="text-sky-400">POST /cart/add.js</code>
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setCartModalOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Configured Product</span>
              <span className="text-sm font-bold text-white">10x10 Custom Canopy Tent</span>
              <span className="text-xs text-slate-400 block mt-0.5 font-mono">
                SKU: {config.id} • Variant ID: {shopifyPayload.items[0]?.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Cart Price</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                ${pricing.total.toFixed(2)} USD
              </span>
            </div>
          </div>

          {/* JSON Payload Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-sky-400" /> Cart Payload (JSON)
              </span>

              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition flex items-center gap-1 border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto max-h-56 leading-relaxed select-all">
              {jsonString}
            </pre>
          </div>

          {/* Simulated API Response */}
          {simulatedResponse && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Shopify Response 200 OK:
              </span>
              <pre className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 overflow-x-auto">
                {simulatedResponse}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Ready to pipe into your Shopify theme or headless storefront.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => dispatch(setCartModalOpen(false))}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Close
            </button>

            <button
              onClick={handleSimulateCartPost}
              disabled={isSimulatingPost}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulatingPost ? 'Sending...' : 'Test AJAX Cart Post'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
