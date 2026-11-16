import React from 'react';
import { Package, Weight, ShieldCheck, Flag, Check } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { updateAccessories } from '../../store/configuratorSlice';
import { ACCESSORY_PRICES } from '../../services/pricingService';

export const AccessoriesConfigurator: React.FC = () => {
  const dispatch = useAppDispatch();
  const accessories = useAppSelector((state) => state.configurator.config.accessories);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-sky-400" /> Anchors & Accessories
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Essential wind weights, transport cases, and promotional attachments.
        </p>
      </div>

      {/* 1. Sandbags */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-white">Saddle Sandbag Weights</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {accessories.sandbagsCount === 0
              ? 'None'
              : accessories.sandbagsCount === 2
              ? `+$${ACCESSORY_PRICES.sandbag2}`
              : `+$${ACCESSORY_PRICES.sandbag4}`}
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Heavy-duty ballast bags wrap around tent legs for outdoor stability on concrete or grass (up to 40 lbs per leg).
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[0, 2, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() =>
                dispatch(updateAccessories({ sandbagsCount: count as 0 | 2 | 4 }))
              }
              className={`py-2 px-2.5 rounded-lg text-xs font-medium border transition ${
                accessories.sandbagsCount === count
                  ? 'bg-brand-900/60 border-brand-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {count === 0 ? 'None' : `${count}-Pack (${count * 30} lbs)`}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Heavy-Duty Roller Bag */}
      <div
        onClick={() =>
          dispatch(
            updateAccessories({
              heavyDutyRollerBag: !accessories.heavyDutyRollerBag,
            })
          )
        }
        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
          accessories.heavyDutyRollerBag
            ? 'bg-slate-850 border-brand-500 shadow-glow'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              accessories.heavyDutyRollerBag
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Deluxe Wheeled Roller Bag</span>
              <span className="text-[11px] font-semibold text-sky-400">
                +${ACCESSORY_PRICES.rollerBag}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              1680D Ballistic Nylon • Oversized All-Terrain Wheels • Reinforced Base Plate
            </span>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
            accessories.heavyDutyRollerBag
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-slate-600'
          }`}
        >
          {accessories.heavyDutyRollerBag && <Check className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* 3. Spiral Stakes & Ratchet Tie-Down Kit */}
      <div
        onClick={() =>
          dispatch(updateAccessories({ stakeKit: !accessories.stakeKit }))
        }
        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
          accessories.stakeKit
            ? 'bg-slate-850 border-brand-500 shadow-glow'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              accessories.stakeKit
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Commercial Spiral Stake Kit</span>
              <span className="text-[11px] font-semibold text-sky-400">
                +${ACCESSORY_PRICES.stakeKit}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              4x Steel corkscrew earth anchors + 1000 lb break-strength ratchet straps
            </span>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
            accessories.stakeKit
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-slate-600'
          }`}
        >
          {accessories.stakeKit && <Check className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* 4. Flag Brackets */}
      <div
        onClick={() =>
          dispatch(updateAccessories({ flagMounts: !accessories.flagMounts }))
        }
        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
          accessories.flagMounts
            ? 'bg-slate-850 border-brand-500 shadow-glow'
            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              accessories.flagMounts
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            <Flag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Corner Teardrop Flag Mounts</span>
              <span className="text-[11px] font-semibold text-sky-400">
                +${ACCESSORY_PRICES.flagMounts}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Dual corner pole clamp brackets to mount high-visibility banner flags
            </span>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
            accessories.flagMounts
              ? 'border-brand-500 bg-brand-500 text-white'
              : 'border-slate-600'
          }`}
        >
          {accessories.flagMounts && <Check className="w-3.5 h-3.5" />}
        </div>
      </div>
    </div>
  );
};
