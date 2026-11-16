import React from 'react';
import { Sparkles, Check, Maximize } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { applyPreset, setTentSize } from '../../store/configuratorSlice';
import { PRESET_TEMPLATES } from '../../utils/presets';
import { PresetTemplate, TENT_SIZE_OPTIONS, TentSize } from '../../types/configurator';

export const PresetTemplates: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentBaseColor = useAppSelector((state) => state.configurator.config.baseColor);
  const currentSize = useAppSelector((state) => state.configurator.config.size);

  const handleSelectPreset = (preset: PresetTemplate) => {
    dispatch(applyPreset(preset.config));
  };

  return (
    <div className="space-y-5">
      {/* 3D Model Size Selector */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
        <label className="text-xs font-bold text-white flex items-center gap-1.5">
          <Maximize className="w-3.5 h-3.5 text-sky-400" /> Select 3D Model Size
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TENT_SIZE_OPTIONS) as TentSize[]).map((sizeKey) => {
            const opt = TENT_SIZE_OPTIONS[sizeKey];
            const isSelected = currentSize === sizeKey;

            return (
              <button
                key={sizeKey}
                type="button"
                onClick={() => dispatch(setTentSize(sizeKey))}
                className={`py-2 px-2 rounded-lg text-center transition border ${
                  isSelected
                    ? 'bg-brand-900/60 border-brand-500 text-sky-200 shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-xs font-bold block">{opt.id}</span>
                <span className="text-[9px] text-slate-400 block mt-0.5 truncate">{opt.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> Curated Design Presets
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Choose a pre-configured commercial branding template or start customizing from scratch.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {PRESET_TEMPLATES.map((preset) => {
          const isSelected = currentBaseColor === preset.previewColor;

          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-3.5 rounded-xl border transition cursor-pointer relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-850 border-brand-500 shadow-glow'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg border border-white/20 shadow-sm flex items-center justify-center shrink-0"
                    style={{ backgroundColor: preset.previewColor }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                      {preset.name}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400">
                      {preset.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition ${
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? 'Applied' : 'Apply'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">
                {preset.tagline}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
