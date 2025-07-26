import { useState, useCallback } from 'react';
import { Scene3D } from './components/Scene3D';
import { PrimitiveToolbar } from './components/PrimitiveToolbar';
// Removed unused primitive creation functions
import type { PrimitiveType, AppState } from './types';
import type { Scene, Engine, WebGPUEngine } from '@babylonjs/core';
import type { ObjectManager } from './utils/ObjectManager';

import './App.css';

function App() {
  const [appState, setAppState] = useState<AppState>({
    selectedTool: 'select',
    selectedObject: null,
    objects: [],
    isTransformMode: false
  });

  const [, setScene] = useState<Scene | null>(null);
  const [engine, setEngine] = useState<Engine | WebGPUEngine | null>(null);
  const [, setObjectManager] = useState<ObjectManager | null>(null);

  const handleSceneReady = useCallback((babylonScene: Scene, babylonEngine: Engine | WebGPUEngine, babylonObjectManager: ObjectManager) => {
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

  // Object creation is now handled entirely by Scene3D component

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
