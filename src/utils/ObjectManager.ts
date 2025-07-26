import { Scene, Mesh, Color3, HighlightLayer } from '@babylonjs/core';
import type { SceneObject } from '../types';

export class ObjectManager {
  private objects: Map<string, { mesh: Mesh; sceneObject: SceneObject }> = new Map();
  private highlightLayer: HighlightLayer;
  private selectedMesh: Mesh | null = null;
  private hoveredMesh: Mesh | null = null;

  constructor(scene: Scene) {
    this.highlightLayer = new HighlightLayer('highlight', scene);
  }

  /**
   * Ajoute un objet à la scène
   */
  addObject(mesh: Mesh, sceneObject: SceneObject) {
    this.objects.set(sceneObject.id, { mesh, sceneObject });
    
    // Ajouter les événements de survol
    mesh.actionManager = null; // Reset action manager
    this.setupMeshEvents(mesh, sceneObject);
  }

  /**
   * Supprime un objet de la scène
   */
  removeObject(objectId: string): boolean {
    const object = this.objects.get(objectId);
    if (object) {
      // Nettoyer les outlines si l'objet est sélectionné/survolé
      if (this.selectedMesh === object.mesh) {
        this.clearSelection();
      }
      if (this.hoveredMesh === object.mesh) {
        this.clearHover();
      }
      
      object.mesh.dispose();
      this.objects.delete(objectId);
      return true;
    }
    return false;
  }

  /**
   * Récupère un objet par son ID
   */
  getObject(objectId: string) {
    return this.objects.get(objectId);
  }

  /**
   * Récupère tous les objets
   */
  getAllObjects(): SceneObject[] {
    return Array.from(this.objects.values()).map(obj => obj.sceneObject);
  }

  /**
   * Sélectionne un objet
   */
  selectObject(objectId: string | null): SceneObject | null {
    // Nettoyer la sélection précédente
    this.clearSelection();

    if (objectId) {
      const object = this.objects.get(objectId);
      if (object) {
        this.selectedMesh = object.mesh;
        this.highlightMesh(object.mesh, 'selected');
        return object.sceneObject;
      }
    }
    return null;
  }

  /**
   * Survole un objet
   */
  hoverObject(objectId: string | null): SceneObject | null {
    // Nettoyer le survol précédent
    this.clearHover();

    if (objectId && objectId !== this.selectedMesh?.name) {
      const object = this.objects.get(objectId);
      if (object) {
        this.hoveredMesh = object.mesh;
        this.highlightMesh(object.mesh, 'hovered');
        return object.sceneObject;
      }
    }
    return null;
  }

  /**
   * Trouve l'objet correspondant à un mesh
   */
  findObjectByMesh(mesh: Mesh): SceneObject | null {
    for (const object of this.objects.values()) {
      if (object.mesh === mesh) {
        return object.sceneObject;
      }
    }
    return null;
  }

  /**
   * Met en surbrillance un mesh
   */
  private highlightMesh(mesh: Mesh, type: 'selected' | 'hovered') {
    if (type === 'selected') {
      this.highlightLayer.addMesh(mesh, new Color3(0, 0.7, 1)); // Bleu pour sélection
    } else if (type === 'hovered') {
      this.highlightLayer.addMesh(mesh, new Color3(1, 1, 0)); // Jaune pour survol
    }
  }

  /**
   * Nettoie la sélection
   */
  private clearSelection() {
    if (this.selectedMesh) {
      this.highlightLayer.removeMesh(this.selectedMesh);
      this.selectedMesh = null;
    }
  }

  /**
   * Nettoie le survol
   */
  private clearHover() {
    if (this.hoveredMesh) {
      this.highlightLayer.removeMesh(this.hoveredMesh);
      this.hoveredMesh = null;
    }
  }

  /**
   * Configure les événements pour un mesh
   */
  private setupMeshEvents(mesh: Mesh, sceneObject: SceneObject) {
    // Les événements seront gérés par le composant parent
    // Cette méthode peut être étendue pour des interactions plus complexes
    mesh.metadata = { sceneObjectId: sceneObject.id };
  }

  /**
   * Nettoyage lors de la destruction
   */
  dispose() {
    // Nettoyer tous les objets
    for (const [, object] of this.objects) {
      object.mesh.dispose();
      if (object.mesh.material) {
        object.mesh.material.dispose();
      }
    }
    
    // Nettoyer les systèmes de rendu
    this.highlightLayer.dispose();
    this.objects.clear();
    
    // Nettoyer les références
    this.selectedMesh = null;
    this.hoveredMesh = null;
  }
}
