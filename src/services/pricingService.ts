import { CanopyConfig, TentFace, WallType, TENT_SIZE_OPTIONS } from '../types/configurator';
import { PriceLineItem, PricingSummary, ShopifyCartPayload } from '../types/pricing';

export const BASE_CANOPY_PRICE = 399.00;

export const FRAME_PRICES: Record<string, { name: string; price: number; variantId: number }> = {
  'standard-steel': { name: 'Standard Steel Frame (Powder-coated)', price: 0, variantId: 44101001 },
  'commercial-aluminum': { name: 'Commercial Grade 40mm Aluminum Frame', price: 150.00, variantId: 44101002 },
  'heavy-duty-hex': { name: 'Heavy-Duty 50mm Hexagonal Aluminum Frame', price: 220.00, variantId: 44101003 },
};

export const WALL_PRICES: Record<WallType, { name: string; price: number }> = {
  none: { name: 'No Wall', price: 0 },
  solid: { name: 'Full Solid Fabric Wall', price: 75.00 },
  half: { name: 'Half Wall with Crossbar Rail', price: 45.00 },
  window: { name: 'Cathedral Window Wall (Clear PVC)', price: 85.00 },
  zipper: { name: 'Roll-Up Zipper Door Wall', price: 90.00 },
};

export const PRINT_PRICES = {
  peak: 40.00,
  valance: 25.00,
  wall: 50.00,
};

export const ACCESSORY_PRICES = {
  sandbag2: 25.00,
  sandbag4: 45.00,
  rollerBag: 65.00,
  stakeKit: 25.00,
  flagMounts: 35.00,
};

/**
 * Pure calculation engine to derive full pricing summary from canopy state
 */
