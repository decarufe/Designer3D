import React, { useState, useCallback } from 'react';
import { Scene3D } from './components/Scene3D';
import { PrimitiveToolbar } from './components/PrimitiveToolbar';
import { createPrimitive, getDefaultPrimitiveConfig } from './utils/primitives';
import type { PrimitiveType, AppState } from './types';
import type { Scene, Engine } from '@babylonjs/core';
import type { ObjectManager } from './utils/ObjectManager';

import './App.css';

function App() {
  const [appState, setAppState] = useState<AppState>({
    selectedTool: 'select',
    selectedObject: null,
    objects: [],
    isTransformMode: false
  });

  const [scene, setScene] = useState<Scene | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [objectManager, setObjectManager] = useState<ObjectManager | null>(null);

  const handleSceneReady = useCallback((babylonScene: Scene, babylonEngine: Engine, babylonObjectManager: ObjectManager) => {
    setScene(babylonScene);
    setEngine(babylonEngine);
    setObjectManager(babylonObjectManager);
    console.log('Scene 3D prête !', { scene: babylonScene, engine: babylonEngine, objectManager: babylonObjectManager });
  }, []);

  const handleToolSelect = useCallback((tool: PrimitiveType | 'select' | null) => {
    setAppState(prev => ({
      ...prev,
      selectedTool: tool,
      isTransformMode: false
    }));
  }, []);

  const handleObjectSelected = useCallback((objectId: string | null) => {
    setAppState(prev => ({
      ...prev,
      selectedObject: objectId
    }));
  }, []);

  const handleTransformModeToggle = useCallback(() => {
    setAppState(prev => ({
      ...prev,
      isTransformMode: !prev.isTransformMode,
      selectedTool: null
    }));
  }, []);

  // Gestion du clic dans la scène pour placer des objets
  const handleSceneClick = useCallback((_event: any) => {
    if (!scene || !appState.selectedTool) return;

    try {
      const config = getDefaultPrimitiveConfig(appState.selectedTool);
      const { mesh, sceneObject } = createPrimitive(scene, config);
      
      // TODO: Calculer la position basée sur le raycast depuis la caméra
      // Pour l'instant, position aléatoire
      const x = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      mesh.position.x = x;
      mesh.position.z = z;
      
      // Mettre à jour le sceneObject avec la vraie position
      sceneObject.position.x = x;
      sceneObject.position.z = z;

      setAppState(prev => ({
        ...prev,
        objects: [...prev.objects, sceneObject]
      }));

      console.log(`${appState.selectedTool} créé:`, sceneObject);
    } catch (error) {
      console.error('Erreur lors de la création de la primitive:', error);
    }
  }, [scene, appState.selectedTool]);

  // Ajouter l'event listener de clic quand la scène est prête
  React.useEffect(() => {
    if (scene && appState.selectedTool) {
      const canvas = scene.getEngine().getRenderingCanvas();
      if (canvas) {
        canvas.addEventListener('click', handleSceneClick);
        return () => canvas.removeEventListener('click', handleSceneClick);
      }
    }
  }, [scene, handleSceneClick, appState.selectedTool]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <PrimitiveToolbar
        selectedTool={appState.selectedTool}
        onToolSelect={handleToolSelect}
        isTransformMode={appState.isTransformMode}
        onTransformModeToggle={handleTransformModeToggle}
      />

      {/* Zone 3D */}
      <div className="flex-1">
        <Scene3D
          className="w-full h-full"
          onSceneReady={handleSceneReady}
          selectedTool={appState.selectedTool}
          onObjectSelected={handleObjectSelected}
        />
      </div>

      {/* Debug info */}
      <div className="bg-gray-800 text-white text-xs p-2 flex justify-between">
        <span>Objets: {appState.objects.length}</span>
        <span>Moteur: {engine?.constructor.name || 'Non initialisé'}</span>
        <span>Mode: {appState.isTransformMode ? 'Transformation' : appState.selectedTool || 'Aucun'}</span>
      </div>
    </div>
  );
}

export default App;
