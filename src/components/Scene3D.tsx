import React, { useRef, useEffect, useState } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { useObjectSelection } from '../hooks/useObjectSelection';
import { raycastFromCamera } from '../utils/raycast';
import { createPrimitive } from '../utils/primitives';
import { TransformGizmoManager, TransformMode } from '../utils/TransformGizmoManager';
import type { PrimitiveType, SceneObject } from '../types';
import type { Scene, Engine, WebGPUEngine, Mesh } from '@babylonjs/core';
import type { ObjectManager } from '../utils/ObjectManager';

interface Scene3DProps {
  className?: string;
  onSceneReady?: (scene: Scene, engine: Engine | WebGPUEngine, objectManager: ObjectManager) => void;
  selectedTool?: PrimitiveType | 'select' | null;
  onObjectSelected?: (objectId: string | null) => void;
  isTransformMode?: boolean;
  selectedObjectId?: string | null;
}

export const Scene3D: React.FC<Scene3DProps> = ({ 
  className = '', 
  onSceneReady,
  selectedTool = 'select',
  onObjectSelected,
  isTransformMode = false,
  selectedObjectId = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scene, engine, objectManager, isReady, error, showInspector } = useBabylonScene(canvasRef);
  const selection = useObjectSelection({ objectManager });
  const [transformGizmoManager, setTransformGizmoManager] = useState<TransformGizmoManager | null>(null);

  // Notifier le parent quand la scène est prête
  useEffect(() => {
    if (isReady && scene && engine && objectManager && onSceneReady) {
      onSceneReady(scene, engine, objectManager);
    }
  }, [isReady, scene, engine, objectManager, onSceneReady]);

  // Initialize TransformGizmoManager when scene is ready
  useEffect(() => {
    if (isReady && scene && objectManager) {
      const gizmoManager = new TransformGizmoManager(scene);
      gizmoManager.setObjectManager(objectManager);
      setTransformGizmoManager(gizmoManager);
      
      return () => {
        gizmoManager.dispose();
      };
    }
  }, [isReady, scene, objectManager]);

  // Handle transform mode and object selection changes
  useEffect(() => {
    if (!transformGizmoManager || !objectManager) return;

    // Enable/disable gizmos based on transform mode
    transformGizmoManager.setEnabled(isTransformMode);

    // Attach gizmos to selected object
    if (isTransformMode && selectedObjectId) {
      const selectedObjectData = objectManager.getObject(selectedObjectId);
      if (selectedObjectData) {
        transformGizmoManager.attachToMesh(selectedObjectData.mesh);
      } else {
        transformGizmoManager.attachToMesh(null);
      }
    } else {
      transformGizmoManager.attachToMesh(null);
    }
  }, [transformGizmoManager, objectManager, isTransformMode, selectedObjectId]);

  // Touch gesture support state
  const [touchData, setTouchData] = useState<{
    startX: number;
    startY: number;
    startTime: number;
    touchCount: number;
  } | null>(null);

  // Scene interaction handling with touch support
  useEffect(() => {
    if (!scene || !objectManager || !canvasRef.current) return;

    const handlePointerDown = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Si on est en mode sélection ou en mode transformation
      if (selectedTool === 'select' || isTransformMode) {
        const pickInfo = scene.pick(x, y);
        if (pickInfo.hit && pickInfo.pickedMesh) {
          const sceneObject = objectManager.findObjectByMesh(pickInfo.pickedMesh as Mesh);
          if (sceneObject) {
            selection.selectObject(sceneObject.id);
            onObjectSelected?.(sceneObject.id);
          }
        } else {
          selection.clearSelection();
          onObjectSelected?.(null);
        }
      }
      // Si on est en mode création d'objet
      else {
        const result = raycastFromCamera(scene, x, y);
        if (result.hit && result.position) {
          // Créer un nouvel objet
          const sceneObject: SceneObject = {
            id: `${selectedTool}-${Date.now()}`,
            name: `${selectedTool} ${Date.now()}`,
            type: selectedTool as PrimitiveType,
            position: { x: result.position.x, y: result.position.y, z: result.position.z },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            material: { color: '#4F46E5' }
          };

          // Créer le mesh avec la configuration
          const config = { type: selectedTool as PrimitiveType };
          const primitive = createPrimitive(scene, config, sceneObject.id);
          
          if (primitive) {
            primitive.mesh.position.copyFrom(result.position);
            
            // Ajouter à l'ObjectManager
            objectManager.addObject(primitive.mesh, sceneObject);
            
            // Sélectionner automatiquement le nouvel objet
            selection.selectObject(sceneObject.id);
            onObjectSelected?.(sceneObject.id);
          }
        }
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      if ((selectedTool === 'select' || isTransformMode) && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const pickInfo = scene.pick(x, y);
        if (pickInfo.hit && pickInfo.pickedMesh) {
          const sceneObject = objectManager.findObjectByMesh(pickInfo.pickedMesh as Mesh);
          if (sceneObject) {
            selection.hoverObject(sceneObject.id);
          }
        } else {
          selection.hoverObject(null);
        }
      }
    };

    // Touch gesture handlers
    const handleTouchStart = (event: TouchEvent) => {
      event.preventDefault(); // Prevent scrolling
      
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        setTouchData({
          startX: touch.clientX,
          startY: touch.clientY,
          startTime: Date.now(),
          touchCount: 1
        });
      } else if (event.touches.length === 2) {
        // Multi-touch detected - could be used for pinch-to-zoom
        setTouchData(prev => prev ? { ...prev, touchCount: 2 } : null);
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault(); // Prevent scrolling
      
      if (event.touches.length === 1 && touchData?.touchCount === 1) {
        // Single finger pan - treat as mouse move for hover effects
        const touch = event.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Only show hover effects if it's a slow movement (not a swipe)
        const deltaX = Math.abs(touch.clientX - touchData.startX);
        const deltaY = Math.abs(touch.clientY - touchData.startY);
        const deltaTime = Date.now() - touchData.startTime;
        
        if (deltaTime > 200 && (deltaX < 10 && deltaY < 10)) {
          const pickInfo = scene.pick(x, y);
          if (pickInfo.hit && pickInfo.pickedMesh) {
            const sceneObject = objectManager.findObjectByMesh(pickInfo.pickedMesh as Mesh);
            if (sceneObject) {
              selection.hoverObject(sceneObject.id);
            }
          }
        }
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      event.preventDefault();
      
      if (touchData && event.changedTouches.length === 1) {
        const touch = event.changedTouches[0];
        const deltaTime = Date.now() - touchData.startTime;
        const deltaX = Math.abs(touch.clientX - touchData.startX);
        const deltaY = Math.abs(touch.clientY - touchData.startY);
        
        // Detect tap (short duration, small movement)
        if (deltaTime < 300 && deltaX < 10 && deltaY < 10) {
          // Simulate pointer down event for tap
          const syntheticEvent = new PointerEvent('pointerdown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true,
            cancelable: true
          });
          handlePointerDown(syntheticEvent);
        }
        
        // Clear hover state on touch end
        selection.hoverObject(null);
      }
      
      setTouchData(null);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      // Pointer events (mouse and basic touch)
      canvas.addEventListener('pointerdown', handlePointerDown);
      canvas.addEventListener('pointermove', handlePointerMove);
      
      // Enhanced touch events for better mobile experience
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [scene, objectManager, selectedTool, selection, onObjectSelected, isTransformMode, touchData]);

  // Gestion des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F12 ou Ctrl+I pour ouvrir l'inspector
      if (event.key === 'F12' || (event.ctrlKey && event.key === 'i')) {
        event.preventDefault();
        showInspector();
      }
      
      // Suppr pour supprimer l'objet sélectionné
      if (event.key === 'Delete' && selection.selectedObject) {
        selection.deleteSelectedObject();
        onObjectSelected?.(null);
      }

      // G pour changer le mode de transformation (quand en mode transformation)
      if (event.key === 'g' && isTransformMode && transformGizmoManager) {
        event.preventDefault();
        transformGizmoManager.cycleTransformMode();
      }

      // X pour mode position
      if (event.key === 'x' && isTransformMode && transformGizmoManager) {
        event.preventDefault();
        transformGizmoManager.setTransformMode(TransformMode.POSITION);
      }

      // R pour mode rotation
      if (event.key === 'r' && isTransformMode && transformGizmoManager) {
        event.preventDefault();
        transformGizmoManager.setTransformMode(TransformMode.ROTATION);
      }

      // S pour mode scale
      if (event.key === 's' && isTransformMode && transformGizmoManager) {
        event.preventDefault();
        transformGizmoManager.setTransformMode(TransformMode.SCALE);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInspector, selection, onObjectSelected, isTransformMode, transformGizmoManager]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center p-8 max-w-md" role="alert" aria-live="polite">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Impossible d'initialiser la scène 3D
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="text-sm text-red-500 space-y-2">
            <p>Solutions possibles:</p>
            <ul className="list-disc list-inside text-left">
              <li>Vérifiez que WebGL est activé</li>
              <li>Mettez à jour votre navigateur</li>
              <li>Essayez un autre navigateur</li>
            </ul>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Recharger la page pour réessayer"
          >
            Recharger la page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block outline-none"
        tabIndex={0}
        role="application"
        aria-label="Éditeur 3D pour créer et manipuler des formes géométriques"
        aria-describedby="canvas-instructions"
      />
      <div id="canvas-instructions" className="sr-only">
        Utilisez les outils de la barre d'outils pour créer des objets 3D. 
        Appuyez sur F12 pour l'inspecteur, Suppr pour supprimer l'objet sélectionné.
      </div>
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/75 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="text-center text-white max-w-sm">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-white border-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Initialisation 3D</h3>
            <p className="text-sm text-gray-300 mb-4">
              Configuration du moteur de rendu...
            </p>
            <div className="text-xs text-gray-400">
              {engine?.constructor.name === 'WebGPUEngine' ? 
                'Utilisation de WebGPU pour de meilleures performances' : 
                'Chargement du moteur WebGL'
              }
            </div>
          </div>
        </div>
      )}

      {/* Engine Indicator */}
      {isReady && (
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded" role="status">
          {engine?.constructor.name === 'WebGPUEngine' ? 'WebGPU' : 'WebGL'}
        </div>
      )}

      {/* Selection Information */}
      {selection.selectedObject && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg" role="status" aria-live="polite">
          <div>Sélectionné: {selection.selectedObject.name}</div>
          {isTransformMode && transformGizmoManager && (
            <div className="text-xs opacity-75 mt-1">
              Mode: {transformGizmoManager.getTransformMode().toUpperCase()} 
              <span className="hidden sm:inline">| G: Cycle | X: Position | R: Rotation | S: Scale</span>
            </div>
          )}
          {!isTransformMode && (
            <div className="text-xs opacity-75">
              <span className="hidden sm:inline">Appuyez sur Suppr pour supprimer</span>
              <span className="sm:hidden">Suppr: supprimer</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
