# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Designer3D - Application de Design 3D Web

Une application moderne de design 3D construite avec **Babylon.js 8.0**, **React 18**, et **TypeScript**.

## 🌟 Fonctionnalités

- ✅ **Primitives 3D** : Cube, Sphère, Cylindre, Cône, Plan, Tore
- ✅ **Moteur WebGPU** : Performance optimisée avec fallback WebGL
- ✅ **Interface intuitive** : Toolbar moderne avec Radix UI
- 🚧 **Transformation d'objets** : Translation, rotation, échelle (en cours)
- 🚧 **Sauvegarde/Chargement** : Format JSON (planifié)

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Navigateur compatible WebGL 2.0 ou WebGPU

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

### Build de production
```bash
npm run build
```

## 🛠 Technologies utilisées

- **[Babylon.js 8.0](https://babylonjs.com/)** - Moteur 3D WebGPU/WebGL
- **[React 18](https://react.dev/)** - Interface utilisateur
- **[TypeScript](https://typescriptlang.org/)** - Typage statique
- **[Vite](https://vitejs.dev/)** - Build tool ultra-rapide
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Radix UI](https://radix-ui.com/)** - Composants UI accessibles
- **[Lucide React](https://lucide.dev/)** - Icônes modernes

## 📁 Structure du projet

```
src/
├── components/          # Composants React UI
│   ├── Scene3D.tsx     # Composant de rendu 3D
│   └── PrimitiveToolbar.tsx # Barre d'outils
├── babylon/            # Logique Babylon.js
├── hooks/              # Hooks React personnalisés
│   └── useBabylonScene.ts
├── types/              # Définitions TypeScript
├── utils/              # Utilitaires
│   └── primitives.ts   # Création de formes 3D
└── styles/             # Styles CSS
```

## 🎮 Utilisation

1. **Sélectionner une forme** dans la toolbar
2. **Cliquer dans la scène 3D** pour placer la forme
3. **F12** pour ouvrir l'inspector Babylon.js
4. **Mode transformation** pour manipuler les objets (à venir)

## 🔧 Développement

### Commandes disponibles
- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Prévisualiser le build
- `npm run lint` - Vérification ESLint

### Architecture

L'application suit une architecture modulaire :
- **Composants React** pour l'interface utilisateur
- **Hooks personnalisés** pour la logique Babylon.js
- **Utilitaires** pour la création et manipulation d'objets 3D
- **Types TypeScript** pour la sécurité de type

## 🌐 Support navigateur

- ✅ Chrome 113+ (WebGPU natif)
- ✅ Firefox (WebGL fallback)
- ✅ Safari (WebGL fallback)
- ✅ Edge 113+ (WebGPU natif)

## 📝 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour les guidelines.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
