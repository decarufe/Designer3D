import React, { useRef, useEffect } from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';
import { useObjectSelection } from '../hooks/useObjectSelection';
import { raycastFromCamera } from '../utils/raycast';
import { createPrimitive } from '../utils/primitives';
import type { PrimitiveType, SceneObject } from '../types';

interface Scene3DProps {
  className?: string;
  onSceneReady?: (scene: any, engine: any, objectManager: any) => void;
  selectedTool?: PrimitiveType | 'select' | null;
  onObjectSelected?: (objectId: string | null) => void;
}

export const Scene3D: React.FC<Scene3DProps> = ({ 
  className = '', 
  onSceneReady,
  selectedTool = 'select',
  onObjectSelected
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scene, engine, objectManager, isReady, error, showInspector } = useBabylonScene(canvasRef);
  const selection = useObjectSelection({ objectManager });

  // Notifier le parent quand la scène est prête
  useEffect(() => {
    if (isReady && scene && engine && objectManager && onSceneReady) {
      onSceneReady(scene, engine, objectManager);
    }
  }, [isReady, scene, engine, objectManager, onSceneReady]);

  // Gestion des clics sur la scène
  useEffect(() => {
    if (!scene || !objectManager || !canvasRef.current) return;

    const handlePointerDown = (event: PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Si on est en mode sélection
      if (selectedTool === 'select') {
        const pickInfo = scene.pick(x, y);
        if (pickInfo.hit && pickInfo.pickedMesh) {
          const sceneObject = objectManager.findObjectByMesh(pickInfo.pickedMesh as any);
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
      if (selectedTool === 'select' && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const pickInfo = scene.pick(x, y);
        if (pickInfo.hit && pickInfo.pickedMesh) {
          const sceneObject = objectManager.findObjectByMesh(pickInfo.pickedMesh as any);
          if (sceneObject) {
            selection.hoverObject(sceneObject.id);
          }
        } else {
          selection.hoverObject(null);
        }
      }
    };

    const canvas = canvasRef.current;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, [scene, objectManager, selectedTool, selection, onObjectSelected]);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showInspector, selection, onObjectSelected]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Erreur d'initialisation 3D
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-red-500">
            Vérifiez que votre navigateur supporte WebGL ou WebGPU
          </p>
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
      />
      
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Initialisation de la scène 3D...</p>
          </div>
        </div>
      )}

      {/* Indicateur du moteur utilisé */}
      {isReady && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {engine?.constructor.name === 'WebGPUEngine' ? 'WebGPU' : 'WebGL'}
        </div>
      )}

      {/* Informations de sélection */}
      {selection.selectedObject && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white text-sm px-3 py-2 rounded">
          <div>Sélectionné: {selection.selectedObject.name}</div>
          <div className="text-xs opacity-75">Appuyez sur Suppr pour supprimer</div>
        </div>
      )}
    </div>
  );
};
