import { useCallback, useState } from 'react';
import type { SceneObject } from '../types';
import type { ObjectManager } from '../utils/ObjectManager';

export interface SelectionState {
  selectedObject: SceneObject | null;
  hoveredObject: SceneObject | null;
  isSelecting: boolean;
}

interface UseObjectSelectionProps {
  objectManager: ObjectManager | null;
}

export const useObjectSelection = ({ objectManager }: UseObjectSelectionProps) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedObject: null,
    hoveredObject: null,
    isSelecting: false
  });

  const selectObject = useCallback((objectId: string | null) => {
    if (!objectManager) return;
    
    const object = objectManager.selectObject(objectId);
    setSelectionState(prev => ({
      ...prev,
      selectedObject: object,
      isSelecting: object !== null
    }));
  }, [objectManager]);

  const hoverObject = useCallback((objectId: string | null) => {
    if (!objectManager) return;
    
    const object = objectManager.hoverObject(objectId);
    setSelectionState(prev => ({
      ...prev,
      hoveredObject: object
    }));
  }, [objectManager]);

  const clearSelection = useCallback(() => {
    if (objectManager) {
      objectManager.selectObject(null);
    }
    setSelectionState({
      selectedObject: null,
      hoveredObject: null,
      isSelecting: false
    });
  }, [objectManager]);

  const deleteSelectedObject = useCallback(() => {
    if (!objectManager || !selectionState.selectedObject) return false;
    
    const success = objectManager.removeObject(selectionState.selectedObject.id);
    if (success) {
      setSelectionState({
        selectedObject: null,
        hoveredObject: null,
        isSelecting: false
      });
    }
    return success;
  }, [objectManager, selectionState.selectedObject]);

  const isObjectSelected = useCallback((objectId: string): boolean => {
    return selectionState.selectedObject?.id === objectId;
  }, [selectionState.selectedObject]);

  const isObjectHovered = useCallback((objectId: string): boolean => {
    return selectionState.hoveredObject?.id === objectId;
  }, [selectionState.hoveredObject]);

  return {
    ...selectionState,
    selectObject,
    hoverObject,
    clearSelection,
    deleteSelectedObject,
    isObjectSelected,
    isObjectHovered
  };
};
