export interface PriceLineItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  total: number;
  category: 'base' | 'customization' | 'walls' | 'frame' | 'accessories';
}

export interface PricingSummary {
  basePrice: number;
  customizationTotal: number;
  wallsTotal: number;
  frameUpgradeTotal: number;
  accessoriesTotal: number;
  subtotal: number;
  estimatedTax: number;
  shipping: number;
  total: number;
  lineItems: PriceLineItem[];
  currency: string;
}

// Shopify Cart API (AJAX API /cart/add.js) Specification Schema
export interface ShopifyCartItemProperty {
  [key: string]: string | number | boolean;
}

export interface ShopifyCartLineItem {
  id: number; // Shopify Variant ID
  quantity: number;
  properties: {
    _configId: string;
    _model: string;
    _dimensions: string;
    'Base Fabric Color': string;
    'Frame Specification': string;
    'Front Peak Customization'?: string;
    'Back Peak Customization'?: string;
    'Left Peak Customization'?: string;
    'Right Peak Customization'?: string;
    'Front Valance Customization'?: string;
    'Back Valance Customization'?: string;
    'Left Valance Customization'?: string;
    'Right Valance Customization'?: string;
    'Wall Configuration'?: string;
    'Selected Accessories'?: string;
    'Production Spec Sheet URL'?: string;
    'Preview Thumbnail'?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface ShopifyCartPayload {
  items: ShopifyCartLineItem[];
  note?: string;
  attributes?: Record<string, string>;
}