export function calculatePricing(config: CanopyConfig, discountPercent = 0): PricingSummary {
  const lineItems: PriceLineItem[] = [];

  // 1. Base Tent
  lineItems.push({
    id: 'base-canopy',
    name: `${config.size} Custom Canopy Tent (Frame + Top Canopy)`,
    description: `Commercial 600D Polyester, UV50+ & CPAI-84 Fire Rated (${TENT_SIZE_OPTIONS[config.size]?.dimensions || config.size})`,
    unitPrice: BASE_CANOPY_PRICE,
    quantity: 1,
    total: BASE_CANOPY_PRICE,
    category: 'base',
  });

  // 2. Frame Upgrade
  const frameInfo = FRAME_PRICES[config.frame.type] || FRAME_PRICES['standard-steel'];
  if (frameInfo.price > 0) {
    lineItems.push({
      id: `frame-${config.frame.type}`,
      name: `Frame Upgrade: ${frameInfo.name}`,
      description: `Finish: ${config.frame.finish.toUpperCase()}`,
      unitPrice: frameInfo.price,
      quantity: 1,
      total: frameInfo.price,
      category: 'frame',
    });
  }

  // 3. Custom Graphics Printing
  const faces: TentFace[] = ['front', 'back', 'left', 'right'];
  let peakPrintCount = 0;
  let valancePrintCount = 0;

  faces.forEach((face) => {
    const peak = config.peaks[face];
    if (peak.text.trim() || peak.logoUrl) {
      peakPrintCount++;
    }

    const valance = config.valances[face];
    if (valance.text.trim() || valance.logoUrl) {
      valancePrintCount++;
    }
  });

  if (peakPrintCount > 0) {
    lineItems.push({
      id: 'print-peaks',
      name: `Full-Color Peak Graphics Printing (${peakPrintCount} peak${peakPrintCount > 1 ? 's' : ''})`,
      description: 'Dye-sublimation UV-resistant outdoor print',
      unitPrice: PRINT_PRICES.peak,
      quantity: peakPrintCount,
      total: PRINT_PRICES.peak * peakPrintCount,
      category: 'customization',
    });
  }

  if (valancePrintCount > 0) {
    lineItems.push({
      id: 'print-valances',
      name: `Valance Graphics / Text Printing (${valancePrintCount} valance${valancePrintCount > 1 ? 's' : ''})`,
      description: 'Edge-to-edge high-definition sublimation print',
      unitPrice: PRINT_PRICES.valance,
      quantity: valancePrintCount,
      total: PRINT_PRICES.valance * valancePrintCount,
      category: 'customization',
    });
  }

  // 4. Wall configurations
  faces.forEach((face) => {
    const wall = config.walls[face];
    if (wall.type !== 'none') {
      const wallPriceInfo = WALL_PRICES[wall.type];
      lineItems.push({
        id: `wall-${face}-${wall.type}`,
        name: `${face.charAt(0).toUpperCase() + face.slice(1)} Wall: ${wallPriceInfo.name}`,
        description: `Color: ${wall.color}`,
        unitPrice: wallPriceInfo.price,
        quantity: 1,
        total: wallPriceInfo.price,
        category: 'walls',
      });

      // Wall printing if custom artwork/text exists
      if (wall.graphics.text.trim() || wall.graphics.logoUrl) {
        lineItems.push({
          id: `wall-print-${face}`,
          name: `${face.charAt(0).toUpperCase() + face.slice(1)} Wall Custom Dye-Sub Print`,
          description: 'Single-sided full bleed print',
          unitPrice: PRINT_PRICES.wall,
          quantity: 1,
          total: PRINT_PRICES.wall,
          category: 'customization',
        });
      }
    }
  });

  // 5. Accessories
  if (config.accessories.sandbagsCount > 0) {
    const price = config.accessories.sandbagsCount === 4 ? ACCESSORY_PRICES.sandbag4 : ACCESSORY_PRICES.sandbag2;
    lineItems.push({
      id: `acc-sandbags-${config.accessories.sandbagsCount}`,
      name: `Heavy-Duty Saddle Sandbags (${config.accessories.sandbagsCount}-Pack)`,
      description: 'Heavy duty weight bags for wind stability (up to 40lbs/leg)',
      unitPrice: price,
      quantity: 1,
      total: price,
      category: 'accessories',
    });
  }

  if (config.accessories.heavyDutyRollerBag) {
    lineItems.push({
      id: 'acc-roller-bag',
      name: 'All-Terrain Deluxe Wheeled Roller Bag',
      description: 'Reinforced 1680D nylon with oversized wheels & grab handles',
      unitPrice: ACCESSORY_PRICES.rollerBag,
      quantity: 1,
      total: ACCESSORY_PRICES.rollerBag,
      category: 'accessories',
    });
  }

  if (config.accessories.stakeKit) {
    lineItems.push({
      id: 'acc-stake-kit',
      name: 'Commercial Heavy-Duty Spiral Stakes & Tie-Down Kit',
      description: '4x Steel stakes + ratcheting cam straps',
      unitPrice: ACCESSORY_PRICES.stakeKit,
      quantity: 1,
      total: ACCESSORY_PRICES.stakeKit,
      category: 'accessories',
    });
  }

  if (config.accessories.flagMounts) {
    lineItems.push({
      id: 'acc-flag-mounts',
      name: 'Corner Feather Flag Mounting Brackets (Pair)',
      description: 'Universal clamp brackets for 10ft & 14ft flags',
      unitPrice: ACCESSORY_PRICES.flagMounts,
      quantity: 1,
      total: ACCESSORY_PRICES.flagMounts,
      category: 'accessories',
    });
  }

  // Calculate totals
  const basePrice = BASE_CANOPY_PRICE;
  const frameUpgradeTotal = lineItems.filter(i => i.category === 'frame').reduce((acc, i) => acc + i.total, 0);
  const customizationTotal = lineItems.filter(i => i.category === 'customization').reduce((acc, i) => acc + i.total, 0);
  const wallsTotal = lineItems.filter(i => i.category === 'walls').reduce((acc, i) => acc + i.total, 0);
  const accessoriesTotal = lineItems.filter(i => i.category === 'accessories').reduce((acc, i) => acc + i.total, 0);

  let rawSubtotal = lineItems.reduce((acc, item) => acc + item.total, 0);
  if (discountPercent > 0) {
    rawSubtotal = rawSubtotal * (1 - discountPercent / 100);
  }

  const subtotal = Math.round(rawSubtotal * 100) / 100;
  const estimatedTax = Math.round(subtotal * 0.0825 * 100) / 100; // 8.25% mock sales tax
  const shipping = subtotal >= 300 ? 0.00 : 35.00; // Free ground shipping over $300
  const total = Math.round((subtotal + estimatedTax + shipping) * 100) / 100;

  return {
    basePrice,
    customizationTotal,
    wallsTotal,
    frameUpgradeTotal,
    accessoriesTotal,
    subtotal,
    estimatedTax,
    shipping,
    total,
    lineItems,
    currency: 'USD',
  };
}

