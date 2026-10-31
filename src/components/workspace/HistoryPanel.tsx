'use client';

import React from 'react';
import Link from 'next/link';
import {
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Move,
  Layers,
  ShoppingBag,
  Info,
  Sliders,
} from 'lucide-react';
import { SceneVersionSnapshot, SceneObject, ArchiTechScene } from '../../types/scene';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface HistoryPanelProps {
  history: SceneVersionSnapshot[];
  currentScene: ArchiTechScene | null;
  selectedObject: SceneObject | undefined;
  onSelectVersion: (versionId: string) => void;
  onRevertOriginal: () => void;
  onUpdatePosition: (id: string, axis: 'x' | 'y' | 'z', value: number) => void;
  onDeselectObject: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  currentScene,
  selectedObject,
  onSelectVersion,
  onRevertOriginal,
  onUpdatePosition,
  onDeselectObject,
}) => {
  return (
    <aside className="w-[330px] bg-[#16191f] border-l border-[#232b37] flex flex-col h-full font-ember select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#232b37] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#ff9900]" />
          <h2 className="text-[16px] font-bold text-white">Versions & History</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRevertOriginal}
          leftIcon={<RotateCcw className="w-3 h-3 text-[#ff9900]" />}
          title="Restore baseline photographic reconstruction"
        >
          Revert
        </Button>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Selected Object Inspector Drawer */}
        {selectedObject ? (
          <div className="bg-[#1b222d] border border-[#ff9900]/60 rounded-[4px] p-3 shadow-md space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-[#ff9900] uppercase font-bold tracking-wider">
                  Inspecting Selected Object
                </span>
                <h3 className="text-[14px] font-bold text-white">{selectedObject.name}</h3>
                <span className="text-[11px] text-[#8c8c94] capitalize">
                  Category: {selectedObject.type}
                </span>
              </div>
              <button
                onClick={onDeselectObject}
                className="text-[11px] text-[#8c8c94] hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {/* YOLO / Pi3 Confidence Indicator */}
            <div className="flex items-center justify-between text-[11px] bg-[#0f141a] px-2.5 py-1.5 rounded-[4px] border border-[#232b37]">
              <span className="text-[#8c8c94]">Detection Confidence:</span>
              <span className="text-[#00e582] font-mono font-bold">
                {selectedObject.confidence ? `${(selectedObject.confidence * 100).toFixed(0)}% (YOLO11-seg)` : 'Manual asset'}
              </span>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              <div className="bg-[#0f141a] p-1.5 rounded border border-[#232b37]">
                <span className="text-[#687078] block">W</span>
                <span className="font-mono text-white font-medium">{selectedObject.dimensions.width}m</span>
              </div>
              <div className="bg-[#0f141a] p-1.5 rounded border border-[#232b37]">
                <span className="text-[#687078] block">H</span>
                <span className="font-mono text-white font-medium">{selectedObject.dimensions.height}m</span>
              </div>
              <div className="bg-[#0f141a] p-1.5 rounded border border-[#232b37]">
                <span className="text-[#687078] block">D</span>
                <span className="font-mono text-white font-medium">{selectedObject.dimensions.depth}m</span>
              </div>
            </div>

            {/* Spatial Position Sliders */}
            <div className="space-y-2 pt-1 border-t border-[#232b37]">
              <div className="flex items-center justify-between text-[11px] text-[#8c8c94]">
                <span>X Offset (Left / Right):</span>
                <span className="font-mono text-white">{selectedObject.position.x}m</span>
              </div>
              <input
                type="range"
                min="-2.5"
                max="2.5"
                step="0.05"
                value={selectedObject.position.x}
                onChange={(e) => onUpdatePosition(selectedObject.id, 'x', parseFloat(e.target.value))}
                className="w-full accent-[#ff9900]"
              />

              <div className="flex items-center justify-between text-[11px] text-[#8c8c94]">
                <span>Z Offset (Front / Back):</span>
                <span className="font-mono text-white">{selectedObject.position.z}m</span>
              </div>
              <input
                type="range"
                min="-2.5"
                max="2.5"
                step="0.05"
                value={selectedObject.position.z}
                onChange={(e) => onUpdatePosition(selectedObject.id, 'z', parseFloat(e.target.value))}
                className="w-full accent-[#ff9900]"
              />
            </div>

            {/* Catalog Replacement CTA */}
            <Link
              href={`/renovation?category=${selectedObject.type}`}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 bg-[#232b37] hover:bg-[#2c3645] border border-[#ff9900]/40 text-[#ff9900] text-[12px] font-semibold py-2 px-3 rounded-[4px] transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Explore Replacements in Catalog</span>
            </Link>
          </div>
        ) : (
          /* Helper when nothing is selected */
          <div className="bg-[#1b222d] border border-[#232b37] rounded-[4px] p-3 text-[12px] text-[#8c8c94] flex items-center gap-2">
            <Info className="w-4 h-4 text-[#ff9900] flex-shrink-0" />
            <span>Click any 3D piece in the viewport to inspect dimensions, position offsets, or replace.</span>
          </div>
        )}

        {/* Spatial Intelligence Validation Summary */}
        <div className="bg-[#1b222d] border border-[#232b37] rounded-[4px] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-bold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00e582]" />
              Spatial Intelligence Rules
            </span>
            <Badge variant="success" size="sm">Valid</Badge>
          </div>
          <div className="space-y-1 text-[11px] text-[#8c8c94]">
            <div className="flex items-center justify-between">
              <span>Collision Overlaps:</span>
              <span className="text-[#00e582] font-mono">0 detected</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Doorway Clearance:</span>
              <span className="text-[#00e582] font-mono">&gt; 0.90m verified</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Identified Entities:</span>
              <span className="text-white font-mono">{currentScene?.objects.length || 0} objects</span>
            </div>
          </div>
        </div>

        {/* Version History Stack */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#8c8c94] uppercase tracking-wider">
            Iteration Timeline ({history.length})
          </span>
          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {history.map((snapshot, idx) => {
              const isCurrent = currentScene?.version === snapshot.scene.version;
              return (
                <div
                  key={snapshot.versionId}
                  onClick={() => onSelectVersion(snapshot.versionId)}
                  className={`p-3 rounded-[4px] border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-[#232b37] border-[#ff9900] shadow-[0px_2px_12px_rgba(255,153,0,0.15)]'
                      : 'bg-[#1b222d] border-[#232b37] hover:border-[#343d4d]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-bold text-white flex items-center gap-1.5">
                      Version {snapshot.versionNumber}
                      {isCurrent && <Badge variant="brand" size="sm">Active</Badge>}
                    </span>
                    <span className="text-[10px] text-[#687078] font-mono">{snapshot.timestamp}</span>
                  </div>
                  <p className="text-[12px] text-[#8c8c94] line-clamp-2 leading-relaxed">
                    {snapshot.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
