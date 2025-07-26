# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Designer3D is a modern 3D design web application built with Babylon.js 8.0, React 19, and TypeScript. It allows users to create and manipulate 3D primitives (cube, sphere, cylinder, cone, plane, torus) in a WebGPU/WebGL-powered 3D scene.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint code linting
- `npm run preview` - Preview production build locally

## Core Architecture

### State Management
- **App.tsx**: Main application state using React useState
- **AppState interface**: Manages selected tool, selected object, objects array, and transform mode
- State flows down through props, callbacks flow up

### 3D Engine Integration
- **useBabylonScene hook**: Initializes Babylon.js engine (WebGPU with WebGL fallback)
- **ObjectManager class**: Manages 3D objects, selection highlighting, and mesh lifecycle
- **Scene3D component**: Renders 3D canvas and handles pointer interactions

### Object System
- **SceneObject interface**: Data representation of 3D objects with position, rotation, scale, material
- **PrimitiveConfig**: Configuration for creating 3D primitives
- **primitives.ts**: Factory functions for creating Babylon.js meshes from configurations

### Event Handling
- **Pointer events**: Scene3D handles pointerdown/pointermove for object creation and selection
- **Keyboard shortcuts**: F12 opens Babylon.js inspector, Delete removes selected object
- **Selection system**: Visual highlighting using Babylon.js HighlightLayer (blue=selected, yellow=hovered)

## Key Technical Details

### Babylon.js Setup
- Engine initialization tries WebGPU first, falls back to WebGL
- Scene uses ArcRotateCamera for 3D navigation
- Ground plane with wireframe grid for spatial reference
- HemisphericLight for basic scene illumination

### Object Creation Flow
1. User selects primitive tool from toolbar
2. Click in 3D scene triggers raycast to get world position
3. createPrimitive() generates Babylon.js mesh and SceneObject data
4. ObjectManager stores mesh-to-data mapping
5. Object automatically selected after creation

### Selection System
- **useObjectSelection hook**: Manages selection state and interactions
- **ObjectManager**: Provides selectObject(), hoverObject(), findObjectByMesh() methods
- Visual feedback through HighlightLayer with color coding

## File Structure Significance

- `src/hooks/`: Custom React hooks for Babylon.js integration
- `src/utils/`: Core 3D logic (ObjectManager, primitives, raycast utilities)
- `src/types/`: TypeScript interfaces for 3D objects and app state
- `src/components/`: React UI components (Scene3D for 3D rendering, PrimitiveToolbar for controls)

## Dependencies

- **@babylonjs/core**: 3D engine
- **@babylonjs/inspector**: F12 debug inspector
- **@radix-ui/**: UI components for toolbar
- **lucide-react**: Icons
- **Tailwind CSS**: Styling with modern design system

## Testing

No test framework is currently configured. When adding tests, check package.json scripts for test commands.