import React from 'react';
import {
  Sparkles,
  Palette,
  Type,
  Square,
  Shield,
  Package,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setActiveTab, ConfiguratorTab } from '../store/configuratorSlice';
import { PresetTemplates } from './tabs/PresetTemplates';
import { ColorCustomizer } from './tabs/ColorCustomizer';
import { GraphicsCustomizer } from './tabs/GraphicsCustomizer';
import { WallConfigurator } from './tabs/WallConfigurator';
import { FrameConfigurator } from './tabs/FrameConfigurator';
import { AccessoriesConfigurator } from './tabs/AccessoriesConfigurator';

export const ControlPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector((state) => state.configurator.activeTab);

  const tabs: { id: ConfiguratorTab; label: string; icon: React.ReactNode }[] = [
    { id: 'presets', label: 'Presets', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'color', label: 'Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'graphics', label: 'Branding', icon: <Type className="w-4 h-4" /> },
    { id: 'walls', label: 'Walls', icon: <Square className="w-4 h-4" /> },
    { id: 'frame', label: 'Frame', icon: <Shield className="w-4 h-4" /> },
    { id: 'accessories', label: 'Add-ons', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-full lg:w-[420px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 flex flex-col h-full z-10 shrink-0">
      {/* TABS HEADER */}
      <div className="flex items-center overflow-x-auto p-2 bg-slate-950/60 border-b border-slate-800 scrollbar-none shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              className={`flex-1 min-w-[64px] py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span className="text-[10px]">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT (Scrollable Area) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {activeTab === 'presets' && <PresetTemplates />}
        {activeTab === 'color' && <ColorCustomizer />}
        {activeTab === 'graphics' && <GraphicsCustomizer />}
        {activeTab === 'walls' && <WallConfigurator />}
        {activeTab === 'frame' && <FrameConfigurator />}
        {activeTab === 'accessories' && <AccessoriesConfigurator />}
      </div>
    </aside>
  );
};
