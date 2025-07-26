import { useEffect, useRef, useState } from 'react';
import { 
  Engine, 
  Scene, 
  WebGPUEngine, 
  HemisphericLight, 
  Vector3, 
  Color4,
  ArcRotateCamera,
  MeshBuilder,
  StandardMaterial,
  Color3
} from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { ObjectManager } from '../utils/ObjectManager';

export const useBabylonScene = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const engineRef = useRef<Engine | WebGPUEngine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const objectManagerRef = useRef<ObjectManager | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeEngine = async () => {
      try {
        let engine: Engine | WebGPUEngine;
        
        // Essayer WebGPU d'abord, fallback vers WebGL
        if (await WebGPUEngine.IsSupportedAsync) {
          console.log('Initializing WebGPU engine...');
          const webgpuEngine = new WebGPUEngine(canvasRef.current!);
          await webgpuEngine.initAsync();
          engine = webgpuEngine;
        } else {
          console.log('WebGPU not supported, falling back to WebGL...');
          engine = new Engine(canvasRef.current!, true, {
            antialias: true,
            stencil: true,
            alpha: false
          });
        }

        engineRef.current = engine;

        // Créer la scène
        const scene = new Scene(engine);
        sceneRef.current = scene;

        // Configuration de base de la scène
        scene.clearColor = new Color4(0.1, 0.1, 0.15, 1);

        // Caméra arc-rotate pour l'interaction 3D
        const camera = new ArcRotateCamera(
          'camera',
          -Math.PI / 2,
          Math.PI / 2.5,
          10,
          Vector3.Zero(),
          scene
        );
        camera.attachControl(canvasRef.current!);
        camera.setTarget(Vector3.Zero());

        // Lumière hémisphérique
        const light = new HemisphericLight(
          'light',
          new Vector3(0, 1, 0),
          scene
        );
        light.intensity = 0.7;

        // Grille de référence au sol
        const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20, subdivisions: 20 }, scene);
        const groundMaterial = new StandardMaterial('groundMaterial', scene);
        groundMaterial.diffuseColor = new Color3(0.8, 0.8, 0.8);
        groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
        groundMaterial.wireframe = true;
        ground.material = groundMaterial;
        ground.position.y = -0.01; // Légèrement en dessous du niveau 0

        // Initialiser l'ObjectManager
        objectManagerRef.current = new ObjectManager(scene);

        // Gestion du redimensionnement
        const handleResize = () => {
          engine.resize();
        };

        window.addEventListener('resize', handleResize);

        // Démarrer la boucle de rendu
        engine.runRenderLoop(() => {
          scene.render();
        });

        setIsReady(true);
        setError(null);

        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          objectManagerRef.current?.dispose();
          scene.dispose();
          engine.dispose();
        };

      } catch (err) {
        console.error('Failed to initialize Babylon.js:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    initializeEngine();
  }, [canvasRef]);

  // Fonction pour activer l'inspector
  const showInspector = () => {
    if (sceneRef.current) {
      Inspector.Show(sceneRef.current, {});
    }
  };

  return {
    engine: engineRef.current,
    scene: sceneRef.current,
    objectManager: objectManagerRef.current,
    isReady,
    error,
    showInspector
  };
};
