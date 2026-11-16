import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Polyfill minimal browser APIs needed for GLTFLoader in Node
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function inspect(fileName) {
  const filePath = path.resolve(__dirname, '../glb', fileName);
  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const loader = new GLTFLoader();
  console.log(`\n=================== INSPECTING: ${fileName} ===================`);
  
  return new Promise((resolve, reject) => {
    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        console.log('Scene name:', gltf.scene.name);
        const hierarchy = [];
        gltf.scene.traverse((obj) => {
          const info = {
            name: obj.name,
            type: obj.type,
            visible: obj.visible,
          };
          if (obj.isMesh) {
            info.geomVertCount = obj.geometry.attributes.position ? obj.geometry.attributes.position.count : 0;
            info.materialName = Array.isArray(obj.material) ? obj.material.map(m => m.name).join(', ') : obj.material?.name;
            info.materialType = Array.isArray(obj.material) ? obj.material.map(m => m.type).join(', ') : obj.material?.type;
          }
          hierarchy.push(info);
        });
        console.log(`Total nodes in ${fileName}:`, hierarchy.length);
        console.log('Meshes:');
        hierarchy.filter(h => h.type === 'Mesh').forEach(m => console.log('  -', JSON.stringify(m)));
        resolve(gltf);
      },
      (err) => {
        console.error('Error parsing GLTF:', err);
        reject(err);
      }
    );
  });
}

async function run() {
  await inspect('Tent_8_8.glb');
}

run();
