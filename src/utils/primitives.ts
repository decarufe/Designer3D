import { 
  Scene, 
  Mesh, 
  MeshBuilder, 
  StandardMaterial, 
  Color3, 
  Vector3 
} from '@babylonjs/core';
import type { PrimitiveType, PrimitiveConfig, SceneObject } from '../types';

// Couleurs par défaut pour chaque type de primitive
const DEFAULT_COLORS: Record<PrimitiveType, string> = {
  cube: '#4F46E5',      // Indigo
  sphere: '#EF4444',    // Red
  cylinder: '#10B981',  // Emerald
  cone: '#F59E0B',      // Amber
  plane: '#6B7280',     // Gray
  torus: '#8B5CF6'      // Violet
};

export const createPrimitive = (
  scene: Scene,
  config: PrimitiveConfig,
  name?: string
): { mesh: Mesh; sceneObject: SceneObject } => {
  let mesh: Mesh;
  const meshName = name || `${config.type}_${Date.now()}`;

  // Créer la géométrie selon le type
  switch (config.type) {
    case 'cube':
      mesh = MeshBuilder.CreateBox(meshName, {
        width: config.width || config.size || 1,
        height: config.height || config.size || 1,
        depth: config.depth || config.size || 1
      }, scene);
      break;

    case 'sphere':
      mesh = MeshBuilder.CreateSphere(meshName, {
        diameter: (config.radius || config.size || 0.5) * 2,
        segments: config.segments || 16
      }, scene);
      break;

    case 'cylinder':
      mesh = MeshBuilder.CreateCylinder(meshName, {
        height: config.height || config.size || 2,
        diameter: (config.radius || config.size || 0.5) * 2,
        tessellation: config.segments || 16
      }, scene);
      break;

    case 'cone':
      mesh = MeshBuilder.CreateCylinder(meshName, {
        height: config.height || config.size || 2,
        diameterTop: 0,
        diameterBottom: (config.radius || config.size || 0.5) * 2,
        tessellation: config.segments || 16
      }, scene);
      break;

    case 'plane':
      mesh = MeshBuilder.CreatePlane(meshName, {
        width: config.width || config.size || 1,
        height: config.height || config.size || 1
      }, scene);
      break;

    case 'torus':
      mesh = MeshBuilder.CreateTorus(meshName, {
        diameter: (config.radius || config.size || 1) * 2,
        thickness: (config.radius || config.size || 1) * 0.3,
        tessellation: config.segments || 16
      }, scene);
      break;

    default:
      throw new Error(`Unknown primitive type: ${config.type}`);
  }

  // Créer et assigner le matériau
  const material = new StandardMaterial(`${meshName}_material`, scene);
  material.diffuseColor = Color3.FromHexString(DEFAULT_COLORS[config.type]);
  material.specularColor = new Color3(0.1, 0.1, 0.1);
  mesh.material = material;

  // Position par défaut légèrement au-dessus du sol
  mesh.position = new Vector3(0, config.type === 'plane' ? 0 : 1, 0);

  // Créer l'objet de données pour le state
  const sceneObject: SceneObject = {
    id: meshName,
    type: config.type,
    name: meshName,
    position: { x: 0, y: config.type === 'plane' ? 0 : 1, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    material: {
      color: DEFAULT_COLORS[config.type],
      metallic: 0.1,
      roughness: 0.7
    }
  };

  return { mesh, sceneObject };
};

// Fonction pour obtenir la configuration par défaut d'une primitive
export const getDefaultPrimitiveConfig = (type: PrimitiveType): PrimitiveConfig => {
  const configs: Record<PrimitiveType, PrimitiveConfig> = {
    cube: { type: 'cube', size: 1 },
    sphere: { type: 'sphere', radius: 0.5, segments: 16 },
    cylinder: { type: 'cylinder', radius: 0.5, height: 2, segments: 16 },
    cone: { type: 'cone', radius: 0.5, height: 2, segments: 16 },
    plane: { type: 'plane', width: 2, height: 2 },
    torus: { type: 'torus', radius: 1, segments: 16 }
  };

  return configs[type];
};
