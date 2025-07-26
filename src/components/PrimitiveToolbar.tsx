import React from 'react';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as Separator from '@radix-ui/react-separator';
import { 
  Box, 
  Circle, 
  Cylinder, 
  Triangle, 
  Square, 
  Zap,
  Move3D,
  RotateCcw,
  Scale,
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

const transformTools = [
  { key: 'move', icon: <Move3D size={20} />, label: 'Déplacer' },
  { key: 'rotate', icon: <RotateCcw size={20} />, label: 'Tourner' },
  { key: 'scale', icon: <Scale size={20} />, label: 'Redimensionner' },
];

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
        'flex items-center gap-2 p-4 bg-white border-b border-gray-200 shadow-sm',
        className
      )}
      orientation="horizontal"
    >
      {/* Section Sélection et Primitives */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-700 mr-2">Outils:</span>
        
        {/* Bouton Sélection */}
        <Toolbar.Button
          className={clsx(
            'inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
            selectedTool === 'select'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 border border-transparent'
          )}
          onClick={() => onToolSelect('select')}
          title="Mode sélection"
        >
          <MousePointer className="w-4 h-4 mr-1" />
          Sélectionner
        </Toolbar.Button>

        <Separator.Root className="w-px h-6 bg-gray-300 mx-2" />
        
        {primitiveTools.map((tool) => (
          <Toolbar.Button
            key={tool.type}
            className={clsx(
              'inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              selectedTool === tool.type && !isTransformMode
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'text-gray-700 border border-gray-300'
            )}
            onClick={() => {
              if (selectedTool === tool.type && !isTransformMode) {
                onToolSelect(null);
              } else {
                onToolSelect(tool.type);
              }
            }}
            title={tool.label}
          >
            {tool.icon}
          </Toolbar.Button>
        ))}
      </div>

      <Separator.Root className="w-px h-6 bg-gray-300" />

      {/* Section Transformation */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-700 mr-2">Outils:</span>
        <Toolbar.Button
          className={clsx(
            'inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1',
            isTransformMode
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'text-gray-700 border border-gray-300'
          )}
          onClick={onTransformModeToggle}
          title="Mode transformation"
        >
          <Move3D size={20} />
        </Toolbar.Button>
      </div>

      <Separator.Root className="w-px h-6 bg-gray-300" />

      {/* Informations */}
      <div className="flex-1" />
      <div className="text-xs text-gray-500">
        {selectedTool && !isTransformMode 
          ? `Cliquez pour placer: ${primitiveTools.find(t => t.type === selectedTool)?.label}`
          : isTransformMode 
          ? 'Mode transformation - Sélectionnez un objet'
          : 'Sélectionnez une forme ou activez le mode transformation'
        }
      </div>
    </Toolbar.Root>
  );
};
