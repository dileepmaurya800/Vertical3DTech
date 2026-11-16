import { CanopyConfig, PresetTemplate } from '../types/configurator';

export const createDefaultGraphics = (text = '', color?: string) => ({
  color,
  text,
  textColor: '#ffffff',
  fontFamily: 'Montserrat' as const,
  fontSize: 36,
  textYOffset: 0,
  logoUrl: null,
  logoScale: 1.0,
  logoYOffset: 0,
  logoRotation: 0,
});

export const INITIAL_CANOPY_CONFIG: CanopyConfig = {
  id: 'CPY-TENT-001',
  name: 'Custom Printed Commercial Canopy',
  size: '8x8',
  baseColor: '#0284c7', // Professional Royal Blue
  uniformColor: true,
  peaks: {
    front: createDefaultGraphics('YOUR BRAND', '#0284c7'),
    back: createDefaultGraphics('WWW.YOURSITE.COM', '#0284c7'),
    left: createDefaultGraphics('INNOVATE', '#0284c7'),
    right: createDefaultGraphics('ELEVATE', '#0284c7'),
  },
  valances: {
    front: createDefaultGraphics('OFFICIAL PARTNER 2026', '#0284c7'),
    back: createDefaultGraphics('INFO@YOURSITE.COM', '#0284c7'),
    left: createDefaultGraphics('(800) 555-0199', '#0284c7'),
    right: createDefaultGraphics('@BRANDNAME', '#0284c7'),
  },
  walls: {
    back: {
      type: 'solid',
      color: '#0284c7',
      graphics: createDefaultGraphics('BACKDROP BANNER', '#0284c7'),
    },
    left: {
      type: 'half',
      color: '#0284c7',
      graphics: createDefaultGraphics('', '#0284c7'),
    },
    right: {
      type: 'none',
      color: '#0284c7',
      graphics: createDefaultGraphics('', '#0284c7'),
    },
    front: {
      type: 'none',
      color: '#0284c7',
      graphics: createDefaultGraphics('', '#0284c7'),
    },
  },
  frame: {
    type: 'commercial-aluminum',
    finish: 'silver',
  },
  accessories: {
    sandbagsCount: 4,
    heavyDutyRollerBag: true,
    stakeKit: true,
    flagMounts: false,
  },
};

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'tech-summit',
    name: 'Tech Summit Pro',
    tagline: 'Modern, high-contrast cyan & deep navy for tech expos',
    category: 'Corporate & Tech',
    previewColor: '#0284c7',
    config: {
      baseColor: '#0284c7',
      uniformColor: true,
      peaks: {
        front: { ...createDefaultGraphics('TECH SUMMIT 2026', '#0284c7'), fontSize: 42 },
        back: { ...createDefaultGraphics('POWERED BY CLOUD', '#0284c7'), fontSize: 34 },
        left: { ...createDefaultGraphics('INNOVATION HUB', '#0284c7'), fontSize: 34 },
        right: { ...createDefaultGraphics('NEXT-GEN AI', '#0284c7'), fontSize: 34 },
      },
      valances: {
        front: { ...createDefaultGraphics('BOOTH #408 • LIVE DEMOS', '#0369a1'), fontSize: 24 },
        back: { ...createDefaultGraphics('SCAN FOR FREE TRIAL', '#0369a1'), fontSize: 24 },
        left: { ...createDefaultGraphics('WWW.TECHSUMMIT.DEV', '#0369a1'), fontSize: 24 },
        right: { ...createDefaultGraphics('TALK TO OUR ENGINEERS', '#0369a1'), fontSize: 24 },
      },
      walls: {
        back: {
          type: 'solid',
          color: '#0369a1',
          graphics: { ...createDefaultGraphics('WELCOME TO THE FUTURE OF WORK', '#0369a1'), fontSize: 44 },
        },
        left: { type: 'half', color: '#0369a1', graphics: createDefaultGraphics('', '#0369a1') },
        right: { type: 'half', color: '#0369a1', graphics: createDefaultGraphics('', '#0369a1') },
        front: { type: 'none', color: '#0369a1', graphics: createDefaultGraphics('', '#0369a1') },
      },
      frame: { type: 'commercial-aluminum', finish: 'silver' },
      accessories: { sandbagsCount: 4, heavyDutyRollerBag: true, stakeKit: true, flagMounts: true },
    },
  },
  {
    id: 'craft-brewery',
    name: 'Artisan Brewery',
    tagline: 'Rich charcoal black with warm amber gold highlights',
    category: 'Food & Beverage',
    previewColor: '#262626',
    config: {
      baseColor: '#262626',
      uniformColor: true,
      peaks: {
        front: { ...createDefaultGraphics('HOP & BARLEY', '#262626'), textColor: '#f59e0b', fontSize: 44 },
        back: { ...createDefaultGraphics('MICROBREWERY EST. 2018', '#262626'), textColor: '#f59e0b', fontSize: 32 },
        left: { ...createDefaultGraphics('CRAFT IPA ON TAP', '#262626'), textColor: '#f59e0b', fontSize: 32 },
        right: { ...createDefaultGraphics('SOURS & STOUTS', '#262626'), textColor: '#f59e0b', fontSize: 32 },
      },
      valances: {
        front: { ...createDefaultGraphics('COLD DRAFT BEER HERE', '#171717'), textColor: '#fbbf24', fontSize: 24 },
        back: { ...createDefaultGraphics('FOLLOW US @HOPBARLEYBREW', '#171717'), textColor: '#fbbf24', fontSize: 24 },
        left: { ...createDefaultGraphics('FRESH PINTS DAILY', '#171717'), textColor: '#fbbf24', fontSize: 24 },
        right: { ...createDefaultGraphics('LOCAL GRAINS ONLY', '#171717'), textColor: '#fbbf24', fontSize: 24 },
      },
      walls: {
        back: {
          type: 'solid',
          color: '#171717',
          graphics: { ...createDefaultGraphics('TASTING ROOM MENU • FLIGHTS $12', '#171717'), textColor: '#fbbf24', fontSize: 38 },
        },
        left: { type: 'half', color: '#171717', graphics: createDefaultGraphics('', '#171717') },
        right: { type: 'none', color: '#171717', graphics: createDefaultGraphics('', '#171717') },
        front: { type: 'none', color: '#171717', graphics: createDefaultGraphics('', '#171717') },
      },
      frame: { type: 'heavy-duty-hex', finish: 'black' },
      accessories: { sandbagsCount: 4, heavyDutyRollerBag: true, stakeKit: true, flagMounts: false },
    },
  },
  {
    id: 'motorsport-red',
    name: 'Apex Racing Team',
    tagline: 'Aggressive racing crimson with bold contrast',
    category: 'Automotive & Sports',
    previewColor: '#dc2626',
    config: {
      baseColor: '#dc2626',
      uniformColor: true,
      peaks: {
        front: { ...createDefaultGraphics('APEX MOTORSPORTS', '#dc2626'), textColor: '#ffffff', fontSize: 44, fontFamily: 'Impact' },
        back: { ...createDefaultGraphics('SPEED • PRECISION • VICTORY', '#dc2626'), textColor: '#ffffff', fontSize: 30, fontFamily: 'Impact' },
        left: { ...createDefaultGraphics('PIT LANE GARAGE', '#dc2626'), textColor: '#ffffff', fontSize: 32, fontFamily: 'Impact' },
        right: { ...createDefaultGraphics('#88 GT-CUP RACING', '#dc2626'), textColor: '#ffffff', fontSize: 32, fontFamily: 'Impact' },
      },
      valances: {
        front: { ...createDefaultGraphics('RACE FUEL ONLY • NO SMOKING', '#991b1b'), textColor: '#ffffff', fontSize: 22, fontFamily: 'Impact' },
        back: { ...createDefaultGraphics('WWW.APEXRACINGTEAM.COM', '#991b1b'), textColor: '#ffffff', fontSize: 22 },
        left: { ...createDefaultGraphics('TEAM CREW ACCESS ONLY', '#991b1b'), textColor: '#ffffff', fontSize: 22 },
        right: { ...createDefaultGraphics('TIRE WARMING ZONE', '#991b1b'), textColor: '#ffffff', fontSize: 22 },
      },
      walls: {
        back: {
          type: 'solid',
          color: '#991b1b',
          graphics: { ...createDefaultGraphics('CHAMPIONSHIP STANDINGS', '#991b1b'), fontSize: 40, fontFamily: 'Impact' },
        },
        left: { type: 'solid', color: '#991b1b', graphics: createDefaultGraphics('', '#991b1b') },
        right: { type: 'window', color: '#991b1b', graphics: createDefaultGraphics('', '#991b1b') },
        front: { type: 'none', color: '#991b1b', graphics: createDefaultGraphics('', '#991b1b') },
      },
      frame: { type: 'heavy-duty-hex', finish: 'silver' },
      accessories: { sandbagsCount: 4, heavyDutyRollerBag: true, stakeKit: true, flagMounts: true },
    },
  },
  {
    id: 'eco-market',
    name: 'Farmers Market Organics',
    tagline: 'Earthy forest green & warm cream for outdoor markets',
    category: 'Market & Outdoor',
    previewColor: '#15803d',
    config: {
      baseColor: '#15803d',
      uniformColor: true,
      peaks: {
        front: { ...createDefaultGraphics('VERDANT FARMS', '#15803d'), textColor: '#fef3c7', fontSize: 44, fontFamily: 'Georgia' },
        back: { ...createDefaultGraphics('100% CERTIFIED ORGANIC', '#15803d'), textColor: '#fef3c7', fontSize: 32, fontFamily: 'Georgia' },
        left: { ...createDefaultGraphics('LOCAL HONEY & HERBS', '#15803d'), textColor: '#fef3c7', fontSize: 32, fontFamily: 'Georgia' },
        right: { ...createDefaultGraphics('FARM TO TABLE FRESH', '#15803d'), textColor: '#fef3c7', fontSize: 32, fontFamily: 'Georgia' },
      },
      valances: {
        front: { ...createDefaultGraphics('HARVESTED THIS MORNING', '#14532d'), textColor: '#fef3c7', fontSize: 22, fontFamily: 'Georgia' },
        back: { ...createDefaultGraphics('WWW.VERDANTFARMS.ORG', '#14532d'), textColor: '#fef3c7', fontSize: 22 },
        left: { ...createDefaultGraphics('NO PESTICIDES • EVER', '#14532d'), textColor: '#fef3c7', fontSize: 22 },
        right: { ...createDefaultGraphics('FAMILY OWNED SINCE 1994', '#14532d'), textColor: '#fef3c7', fontSize: 22 },
      },
      walls: {
        back: {
          type: 'window',
          color: '#14532d',
          graphics: createDefaultGraphics('', '#14532d'),
        },
        left: { type: 'none', color: '#14532d', graphics: createDefaultGraphics('', '#14532d') },
        right: { type: 'none', color: '#14532d', graphics: createDefaultGraphics('', '#14532d') },
        front: { type: 'none', color: '#14532d', graphics: createDefaultGraphics('', '#14532d') },
      },
      frame: { type: 'standard-steel', finish: 'white' },
      accessories: { sandbagsCount: 4, heavyDutyRollerBag: true, stakeKit: true, flagMounts: false },
    },
  },
];

export const POPULAR_COLORS = [
  { name: 'Royal Blue', hex: '#0284c7' },
  { name: 'Navy Blue', hex: '#1e3a8a' },
  { name: 'Racing Red', hex: '#dc2626' },
  { name: 'Forest Green', hex: '#15803d' },
  { name: 'Charcoal Black', hex: '#1f2937' },
  { name: 'Pure White', hex: '#f8fafc' },
  { name: 'Warm Amber', hex: '#d97706' },
  { name: 'Vibrant Orange', hex: '#ea580c' },
  { name: 'Deep Purple', hex: '#7e22ce' },
  { name: 'Teal Cyan', hex: '#0d9488' },
  { name: 'Graphite Grey', hex: '#4b5563' },
  { name: 'Bright Yellow', hex: '#eab308' },
];

export const SAMPLE_LOGOS = [
  {
    name: 'Shield Emblem',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/></svg>`,
  },
  {
    name: 'Mountain Outdoor',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/><path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19"/></svg>`,
  },
  {
    name: 'Rocket Launch',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
  },
  {
    name: 'Crown VIP',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>`,
  },
  {
    name: 'Flame Energy',
    svg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`,
  },
];
