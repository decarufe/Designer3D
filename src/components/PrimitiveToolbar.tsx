import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import { 
  Box, 
  Circle, 
  Cylinder, 
  Triangle, 
  Square, 
  Zap,
  Move3D,
  MousePointer
} from 'lucide-react';
import { clsx } from 'clsx';
import type { PrimitiveType } from '../types';

interface PrimitiveToolbarProps {
  selectedTool: PrimitiveType | 'select' | null;
  onToolSelect: (tool: PrimitiveType | 'select' | null) => void;
  isTransformMode: boolean;
  onTransformModeToggle: () => void;
  className?: string;
}

const primitiveTools: Array<{
  type: PrimitiveType;
  icon: React.ReactNode;
  label: string;
}> = [
  { type: 'cube', icon: <Box size={20} />, label: 'Cube' },
  { type: 'sphere', icon: <Circle size={20} />, label: 'Sphère' },
  { type: 'cylinder', icon: <Cylinder size={20} />, label: 'Cylindre' },
  { type: 'cone', icon: <Triangle size={20} />, label: 'Cône' },
  { type: 'plane', icon: <Square size={20} />, label: 'Plan' },
  { type: 'torus', icon: <Zap size={20} />, label: 'Tore' },
];

// Transform tools configuration (planned for future use)
// const transformTools = [
//   { key: 'move', icon: <Move3D size={20} />, label: 'Déplacer' },
//   { key: 'rotate', icon: <RotateCcw size={20} />, label: 'Tourner' },
//   { key: 'scale', icon: <Scale size={20} />, label: 'Redimensionner' },
// ];

export const PrimitiveToolbar: React.FC<PrimitiveToolbarProps> = ({
  selectedTool,
  onToolSelect,
  isTransformMode,
  onTransformModeToggle,
  className = ''
}) => {
  return (
    <Toolbar.Root 
      className={clsx(
        'flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200/50 shadow-lg',
        className
      )}
      orientation="horizontal"
      role="toolbar"
      aria-label="Outils de modélisation 3D"
    >
      {/* Selection Tools Group */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
        <span className="text-xs font-medium text-gray-600 px-2">Sélection</span>
        <Toolbar.Button
          className={clsx(
            'inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
            'hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50',
            'min-h-[44px] min-w-[44px] touch-manipulation',
            selectedTool === 'select'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
              : 'text-gray-600'
          )}
          onClick={() => onToolSelect('select')}
          title="Mode sélection"
          aria-label="Sélectionner les objets dans la scène 3D"
          aria-pressed={selectedTool === 'select'}
          role="button"
        >
          <MousePointer className="w-4 h-4 mr-1" aria-hidden="true" />
          <span className="hidden sm:inline">Sélectionner</span>
        </Toolbar.Button>
      </div>

      {/* Primitive Tools Group */}
      <div className="flex flex-wrap items-center gap-1 bg-gray-50 rounded-lg p-1">
        <span className="text-xs font-medium text-gray-600 px-2">Formes</span>
        {primitiveTools.map((tool) => (
          <Toolbar.Button
            key={tool.type}
            className={clsx(
              'inline-flex items-center justify-center p-2 rounded-md transition-all duration-200',
              'hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50',
              'min-h-[44px] min-w-[44px] touch-manipulation',
              selectedTool === tool.type && !isTransformMode
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                : 'text-gray-600 hover:text-gray-900'
            )}
            onClick={() => {
              if (selectedTool === tool.type && !isTransformMode) {
                onToolSelect(null);
              } else {
                onToolSelect(tool.type);
              }
            }}
            aria-label={`Créer ${tool.label}`}
            aria-pressed={selectedTool === tool.type && !isTransformMode}
            title={tool.label}
            role="button"
          >
            {tool.icon}
          </Toolbar.Button>
        ))}
      </div>

      {/* Transform Mode Group */}
      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1">
        <span className="text-xs font-medium text-gray-600 px-2">Transformation</span>
        <Toolbar.Button
          className={clsx(
            'inline-flex items-center justify-center p-2 rounded-md transition-all duration-200',
            'hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50',
            'min-h-[44px] min-w-[44px] touch-manipulation',
            isTransformMode
              ? 'bg-green-100 text-green-700 shadow-sm ring-1 ring-green-200'
              : 'text-gray-600 hover:text-gray-900'
          )}
          onClick={onTransformModeToggle}
          aria-label="Activer le mode transformation"
          aria-pressed={isTransformMode}
          title="Mode transformation"
          role="button"
        >
          <Move3D size={20} aria-hidden="true" />
        </Toolbar.Button>
      </div>

      {/* Status Display */}
      <div className="flex-1" />
      <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md hidden sm:block">
        {selectedTool && !isTransformMode 
          ? `Cliquez pour placer: ${primitiveTools.find(t => t.type === selectedTool)?.label}`
          : isTransformMode 
          ? 'Mode transformation actif'
          : 'Sélectionnez un outil'
        }
      </div>
    </Toolbar.Root>
  );
};
