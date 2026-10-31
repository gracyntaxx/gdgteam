'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArchiTechScene,
  SceneObject,
  SceneVersionSnapshot,
  ProductItem,
} from '../types/scene';
import { ArchiTechService, DEFAULT_LIVING_ROOM } from '../services/api';

const STORAGE_KEY = 'architech_scene_state';
const HISTORY_KEY = 'architech_scene_history';

export function useArchiTechScene() {
  const [scene, setScene] = useState<ArchiTechScene | null>(null);
  const [history, setHistory] = useState<SceneVersionSnapshot[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isProcessingPrompt, setIsProcessingPrompt] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready');
  const [activeViewMode, setActiveViewMode] = useState<'perspective' | 'top' | 'front'>('perspective');
  const [wireframeMode, setWireframeMode] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [collisionHighlights, setCollisionHighlights] = useState<boolean>(false);

  // Initialize scene from localStorage or default
  useEffect(() => {
    try {
      const savedScene = localStorage.getItem(STORAGE_KEY);
      const savedHistory = localStorage.getItem(HISTORY_KEY);

      if (savedScene) {
        setScene(JSON.parse(savedScene));
      } else {
        setScene(DEFAULT_LIVING_ROOM);
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        const initialSnapshot: SceneVersionSnapshot = {
          versionId: 'v-1',
          versionNumber: 1,
          description: 'Initial room reconstruction from dual-view photos',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          scene: DEFAULT_LIVING_ROOM,
          author: 'AI',
        };
        setHistory([initialSnapshot]);
      }
    } catch {
      setScene(DEFAULT_LIVING_ROOM);
    }
  }, []);

  // Sync to localStorage
  const saveState = useCallback((newScene: ArchiTechScene, newHistory: SceneVersionSnapshot[]) => {
    setScene(newScene);
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newScene));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, []);

  // Upload references handler (Page 2 Left Panel)
  const uploadReferences = async (files: FileList | File[]) => {
    setLoading(true);
    setStatusMessage('Ingesting photographic references via PURE Pi3 pipeline...');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      const result = await ArchiTechService.uploadReferences(formData);
      const newSnapshot: SceneVersionSnapshot = {
        versionId: `v-${Date.now()}`,
        versionNumber: history.length + 1,
        description: `Reconstructed from ${files.length} uploaded image(s)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scene: result.scene,
        author: 'AI',
      };

      const updatedHistory = [newSnapshot, ...history];
      saveState(result.scene, updatedHistory);
      setStatusMessage('Reconstruction complete. 3D geometry & segmentation ready.');
    } catch (error) {
      console.error('Upload failed:', error);
      setStatusMessage('Error processing images. Retaining current scene.');
    } finally {
      setLoading(false);
    }
  };

  // Submit edit prompt (Page 2 Bottom Prompt Bar)
  const submitPrompt = async (promptText: string, inputMethod: 'text' | 'voice' = 'text') => {
    if (!promptText.trim() || !scene) return;

    setIsProcessingPrompt(true);
    setStatusMessage(`Interpreting ${inputMethod} prompt: "${promptText}"...`);

    try {
      const { scene: updatedScene, changeDescription } = await ArchiTechService.submitEditPrompt(
        scene.scene_id,
        promptText,
        scene
      );

      const newSnapshot: SceneVersionSnapshot = {
        versionId: `v-${Date.now()}`,
        versionNumber: history.length + 1,
        description: changeDescription,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        scene: updatedScene,
        author: inputMethod === 'voice' ? 'AI' : 'User',
      };

      const updatedHistory = [newSnapshot, ...history];
      saveState(updatedScene, updatedHistory);
      setStatusMessage(`Updated: ${changeDescription}`);
    } catch (error) {
      console.error('Prompt edit failed:', error);
      setStatusMessage('Failed to execute spatial edit.');
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  // Restore previous version (Page 2 Right Panel)
  const selectVersion = (versionId: string) => {
    const target = history.find((h) => h.versionId === versionId);
    if (target) {
      setScene(target.scene);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(target.scene));
      } catch (e) {
        console.warn(e);
      }
      setStatusMessage(`Restored ${target.description}`);
    }
  };

  // Revert to original reconstruction
  const revertToOriginal = () => {
    const original = history[history.length - 1] || {
      versionId: 'v-1',
      versionNumber: 1,
      description: 'Original reconstruction',
      timestamp: 'Initial',
      scene: DEFAULT_LIVING_ROOM,
      author: 'AI' as const,
    };

    setScene(original.scene);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(original.scene));
    } catch (e) {
      console.warn(e);
    }
    setStatusMessage('Reverted workspace to original photograph reconstruction.');
  };

  // Select 3D Object
  const selectObject = (objectId: string | null) => {
    setSelectedObjectId(objectId);
  };

  // Update object coordinates manually
  const updateObjectPosition = (
    objectId: string,
    axis: 'x' | 'y' | 'z',
    value: number
  ) => {
    if (!scene) return;
    const updatedObjects = scene.objects.map((obj) => {
      if (obj.id === objectId) {
        return {
          ...obj,
          position: {
            ...obj.position,
            [axis]: Number(value.toFixed(2)),
          },
        };
      }
      return obj;
    });

    const updatedScene = { ...scene, objects: updatedObjects };
    setScene(updatedScene);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScene));
    } catch (e) {
      console.warn(e);
    }
  };

  // Apply catalog product to scene (Page 3 integration)
  const applyProduct = async (product: ProductItem, targetId: string | null = null) => {
    if (!scene) return;
    setStatusMessage(`Injecting "${product.name}" into spatial scene...`);

    const updated = await ArchiTechService.applyProductToScene(product, targetId || selectedObjectId, scene);
    const newSnapshot: SceneVersionSnapshot = {
      versionId: `v-${Date.now()}`,
      versionNumber: history.length + 1,
      description: `Installed ${product.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scene: updated,
      author: 'User',
    };

    saveState(updated, [newSnapshot, ...history]);
    setStatusMessage(`Catalog item "${product.name}" integrated successfully.`);
  };

  // Reset entire workspace to pristine demo
  const resetToDefaultPreset = () => {
    const initialSnapshot: SceneVersionSnapshot = {
      versionId: `v-${Date.now()}`,
      versionNumber: 1,
      description: 'Default Living Room preset loaded',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scene: DEFAULT_LIVING_ROOM,
      author: 'AI',
    };
    saveState(DEFAULT_LIVING_ROOM, [initialSnapshot]);
    setStatusMessage('Reset workspace to standard living room preset.');
  };

  const selectedObject: SceneObject | undefined = scene?.objects.find((o) => o.id === selectedObjectId);

  return {
    scene,
    history,
    selectedObjectId,
    selectedObject,
    loading,
    isProcessingPrompt,
    statusMessage,
    activeViewMode,
    wireframeMode,
    showGrid,
    collisionHighlights,
    setActiveViewMode,
    setWireframeMode,
    setShowGrid,
    setCollisionHighlights,
    uploadReferences,
    submitPrompt,
    selectVersion,
    revertToOriginal,
    selectObject,
    updateObjectPosition,
    applyProduct,
    resetToDefaultPreset,
  };
}
