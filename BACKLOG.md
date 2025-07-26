# Designer3D - Backlog d'Améliorations

*Généré par analyse des agents spécialisés designer3d-code-reviewer et fusion360-ux-specialist*

## 🔴 **Problèmes Critiques (À corriger immédiatement)**

### **Designer3D-Code-Reviewer** : Corrections Urgentes

#### 1. **Fuites mémoire - Event Listeners**
- **Fichier**: `/src/components/Scene3D.tsx:111-117`
- **Problème**: Event listeners non nettoyés dans useEffect
- **Impact**: Accumulation mémoire, dégradation performance
- **Solution**: 
```typescript
useEffect(() => {
  const canvas = canvasRef.current;
  const handlePointerDown = (event: PointerEvent) => { /* logic */ };
  const handlePointerMove = (event: PointerEvent) => { /* logic */ };
  
  if (canvas) {
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }
}, [scene, objectManager, selectedTool, selection, onObjectSelected]);
```

#### 2. **Disposal des ressources Babylon.js**
- **Fichier**: `/src/utils/ObjectManager.ts:151-154`
- **Problème**: Méthode dispose() incomplète
- **Impact**: Fuites mémoire GPU, crash sur scènes complexes
- **Solution**:
```typescript
dispose() {
  // Nettoyer tous les objets
  for (const [id, object] of this.objects) {
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
```

#### 3. **Consolidation logique création objets**
- **Fichiers**: `/src/App.tsx:54-81` et `/src/components/Scene3D.tsx:58-88`
- **Problème**: Logique dupliquée entre App.tsx et Scene3D.tsx
- **Impact**: Maintenance difficile, comportements incohérents
- **Solution**: Centraliser dans ObjectManager

#### 4. **Élimination types Any**
- **Fichier**: `/src/components/Scene3D.tsx:6,10,48`
- **Problème**: Perte de type safety avec `any`
- **Impact**: Erreurs runtime, perte IntelliSense
- **Solution**: Définir interfaces Babylon.js strictes

### **Fusion360-UX-Specialist** : UX Critique

#### 5. **Positionnement aléatoire des objets**
- **Fichier**: `/src/App.tsx:63-66`
- **Problème**: `Math.random()` pour placement objets
- **Impact**: UX non-professionnelle, imprécision
- **Solution**:
```typescript
// Remplacer par raycast précis
const result = raycastFromCamera(scene, event.clientX, event.clientY);
if (result.hit && result.position) {
  mesh.position.copyFrom(result.position);
  // Ajouter snap-to-grid
  if (snapEnabled) {
    mesh.position = snapToGrid(mesh.position, gridSize);
  }
}
```

#### 6. **Gizmos de transformation 3D**
- **Fichier**: Nouveau - `/src/components/TransformGizmos.tsx`
- **Problème**: Mode transformation existe mais non implémenté
- **Impact**: Impossible de manipuler objets précisément
- **Solution**:
```typescript
import { GizmoManager, PositionGizmo, RotationGizmo, ScaleGizmo } from '@babylonjs/core';

export class TransformGizmoManager {
  private gizmoManager: GizmoManager;
  
  constructor(scene: Scene) {
    this.gizmoManager = new GizmoManager(scene);
    this.setupGizmos();
  }
  
  private setupGizmos() {
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = true;
    this.gizmoManager.scaleGizmoEnabled = true;
  }
  
  attachToMesh(mesh: Mesh) {
    this.gizmoManager.attachToMesh(mesh);
  }
}
```

#### 7. **Mode transformation manquant**
- **Fichier**: `/src/App.tsx:45-51`
- **Problème**: isTransformMode existe mais sans fonctionnalité
- **Impact**: Promesse UX non tenue
- **Solution**: Intégrer TransformGizmoManager

## 🟡 **Améliorations Moyennes (Sprint suivant)**

### **Architecture & Performance**

#### 8. **State Management centralisé**
- **Problème**: État dispersé entre App.tsx et composants
- **Solution**: Migrer vers Context API ou Zustand
```typescript
// Nouveau fichier: /src/context/Designer3DContext.tsx
interface Designer3DState {
  scene: Scene | null;
  selectedObjects: SceneObject[];
  currentTool: PrimitiveType | 'select';
  transformMode: 'translate' | 'rotate' | 'scale' | null;
}

const Designer3DContext = createContext<Designer3DState>();
```

#### 9. **Géométrie partagée et pooling matériaux**
- **Fichier**: `/src/utils/primitives.ts`
- **Problème**: Chaque objet crée nouvelle géométrie/matériau
- **Solution**: Système de pooling
```typescript
class GeometryPool {
  private geometries = new Map<PrimitiveType, Geometry>();
  private materials = new Map<string, Material>();
  
  getGeometry(type: PrimitiveType): Geometry {
    if (!this.geometries.has(type)) {
      this.geometries.set(type, this.createGeometry(type));
    }
    return this.geometries.get(type)!;
  }
}
```

