import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  CameraViewPreset,
  CanopyConfig,
  LightingPreset,
  MeshPartId,
  TENT_SIZE_OPTIONS,
  TentSize,
} from '../types/configurator';
import { RaycastHitResult } from '../types/three';
import { CanopyGeometryBuilder, CanopyModelGroups } from './CanopyGeometryBuilder';
import { CanvasTextureManager } from './CanvasTextureManager';

export interface ThreeSceneOptions {
  container: HTMLDivElement;
  onPartClick?: (partId: MeshPartId) => void;
  onPartHover?: (hit: RaycastHitResult | null) => void;
  onLoaded?: () => void;
}

export class ThreeScene {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private textureManager: CanvasTextureManager;
  private geometryBuilder: CanopyGeometryBuilder;

  // Active GLTF Model
  private gltfLoader = new GLTFLoader();
  private loadedGltfGroup: THREE.Group | null = null;
  private currentLoadedSize: TentSize | null = null;
  private interactiveMeshes = new Map<MeshPartId, THREE.Mesh>();

  // User GLTF Sub-nodes & Materials
  private fabricNode: THREE.Object3D | null = null;
  private mechanismNode: THREE.Object3D | null = null;
  private fabricMaterial: THREE.MeshStandardMaterial | null = null;
  private innerFabricMaterial: THREE.MeshStandardMaterial | null = null;
  private metalMaterial: THREE.MeshStandardMaterial | null = null;

  private originalFabricPos = new THREE.Vector3();
  private originalMechPos = new THREE.Vector3();

  // Supplementary Walls & Accessories Group
  private secondaryModelGroups: CanopyModelGroups | null = null;

  // Lights & Shadows
  private ambientLight!: THREE.AmbientLight;
  private hemisphereLight!: THREE.HemisphereLight;
  private dirLightKey!: THREE.DirectionalLight;
  private dirLightFill!: THREE.DirectionalLight;
  private groundShadowMesh!: THREE.Mesh;
  private gridHelper!: THREE.GridHelper;

  private animFrameId: number | null = null;
  private isDisposed = false;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(-999, -999);
  private hoveredPartId: MeshPartId | null = null;
  private activePartId: MeshPartId | null = 'peak_front';

  // Camera animation
  private isCameraTransitioning = false;
  private cameraStartPos = new THREE.Vector3();
  private cameraTargetPos = new THREE.Vector3();
  private controlsStartTarget = new THREE.Vector3();
  private controlsEndTarget = new THREE.Vector3();
  private cameraTransitionProgress = 1;
  private readonly cameraTransitionDuration = 0.8;
  private lastTimestamp = 0;

  // Exploded view
  private currentExplodedFactor = 0;
  private targetExplodedFactor = 0;

  // Callbacks
  private onPartClick?: (partId: MeshPartId) => void;
  private onPartHover?: (hit: RaycastHitResult | null) => void;
  private onLoaded?: () => void;

  constructor(options: ThreeSceneOptions) {
    this.container = options.container;
    this.onPartClick = options.onPartClick;
    this.onPartHover = options.onPartHover;
    this.onLoaded = options.onLoaded;

    this.initEngine();
    this.initLights();
    this.initGroundShadow();

    this.textureManager = new CanvasTextureManager(
      this.renderer.capabilities.getMaxAnisotropy()
    );
    this.geometryBuilder = new CanopyGeometryBuilder(this.textureManager);

    this.bindEvents();
    this.startRenderLoop();
  }

