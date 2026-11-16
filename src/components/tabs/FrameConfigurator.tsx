import React from 'react';
import { Shield, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { setFrameType, setFrameFinish } from '../../store/configuratorSlice';
import { FrameFinish, FrameType } from '../../types/configurator';
import { FRAME_PRICES } from '../../services/pricingService';

export const FrameConfigurator: React.FC = () => {
  const dispatch = useAppDispatch();
  const frame = useAppSelector((state) => state.configurator.config.frame);

  const frameOptions: {
    id: FrameType;
    name: string;
    specs: string;
    price: number;
    badge?: string;
  }[] = [
    {
      id: 'standard-steel',
      name: FRAME_PRICES['standard-steel'].name,
      specs: '32mm Square Legs • Carbon Steel with Rust-Resistant Coating • 52 lbs',
      price: FRAME_PRICES['standard-steel'].price,
    },
    {
      id: 'commercial-aluminum',
      name: FRAME_PRICES['commercial-aluminum'].name,
      specs: '40mm Extruded Aluminum • 100% Rust-Proof • Easy Push-Button Pin Sliders • 38 lbs',
      price: FRAME_PRICES['commercial-aluminum'].price,
      badge: 'Most Popular',
    },
    {
      id: 'heavy-duty-hex',
      name: FRAME_PRICES['heavy-duty-hex'].name,
      specs: '50mm Hexagonal Profile • Heavy-Duty Internal Ribs • Wind Rating 35mph • 44 lbs',
      price: FRAME_PRICES['heavy-duty-hex'].price,
      badge: 'Extreme Duty',
    },
  ];

  const finishes: { id: FrameFinish; name: string; hex: string }[] = [
    { id: 'silver', name: 'Brushed Silver', hex: '#d1d5db' },
    { id: 'black', name: 'Matte Black', hex: '#1f2937' },
    { id: 'white', name: 'Powder White', hex: '#f8fafc' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-sky-400" /> Frame & Hardware Grade
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select heavy-duty structural trusses and telescopic leg profiles.
        </p>
      </div>

      {/* Frame Grade Selection */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-300">Frame Specification:</label>
        {frameOptions.map((opt) => {
          const isSelected = frame.type === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => dispatch(setFrameType(opt.id))}
              className={`p-3.5 rounded-xl border transition cursor-pointer relative flex flex-col gap-1.5 ${
                isSelected
                  ? 'bg-slate-850 border-brand-500 shadow-glow'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/30">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block leading-relaxed">
                    {opt.specs}
                  </span>
                </div>

                <span className="text-xs font-bold text-sky-400 shrink-0 ml-2">
                  {opt.price === 0 ? 'Included' : `+$${opt.price}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Frame Finish Selection */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
        <label className="text-xs font-semibold text-slate-300">Frame Coating / Finish:</label>
        <div className="grid grid-cols-3 gap-2">
          {finishes.map((f) => {
            const isSelected = frame.finish === f.id;

            return (
              <button
                key={f.id}
                onClick={() => dispatch(setFrameFinish(f.id))}
                className={`p-2.5 rounded-xl border transition flex flex-col items-center gap-1.5 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-950/40 ring-1 ring-brand-500'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: f.hex }}
                >
                  {isSelected && <Check className="w-3 h-3 text-slate-800" />}
                </div>
                <span className="text-[11px] font-medium text-slate-300 text-center">
                  {f.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
