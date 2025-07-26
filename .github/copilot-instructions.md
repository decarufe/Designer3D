# Copilot Instructions pour Designer3D

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Contexte du Projet

Designer3D est une application de design 3D web moderne construite avec :
- **Babylon.js 8.0** avec support WebGPU natif
- **React 18** + **TypeScript** 
- **Vite** comme build tool
- **Radix UI** pour les composants d'interface

## Objectifs

Créer une application intuitive permettant de :
- Placer des formes 3D primitives (cube, sphère, cylindre, cône, plan, tore)
- Manipuler les objets (translation, rotation, échelle)
- Interface utilisateur moderne et réactive
- Performance optimisée avec WebGPU

## Architecture

```
src/
├── components/          # Composants React UI
├── babylon/            # Logique Babylon.js
├── hooks/              # Hooks React personnalisés
├── types/              # Définitions TypeScript
├── utils/              # Utilitaires
└── styles/             # Styles CSS
```

## Guidelines de Code

1. **TypeScript strict** - Toujours typer les variables et fonctions
2. **Composants fonctionnels** - Utiliser les hooks React
3. **Performance** - Optimiser pour WebGPU et éviter les re-renders
4. **Accessibilité** - Suivre les bonnes pratiques ARIA
5. **Babylon.js** - Utiliser les patterns modernes et WebGPU quand possible

## Patterns Spécifiques

- Utiliser `useRef` pour les instances Babylon.js Engine/Scene
- Cleanup approprié avec `useEffect` pour éviter les memory leaks
- State management avec React hooks pour l'interface
- Séparer la logique 3D de la logique UI