#### 10. **Rendu sélectif optimisé**
- **Fichier**: `/src/hooks/useBabylonScene.ts:95-97`
- **Problème**: Rendu continu sans dirty checking
- **Solution**: Rendu basé sur changements
```typescript
const [needsRender, setNeedsRender] = useState(true);

engine.runRenderLoop(() => {
  if (needsRender) {
    scene.render();
    setNeedsRender(false);
  }
});

// Déclencher re-render sur changements
const triggerRender = useCallback(() => setNeedsRender(true), []);
```

#### 11. **Système multi-sélection**
- **Fichier**: `/src/hooks/useObjectSelection.ts`
- **Amélioration**: Support sélection multiple
```typescript
interface SelectionState {
  selectedObjects: SceneObject[]; // Changé de single à array
  selectionBox: BoundingBox | null;
  isBoxSelecting: boolean;
}

const handleMultiSelect = (objectId: string, ctrlKey: boolean) => {
  if (ctrlKey) {
    // Ajouter à sélection existante
    setSelectionState(prev => ({
      ...prev,
      selectedObjects: [...prev.selectedObjects, object]
    }));
  } else {
    // Remplacer sélection
    clearSelection();
    selectObject(objectId);
  }
};
```

### **Interface Utilisateur**

#### 12. **ViewCube Navigation**
- **Fichier**: Nouveau - `/src/components/ViewCube.tsx`
- **Fonctionnalité**: Navigation 3D standard CAD
```typescript
interface ViewCubeProps {
  camera: ArcRotateCamera;
  onViewChange: (view: StandardView) => void;
}

const standardViews = {
  front: { alpha: 0, beta: Math.PI/2 },
  back: { alpha: Math.PI, beta: Math.PI/2 },
  left: { alpha: -Math.PI/2, beta: Math.PI/2 },
  right: { alpha: Math.PI/2, beta: Math.PI/2 },
  top: { alpha: 0, beta: 0 },
  bottom: { alpha: 0, beta: Math.PI },
  isometric: { alpha: -Math.PI/4, beta: Math.PI/3 }
};
```

#### 13. **Panneau propriétés objets**
- **Fichier**: Nouveau - `/src/components/PropertiesPanel.tsx`
- **Fonctionnalité**: Édition paramètres objets sélectionnés
```typescript
interface PropertiesPanelProps {
  selectedObjects: SceneObject[];
  onPropertyChange: (objectId: string, property: string, value: any) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  selectedObjects, 
  onPropertyChange 
}) => {
  return (
    <div className="properties-panel">
      {selectedObjects.map(obj => (
        <ObjectProperties 
          key={obj.id}
          object={obj}
          onPropertyChange={(prop, value) => onPropertyChange(obj.id, prop, value)}
        />
      ))}
    </div>
  );
};
```

#### 14. **Grid Snapping System**
- **Fichier**: Nouveau - `/src/utils/GridSnapping.ts`
- **Fonctionnalité**: Accrochage précis à la grille
```typescript
interface GridSettings {
  size: number;
  enabled: boolean;
  visible: boolean;
}

export const snapToGrid = (position: Vector3, gridSize: number): Vector3 => {
  return new Vector3(
    Math.round(position.x / gridSize) * gridSize,
    Math.round(position.y / gridSize) * gridSize,
    Math.round(position.z / gridSize) * gridSize
  );
};
```

#### 15. **Organisation Workspace**
- **Fichier**: Nouveau - `/src/components/WorkspaceManager.tsx`
- **Fonctionnalité**: Groupes d'outils contextuels
```typescript
interface Workspace {
  id: string;
  name: string;
  toolGroups: ToolGroup[];
  panels: PanelConfig[];
}

const workspaces: Workspace[] = [
  {
    id: 'model',
    name: 'Model',
    toolGroups: [
      { name: 'Create', tools: ['cube', 'sphere', 'cylinder'] },
      { name: 'Modify', tools: ['move', 'rotate', 'scale'] },
      { name: 'Sketch', tools: ['line', 'circle', 'rectangle'] }
    ],
    panels: ['browser', 'properties', 'timeline']
  }
];
```

## 🟢 **Fonctionnalités Avancées (Futures)**

### **Outils CAD Professionnels**

