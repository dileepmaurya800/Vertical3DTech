import React, { useMemo } from 'react';
import { HeaderBar } from './HeaderBar';
import { Viewport3D } from './Viewport3D';
import { ControlPanel } from './ControlPanel';
import { PricingSummaryBar } from './PricingSummaryBar';
import { ShopifyCartModal } from './ShopifyCartModal';
import { PdfPreviewModal } from './PdfPreviewModal';
import { Toast } from './Toast';

export interface ConfiguratorProps {
  embed?: boolean;
}

export const Configurator: React.FC<ConfiguratorProps> = ({ embed }) => {
  // Check if URL has ?embed=true
  const isEmbed = useMemo(() => {
    if (typeof embed === 'boolean') return embed;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('embed') === 'true';
    }
    return false;
  }, [embed]);

  return (
    <div className="flex flex-col w-screen h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Toast notifications */}
      <Toast />

      {/* Header Bar */}
      <HeaderBar isEmbed={isEmbed} />

      {/* Main Interactive Work Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* 3D WebGL Canvas Viewport */}
        <Viewport3D />

        {/* 2D Customization Control Panel */}
        <ControlPanel />
      </div>

      {/* Bottom Sticky Dynamic Pricing & Checkout Bar */}
      <PricingSummaryBar />

      {/* Modals */}
      <ShopifyCartModal />
      <PdfPreviewModal />
    </div>
  );
};
