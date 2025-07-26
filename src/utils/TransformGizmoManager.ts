import { 
  Scene, 
  Mesh, 
  GizmoManager, 
  UtilityLayerRenderer
} from '@babylonjs/core';
import type { ObjectManager } from './ObjectManager';

export const TransformMode = {
  POSITION: 'position',
  ROTATION: 'rotation',
  SCALE: 'scale'
} as const;

export type TransformMode = typeof TransformMode[keyof typeof TransformMode];

export class TransformGizmoManager {
  private gizmoManager: GizmoManager;
  private utilityLayer: UtilityLayerRenderer;
  private objectManager: ObjectManager | null = null;
  private currentMesh: Mesh | null = null;
  private transformMode: TransformMode = TransformMode.POSITION;
  private isEnabled: boolean = false;

  constructor(scene: Scene) {
    // Create utility layer for gizmos
    this.utilityLayer = new UtilityLayerRenderer(scene);
    
    // Initialize gizmo manager with the utility layer
    this.gizmoManager = new GizmoManager(scene, 0.75, this.utilityLayer);
    
    this.setupGizmos();
    this.setupEventHandlers();
  }

  /**
   * Initialize and configure the gizmos
   */
  private setupGizmos() {
    // Configure position gizmo
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
    
    // Configure gizmo appearance
    if (this.gizmoManager.gizmos.positionGizmo) {
      this.gizmoManager.gizmos.positionGizmo.planarGizmoEnabled = true;
      this.gizmoManager.gizmos.positionGizmo.updateGizmoRotationToMatchAttachedMesh = false;
      this.gizmoManager.gizmos.positionGizmo.snapDistance = 0.25;
    }

    if (this.gizmoManager.gizmos.rotationGizmo) {
      this.gizmoManager.gizmos.rotationGizmo.updateGizmoRotationToMatchAttachedMesh = true;
      this.gizmoManager.gizmos.rotationGizmo.snapDistance = Math.PI / 12; // 15 degrees
    }

    if (this.gizmoManager.gizmos.scaleGizmo) {
      this.gizmoManager.gizmos.scaleGizmo.updateGizmoRotationToMatchAttachedMesh = false;
      this.gizmoManager.gizmos.scaleGizmo.snapDistance = 0.1;
    }

    // Set initial visibility to false
    this.setGizmosVisibility(false);
  }

  /**
   * Setup event handlers for gizmo interactions
   */
  private setupEventHandlers() {
    // Position gizmo events
    if (this.gizmoManager.gizmos.positionGizmo) {
      this.gizmoManager.gizmos.positionGizmo.onDragStartObservable.add(() => {
        console.log('Position drag started');
      });

      this.gizmoManager.gizmos.positionGizmo.onDragEndObservable.add(() => {
        this.updateObjectData();
        console.log('Position drag ended');
      });
    }

    // Rotation gizmo events
    if (this.gizmoManager.gizmos.rotationGizmo) {
      this.gizmoManager.gizmos.rotationGizmo.onDragStartObservable.add(() => {
        console.log('Rotation drag started');
      });

      this.gizmoManager.gizmos.rotationGizmo.onDragEndObservable.add(() => {
        this.updateObjectData();
        console.log('Rotation drag ended');
      });
    }

    // Scale gizmo events
    if (this.gizmoManager.gizmos.scaleGizmo) {
      this.gizmoManager.gizmos.scaleGizmo.onDragStartObservable.add(() => {
        console.log('Scale drag started');
      });

      this.gizmoManager.gizmos.scaleGizmo.onDragEndObservable.add(() => {
        this.updateObjectData();
        console.log('Scale drag ended');
      });
    }
  }

  /**
   * Set the object manager reference for data updates
   */
  setObjectManager(objectManager: ObjectManager) {
    this.objectManager = objectManager;
  }

  /**
   * Enable or disable transform gizmos
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    
    if (enabled && this.currentMesh) {
      this.setGizmosVisibility(true);
      this.gizmoManager.attachToMesh(this.currentMesh);
    } else {
      this.setGizmosVisibility(false);
      this.gizmoManager.attachToMesh(null);
    }
  }

  /**
   * Attach gizmos to a specific mesh
   */
  attachToMesh(mesh: Mesh | null) {
    this.currentMesh = mesh;
    
    if (this.isEnabled && mesh) {
      this.setGizmosVisibility(true);
      this.gizmoManager.attachToMesh(mesh);
    } else {
      this.setGizmosVisibility(false);
      this.gizmoManager.attachToMesh(null);
    }
  }

  /**
   * Set the current transform mode (position, rotation, scale)
   */
  setTransformMode(mode: TransformMode) {
    this.transformMode = mode;
    
    // Disable all gizmos first
    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;
    
    // Enable the selected gizmo
    switch (mode) {
      case TransformMode.POSITION:
        this.gizmoManager.positionGizmoEnabled = true;
        break;
      case TransformMode.ROTATION:
        this.gizmoManager.rotationGizmoEnabled = true;
        break;
      case TransformMode.SCALE:
        this.gizmoManager.scaleGizmoEnabled = true;
        break;
    }

    // Reattach to current mesh if enabled
    if (this.isEnabled && this.currentMesh) {
      this.gizmoManager.attachToMesh(this.currentMesh);
    }
  }

  /**
   * Get the current transform mode
   */
  getTransformMode(): TransformMode {
    return this.transformMode;
  }

  /**
   * Toggle between different transform modes
   */
  cycleTransformMode() {
    const modes = Object.values(TransformMode);
    const currentIndex = modes.indexOf(this.transformMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    this.setTransformMode(modes[nextIndex] as TransformMode);
  }

  /**
   * Update object data in ObjectManager after transformation
   */
  private updateObjectData() {
    if (!this.objectManager || !this.currentMesh) return;

    const sceneObject = this.objectManager.findObjectByMesh(this.currentMesh);
    if (!sceneObject) return;

    // Update position
    const position = this.currentMesh.position;
    sceneObject.position = {
      x: position.x,
      y: position.y,
      z: position.z
    };

    // Update rotation (convert from radians to degrees for consistency)
    const rotation = this.currentMesh.rotation;
    sceneObject.rotation = {
      x: rotation.x,
      y: rotation.y,
      z: rotation.z
    };

    // Update scale
    const scaling = this.currentMesh.scaling;
    sceneObject.scale = {
      x: scaling.x,
      y: scaling.y,
      z: scaling.z
    };

    console.log('Updated object data:', sceneObject);
  }

  /**
   * Set visibility of all gizmos
   */
  private setGizmosVisibility(visible: boolean) {
    if (!visible) {
      // Hide all gizmos by disabling them when not visible
      this.gizmoManager.positionGizmoEnabled = false;
      this.gizmoManager.rotationGizmoEnabled = false;
      this.gizmoManager.scaleGizmoEnabled = false;
    } else {
      // Show only the active gizmo based on current mode
      this.setTransformMode(this.transformMode);
    }
  }

  /**
   * Check if gizmos are currently enabled
   */
  isGizmosEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get the currently attached mesh
   */
  getAttachedMesh(): Mesh | null {
    return this.currentMesh;
  }

  /**
   * Dispose of all gizmo resources
   */
  dispose() {
    this.gizmoManager.attachToMesh(null);
    this.gizmoManager.dispose();
    this.utilityLayer.dispose();
    this.currentMesh = null;
    this.objectManager = null;
  }
}