#### 16. **Géométrie de construction**
- **Fichiers**: Nouveaux - `/src/construction/`
- **Fonctionnalité**: Plans de travail, axes, points de référence
```typescript
interface ConstructionGeometry {
  workPlanes: WorkPlane[];
  axes: Axis[];
  points: ConstructionPoint[];
}

class WorkPlane {
  constructor(
    public origin: Vector3,
    public normal: Vector3,
    public uAxis: Vector3,
    public vAxis: Vector3
  ) {}
}
```

#### 17. **Système de mesures et cotation**
- **Fichier**: Nouveau - `/src/measurement/MeasurementManager.ts`
- **Fonctionnalité**: Outils de mesure professionnels
```typescript
interface MeasurementOverlay {
  type: 'distance' | 'angle' | 'radius';
  points: Vector3[];
  value: number;
  unit: string;
  visible: boolean;
}

class MeasurementManager {
  private overlays: MeasurementOverlay[] = [];
  
  addDistanceMeasurement(point1: Vector3, point2: Vector3) {
    const distance = Vector3.Distance(point1, point2);
    this.overlays.push({
      type: 'distance',
      points: [point1, point2],
      value: distance,
      unit: 'mm',
      visible: true
    });
  }
}
```

#### 18. **Historique des opérations (Undo/Redo)**
- **Fichier**: Nouveau - `/src/commands/CommandManager.ts`
- **Fonctionnalité**: Pattern Command pour opérations réversibles
```typescript
interface Command {
  execute(): void;
  undo(): void;
  redo(): void;
}

class CommandManager {
  private history: Command[] = [];
  private currentIndex = -1;
  
  executeCommand(command: Command) {
    command.execute();
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    this.currentIndex++;
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].redo();
    }
  }
}
```

#### 19. **Contraintes géométriques**
- **Fichier**: Nouveau - `/src/constraints/ConstraintManager.ts`
- **Fonctionnalité**: Relations entre objets
```typescript
interface Constraint {
  type: 'parallel' | 'perpendicular' | 'tangent' | 'coincident';
  objects: SceneObject[];
  satisfied: boolean;
}

class ConstraintManager {
  private constraints: Constraint[] = [];
  
  addParallelConstraint(obj1: SceneObject, obj2: SceneObject) {
    this.constraints.push({
      type: 'parallel',
      objects: [obj1, obj2],
      satisfied: false
    });
  }
  
  solve() {
    // Résoudre système de contraintes
    for (const constraint of this.constraints) {
      this.solveConstraint(constraint);
    }
  }
}
```

### **Performance & Rendu**

#### 20. **Système LOD (Level of Detail)**
- **Fichier**: Nouveau - `/src/optimization/LODManager.ts`
- **Fonctionnalité**: Optimisation rendu selon distance caméra
```typescript
class LODManager {
  private lodLevels = new Map<string, Mesh[]>();
  
  addLODMesh(objectId: string, highDetail: Mesh, mediumDetail: Mesh, lowDetail: Mesh) {
    this.lodLevels.set(objectId, [highDetail, mediumDetail, lowDetail]);
  }
  
  updateLOD(camera: Camera) {
    for (const [objectId, lodMeshes] of this.lodLevels) {
      const distance = Vector3.Distance(camera.position, lodMeshes[0].position);
      const lodLevel = this.calculateLODLevel(distance);
      
      lodMeshes.forEach((mesh, index) => {
        mesh.setEnabled(index === lodLevel);
      });
    }
  }
}
```

#### 21. **Instancing pour objets répétés**
- **Fichier**: Nouveau - `/src/optimization/InstanceManager.ts`
- **Fonctionnalité**: Rendu optimisé objets identiques
```typescript
class InstanceManager {
  private instancedMeshes = new Map<string, InstancedMesh>();
  
  createInstances(mesh: Mesh, positions: Vector3[]): InstancedMesh[] {
    const instances: InstancedMesh[] = [];
    
    for (let i = 0; i < positions.length; i++) {
      const instance = mesh.createInstance(`${mesh.name}_instance_${i}`);
      instance.position = positions[i];
      instances.push(instance);
    }
    
    return instances;
  }
}
```

#### 22. **Optimisations WebGPU spécifiques**
- **Fichier**: `/src/hooks/useBabylonScene.ts`
- **Amélioration**: Exploiter fonctionnalités WebGPU
```typescript
const setupWebGPUOptimizations = (engine: WebGPUEngine) => {
  // Activer compute shaders pour calculs parallèles
  engine.enableComputeShaders = true;
  
  // Optimiser pipeline rendu
  engine.setHardwareScalingLevel(1.0);
  
  // Activer occlusion culling
  scene.occlusionQueryEnabled = true;
};
```

## 📋 **Backlogs par Agent**

