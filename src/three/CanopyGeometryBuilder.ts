import * as THREE from 'three';
import { CanopyConfig, MeshPartId, TentFace } from '../types/configurator';
import { CanvasTextureManager } from './CanvasTextureManager';

export interface CanopyModelGroups {
  rootGroup: THREE.Group;
  roofGroup: THREE.Group;
  valanceGroup: THREE.Group;
  frameGroup: THREE.Group;
  wallsGroup: THREE.Group;
  accessoriesGroup: THREE.Group;
  dimensionGroup: THREE.Group;
  interactiveMeshes: Map<MeshPartId, THREE.Mesh>;
  materials: Map<MeshPartId, THREE.MeshStandardMaterial>;
}

export class CanopyGeometryBuilder {
  // Dimensions in meters (10ft = 3.048m)
  public static readonly WIDTH = 3.05;
  public static readonly DEPTH = 3.05;
  public static readonly EAVES_HEIGHT = 2.15;
  public static readonly VALANCE_HEIGHT = 0.35;
  public static readonly PEAK_HEIGHT = 3.40;

  private textureManager: CanvasTextureManager;

  constructor(textureManager: CanvasTextureManager) {
    this.textureManager = textureManager;
  }

  /**
   * Build the complete 10x10 canopy tent assembly
   */
  public buildCanopyModel(config: CanopyConfig): CanopyModelGroups {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'CanopyTent_Root';

    const roofGroup = new THREE.Group();
    roofGroup.name = 'Roof_Group';

    const valanceGroup = new THREE.Group();
    valanceGroup.name = 'Valance_Group';

    const frameGroup = new THREE.Group();
    frameGroup.name = 'Frame_Group';

    const wallsGroup = new THREE.Group();
    wallsGroup.name = 'Walls_Group';

    const accessoriesGroup = new THREE.Group();
    accessoriesGroup.name = 'Accessories_Group';

    const dimensionGroup = new THREE.Group();
    dimensionGroup.name = 'Dimension_Group';

    const interactiveMeshes = new Map<MeshPartId, THREE.Mesh>();
    const materials = new Map<MeshPartId, THREE.MeshStandardMaterial>();

    // 1. Build 4 Roof Peaks
    this.buildRoofPeaks(config, roofGroup, interactiveMeshes, materials);

    // 2. Build 4 Valance drops
    this.buildValances(config, valanceGroup, interactiveMeshes, materials);

    // 3. Build Structural Frame (Legs, Scissor Trusses, Center Peak Pole)
    this.buildFrame(config, frameGroup, interactiveMeshes);

    // 4. Build Walls
    this.buildWalls(config, wallsGroup, interactiveMeshes, materials);

    // 5. Build Accessories (Sandbags, Stakes, Flags)
    this.buildAccessories(config, accessoriesGroup);

    // 6. Build 3D Dimension Annotation Lines
    this.buildDimensionGuides(dimensionGroup);

    rootGroup.add(roofGroup);
    rootGroup.add(valanceGroup);
    rootGroup.add(frameGroup);
    rootGroup.add(wallsGroup);
    rootGroup.add(accessoriesGroup);
    rootGroup.add(dimensionGroup);

    return {
      rootGroup,
      roofGroup,
      valanceGroup,
      frameGroup,
      wallsGroup,
      accessoriesGroup,
      dimensionGroup,
      interactiveMeshes,
      materials,
    };
  }

