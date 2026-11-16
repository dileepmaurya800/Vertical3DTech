import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/store';
import { setActivePart, setHoveredPart } from '../store/configuratorSlice';
import { ThreeScene } from './ThreeScene';
import { MeshPartId } from '../types/configurator';
import { RaycastHitResult } from '../types/three';

export function useThreeCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<ThreeScene | null>(null);
  const dispatch = useAppDispatch();

  const [isSceneReady, setIsSceneReady] = useState(false);
  const [hoveredResult, setHoveredResult] = useState<RaycastHitResult | null>(null);

  // Redux state selectors
  const config = useAppSelector((state) => state.configurator.config);
  const activePart = useAppSelector((state) => state.configurator.activePart);
  const cameraPreset = useAppSelector((state) => state.configurator.cameraPreset);
  const lightingPreset = useAppSelector((state) => state.configurator.lightingPreset);
  const isExplodedView = useAppSelector((state) => state.configurator.isExplodedView);
  const explodedFactor = useAppSelector((state) => state.configurator.explodedFactor);
  const isWireframe = useAppSelector((state) => state.configurator.isWireframe);
  const showDimensions = useAppSelector((state) => state.configurator.showDimensions);
  const isAutoRotating = useAppSelector((state) => state.configurator.isAutoRotating);

  // Initialize ThreeScene on mount
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new ThreeScene({
      container: containerRef.current,
      onPartClick: (partId: MeshPartId) => {
        dispatch(setActivePart(partId));
      },
      onPartHover: (hit: RaycastHitResult | null) => {
        dispatch(setHoveredPart(hit ? hit.partId : null));
        setHoveredResult(hit);
      },
      onLoaded: () => {
        setIsSceneReady(true);
      },
    });

    sceneRef.current = scene;

    // Initial load
    scene.loadModel(config);

    // ResizeObserver for responsive layout
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        scene.resize(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      scene.dispose();
      sceneRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync canopy configuration changes
  useEffect(() => {
    if (sceneRef.current && isSceneReady) {
      sceneRef.current.updateConfig(config);
    }
  }, [config, isSceneReady]);

  // Sync active part highlight
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setActivePart(activePart);
    }
  }, [activePart]);

  // Sync camera preset
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Sync lighting preset
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setLightingPreset(lightingPreset);
    }
  }, [lightingPreset]);

  // Sync exploded view
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setExplodedFactor(isExplodedView ? (explodedFactor || 1) : 0);
    }
  }, [isExplodedView, explodedFactor]);

  // Sync wireframe
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setIsWireframe(isWireframe);
    }
  }, [isWireframe]);

  // Sync dimensions
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setShowDimensions(showDimensions);
    }
  }, [showDimensions]);

  // Sync auto rotate
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setAutoRotate(isAutoRotating);
    }
  }, [isAutoRotating]);

  // Screenshot capture helper
  const captureScreenshot = useCallback((): string => {
    if (sceneRef.current) {
      return sceneRef.current.captureScreenshot();
    }
    return '';
  }, []);

  return {
    containerRef,
    isSceneReady,
    hoveredResult,
    captureScreenshot,
  };
}