/**
 * Build standard Shopify AJAX Cart API (/cart/add.js) payload
 */
export function buildShopifyCartPayload(
  config: CanopyConfig,
  pricing: PricingSummary,
  screenshotDataUrl?: string
): ShopifyCartPayload {
  const frameInfo = FRAME_PRICES[config.frame.type] || FRAME_PRICES['standard-steel'];

  const wallSummaryParts: string[] = [];
  (['front', 'back', 'left', 'right'] as TentFace[]).forEach(face => {
    const wall = config.walls[face];
    if (wall.type !== 'none') {
      wallSummaryParts.push(`${face.toUpperCase()}: ${WALL_PRICES[wall.type].name} (${wall.color})`);
    }
  });

  const accessoryParts: string[] = [];
  if (config.accessories.sandbagsCount > 0) accessoryParts.push(`${config.accessories.sandbagsCount}x Sandbags`);
  if (config.accessories.heavyDutyRollerBag) accessoryParts.push('Deluxe Wheeled Bag');
  if (config.accessories.stakeKit) accessoryParts.push('Spiral Stakes Kit');
  if (config.accessories.flagMounts) accessoryParts.push('Flag Mounts');

  const lineItem = {
    id: frameInfo.variantId,
    quantity: 1,
    properties: {
      _configId: config.id,
      _model: `${config.size} Custom Printed Commercial Canopy`,
      _dimensions: TENT_SIZE_OPTIONS[config.size]?.dimensions || `${config.size} Canopy`,
      'Base Fabric Color': config.baseColor,
      'Frame Specification': `${frameInfo.name} (${config.frame.finish})`,
      'Front Peak Customization': config.peaks.front.text || (config.peaks.front.logoUrl ? '[Custom Logo]' : 'None'),
      'Back Peak Customization': config.peaks.back.text || (config.peaks.back.logoUrl ? '[Custom Logo]' : 'None'),
      'Left Peak Customization': config.peaks.left.text || (config.peaks.left.logoUrl ? '[Custom Logo]' : 'None'),
      'Right Peak Customization': config.peaks.right.text || (config.peaks.right.logoUrl ? '[Custom Logo]' : 'None'),
      'Front Valance Customization': config.valances.front.text || 'None',
      'Wall Configuration': wallSummaryParts.length > 0 ? wallSummaryParts.join(' | ') : 'No Walls Selected',
      'Selected Accessories': accessoryParts.length > 0 ? accessoryParts.join(', ') : 'None',
      'Calculated Unit Price': `$${pricing.total.toFixed(2)} USD`,
      'Preview Thumbnail': screenshotDataUrl ? '[Attached Canvas Render]' : 'N/A',
    },
  };

  return {
    items: [lineItem],
    note: `Custom 3D Canopy Configurator Order #${config.id} generated at ${new Date().toISOString()}`,
    attributes: {
      'Configurator Version': '2.4.0',
      'Fabric Standard': '600D Polyester CPAI-84 Certified',
      'Estimated Production Time': '3-5 Business Days',
    },
  };
}
