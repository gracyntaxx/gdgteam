'use client';

import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Video, FileText, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface UploadPanelProps {
  onUpload: (files: File[]) => void;
  isLoading: boolean;
  onLoadPreset: () => void;
  statusMessage: string;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onUpload,
  isLoading,
  onLoadPreset,
  statusMessage,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [roomType, setRoomType] = useState<string>('Living Room');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    validateAndSetFiles(Array.from(e.target.files));
  };

  const validateAndSetFiles = (files: File[]) => {
    setValidationError(null);

    // Rule: Max 2 images or 1 video (max duration 10s)
    const images = files.filter((f) => f.type.startsWith('image/'));
    const videos = files.filter((f) => f.type.startsWith('video/'));

    if (videos.length > 1) {
      setValidationError('Constraint: Maximum 1 video reference allowed.');
      return;
    }

    if (videos.length === 1 && images.length > 0) {
      setValidationError('Upload either 1 video (max 10s) or up to 2 photographs.');
      return;
    }

    if (images.length > 2) {
      setValidationError('Constraint: Maximum 2 ordered photographs allowed for PURE Pi3.');
      return;
    }

    setSelectedFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      validateAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
  };

  return (
    <aside className="w-[280px] bg-[#16191f] border-r border-[#232b37] flex flex-col h-full font-ember select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#232b37] flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-white">Upload References</h2>
          <p className="text-[11px] text-[#8c8c94]">PURE Pi3 Reconstruction</p>
        </div>
        <Badge variant="brand" size="sm">Colab T4</Badge>
      </div>

      <div className="p-4 flex flex-col gap-4 flex-1">
        {/* Upload Constraints Card */}
        <div className="bg-[#1b222d] border border-[#232b37] rounded-[4px] p-3 text-[12px] text-[#8c8c94] space-y-1.5">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00e582]" />
            <span>Enforced Input Limits:</span>
          </div>
          <p className="pl-5">• Images: <strong>Max 2 photos</strong> (ordered room views)</p>
          <p className="pl-5">• Video: <strong>Max 1 clip</strong> (&le; 10s duration)</p>
          <p className="pl-5">• Formats: JPG, PNG, MP4, WebM</p>
        </div>

        {/* Room Type Selector */}
        <div className="space-y-1">
          <label className="text-[12px] font-semibold text-[#8c8c94] uppercase tracking-wider">
            Target Space
          </label>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            className="w-full bg-[#0f141a] border border-[#343d4d] text-white text-[13px] px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#ff9900]"
          >
            <option value="Living Room">Living Room</option>
            <option value="Bedroom">Master Bedroom</option>
            <option value="Home Office">Executive Studio / Office</option>
            <option value="Dining Room">Dining & Lounge</option>
          </select>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-[#687078] hover:border-[#ff9900] bg-[#0f141a]/60 hover:bg-[#0f141a] p-5 text-center rounded-[4px] cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-[4px] bg-[#232b37] flex items-center justify-center text-[#ff9900] group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[13px] font-semibold text-white">Click or Drop references</p>
            <p className="text-[11px] text-[#687078]">Two ordered views for depth fusion</p>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#8c8c94] uppercase">Queued Inputs ({selectedFiles.length})</span>
            <div className="space-y-1.5">
              {selectedFiles.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-[#232b37] border border-[#343d4d] px-2.5 py-1.5 rounded-[4px] flex items-center justify-between text-[12px]"
                >
                  <div className="flex items-center gap-2 truncate">
                    {f.type.startsWith('video/') ? (
                      <Video className="w-3.5 h-3.5 text-[#ff9900] flex-shrink-0" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-[#0073bb] flex-shrink-0" />
                    )}
                    <span className="truncate text-white">{f.name}</span>
                  </div>
                  <span className="text-[10px] text-[#687078] flex-shrink-0">
                    {(f.size / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full mt-2"
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Reconstruct with PURE Pi3
            </Button>
          </div>
        )}

        {/* Validation Error Message */}
        {validationError && (
          <div className="p-2.5 bg-[#d9383a]/15 border border-[#d9383a]/40 rounded-[4px] text-[11px] text-[#ff8080] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Demo Preset Loader */}
        <div className="pt-2 border-t border-[#232b37] space-y-2 mt-auto">
          <span className="text-[11px] font-semibold text-[#8c8c94] uppercase">Quick Demo Datasets</span>
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-left justify-start"
            onClick={onLoadPreset}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />}
          >
            Load Colab Verified Living Room
          </Button>
        </div>
      </div>

      {/* Footer Process Status Bar */}
      <div className="p-3 bg-[#0f141a] border-t border-[#232b37] text-[11px] text-[#8c8c94] truncate">
        <span className="text-[#00e582] mr-1.5">●</span>
        <span>{statusMessage}</span>
      </div>
    </aside>
  );
};
