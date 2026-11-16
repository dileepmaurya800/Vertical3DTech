import React, { useState } from 'react';
import {
  Camera,
  Layers,
  Sun,
  Maximize2,
  Compass,
  Ruler,
  RotateCw,
  MousePointerClick,
} from 'lucide-react';
import { useThreeCanvas } from '../three/useThreeCanvas';
import { useAppDispatch, useAppSelector } from '../store/store';
import {
  setCameraPreset,
  setLightingPreset,
  setIsExplodedView,
  setExplodedFactor,
  setIsWireframe,
  setShowDimensions,
  setIsAutoRotating,
} from '../store/configuratorSlice';
import { setCapturedScreenshot, setToastMessage } from '../store/cartSlice';
import { CameraViewPreset, LightingPreset } from '../types/configurator';

export const Viewport3D: React.FC = () => {
  const dispatch = useAppDispatch();
  const { containerRef, isSceneReady, hoveredResult, captureScreenshot } = useThreeCanvas();

  const cameraPreset = useAppSelector((state) => state.configurator.cameraPreset);
  const lightingPreset = useAppSelector((state) => state.configurator.lightingPreset);
  const isExplodedView = useAppSelector((state) => state.configurator.isExplodedView);
  const explodedFactor = useAppSelector((state) => state.configurator.explodedFactor);
  const isWireframe = useAppSelector((state) => state.configurator.isWireframe);
  const showDimensions = useAppSelector((state) => state.configurator.showDimensions);
  const isAutoRotating = useAppSelector((state) => state.configurator.isAutoRotating);
  const activePart = useAppSelector((state) => state.configurator.activePart);

  const [isSnapshotting, setIsSnapshotting] = useState(false);

  const cameraPresets: { id: CameraViewPreset; label: string }[] = [
    { id: 'isometric', label: '3D ISO' },
    { id: 'front', label: 'Front' },
    { id: 'back', label: 'Back' },
    { id: 'left', label: 'Left' },
    { id: 'right', label: 'Right' },
    { id: 'top', label: 'Top' },
    { id: 'interior', label: 'Inside' },
  ];

  const lightingPresets: { id: LightingPreset; label: string }[] = [
    { id: 'studio', label: 'Studio' },
    { id: 'outdoor-day', label: 'Sunny Day' },
    { id: 'sunset', label: 'Sunset' },
    { id: 'event', label: 'Exhibition' },
  ];

  const handleCaptureSnapshot = () => {
    setIsSnapshotting(true);
    const dataUrl = captureScreenshot();
    if (dataUrl) {
      dispatch(setCapturedScreenshot(dataUrl));
      dispatch(setToastMessage('3D snapshot captured! Added to spec sheet preview.'));
      setTimeout(() => dispatch(setToastMessage(null)), 3000);
    }
    setTimeout(() => setIsSnapshotting(false), 500);
  };

  return (
    <div className="relative w-full h-full flex-1 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading state indicator */}
      {!isSceneReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm z-30 pointer-events-none">
          <div className="w-12 h-12 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-300">Initializing 3D Canvas Engine...</p>
          <p className="text-xs text-slate-500 mt-1">Loading GLTF mesh geometry & canvas shaders</p>
        </div>
      )}

      {/* TOP FLOATING CONTROLS: Camera Presets */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-glass z-10">
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 px-2">
          <Compass className="w-3.5 h-3.5 text-sky-400" /> Views:
        </span>
        {cameraPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => dispatch(setCameraPreset(preset.id))}
            className={`px-2.5 py-1 text-xs font-medium rounded-lg transition ${
              cameraPreset === preset.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* TOP RIGHT FLOATING CONTROLS: Environment & Snapshot */}
      <div className="absolute top-4 right-4 hidden md:flex items-center gap-2 z-10">
        {/* Lighting Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-glass">
          <Sun className="w-3.5 h-3.5 text-amber-400 ml-2 mr-1" />
          {lightingPresets.map((lp) => (
            <button
              key={lp.id}
              onClick={() => dispatch(setLightingPreset(lp.id))}
              className={`px-2 py-1 text-[11px] font-medium rounded-lg transition ${
                lightingPreset === lp.id
                  ? 'bg-slate-800 text-sky-400 border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lp.label}
            </button>
          ))}
        </div>

        {/* High-res Screenshot Button */}
        <button
          onClick={handleCaptureSnapshot}
          className={`p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-glass ${
            isSnapshotting ? 'scale-90 text-sky-400' : ''
          }`}
          title="Capture High-Res 3D Screenshot"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM LEFT: Active Selected Mesh Indicator */}
      <div className="absolute bottom-20 sm:bottom-6 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-glass pointer-events-auto">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Selected Part:</span>
          <span className="text-xs font-bold text-white capitalize">
            {activePart.replace('_', ' ')}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 px-1 hidden sm:block">
          💡 Click directly on any 3D canopy face to edit its artwork
        </p>
      </div>

      {/* FLOATING HOVER TOOLTIP (Raycast hit) */}
      {hoveredResult && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-all duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-950/90 text-sky-200 border border-sky-500/40 shadow-glow backdrop-blur-md text-xs font-semibold">
            <MousePointerClick className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
            <span>{hoveredResult.label}</span>
            <span className="text-[10px] text-sky-300/70 font-normal">| Click to customize</span>
          </div>
        </div>
      )}

      {/* BOTTOM CENTER: Exploded View & View Mode Toggles */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-glass z-10 max-w-[95%]">
        {/* Exploded View Toggle & Slider */}
        <div className="flex items-center gap-2 px-2 py-1">
          <button
            onClick={() => dispatch(setIsExplodedView(!isExplodedView))}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
              isExplodedView
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Toggle Exploded Assembly View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exploded</span>
          </button>

          {isExplodedView && (
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={explodedFactor}
              onChange={(e) => dispatch(setExplodedFactor(parseFloat(e.target.value)))}
              className="w-20 sm:w-28 accent-brand-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
              title="Explosion distance"
            />
          )}
        </div>

        <div className="w-px h-5 bg-slate-800" />

        {/* 3D Dimensions Toggle */}
        <button
          onClick={() => dispatch(setShowDimensions(!showDimensions))}
          className={`p-1.5 sm:px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            showDimensions
              ? 'bg-slate-800 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle 3D Dimension Measurements"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Dimensions</span>
        </button>

        {/* Wireframe Mode Toggle */}
        <button
          onClick={() => dispatch(setIsWireframe(!isWireframe))}
          className={`p-1.5 sm:px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            isWireframe
              ? 'bg-slate-800 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Wireframe Mesh"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Wireframe</span>
        </button>

        {/* Auto Rotate Toggle */}
        <button
          onClick={() => dispatch(setIsAutoRotating(!isAutoRotating))}
          className={`p-1.5 sm:px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${
            isAutoRotating
              ? 'bg-slate-800 text-sky-400 border border-slate-700'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Turntable 360 Spin"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">360° Spin</span>
        </button>
      </div>
    </div>
  );
};
