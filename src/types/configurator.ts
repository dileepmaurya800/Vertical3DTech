export type TentFace = 'front' | 'back' | 'left' | 'right';

export type TentSize = '8x8' | '6.5x6.5' | '5x5';

export interface TentSizeOption {
  id: TentSize;
  label: string;
  dimensions: string;
  glbFile: string;
}

export const TENT_SIZE_OPTIONS: Record<TentSize, TentSizeOption> = {
  '8x8': {
    id: '8x8',
    label: '8x8 Canopy',
    dimensions: '8ft x 8ft (2.4m x 2.4m)',
    glbFile: '/models/Tent_8_8.glb',
  },
  '6.5x6.5': {
    id: '6.5x6.5',
    label: '6.5x6.5 Canopy',
    dimensions: '6.5ft x 6.5ft (2.0m x 2.0m)',
    glbFile: '/models/Tent_6_5_6_5.glb',
  },
  '5x5': {
    id: '5x5',
    label: '5x5 Canopy',
    dimensions: '5ft x 5ft (1.5m x 1.5m)',
    glbFile: '/models/Tent_5_5.glb',
  },
};

export type MeshPartId =
  | 'peak_front'
  | 'peak_back'
  | 'peak_left'
  | 'peak_right'
  | 'valance_front'
  | 'valance_back'
  | 'valance_left'
  | 'valance_right'
  | 'wall_back'
  | 'wall_left'
  | 'wall_right'
  | 'wall_front'
  | 'frame';

export type WallType = 'none' | 'solid' | 'half' | 'window' | 'zipper';

export type FrameType = 'standard-steel' | 'commercial-aluminum' | 'heavy-duty-hex';

export type FrameFinish = 'silver' | 'black' | 'white';

export type LightingPreset = 'studio' | 'outdoor-day' | 'sunset' | 'event';

export type CameraViewPreset = 'isometric' | 'front' | 'back' | 'left' | 'right' | 'top' | 'interior';

export interface FaceGraphics {
  color?: string; // If undefined, falls back to base canopy color
  text: string;
  textColor: string;
  fontFamily: 'Montserrat' | 'Inter' | 'Impact' | 'Courier New' | 'Georgia';
  fontSize: number; // in pt
  textYOffset: number; // -1 to 1 (vertical centering adjustment)
  logoUrl: string | null;
  logoScale: number; // 0.2 to 2.5
  logoYOffset: number; // -1 to 1
  logoRotation: number; // in degrees
}

export interface WallConfig {
  type: WallType;
  color: string;
  graphics: FaceGraphics;
}

export interface CanopyConfig {
  id: string;
  name: string;
  size: TentSize;
  baseColor: string; // Default fabric color for all sections
  uniformColor: boolean; // When true, all peaks and valances share baseColor
  peaks: Record<TentFace, FaceGraphics>;
  valances: Record<TentFace, FaceGraphics>;
  walls: Record<TentFace, WallConfig>;
  frame: {
    type: FrameType;
    finish: FrameFinish;
  };
  accessories: {
    sandbagsCount: 0 | 2 | 4;
    heavyDutyRollerBag: boolean;
    stakeKit: boolean;
    flagMounts: boolean;
  };
}

export interface PresetTemplate {
  id: string;
  name: string;
  tagline: string;
  category: string;
  previewColor: string;
  config: Partial<CanopyConfig>;
}
