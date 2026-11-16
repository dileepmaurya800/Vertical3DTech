import * as THREE from 'three';
import { MeshPartId } from './configurator';

export interface MeshMetadata {
  partId: MeshPartId;
  label: string;
  category: 'peak' | 'valance' | 'wall' | 'frame';
  originalColor: THREE.Color;
  material: THREE.MeshStandardMaterial;
  mesh: THREE.Mesh;
}

export interface RaycastHitResult {
  partId: MeshPartId;
  label: string;
  point: THREE.Vector3;
  normal?: THREE.Vector3;
  distance: number;
}

export interface CameraPositionPreset {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov?: number;
}