  /**
   * Build the 4 triangular roof peak faces with custom UVs
   */
  private buildRoofPeaks(
    config: CanopyConfig,
    group: THREE.Group,
    meshMap: Map<MeshPartId, THREE.Mesh>,
    materialMap: Map<MeshPartId, THREE.MeshStandardMaterial>
  ) {
    const w2 = CanopyGeometryBuilder.WIDTH / 2;
    const d2 = CanopyGeometryBuilder.DEPTH / 2;
    const hEaves = CanopyGeometryBuilder.EAVES_HEIGHT;
    const hPeak = CanopyGeometryBuilder.PEAK_HEIGHT;

    const apex = new THREE.Vector3(0, hPeak, 0);

    const corners = {
      frontRight: new THREE.Vector3(w2, hEaves, d2),
      frontLeft: new THREE.Vector3(-w2, hEaves, d2),
      backLeft: new THREE.Vector3(-w2, hEaves, -d2),
      backRight: new THREE.Vector3(w2, hEaves, -d2),
    };

    const peakConfigs: { face: TentFace; partId: MeshPartId; v1: THREE.Vector3; v2: THREE.Vector3; v3: THREE.Vector3 }[] = [
      { face: 'front', partId: 'peak_front', v1: corners.frontLeft, v2: corners.frontRight, v3: apex },
      { face: 'back', partId: 'peak_back', v1: corners.backRight, v2: corners.backLeft, v3: apex },
      { face: 'left', partId: 'peak_left', v1: corners.backLeft, v2: corners.frontLeft, v3: apex },
      { face: 'right', partId: 'peak_right', v1: corners.frontRight, v2: corners.backRight, v3: apex },
    ];

    peakConfigs.forEach(({ face, partId, v1, v2, v3 }) => {
      const geom = new THREE.BufferGeometry();

      // Triangle vertices: bottom-left (v1), bottom-right (v2), apex (v3)
      const positions = new Float32Array([
        v1.x, v1.y, v1.z,
        v2.x, v2.y, v2.z,
        v3.x, v3.y, v3.z,
      ]);

      // UV coordinates mapped to fill texture nicely
      const uvs = new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.5, 1.0,
      ]);

      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
      geom.computeVertexNormals();

      const graphics = config.peaks[face];
      const texture = this.textureManager.getOrCreateTexture(partId, graphics, config.baseColor, false);

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.75,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = partId;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        partId,
        label: `${face.charAt(0).toUpperCase() + face.slice(1)} Peak`,
        category: 'peak',
      };

