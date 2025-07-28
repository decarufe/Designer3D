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
  Color3,
  Plane
} from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { ObjectManager } from '../utils/ObjectManager';

export const useBabylonScene = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const engineRef = useRef<Engine | WebGPUEngine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const objectManagerRef = useRef<ObjectManager | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const resizeTimeoutRef = useRef<number | null>(null);
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
        
        // Désactiver le zoom par défaut de la caméra
        camera.inputs.attached.mousewheel.detachControl();

        // Implémenter le zoom centré sur la souris
        const handleWheel = (event: WheelEvent) => {
          event.preventDefault();
          
          const canvas = canvasRef.current!;
          const rect = canvas.getBoundingClientRect();
          
          // Position de la souris en coordonnées canvas
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;
          
          // Créer un rayon depuis la caméra vers le point de la souris
          const ray = scene.createPickingRay(mouseX, mouseY, null, camera);
          
          // Direction du zoom
          const zoomDirection = event.deltaY > 0 ? 1 : -1;
          const zoomSpeed = 0.15;
          
          // Calculer la nouvelle distance
          const currentDistance = camera.radius;
          const newDistance = Math.max(0.5, Math.min(50, currentDistance + (zoomDirection * zoomSpeed * currentDistance)));
          
          // Trouver le point d'intersection avec le plan du sol ou un objet
          let targetPoint = camera.target;
          
          // Essayer d'abord de faire un pick sur les objets
          const pickInfo = scene.pick(mouseX, mouseY);
          if (pickInfo.hit && pickInfo.pickedPoint) {
            targetPoint = pickInfo.pickedPoint;
          } else {
            // Si pas d'objet, intersect avec le plan du sol (y = 0)
            const groundPlane = new Plane(0, 1, 0, 0); // Plan y = 0
            const distance = ray.intersectsPlane(groundPlane);
            if (distance !== null) {
              targetPoint = ray.origin.add(ray.direction.scale(distance));
            }
          }
          
          // Interpoler vers le nouveau target pour un zoom fluide
          const lerpFactor = 0.3;
          const newTarget = Vector3.Lerp(camera.target, targetPoint, lerpFactor);
          
          // Appliquer les nouveaux paramètres
          camera.setTarget(newTarget);
          camera.radius = newDistance;
        };
        
        canvasRef.current!.addEventListener('wheel', handleWheel, { passive: false });

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

        // Gestion robuste du redimensionnement
        const performResize = () => {
          if (!engine || !canvasRef.current) return;
          
          try {
            // Vérifier que le canvas a des dimensions valides
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            
            if (rect.width > 0 && rect.height > 0) {
              // Forcer la resize avec les nouvelles dimensions
              engine.resize(true);
              console.log(`Engine resized to: ${rect.width}x${rect.height}`);
            } else {
              console.warn('Canvas has invalid dimensions during resize');
            }
          } catch (error) {
            console.error('Error during engine resize:', error);
          }
        };

        // Gestionnaire de redimensionnement avec délai
        const handleResize = () => {
          // Annuler le timeout précédent s'il existe
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }
          
          // Utiliser requestAnimationFrame pour attendre que le layout CSS soit terminé
          requestAnimationFrame(() => {
            // Ajouter un petit délai pour s'assurer que les dimensions sont correctes
            resizeTimeoutRef.current = window.setTimeout(() => {
              performResize();
            }, 16); // ~1 frame à 60fps
          });
        };

        // Observer les changements de taille du canvas avec ResizeObserver (plus précis)
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserverRef.current = new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (entry.target === canvasRef.current) {
                handleResize();
                break;
              }
            }
          });
          resizeObserverRef.current.observe(canvasRef.current!);
        }

        // Fallback avec window resize event
        window.addEventListener('resize', handleResize);

        // Démarrer la boucle de rendu
        engine.runRenderLoop(() => {
          scene.render();
        });

        setIsReady(true);
        setError(null);

        // Cleanup function
        return () => {
          // Nettoyer les timeouts
          if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
          }
          
          // Nettoyer les observers
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
          }
          
          // Nettoyer les event listeners
          window.removeEventListener('resize', handleResize);
          canvasRef.current?.removeEventListener('wheel', handleWheel);
          
          // Nettoyer les ressources Babylon.js
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
