import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CameraViewPreset,
  CanopyConfig,
  FaceGraphics,
  FrameFinish,
  FrameType,
  LightingPreset,
  MeshPartId,
  TentFace,
  TentSize,
  WallConfig,
} from '../types/configurator';
import { INITIAL_CANOPY_CONFIG } from '../utils/presets';

export type ConfiguratorTab = 'presets' | 'color' | 'graphics' | 'walls' | 'frame' | 'accessories';

export interface ConfiguratorState {
  config: CanopyConfig;
  activePart: MeshPartId;
  activeTab: ConfiguratorTab;
  cameraPreset: CameraViewPreset;
  lightingPreset: LightingPreset;
  isExplodedView: boolean;
  explodedFactor: number; // 0 (normal) to 1 (fully separated)
  isWireframe: boolean;
  showDimensions: boolean;
  isAutoRotating: boolean;
  hoveredPart: MeshPartId | null;
}

const initialState: ConfiguratorState = {
  config: INITIAL_CANOPY_CONFIG,
  activePart: 'peak_front',
  activeTab: 'presets',
  cameraPreset: 'isometric',
  lightingPreset: 'studio',
  isExplodedView: false,
  explodedFactor: 0,
  isWireframe: false,
  showDimensions: false,
  isAutoRotating: false,
  hoveredPart: null,
};

export const configuratorSlice = createSlice({
  name: 'configurator',
  initialState,
  reducers: {
    setTentSize: (state, action: PayloadAction<TentSize>) => {
      state.config.size = action.payload;
    },
    setBaseColor: (state, action: PayloadAction<string>) => {
      state.config.baseColor = action.payload;
      if (state.config.uniformColor) {
        (['front', 'back', 'left', 'right'] as TentFace[]).forEach((face) => {
          state.config.peaks[face].color = action.payload;
          state.config.valances[face].color = action.payload;
          if (state.config.walls[face].type !== 'none') {
            state.config.walls[face].color = action.payload;
          }
        });
      }
    },
    setUniformColor: (state, action: PayloadAction<boolean>) => {
      state.config.uniformColor = action.payload;
      if (action.payload) {
        const color = state.config.baseColor;
        (['front', 'back', 'left', 'right'] as TentFace[]).forEach((face) => {
          state.config.peaks[face].color = color;
          state.config.valances[face].color = color;
        });
      }
    },
    setActivePart: (state, action: PayloadAction<MeshPartId>) => {
      state.activePart = action.payload;
      // Auto-switch to appropriate tab when part is clicked
      if (action.payload.startsWith('peak_') || action.payload.startsWith('valance_')) {
        state.activeTab = 'graphics';
      } else if (action.payload.startsWith('wall_')) {
        state.activeTab = 'walls';
      } else if (action.payload === 'frame') {
        state.activeTab = 'frame';
      }
    },
    setHoveredPart: (state, action: PayloadAction<MeshPartId | null>) => {
      state.hoveredPart = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<ConfiguratorTab>) => {
      state.activeTab = action.payload;
    },
    updatePeakGraphics: (
      state,
      action: PayloadAction<{ face: TentFace; graphics: Partial<FaceGraphics> }>
    ) => {
      const { face, graphics } = action.payload;
      state.config.peaks[face] = {
        ...state.config.peaks[face],
        ...graphics,
      };
    },
    updateValanceGraphics: (
      state,
      action: PayloadAction<{ face: TentFace; graphics: Partial<FaceGraphics> }>
    ) => {
      const { face, graphics } = action.payload;
      state.config.valances[face] = {
        ...state.config.valances[face],
        ...graphics,
      };
    },
    updateWall: (
      state,
      action: PayloadAction<{ face: TentFace; wall: Partial<WallConfig> }>
    ) => {
      const { face, wall } = action.payload;
      state.config.walls[face] = {
        ...state.config.walls[face],
        ...wall,
        graphics: {
          ...state.config.walls[face].graphics,
          ...(wall.graphics || {}),
        },
      };
    },
    setFrameType: (state, action: PayloadAction<FrameType>) => {
      state.config.frame.type = action.payload;
    },
    setFrameFinish: (state, action: PayloadAction<FrameFinish>) => {
      state.config.frame.finish = action.payload;
    },
    updateAccessories: (
      state,
      action: PayloadAction<Partial<CanopyConfig['accessories']>>
    ) => {
      state.config.accessories = {
        ...state.config.accessories,
        ...action.payload,
      };
    },
    applyPreset: (state, action: PayloadAction<Partial<CanopyConfig>>) => {
      const preset = action.payload;
      state.config = {
        ...state.config,
        ...preset,
        peaks: {
          ...state.config.peaks,
          ...(preset.peaks || {}),
        },
        valances: {
          ...state.config.valances,
          ...(preset.valances || {}),
        },
        walls: {
          ...state.config.walls,
          ...(preset.walls || {}),
        },
        frame: {
          ...state.config.frame,
          ...(preset.frame || {}),
        },
        accessories: {
          ...state.config.accessories,
          ...(preset.accessories || {}),
        },
      };
    },
    setCameraPreset: (state, action: PayloadAction<CameraViewPreset>) => {
      state.cameraPreset = action.payload;
    },
    setLightingPreset: (state, action: PayloadAction<LightingPreset>) => {
      state.lightingPreset = action.payload;
    },
    setIsExplodedView: (state, action: PayloadAction<boolean>) => {
      state.isExplodedView = action.payload;
      state.explodedFactor = action.payload ? 1 : 0;
    },
    setExplodedFactor: (state, action: PayloadAction<number>) => {
      state.explodedFactor = action.payload;
      state.isExplodedView = action.payload > 0;
    },
    setIsWireframe: (state, action: PayloadAction<boolean>) => {
      state.isWireframe = action.payload;
    },
    setShowDimensions: (state, action: PayloadAction<boolean>) => {
      state.showDimensions = action.payload;
    },
    setIsAutoRotating: (state, action: PayloadAction<boolean>) => {
      state.isAutoRotating = action.payload;
    },
    resetConfig: (state) => {
      state.config = INITIAL_CANOPY_CONFIG;
      state.isExplodedView = false;
      state.explodedFactor = 0;
      state.isWireframe = false;
      state.showDimensions = false;
    },
  },
});

export const {
  setTentSize,
  setBaseColor,
  setUniformColor,
  setActivePart,
  setHoveredPart,
  setActiveTab,
  updatePeakGraphics,
  updateValanceGraphics,
  updateWall,
  setFrameType,
  setFrameFinish,
  updateAccessories,
  applyPreset,
  setCameraPreset,
  setLightingPreset,
  setIsExplodedView,
  setExplodedFactor,
  setIsWireframe,
  setShowDimensions,
  setIsAutoRotating,
  resetConfig,
} = configuratorSlice.actions;

export default configuratorSlice.reducer;