  /**
   * Initialize Three.js WebGLRenderer, Scene, Camera, and OrbitControls
   */
  private initEngine() {
    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(4.8, 3.6, 4.8);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 1.4, 0);
    this.controls.minDistance = 2.0;
    this.controls.maxDistance = 14.0;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.08;
    this.controls.update();
  }

  /**
   * Setup studio lighting
   */
  private initLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(this.ambientLight);

    this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.5);
    this.scene.add(this.hemisphereLight);

    this.dirLightKey = new THREE.DirectionalLight(0xffffff, 1.4);
    this.dirLightKey.position.set(6, 8, 7);
    this.dirLightKey.castShadow = true;
    this.dirLightKey.shadow.mapSize.width = 2048;
    this.dirLightKey.shadow.mapSize.height = 2048;
    this.dirLightKey.shadow.camera.near = 0.5;
    this.dirLightKey.shadow.camera.far = 25;
    this.dirLightKey.shadow.camera.left = -4;
    this.dirLightKey.shadow.camera.right = 4;
    this.dirLightKey.shadow.camera.top = 5;
    this.dirLightKey.shadow.camera.bottom = -1;
    this.dirLightKey.shadow.bias = -0.0005;
    this.scene.add(this.dirLightKey);

    this.dirLightFill = new THREE.DirectionalLight(0x93c5fd, 0.6);
    this.dirLightFill.position.set(-6, 5, -5);
    this.scene.add(this.dirLightFill);
  }

  /**
   * Contact shadow and floor showroom grid
   */
  private initGroundShadow() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 250);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.18)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);
    }

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(5.4, 5.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
    });

    this.groundShadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    this.groundShadowMesh.rotation.x = -Math.PI / 2;
    this.groundShadowMesh.position.y = 0.001;
    this.scene.add(this.groundShadowMesh);

    this.gridHelper = new THREE.GridHelper(8, 16, 0x0284c7, 0x1e293b);
    this.gridHelper.position.y = 0.0005;
    this.scene.add(this.gridHelper);
  }

  /**
   * Load the User's Real GLB Canopy Model (Tent_8_8.glb / Tent_6_5_6_5.glb / Tent_5_5.glb)
   */
  public async loadModel(config: CanopyConfig): Promise<void> {
    const targetGlbPath = TENT_SIZE_OPTIONS[config.size]?.glbFile || '/models/Tent_8_8.glb';

    // If size changed or not loaded yet, fetch GLB
    if (this.currentLoadedSize !== config.size || !this.loadedGltfGroup) {
      // Clean previous model
      if (this.loadedGltfGroup) {
        this.scene.remove(this.loadedGltfGroup);
        this.disposeObject(this.loadedGltfGroup);
        this.loadedGltfGroup = null;
      }
      this.interactiveMeshes.clear();

      try {
        console.log(`[ThreeScene] Loading User GLB: ${targetGlbPath}`);
        const gltf = await this.loadGlbAsync(targetGlbPath);
        this.loadedGltfGroup = gltf.scene;
        this.currentLoadedSize = config.size;

        this.processUserGlbHierarchy(gltf.scene);
        this.scene.add(this.loadedGltfGroup);

        if (this.onLoaded) {
          this.onLoaded();
        }
      } catch (err) {
        console.warn(`[ThreeScene] Error loading ${targetGlbPath}, falling back to procedural model:`, err);
        // Fallback procedural
        if (!this.secondaryModelGroups) {
          this.secondaryModelGroups = this.geometryBuilder.buildCanopyModel(config);
          this.scene.add(this.secondaryModelGroups.rootGroup);
        }
      }
    }

    // Apply materials, colors, and canvas textures
    this.applyMaterialsFromConfig(config);
  }

  private loadGlbAsync(url: string): Promise<{ scene: THREE.Group }> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        url,
        (gltf) => resolve(gltf as unknown as { scene: THREE.Group }),
        undefined,
        (err) => reject(err)
      );
    });
  }

  /**
   * Parse user GLB nodes ('fabric', 'leg', 'mechanism') & clone materials for independent control
   */
  private processUserGlbHierarchy(root: THREE.Group) {
    this.fabricNode = null;
    this.mechanismNode = null;

    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Clone materials to avoid shared state
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
          mesh.material.forEach((m) => this.categorizeMaterial(m));
        } else if (mesh.material) {
          mesh.material = mesh.material.clone();
          this.categorizeMaterial(mesh.material);
        }
      }

      const lowerName = obj.name.toLowerCase();

      // Canopy Roof Fabric node
      if (lowerName.includes('fabric')) {
        this.fabricNode = obj;
        this.originalFabricPos.copy(obj.position);
        obj.userData = {
          partId: 'peak_front',
          label: 'Custom Canopy Roof Fabric',
          category: 'peak',
        };
        if ((obj as THREE.Mesh).isMesh) {
          this.interactiveMeshes.set('peak_front', obj as THREE.Mesh);
          this.interactiveMeshes.set('valance_front', obj as THREE.Mesh);
        }
      }

      // Frame Legs node
      if (lowerName.includes('leg')) {
        obj.userData = {
          partId: 'frame',
          label: 'Commercial Telescopic Leg',
          category: 'frame',
        };
        if ((obj as THREE.Mesh).isMesh) {
          this.interactiveMeshes.set('frame', obj as THREE.Mesh);
        }
      }

      // Scissor Truss Mechanism node
      if (lowerName.includes('mechanism')) {
        this.mechanismNode = obj;
        this.originalMechPos.copy(obj.position);
        obj.userData = {
          partId: 'frame',
          label: 'Scissor Truss Mechanism',
          category: 'frame',
        };
        if ((obj as THREE.Mesh).isMesh && !this.interactiveMeshes.has('frame')) {
          this.interactiveMeshes.set('frame', obj as THREE.Mesh);
        }
      }
    });

    // Compute bounding box and adjust camera lookAt
    const bbox = new THREE.Box3().setFromObject(root);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    this.controls.target.set(0, center.y, 0);
  }

  private categorizeMaterial(mat: THREE.Material) {
    const stdMat = mat as THREE.MeshStandardMaterial;
    if (mat.name === 'fabric_Mat') {
      this.fabricMaterial = stdMat;
    } else if (mat.name === 'Inner_fabric') {
      this.innerFabricMaterial = stdMat;
    } else if (mat.name === 'Metal_mat') {
      this.metalMaterial = stdMat;
    }
  }

  /**
   * Sync Canopy Config with User GLB materials
   */
  public updateConfig(config: CanopyConfig) {
    // If size changed, reload appropriate GLB
    if (this.currentLoadedSize !== config.size) {
      this.loadModel(config);
      return;
    }

    this.applyMaterialsFromConfig(config);
    this.updateActivePartHighlight();
    this.applyExplodedTransform(this.currentExplodedFactor);
  }

  private applyMaterialsFromConfig(config: CanopyConfig) {
    // 1. Update Canopy Fabric Material
    if (this.fabricMaterial) {
      const frontPeak = config.peaks.front;
      const baseHex = config.baseColor;

      // If user has custom text or custom logo, generate dynamic CanvasTexture
      if (frontPeak.text.trim() || frontPeak.logoUrl) {
        const dynamicTexture = this.textureManager.getOrCreateTexture(
          'peak_front',
          frontPeak,
          baseHex,
          false
        );
        this.fabricMaterial.map = dynamicTexture;
        this.fabricMaterial.color.setHex(0xffffff); // Use canvas texture as true color
      } else {
        // Pure fabric color
        this.fabricMaterial.color.set(baseHex);
      }
      this.fabricMaterial.roughness = 0.75;
      this.fabricMaterial.needsUpdate = true;
    }

    if (this.innerFabricMaterial) {
      this.innerFabricMaterial.color.set(config.baseColor);
      this.innerFabricMaterial.roughness = 0.85;
      this.innerFabricMaterial.needsUpdate = true;
    }

    // 2. Update Metal Frame Hardware Finish
    if (this.metalMaterial) {
      if (config.frame.finish === 'black') {
        this.metalMaterial.color.setHex(0x1f2937);
        this.metalMaterial.roughness = 0.45;
        this.metalMaterial.metalness = 0.5;
      } else if (config.frame.finish === 'white') {
        this.metalMaterial.color.setHex(0xf8fafc);
        this.metalMaterial.roughness = 0.35;
        this.metalMaterial.metalness = 0.2;
      } else {
        // Silver aluminum
        this.metalMaterial.color.setHex(0xd1d5db);
        this.metalMaterial.roughness = 0.25;
        this.metalMaterial.metalness = 0.85;
      }
      this.metalMaterial.needsUpdate = true;
    }
  }

  /**
   * Update active selection highlight
   */
  public setActivePart(partId: MeshPartId) {
    this.activePartId = partId;
    this.updateActivePartHighlight();
  }

  private updateActivePartHighlight() {
    if (!this.fabricMaterial || !this.metalMaterial) return;

    if (this.activePartId?.startsWith('peak') || this.activePartId?.startsWith('valance')) {
      this.fabricMaterial.emissive.setHex(0x0284c7);
      this.fabricMaterial.emissiveIntensity = 0.25;
      this.metalMaterial.emissive.setHex(0x000000);
      this.metalMaterial.emissiveIntensity = 0;
    } else if (this.activePartId === 'frame') {
      this.metalMaterial.emissive.setHex(0x38bdf8);
      this.metalMaterial.emissiveIntensity = 0.35;
      this.fabricMaterial.emissive.setHex(0x000000);
      this.fabricMaterial.emissiveIntensity = 0;
    } else {
      this.fabricMaterial.emissive.setHex(0x000000);
      this.fabricMaterial.emissiveIntensity = 0;
      this.metalMaterial.emissive.setHex(0x000000);
      this.metalMaterial.emissiveIntensity = 0;
    }
  }

  /**
   * Set Exploded View factor (0 = assembled, 1 = exploded)
   */
  public setExplodedFactor(factor: number) {
    this.targetExplodedFactor = Math.max(0, Math.min(1, factor));
  }

  private applyExplodedTransform(t: number) {
    // Elevate the user's real GLTF fabric roof
    if (this.fabricNode) {
      this.fabricNode.position.y = this.originalFabricPos.y + t * 0.95;
    }
    // Elevate the scissor truss mechanism
    if (this.mechanismNode) {
      this.mechanismNode.position.y = this.originalMechPos.y + t * 0.4;
    }
  }

  /**
   * Switch lighting environment preset
   */
  public setLightingPreset(preset: LightingPreset) {
    switch (preset) {
      case 'studio':
        this.ambientLight.intensity = 0.7;
        this.ambientLight.color.setHex(0xffffff);
        this.dirLightKey.intensity = 1.4;
        this.dirLightKey.color.setHex(0xffffff);
        this.dirLightFill.intensity = 0.6;
        this.dirLightFill.color.setHex(0x93c5fd);
        break;

      case 'outdoor-day':
        this.ambientLight.intensity = 0.9;
        this.ambientLight.color.setHex(0xfef9c3);
        this.dirLightKey.intensity = 1.8;
        this.dirLightKey.color.setHex(0xfffbeb);
        this.dirLightFill.intensity = 0.7;
        this.dirLightFill.color.setHex(0xbae6fd);
        break;

      case 'sunset':
        this.ambientLight.intensity = 0.5;
        this.ambientLight.color.setHex(0xfdba74);
        this.dirLightKey.intensity = 1.5;
        this.dirLightKey.color.setHex(0xf97316);
        this.dirLightFill.intensity = 0.8;
        this.dirLightFill.color.setHex(0x7c3aed);
        break;

      case 'event':
        this.ambientLight.intensity = 0.4;
        this.ambientLight.color.setHex(0xe2e8f0);
        this.dirLightKey.intensity = 1.6;
        this.dirLightKey.color.setHex(0x38bdf8);
        this.dirLightFill.intensity = 1.0;
        this.dirLightFill.color.setHex(0xa855f7);
        break;
    }
  }

  /**
   * Toggle 3D Dimension lines visibility
   */
  public setShowDimensions(show: boolean) {
    this.gridHelper.visible = show;
  }

  /**
   * Toggle wireframe mode
   */
  public setIsWireframe(wireframe: boolean) {
    if (this.fabricMaterial) this.fabricMaterial.wireframe = wireframe;
    if (this.metalMaterial) this.metalMaterial.wireframe = wireframe;
  }

  /**
   * Set OrbitControls auto-rotation
   */
  public setAutoRotate(autoRotate: boolean) {
    this.controls.autoRotate = autoRotate;
    this.controls.autoRotateSpeed = 2.0;
  }

  /**
   * Smoothly animate camera to specific viewpoint
   */
  public setCameraPreset(preset: CameraViewPreset) {
    const targets: Record<CameraViewPreset, { pos: THREE.Vector3; lookAt: THREE.Vector3 }> = {
      isometric: { pos: new THREE.Vector3(4.8, 3.6, 4.8), lookAt: new THREE.Vector3(0, 1.4, 0) },
      front: { pos: new THREE.Vector3(0, 1.8, 5.4), lookAt: new THREE.Vector3(0, 1.4, 0) },
      back: { pos: new THREE.Vector3(0, 1.8, -5.4), lookAt: new THREE.Vector3(0, 1.4, 0) },
      left: { pos: new THREE.Vector3(-5.4, 1.8, 0), lookAt: new THREE.Vector3(0, 1.4, 0) },
      right: { pos: new THREE.Vector3(5.4, 1.8, 0), lookAt: new THREE.Vector3(0, 1.4, 0) },
      top: { pos: new THREE.Vector3(0, 7.2, 0.05), lookAt: new THREE.Vector3(0, 1.4, 0) },
      interior: { pos: new THREE.Vector3(0, 1.0, 0.1), lookAt: new THREE.Vector3(0, 2.6, 0) },
    };

    const target = targets[preset] || targets.isometric;

    this.cameraStartPos.copy(this.camera.position);
    this.cameraTargetPos.copy(target.pos);
    this.controlsStartTarget.copy(this.controls.target);
    this.controlsEndTarget.copy(target.lookAt);

    this.cameraTransitionProgress = 0;
    this.isCameraTransitioning = true;
  }

  /**
   * Capture crisp screenshot from WebGL canvas
   */
  public captureScreenshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Handle Raycasting pointer events
   */
  private bindEvents() {
    const dom = this.renderer.domElement;
    dom.addEventListener('pointermove', this.onPointerMove);
    dom.addEventListener('pointerdown', this.onPointerDown);
    dom.addEventListener('pointerleave', this.onPointerLeave);
  }

  private onPointerMove = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.performRaycast(false);
  };

  private onPointerDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.performRaycast(true);
  };

  private onPointerLeave = () => {
    this.pointer.set(-999, -999);
    if (this.hoveredPartId) {
      this.hoveredPartId = null;
      this.updateActivePartHighlight();
      if (this.onPartHover) {
        this.onPartHover(null);
      }
      this.renderer.domElement.style.cursor = 'default';
    }
  };

  private performRaycast(isClick: boolean) {
    if (this.interactiveMeshes.size === 0) return;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const meshes = Array.from(this.interactiveMeshes.values());
    const intersects = this.raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      const hit = intersects[0];
      const partId = (hit.object.userData.partId as MeshPartId) || 'peak_front';
      const label = (hit.object.userData.label as string) || 'Canopy Tent Part';

      if (!isClick) {
        if (this.hoveredPartId !== partId) {
          this.hoveredPartId = partId;
          this.updateActivePartHighlight();
          this.renderer.domElement.style.cursor = 'pointer';

          if (this.onPartHover) {
            this.onPartHover({
              partId,
              label,
              point: hit.point,
              normal: hit.face?.normal,
              distance: hit.distance,
            });
          }
        }
      } else {
        this.activePartId = partId;
        this.updateActivePartHighlight();
        if (this.onPartClick) {
          this.onPartClick(partId);
        }
      }
    } else {
      if (!isClick && this.hoveredPartId !== null) {
        this.hoveredPartId = null;
        this.updateActivePartHighlight();
        this.renderer.domElement.style.cursor = 'default';
        if (this.onPartHover) {
          this.onPartHover(null);
        }
      }
    }
  }

  /**
   * Handle resize
   */
  public resize(width: number, height: number) {
    if (width === 0 || height === 0 || this.isDisposed) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Render Loop with smooth camera transitions and exploded view lerping
   */
  private startRenderLoop() {
    this.lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      if (this.isDisposed) return;

      const delta = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      // 1. Camera Transition Animation
      if (this.isCameraTransitioning) {
        this.cameraTransitionProgress += delta / this.cameraTransitionDuration;
        const t = Math.min(this.cameraTransitionProgress, 1.0);
        const ease = 1 - Math.pow(1 - t, 3);

        this.camera.position.lerpVectors(this.cameraStartPos, this.cameraTargetPos, ease);
        this.controls.target.lerpVectors(this.controlsStartTarget, this.controlsEndTarget, ease);

        if (t >= 1.0) {
          this.isCameraTransitioning = false;
        }
      }

      // 2. Exploded View Smooth Lerp
      if (Math.abs(this.currentExplodedFactor - this.targetExplodedFactor) > 0.001) {
        this.currentExplodedFactor += (this.targetExplodedFactor - this.currentExplodedFactor) * Math.min(delta * 8, 1);
        this.applyExplodedTransform(this.currentExplodedFactor);
      }

      // 3. Controls & Render
      this.controls.update();
      this.renderer.render(this.scene, this.camera);

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private disposeObject(obj: THREE.Object3D) {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => m.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      }
    });
  }

  public dispose() {
    this.isDisposed = true;

    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointermove', this.onPointerMove);
    dom.removeEventListener('pointerdown', this.onPointerDown);
    dom.removeEventListener('pointerleave', this.onPointerLeave);

    if (this.loadedGltfGroup) {
      this.disposeObject(this.loadedGltfGroup);
    }
    if (this.secondaryModelGroups) {
      this.disposeObject(this.secondaryModelGroups.rootGroup);
    }

    this.textureManager.dispose();
    this.controls.dispose();
    this.renderer.dispose();

    if (dom.parentElement) {
      dom.parentElement.removeChild(dom);
    }
  }
}
