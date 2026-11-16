import React from 'react';
import { Palette, Check, SlidersHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  setBaseColor,
  setUniformColor,
  updatePeakGraphics,
  updateValanceGraphics,
  setActivePart,
} from '../../store/configuratorSlice';
import { POPULAR_COLORS } from '../../utils/presets';
import { MeshPartId, TentFace } from '../../types/configurator';

export const ColorCustomizer: React.FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.configurator.config);
  const activePart = useAppSelector((state) => state.configurator.activePart);

  const handleBaseColorChange = (hex: string) => {
    dispatch(setBaseColor(hex));
  };

  const handleFaceColorChange = (face: TentFace, isValance: boolean, hex: string) => {
    if (isValance) {
      dispatch(updateValanceGraphics({ face, graphics: { color: hex } }));
    } else {
      dispatch(updatePeakGraphics({ face, graphics: { color: hex } }));
    }
  };

  // Determine which part is currently selected for specific coloring
  let currentTargetColor = config.baseColor;
  if (!config.uniformColor) {
    if (activePart.startsWith('peak_')) {
      const face = activePart.replace('peak_', '') as TentFace;
      currentTargetColor = config.peaks[face]?.color || config.baseColor;
    } else if (activePart.startsWith('valance_')) {
      const face = activePart.replace('valance_', '') as TentFace;
      currentTargetColor = config.valances[face]?.color || config.baseColor;
    }
  }

  const partsList: { id: MeshPartId; label: string }[] = [
    { id: 'peak_front', label: 'Front Peak' },
    { id: 'peak_back', label: 'Back Peak' },
    { id: 'peak_left', label: 'Left Peak' },
    { id: 'peak_right', label: 'Right Peak' },
    { id: 'valance_front', label: 'Front Valance' },
    { id: 'valance_back', label: 'Back Valance' },
    { id: 'valance_left', label: 'Left Valance' },
    { id: 'valance_right', label: 'Right Valance' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-sky-400" /> Fabric Colors & Finishes
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select outdoor UV50+ commercial 600D polyester fabric colors.
        </p>
      </div>

      {/* Uniform Color Toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-200 block">
            Uniform Canopy Color
          </span>
          <span className="text-[10px] text-slate-400">
            Apply one primary color to all roof peaks and valances
          </span>
        </div>
        <button
          type="button"
          onClick={() => dispatch(setUniformColor(!config.uniformColor))}
          className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
            config.uniformColor ? 'bg-brand-600' : 'bg-slate-700'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              config.uniformColor ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Independent Part Target Selector (if not uniform) */}
      {!config.uniformColor && (
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" /> Target Part To Color:
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {partsList.map((p) => (
              <button
                key={p.id}
                onClick={() => dispatch(setActivePart(p.id))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition border ${
                  activePart === p.id
                    ? 'bg-brand-900/60 border-brand-500 text-sky-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Color Swatches */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Commercial Color Palette
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {POPULAR_COLORS.map((col) => {
            const isSelected = currentTargetColor.toLowerCase() === col.hex.toLowerCase();
            return (
              <button
                key={col.hex}
                onClick={() => {
                  if (config.uniformColor) {
                    handleBaseColorChange(col.hex);
                  } else {
                    const isVal = activePart.startsWith('valance_');
                    const face = (activePart.replace('peak_', '').replace('valance_', '')) as TentFace;
                    handleFaceColorChange(face, isVal, col.hex);
                  }
                }}
                className={`group flex flex-col items-center gap-1 p-1.5 rounded-lg border transition ${
                  isSelected
                    ? 'border-brand-500 bg-brand-950/40 ring-1 ring-brand-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
                title={col.name}
              >
                <div
                  className="w-7 h-7 rounded-md border border-white/20 shadow-sm flex items-center justify-center relative"
                  style={{ backgroundColor: col.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />}
                </div>
                <span className="text-[9px] text-slate-400 group-hover:text-slate-200 truncate w-full text-center">
                  {col.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Hex Input */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Custom Brand Hex / Pantone Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={currentTargetColor}
            onChange={(e) => {
              if (config.uniformColor) {
                handleBaseColorChange(e.target.value);
              } else {
                const isVal = activePart.startsWith('valance_');
                const face = (activePart.replace('peak_', '').replace('valance_', '')) as TentFace;
                handleFaceColorChange(face, isVal, e.target.value);
              }
            }}
            className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
          />
          <div className="flex-1">
            <input
              type="text"
              value={currentTargetColor.toUpperCase()}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                  if (config.uniformColor) {
                    handleBaseColorChange(val);
                  } else {
                    const isVal = activePart.startsWith('valance_');
                    const face = (activePart.replace('peak_', '').replace('valance_', '')) as TentFace;
                    handleFaceColorChange(face, isVal, val);
                  }
                }
              }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-brand-500"
              placeholder="#0284C7"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
