import React, { useRef } from 'react';
import {
  Type,
  Image as ImageIcon,
  Upload,
  Trash2,
  RotateCw,
  MoveVertical,
  Maximize2,
  Copy,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import {
  updatePeakGraphics,
  updateValanceGraphics,
  setActivePart,
} from '../../store/configuratorSlice';
import { SAMPLE_LOGOS } from '../../utils/presets';
import { MeshPartId, TentFace } from '../../types/configurator';

export const GraphicsCustomizer: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activePart = useAppSelector((state) => state.configurator.activePart);
  const config = useAppSelector((state) => state.configurator.config);

  // Normalize active part to face & type
  const isValance = activePart.startsWith('valance_');
  const face: TentFace = (activePart.replace('peak_', '').replace('valance_', '')) as TentFace;
  const currentFace: TentFace = ['front', 'back', 'left', 'right'].includes(face) ? face : 'front';

  const graphics = isValance
    ? config.valances[currentFace]
    : config.peaks[currentFace];

  const handleUpdate = (updatedFields: Record<string, unknown>) => {
    if (isValance) {
      dispatch(updateValanceGraphics({ face: currentFace, graphics: updatedFields }));
    } else {
      dispatch(updatePeakGraphics({ face: currentFace, graphics: updatedFields }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      handleUpdate({ logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyToAllSides = () => {
    const faces: TentFace[] = ['front', 'back', 'left', 'right'];
    faces.forEach((f) => {
      if (isValance) {
        dispatch(updateValanceGraphics({ face: f, graphics }));
      } else {
        dispatch(updatePeakGraphics({ face: f, graphics }));
      }
    });
  };

  const faceOptions: { id: MeshPartId; label: string }[] = [
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
          <Type className="w-4 h-4 text-sky-400" /> Branding & Artwork
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize dye-sublimation printed vector logos and text on each face.
        </p>
      </div>

      {/* Face Selector Pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Target Print Face:
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {faceOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => dispatch(setActivePart(opt.id))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition border ${
                activePart === opt.id
                  ? 'bg-brand-900/60 border-brand-500 text-sky-200'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action: Apply to all 4 faces */}
      <button
        onClick={handleApplyToAllSides}
        className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition"
      >
        <Copy className="w-3.5 h-3.5 text-sky-400" />
        <span>Sync this artwork to all 4 {isValance ? 'valances' : 'peaks'}</span>
      </button>

      {/* SECTION 1: Custom Text Overlay */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-sky-400" /> Custom Printed Text
          </label>
          {graphics.text && (
            <button
              onClick={() => handleUpdate({ text: '' })}
              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <input
          type="text"
          value={graphics.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          placeholder="e.g. YOUR BRAND NAME"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
        />

        {/* Font Family & Color */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Font Family</label>
            <select
              value={graphics.fontFamily}
              onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Montserrat">Montserrat (Modern)</option>
              <option value="Inter">Inter (Clean Sans)</option>
              <option value="Impact">Impact (Heavy Bold)</option>
              <option value="Georgia">Georgia (Classic Serif)</option>
              <option value="Courier New">Courier (Monospace)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={graphics.textColor}
                onChange={(e) => handleUpdate({ textColor: e.target.value })}
                className="w-7 h-7 rounded-md cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-slate-300 font-mono">
                {graphics.textColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Font Size & Position Sliders */}
        <div className="space-y-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-slate-500" /> Size ({graphics.fontSize}pt)
            </span>
            <input
              type="range"
              min="18"
              max="64"
              value={graphics.fontSize}
              onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value, 10) })}
              className="w-32 accent-brand-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <MoveVertical className="w-3 h-3 text-slate-500" /> Vertical Offset
            </span>
            <input
              type="range"
              min="-0.8"
              max="0.8"
              step="0.05"
              value={graphics.textYOffset}
              onChange={(e) => handleUpdate({ textYOffset: parseFloat(e.target.value) })}
              className="w-32 accent-brand-500 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: Logo Image Upload */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" /> Custom Logo Badge
          </label>
          {graphics.logoUrl && (
            <button
              onClick={() => handleUpdate({ logoUrl: null })}
              className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Upload Button Box */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-700 hover:border-brand-500 bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 hover:text-white transition flex flex-col items-center justify-center gap-1 group"
        >
          <Upload className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium">Click to Upload Brand Logo</span>
          <span className="text-[10px] text-slate-500">PNG, JPG, or SVG with transparency</span>
        </button>

        {/* Quick Sample Logos library */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-slate-400">Or try a sample vector emblem:</span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {SAMPLE_LOGOS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleUpdate({ logoUrl: sample.svg })}
                className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 hover:border-brand-500 p-1.5 shrink-0 flex items-center justify-center transition"
                title={sample.name}
              >
                <img src={sample.svg} alt={sample.name} className="w-full h-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Logo Controls (if logo present) */}
        {graphics.logoUrl && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-slate-500" /> Scale ({Math.round(graphics.logoScale * 100)}%)
              </span>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.05"
                value={graphics.logoScale}
                onChange={(e) => handleUpdate({ logoScale: parseFloat(e.target.value) })}
                className="w-32 accent-brand-500 h-1 bg-slate-700 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-slate-500" /> Rotation ({graphics.logoRotation}°)
              </span>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={graphics.logoRotation}
                onChange={(e) => handleUpdate({ logoRotation: parseInt(e.target.value, 10) })}
                className="w-32 accent-brand-500 h-1 bg-slate-700 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <MoveVertical className="w-3 h-3 text-slate-500" /> Vertical Offset
              </span>
              <input
                type="range"
                min="-0.8"
                max="0.8"
                step="0.05"
                value={graphics.logoYOffset}
                onChange={(e) => handleUpdate({ logoYOffset: parseFloat(e.target.value) })}
                className="w-32 accent-brand-500 h-1 bg-slate-700 rounded cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
