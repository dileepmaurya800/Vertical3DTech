import React from 'react';
import {
  Square,
  Columns2,
  Eye,
  DoorClosed,
  X,
  Type,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import { updateWall, setActivePart } from '../../store/configuratorSlice';
import { TentFace, WallType } from '../../types/configurator';
import { WALL_PRICES } from '../../services/pricingService';

export const WallConfigurator: React.FC = () => {
  const dispatch = useAppDispatch();
  const config = useAppSelector((state) => state.configurator.config);
  const activePart = useAppSelector((state) => state.configurator.activePart);

  // Normalize face
  const activeFace = (activePart.startsWith('wall_')
    ? activePart.replace('wall_', '')
    : 'back') as TentFace;

  const currentWall = config.walls[activeFace];

  const handleWallTypeChange = (type: WallType) => {
    dispatch(updateWall({ face: activeFace, wall: { type } }));
  };

  const handleWallColorChange = (color: string) => {
    dispatch(updateWall({ face: activeFace, wall: { color } }));
  };

  const handleWallTextChange = (text: string) => {
    dispatch(
      updateWall({
        face: activeFace,
        wall: {
          graphics: {
            ...currentWall.graphics,
            text,
          },
        },
      })
    );
  };

  const wallFaces: { id: TentFace; label: string }[] = [
    { id: 'back', label: 'Back Wall' },
    { id: 'left', label: 'Left Wall' },
    { id: 'right', label: 'Right Wall' },
    { id: 'front', label: 'Front Wall' },
  ];

  const wallTypes: { id: WallType; label: string; price: number; icon: React.ReactNode; desc: string }[] = [
    { id: 'none', label: 'Open (No Wall)', price: WALL_PRICES.none.price, icon: <X className="w-4 h-4" />, desc: 'Open walk-through breeze' },
    { id: 'solid', label: 'Full Solid Wall', price: WALL_PRICES.solid.price, icon: <Square className="w-4 h-4" />, desc: 'Full-bleed opaque weather barrier' },
    { id: 'half', label: 'Half Wall + Rail', price: WALL_PRICES.half.price, icon: <Columns2 className="w-4 h-4" />, desc: 'Waist-height counter barrier with clamp bar' },
    { id: 'window', label: 'Cathedral Window', price: WALL_PRICES.window.price, icon: <Eye className="w-4 h-4" />, desc: 'Clear arched PVC decorative windows' },
    { id: 'zipper', label: 'Roll-Up Zipper Door', price: WALL_PRICES.zipper.price, icon: <DoorClosed className="w-4 h-4" />, desc: 'Heavy-duty center zipper with tie-backs' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Square className="w-4 h-4 text-sky-400" /> Sidewalls & Enclosures
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure individual side panels, half walls, windows, and zipper entryways.
        </p>
      </div>

      {/* Wall Face Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">Select Wall Side:</label>
        <div className="grid grid-cols-4 gap-1.5">
          {wallFaces.map((f) => {
            const hasWall = config.walls[f.id].type !== 'none';
            const isSelected = activeFace === f.id;

            return (
              <button
                key={f.id}
                onClick={() => dispatch(setActivePart(`wall_${f.id}`))}
                className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition border relative ${
                  isSelected
                    ? 'bg-brand-900/60 border-brand-500 text-sky-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="block truncate">{f.label.split(' ')[0]}</span>
                {hasWall && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mt-1 block" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Wall Type Options */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300">
          Wall Style for {activeFace.toUpperCase()}:
        </label>
        <div className="space-y-2">
          {wallTypes.map((type) => {
            const isSelected = currentWall.type === type.id;

            return (
              <div
                key={type.id}
                onClick={() => handleWallTypeChange(type.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-850 border-brand-500 shadow-glow'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {type.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{type.label}</span>
                      {type.price > 0 && (
                        <span className="text-[11px] font-semibold text-sky-400">
                          +${type.price}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block">{type.desc}</span>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-600'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wall Color & Text Customization (when wall enabled) */}
      {currentWall.type !== 'none' && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <label className="text-xs font-bold text-white block">
            {activeFace.toUpperCase()} Wall Customization
          </label>

          {/* Color */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Fabric Color:</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentWall.color || config.baseColor}
                onChange={(e) => handleWallColorChange(e.target.value)}
                className="w-7 h-7 rounded-md cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-slate-400 font-mono">
                {(currentWall.color || config.baseColor).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Wall Text */}
          <div className="space-y-1">
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Type className="w-3 h-3 text-sky-400" /> Printed Wall Banner Text:
            </span>
            <input
              type="text"
              value={currentWall.graphics.text}
              onChange={(e) => handleWallTextChange(e.target.value)}
              placeholder="e.g. VIP LOUNGE BACKDROP"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
