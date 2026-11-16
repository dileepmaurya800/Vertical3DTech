import React, { useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  CheckCircle,
  Building,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setPdfModalOpen, setToastMessage } from '../store/cartSlice';
import { calculatePricing } from '../services/pricingService';
import { generateSpecSheetPdf } from '../services/pdfService';
import { TENT_SIZE_OPTIONS } from '../types/configurator';

export const PdfPreviewModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.cart.isPdfModalOpen);
  const config = useAppSelector((state) => state.configurator.config);
  const screenshot = useAppSelector((state) => state.cart.capturedScreenshot);

  const [customerName, setCustomerName] = useState('Apex Dynamics LLC');
  const [productionNotes, setProductionNotes] = useState(
    'Please inspect PMS color matching for canopy roof prior to sublimation heat press.'
  );
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const pricing = calculatePricing(config);

  const handleDownloadPdf = () => {
    setIsGenerating(true);

    try {
      const doc = generateSpecSheetPdf({
        config,
        pricing,
        screenshotDataUrl: screenshot || undefined,
        customerName,
        orderNotes: productionNotes,
      });

      doc.save(`Canopy_10x10_SpecSheet_${config.id}.pdf`);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#34d399', '#f59e0b'],
      });

      dispatch(setToastMessage('Production spec sheet PDF downloaded successfully!'));
      setTimeout(() => dispatch(setToastMessage(null)), 3500);
      dispatch(setPdfModalOpen(false));
    } catch (err) {
      console.error('PDF generation error:', err);
      dispatch(setToastMessage('Failed to export PDF. Check console for details.'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-glass overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Factory Production Spec Sheet (PDF)
              </h2>
              <p className="text-xs text-slate-400">
                Pre-flight technical drawing & Bill of Materials for manufacturing
              </p>
            </div>
          </div>

          <button
            onClick={() => dispatch(setPdfModalOpen(false))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* 3D Snapshot & Basic Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950/70 aspect-video flex items-center justify-center relative">
              {screenshot ? (
                <img
                  src={screenshot}
                  alt="3D Canopy Render"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <span className="text-xs text-slate-500 block">
                    3D Snapshot will be rendered automatically into PDF
                  </span>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] font-mono text-sky-400 border border-slate-700">
                {config.id}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-white block text-sm">Key Specifications</span>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Footprint:</span>
                  <span className="font-medium">{TENT_SIZE_OPTIONS[config.size]?.dimensions || `${config.size} Tent`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Peak Height:</span>
                  <span className="font-medium">11ft 2in (3.40m)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clearance:</span>
                  <span className="font-medium">7ft 0in (2.13m)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fabric Grade:</span>
                  <span className="font-medium">600D PU Polyester UV50+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fire Safety:</span>
                  <span className="text-emerald-400 font-semibold">CPAI-84 / NFPA 701</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Price:</span>
                  <span className="font-bold text-white font-mono">${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields: Customer & Notes */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <Building className="w-3.5 h-3.5 text-sky-400" /> Customer / Company Name:
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
                <FileText className="w-3.5 h-3.5 text-sky-400" /> Pre-Flight Production Notes:
              </label>
              <textarea
                value={productionNotes}
                onChange={(e) => setProductionNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 resize-none"
                placeholder="Add special instructions for print operators..."
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Includes high-res vector color breakdown, artwork schedule for all 4 peaks & valances, and sign-off block.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-end gap-3">
          <button
            onClick={() => dispatch(setPdfModalOpen(false))}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <FileDown className="w-4 h-4" />
            <span>{isGenerating ? 'Generating PDF...' : 'Download PDF Spec Sheet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
