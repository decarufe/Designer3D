// Types pour les formes 3D primitives
export type PrimitiveType = 
  | 'cube' 
  | 'sphere' 
  | 'cylinder' 
  | 'cone' 
  | 'plane' 
  | 'torus';

// Interface pour un objet 3D dans la scène
export interface SceneObject {
  id: string;
  type: PrimitiveType;
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  material: {
    color: string;
    metallic?: number;
    roughness?: number;
  };
}

// Configuration pour créer une primitive
export interface PrimitiveConfig {
  type: PrimitiveType;
  size?: number;
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
  segments?: number;
}

// État de l'application
export interface AppState {
  selectedTool: PrimitiveType | 'select' | null;
  selectedObject: string | null;
  objects: SceneObject[];
  isTransformMode: boolean;
}
