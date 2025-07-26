import { Scene, Ray, Vector3, Mesh, PickingInfo } from '@babylonjs/core';

export interface RaycastResult {
  hit: boolean;
  position?: Vector3;
  normal?: Vector3;
  pickedMesh?: Mesh;
  distance?: number;
}

/**
 * Effectue un raycast depuis la caméra vers la position de la souris
 */
export const raycastFromCamera = (
  scene: Scene, 
  screenX: number, 
  screenY: number
): RaycastResult => {
  if (!scene.activeCamera) {
    return { hit: false };
  }

  // Créer un rayon depuis la caméra
  const ray = scene.createPickingRay(screenX, screenY, null, scene.activeCamera);
  
  // Effectuer le raycast
  const pickInfo: PickingInfo = scene.pick(screenX, screenY);
  
  if (pickInfo.hit && pickInfo.pickedPoint) {
    return {
      hit: true,
      position: pickInfo.pickedPoint,
      normal: pickInfo.getNormal(true) || undefined,
      pickedMesh: pickInfo.pickedMesh as Mesh,
      distance: pickInfo.distance
    };
  }

  // Si aucun objet n'est touché, calculer l'intersection avec le plan Y=0
  const groundPlanePosition = intersectRayWithGroundPlane(ray);
  
  return {
    hit: true,
    position: groundPlanePosition,
    normal: new Vector3(0, 1, 0)
  };
};

/**
 * Calcule l'intersection d'un rayon avec le plan Y=0
 */
const intersectRayWithGroundPlane = (ray: Ray): Vector3 => {
  const planeY = 0;
  const rayDirection = ray.direction;
  const rayOrigin = ray.origin;

  // Calculer t pour l'intersection avec le plan Y=0
  // rayOrigin.y + t * rayDirection.y = planeY
  // t = (planeY - rayOrigin.y) / rayDirection.y
  
  if (Math.abs(rayDirection.y) < 0.0001) {
    // Le rayon est parallèle au plan, retourner l'origine projetée
    return new Vector3(rayOrigin.x, planeY, rayOrigin.z);
  }

  const t = (planeY - rayOrigin.y) / rayDirection.y;
  
  return new Vector3(
    rayOrigin.x + t * rayDirection.x,
    planeY,
    rayOrigin.z + t * rayDirection.z
  );
};

/**
 * Convertit les coordonnées d'événement souris en coordonnées d'écran Babylon.js
 */
export const getScreenCoordinates = (
  event: MouseEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
};