      group.add(mesh);
      meshMap.set(partId, mesh);
      materialMap.set(partId, mat);
    });
  }

  /**
   * Build 4 vertical valances with custom UVs
   */
  private buildValances(
    config: CanopyConfig,
    group: THREE.Group,
    meshMap: Map<MeshPartId, THREE.Mesh>,
    materialMap: Map<MeshPartId, THREE.MeshStandardMaterial>
  ) {
    const w = CanopyGeometryBuilder.WIDTH;
    const d = CanopyGeometryBuilder.DEPTH;
    const hEaves = CanopyGeometryBuilder.EAVES_HEIGHT;
    const hValance = CanopyGeometryBuilder.VALANCE_HEIGHT;
    const halfValance = hValance / 2;
    const yCenter = hEaves - halfValance;

    const valanceConfigs: { face: TentFace; partId: MeshPartId; pos: [number, number, number]; rotY: number; width: number }[] = [
      { face: 'front', partId: 'valance_front', pos: [0, yCenter, d / 2], rotY: 0, width: w },
      { face: 'back', partId: 'valance_back', pos: [0, yCenter, -d / 2], rotY: Math.PI, width: w },
      { face: 'left', partId: 'valance_left', pos: [-w / 2, yCenter, 0], rotY: -Math.PI / 2, width: d },
      { face: 'right', partId: 'valance_right', pos: [w / 2, yCenter, 0], rotY: Math.PI / 2, width: d },
    ];

    valanceConfigs.forEach(({ face, partId, pos, rotY, width }) => {
      const geom = new THREE.PlaneGeometry(width, hValance);

      const graphics = config.valances[face];
      const texture = this.textureManager.getOrCreateTexture(partId, graphics, config.baseColor, true);

      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.75,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.name = partId;
      mesh.position.set(pos[0], pos[1], pos[2]);
      mesh.rotation.y = rotY;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        partId,
        label: `${face.charAt(0).toUpperCase() + face.slice(1)} Valance`,
        category: 'valance',
      };

      group.add(mesh);
      meshMap.set(partId, mesh);
      materialMap.set(partId, mat);
    });
  }

  /**
   * Build realistic structural frame (Legs, Scissor Trusses, Center Peak Mast, Footpads)
   */
  private buildFrame(
    config: CanopyConfig,
    group: THREE.Group,
    meshMap: Map<MeshPartId, THREE.Mesh>
  ) {
    const w2 = CanopyGeometryBuilder.WIDTH / 2;
    const d2 = CanopyGeometryBuilder.DEPTH / 2;
    const hEaves = CanopyGeometryBuilder.EAVES_HEIGHT;

    // Frame Material
    let frameColor = 0xd1d5db; // Aluminum silver
    let roughness = 0.25;
    let metalness = 0.85;

    if (config.frame.finish === 'black') {
      frameColor = 0x1f2937;
      roughness = 0.45;
      metalness = 0.5;
    } else if (config.frame.finish === 'white') {
      frameColor = 0xf8fafc;
      roughness = 0.35;
      metalness = 0.2;
    }

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      roughness,
      metalness,
    });

    const isHex = config.frame.type === 'heavy-duty-hex';
    const legRadius = isHex ? 0.032 : 0.024;
    const legSegments = isHex ? 6 : 4; // Hexagonal vs Square extruded column

    // 4 Corner Legs
    const legGeom = new THREE.CylinderGeometry(legRadius, legRadius, hEaves, legSegments);
    const legPositions: [number, number][] = [
      [w2, d2],
      [-w2, d2],
      [-w2, -d2],
      [w2, -d2],
    ];

    legPositions.forEach(([x, z], idx) => {
      const legMesh = new THREE.Mesh(legGeom, frameMat);
      legMesh.position.set(x, hEaves / 2, z);
      legMesh.rotation.y = Math.PI / 4;
      legMesh.castShadow = true;
      legMesh.receiveShadow = true;
      legMesh.name = `frame_leg_${idx}`;
      legMesh.userData = { partId: 'frame', label: 'Telescopic Aluminum Leg', category: 'frame' };
      group.add(legMesh);

      // Triangular Heavy-duty Footpad Anchor Plate
      const footpadGeom = new THREE.CylinderGeometry(0.065, 0.075, 0.008, 3);
      const footpadMesh = new THREE.Mesh(footpadGeom, frameMat);
      footpadMesh.position.set(x, 0.004, z);
      group.add(footpadMesh);
    });

    // Center Peak Mast (Pole that holds apex)
    const mastHeight = CanopyGeometryBuilder.PEAK_HEIGHT - hEaves;
    const mastGeom = new THREE.CylinderGeometry(0.02, 0.025, mastHeight + 0.1, 8);
    const mastMesh = new THREE.Mesh(mastGeom, frameMat);
    mastMesh.position.set(0, hEaves + mastHeight / 2, 0);
    mastMesh.userData = { partId: 'frame', label: 'Apex Peak Mast', category: 'frame' };
    group.add(mastMesh);

    // 4 Diagonal Internal Roof Rafters connecting eaves corners to apex
    legPositions.forEach(([x, z]) => {
      const start = new THREE.Vector3(x, hEaves, z);
      const end = new THREE.Vector3(0, CanopyGeometryBuilder.PEAK_HEIGHT, 0);
      const dir = new THREE.Vector3().subVectors(end, start);
      const length = dir.length();

      const rafterGeom = new THREE.CylinderGeometry(0.012, 0.012, length, 6);
      const rafterMesh = new THREE.Mesh(rafterGeom, frameMat);

      // Position halfway between start and end
      rafterMesh.position.copy(start).addScaledVector(dir, 0.5);
      rafterMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      group.add(rafterMesh);
    });

    // Perimeter Folding Scissor Trusses (X-Trusses)
    const sides: [number, number, number, number][] = [
      [-w2, d2, w2, d2], // Front
      [w2, -d2, -w2, -d2], // Back
      [-w2, -d2, -w2, d2], // Left
      [w2, d2, w2, -d2], // Right
    ];

    const trussHeight = 0.28;
    const trussY = hEaves - 0.16;

    sides.forEach(([x1, z1, x2, z2]) => {
      // 2 X-truss segments per 10ft side
      const midX = (x1 + x2) / 2;
      const midZ = (z1 + z2) / 2;

      this.addScissorCross(group, frameMat, x1, z1, midX, midZ, trussY, trussHeight);
      this.addScissorCross(group, frameMat, midX, midZ, x2, z2, trussY, trussHeight);
    });

    // Register a primary frame mesh for raycasting
    if (group.children.length > 0) {
      const primaryFrameMesh = group.children[0] as THREE.Mesh;
      primaryFrameMesh.userData = { partId: 'frame', label: 'Heavy-Duty Hardware Frame', category: 'frame' };
      meshMap.set('frame', primaryFrameMesh);
    }
  }

  /**
   * Helper to add an X-shaped scissor truss pair
   */
  private addScissorCross(
    group: THREE.Group,
    mat: THREE.Material,
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    baseY: number,
    height: number
  ) {
    const p1Bottom = new THREE.Vector3(x1, baseY - height / 2, z1);
    const p1Top = new THREE.Vector3(x1, baseY + height / 2, z1);
    const p2Bottom = new THREE.Vector3(x2, baseY - height / 2, z2);
    const p2Top = new THREE.Vector3(x2, baseY + height / 2, z2);

    // Diagonal bar 1: p1Bottom to p2Top
    this.addTrussBar(group, mat, p1Bottom, p2Top);
    // Diagonal bar 2: p1Top to p2Bottom
    this.addTrussBar(group, mat, p1Top, p2Bottom);
  }

  private addTrussBar(group: THREE.Group, mat: THREE.Material, pStart: THREE.Vector3, pEnd: THREE.Vector3) {
    const dir = new THREE.Vector3().subVectors(pEnd, pStart);
    const length = dir.length();
    const geom = new THREE.BoxGeometry(0.012, length, 0.018);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(pStart).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    mesh.castShadow = true;
    group.add(mesh);
  }

  /**
   * Build Walls (Solid, Half, Window, Zipper)
   */
  private buildWalls(
    config: CanopyConfig,
    group: THREE.Group,
    meshMap: Map<MeshPartId, THREE.Mesh>,
    materialMap: Map<MeshPartId, THREE.MeshStandardMaterial>
  ) {
    const w = CanopyGeometryBuilder.WIDTH;
    const d = CanopyGeometryBuilder.DEPTH;
    const hEaves = CanopyGeometryBuilder.EAVES_HEIGHT;

    const wallSpecs: { face: TentFace; partId: MeshPartId; pos: [number, number, number]; rotY: number; width: number }[] = [
      { face: 'front', partId: 'wall_front', pos: [0, 0, d / 2], rotY: 0, width: w },
      { face: 'back', partId: 'wall_back', pos: [0, 0, -d / 2], rotY: Math.PI, width: w },
      { face: 'left', partId: 'wall_left', pos: [-w / 2, 0, 0], rotY: -Math.PI / 2, width: d },
      { face: 'right', partId: 'wall_right', pos: [w / 2, 0, 0], rotY: Math.PI / 2, width: d },
    ];

    wallSpecs.forEach(({ face, partId, pos, rotY, width }) => {
      const wallConfig = config.walls[face];
      if (wallConfig.type === 'none') {
        return;
      }

      const isHalf = wallConfig.type === 'half';
      const wallH = isHalf ? 1.05 : hEaves;
      const yCenter = wallH / 2;

      const wallGeom = new THREE.PlaneGeometry(width - 0.04, wallH);

      // Generate dynamic texture with wall graphics & color
      const texture = this.textureManager.getOrCreateTexture(
        partId,
        wallConfig.graphics,
        wallConfig.color || config.baseColor,
        false
      );

      const wallMat = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const wallMesh = new THREE.Mesh(wallGeom, wallMat);
      wallMesh.position.set(pos[0], yCenter, pos[2]);
      wallMesh.rotation.y = rotY;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      wallMesh.name = partId;
      wallMesh.userData = {
        partId,
        label: `${face.charAt(0).toUpperCase() + face.slice(1)} Wall (${wallConfig.type})`,
        category: 'wall',
      };

      group.add(wallMesh);
      meshMap.set(partId, wallMesh);
      materialMap.set(partId, wallMat);

      // Add structural details for specialized walls
      if (isHalf) {
        // Horizontal top spreader bar
        const barGeom = new THREE.CylinderGeometry(0.016, 0.016, width, 8);
        const barMat = new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.8, roughness: 0.3 });
        const barMesh = new THREE.Mesh(barGeom, barMat);
        barMesh.position.set(pos[0], 1.05, pos[2]);
        barMesh.rotation.z = Math.PI / 2;
        barMesh.rotation.y = rotY;
        group.add(barMesh);
      } else if (wallConfig.type === 'window') {
        // Add decorative arched cathedral window panes
        this.addCathedralWindows(group, pos, rotY, width);
      } else if (wallConfig.type === 'zipper') {
        // Add vertical zipper seam down center
        const zipGeom = new THREE.BoxGeometry(0.02, hEaves * 0.9, 0.01);
        const zipMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.4 });
        const zipMesh = new THREE.Mesh(zipGeom, zipMat);
        zipMesh.position.set(pos[0], yCenter, pos[2]);
        zipMesh.rotation.y = rotY;
        group.add(zipMesh);
      }
    });
  }

  /**
   * Add cathedral clear PVC window panes
   */
  private addCathedralWindows(group: THREE.Group, pos: [number, number, number], rotY: number, width: number) {
    const windowCount = 3;
    const windowW = (width * 0.75) / windowCount;
    const windowH = 1.0;
    const windowY = 1.25;

    const winGeom = new THREE.PlaneGeometry(windowW * 0.85, windowH);
    const winMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      transmission: 0.85,
      opacity: 0.85,
      transparent: true,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < windowCount; i++) {
      const offsetX = (i - 1) * windowW;
      const winMesh = new THREE.Mesh(winGeom, winMat);

      // Local offset relative to wall orientation
      const offsetVec = new THREE.Vector3(offsetX, windowY, 0.01);
      offsetVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);

      winMesh.position.set(pos[0] + offsetVec.x, offsetVec.y, pos[2] + offsetVec.z);
      winMesh.rotation.y = rotY;
      group.add(winMesh);
    }
  }

  /**
   * Build Optional Accessories (Saddle Sandbags, Stake Cords, Flags)
   */
  private buildAccessories(config: CanopyConfig, group: THREE.Group) {
    const w2 = CanopyGeometryBuilder.WIDTH / 2;
    const d2 = CanopyGeometryBuilder.DEPTH / 2;

    // 1. Sandbag Weights
    if (config.accessories.sandbagsCount > 0) {
      const sandbagMat = new THREE.MeshStandardMaterial({
        color: 0x1f2937,
        roughness: 0.9,
      });

      const corners: [number, number][] = [
        [w2, d2],
        [-w2, d2],
        [-w2, -d2],
        [w2, -d2],
      ];

      const count = Math.min(config.accessories.sandbagsCount, corners.length);
      for (let i = 0; i < count; i++) {
        const [x, z] = corners[i];
        // Dual cylinder saddle bag clamped around post
        const bagGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.35, 12);

        const bag1 = new THREE.Mesh(bagGeom, sandbagMat);
        bag1.position.set(x + 0.09, 0.18, z);
        bag1.castShadow = true;
        group.add(bag1);

        const bag2 = new THREE.Mesh(bagGeom, sandbagMat);
        bag2.position.set(x - 0.09, 0.18, z);
        bag2.castShadow = true;
        group.add(bag2);
      }
    }

    // 2. Corner Flag Mounts
    if (config.accessories.flagMounts) {
      const flagPoleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
      const flagFabricMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, side: THREE.DoubleSide });

      const flagPoleGeom = new THREE.CylinderGeometry(0.01, 0.01, 1.8, 8);
      const flagMesh1 = new THREE.Mesh(flagPoleGeom, flagPoleMat);
      flagMesh1.position.set(w2 + 0.12, CanopyGeometryBuilder.EAVES_HEIGHT + 0.6, d2 + 0.12);
      flagMesh1.rotation.z = -0.15;
      group.add(flagMesh1);

      // Teardrop flag fabric
      const flagClothGeom = new THREE.PlaneGeometry(0.35, 0.9);
      const flagClothMesh = new THREE.Mesh(flagClothGeom, flagFabricMat);
      flagClothMesh.position.set(w2 + 0.3, CanopyGeometryBuilder.EAVES_HEIGHT + 0.9, d2 + 0.12);
      group.add(flagClothMesh);
    }
  }

  /**
   * Build 3D Dimension Guides (10ft width, 11ft peak, 7ft clearance)
   */
  private buildDimensionGuides(group: THREE.Group) {
    const w2 = CanopyGeometryBuilder.WIDTH / 2;
    const d2 = CanopyGeometryBuilder.DEPTH / 2;
    const hEaves = CanopyGeometryBuilder.EAVES_HEIGHT;
    const hPeak = CanopyGeometryBuilder.PEAK_HEIGHT;

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      linewidth: 2,
    });

    // 1. Width Dimension Line at front ground
    const widthLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-w2, 0.02, d2 + 0.35),
      new THREE.Vector3(w2, 0.02, d2 + 0.35),
    ]);
    group.add(new THREE.Line(widthLineGeom, lineMat));

    // 2. Peak Height Dimension Line at right side
    const heightLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(w2 + 0.35, 0, 0),
      new THREE.Vector3(w2 + 0.35, hPeak, 0),
    ]);
    group.add(new THREE.Line(heightLineGeom, lineMat));

    // 3. Eaves Height Dimension Line
    const eavesLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(w2 + 0.35, 0, d2),
      new THREE.Vector3(w2 + 0.35, hEaves, d2),
    ]);
    group.add(new THREE.Line(eavesLineGeom, lineMat));
  }
}
