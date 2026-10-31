'use client';

import React from 'react';
import { useArchiTechScene } from '../../hooks/useArchiTechScene';
import { SceneCanvas } from './SceneCanvas';
import { UploadPanel } from './UploadPanel';
import { FloatingPromptBar } from './FloatingPromptBar';
import { HistoryPanel } from './HistoryPanel';
import { Grid, Eye, ShieldAlert, Sparkles, Box, RefreshCw } from 'lucide-react';

export default function WorkspaceView() {
  const {
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
    resetToDefaultPreset,
  } = useArchiTechScene();

  return (
    <div className="grid grid-cols-[280px_1fr_330px] h-[calc(100vh-56px)] bg-[#16191f] text-white font-ember overflow-hidden">
      {/* Left Panel: Upload References & Constraints */}
      <UploadPanel
        onUpload={uploadReferences}
        isLoading={loading}
        onLoadPreset={resetToDefaultPreset}
        statusMessage={statusMessage}
      />

      {/* Center 3D Viewport Area */}
      <main className="relative flex flex-col h-full bg-[#0f141a] overflow-hidden">
        {/* Top Viewport Floating Toolbar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#16191f]/90 backdrop-blur-md border border-[#343d4d] p-1 rounded-[4px] shadow-lg select-none">
          {/* View presets */}
          <div className="flex items-center gap-1 border-r border-[#232b37] pr-1.5 mr-0.5">
            <button
              onClick={() => setActiveViewMode('perspective')}
              className={`px-2 py-1 rounded-[2px] text-[11px] font-semibold transition-colors ${
                activeViewMode === 'perspective'
                  ? 'bg-[#ff9900] text-[#16191f]'
                  : 'text-[#8c8c94] hover:text-white'
              }`}
            >
              Perspective
            </button>
            <button
              onClick={() => setActiveViewMode('top')}
              className={`px-2 py-1 rounded-[2px] text-[11px] font-semibold transition-colors ${
                activeViewMode === 'top'
                  ? 'bg-[#ff9900] text-[#16191f]'
                  : 'text-[#8c8c94] hover:text-white'
              }`}
            >
              Top-Down
            </button>
            <button
              onClick={() => setActiveViewMode('front')}
              className={`px-2 py-1 rounded-[2px] text-[11px] font-semibold transition-colors ${
                activeViewMode === 'front'
                  ? 'bg-[#ff9900] text-[#16191f]'
                  : 'text-[#8c8c94] hover:text-white'
              }`}
            >
              Front
            </button>
          </div>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Spatial Grid"
            className={`p-1.5 rounded-[2px] text-[11px] transition-colors ${
              showGrid ? 'text-[#ff9900] bg-[#232b37]' : 'text-[#687078] hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            title="Toggle Wireframe Mesh Mode"
            className={`p-1.5 rounded-[2px] text-[11px] transition-colors ${
              wireframeMode ? 'text-[#7300e5] bg-[#232b37]' : 'text-[#687078] hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => setActiveViewMode('perspective')}
            title="Reset Camera Angle"
            className="p-1.5 rounded-[2px] text-[#8c8c94] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3D Canvas or Empty State */}
        {!scene ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
            <div className="w-16 h-16 rounded-[4px] bg-[#232b37] flex items-center justify-center text-[#ff9900] mb-4">
              <Box className="w-8 h-8" />
            </div>
            <h1 className="text-[24px] font-bold mb-2">Workspace Empty</h1>
            <p className="text-[14px] text-[#687078] max-w-md">
              Upload references on the left or click "Load Colab Verified Living Room" to instantiate the 3D reconstructed scene.
            </p>
          </div>
        ) : (
          <div className="w-full h-full relative">
            <SceneCanvas
              scene={scene}
              selectedObjectId={selectedObjectId}
              onSelectObject={selectObject}
              activeViewMode={activeViewMode}
              wireframeMode={wireframeMode}
              showGrid={showGrid}
              collisionHighlights={collisionHighlights}
            />
          </div>
        )}

        {/* Floating Natural Language Prompt Bar */}
        <FloatingPromptBar
          onSubmit={(prompt, method) => submitPrompt(prompt, method)}
          isLoading={isProcessingPrompt}
        />
      </main>

      {/* Right Panel: Versions, Spatial Validation & Object Inspector */}
      <HistoryPanel
        history={history}
        currentScene={scene}
        selectedObject={selectedObject}
        onSelectVersion={selectVersion}
        onRevertOriginal={revertToOriginal}
        onUpdatePosition={updateObjectPosition}
        onDeselectObject={() => selectObject(null)}
      />
    </div>
  );
}