### **Designer3D-Code-Reviewer** Tasks
- [ ] **P0**: Audit mémoire - event listeners et disposal Babylon.js
- [ ] **P1**: Refactor ObjectManager - séparation des responsabilités  
- [ ] **P1**: TypeScript strict - éliminer types Any
- [ ] **P2**: Tests setup - Vitest + React Testing Library
- [ ] **P2**: Performance profiling - identifier bottlenecks rendu
- [ ] **P3**: Code review automation - hooks pre-commit
- [ ] **P3**: Documentation technique - JSDoc pour APIs complexes
- [ ] **P4**: Monitoring - intégration Babylon.js Inspector avancé

### **Fusion360-UX-Specialist** Tasks  
- [ ] **P0**: UX audit - comparaison standards CAD professionnels
- [ ] **P1**: Interaction design - gizmos transformation 3D
- [ ] **P1**: Navigation patterns - ViewCube + vues standard
- [ ] **P2**: Workflow optimization - placement précis objets
- [ ] **P2**: Accessibility review - raccourcis clavier + navigation
- [ ] **P3**: Usability testing - scenarios utilisateurs réels
- [ ] **P3**: Design system - composants UI cohérents
- [ ] **P4**: Advanced features - contraintes et mesures

## 🎯 **Matrice de Priorités**

| Tâche | Impact | Effort | Priorité | Agent |
|-------|--------|--------|----------|--------|
| Fuites mémoire | Critique | Faible | 🔴 P0 | Code-Reviewer |
| Gizmos transformation | Élevé | Moyen | 🔴 P1 | UX-Specialist |
| Positionnement précis | Élevé | Faible | 🔴 P1 | UX-Specialist |
| State management | Élevé | Élevé | 🟡 P2 | Code-Reviewer |
| ViewCube navigation | Moyen | Moyen | 🟡 P3 | UX-Specialist |
| Système mesures | Moyen | Élevé | 🟢 P4 | UX-Specialist |

## 📈 **Roadmap Suggérée**

### **Phase 1 (2-3 semaines) : Stabilisation**
**Objectif**: Corriger problèmes critiques et bases solides
- [ ] Corriger fuites mémoire (event listeners + Babylon.js disposal)
- [ ] Éliminer types Any - TypeScript strict
- [ ] Implémenter gizmos transformation basiques
- [ ] Unifier logique création objets
- [ ] Remplacer positionnement aléatoire par raycast

**Livrables**:
- Application stable sans fuites mémoire
- Gizmos 3D fonctionnels (translate/rotate/scale)
- Placement précis des objets

### **Phase 2 (4-6 semaines) : UX Professionnel**
**Objectif**: Interface niveau CAD professionnel
- [ ] Refactor state management (Context API)
- [ ] Ajouter ViewCube et navigation standard
- [ ] Système multi-sélection avec Ctrl+clic
- [ ] Panneau propriétés pour objets sélectionnés
- [ ] Grid snapping et accrochage

**Livrables**:
- Navigation 3D intuitive
- Sélection multiple et manipulation
- Interface organisée par workspaces

### **Phase 3 (8+ semaines) : Fonctionnalités Avancées**
**Objectif**: Outils CAD complets
- [ ] Outils de mesure et cotation
- [ ] System undo/redo complet
- [ ] Contraintes géométriques basiques
- [ ] Optimisations performance (LOD, instancing)
- [ ] Géométrie de construction

**Livrables**:
- Application CAD complète
- Performance optimisée pour grandes scènes
- Outils de précision professionnels

## 🛠 **Guide d'Exécution**

### **Pour démarrer une tâche**:
1. Identifier la priorité (P0-P4) et l'agent responsable
2. Lire la description détaillée avec code d'exemple
3. Créer branche Git: `feature/[agent]-[task-name]`
4. Implémenter selon les spécifications
5. Tester avec `npm run build` et `npm run lint`
6. Demander review à l'agent spécialisé

### **Commandes utiles**:
```bash
# Développement
npm run dev

# Tests et validation
npm run build
npm run lint

# Debug Babylon.js
# F12 dans l'application pour inspector
```

### **Architecture cible**:
```
src/
├── components/
│   ├── navigation/         # ViewCube, vues standard
│   ├── tools/             # Gizmos, propriétés, workspace
│   ├── ui/                # Composants UI réutilisables
│   └── overlays/          # Mesures, contraintes
├── managers/              # Logique métier centralisée
├── optimization/          # LOD, instancing, performance
├── commands/              # Undo/redo, historique
├── constraints/           # Système contraintes géométriques
└── context/               # State management global
```

---

*Ce backlog sera mis à jour au fur et à mesure de l'avancement. Chaque tâche terminée doit être validée par l'agent spécialisé correspondant.*