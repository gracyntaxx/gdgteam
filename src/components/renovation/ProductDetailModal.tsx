'use client';

import React from 'react';
import { ProductItem } from '../../types/scene';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  Star,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
  Truck,
  Leaf,
  Maximize2,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTryInModel: (product: ProductItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onTryInModel,
}) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} maxWidth="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-ember">
        {/* Product Image & Spatial badge */}
        <div className="space-y-3">
          <div className="relative h-64 md:h-72 w-full bg-[#0f141a] rounded-[4px] overflow-hidden border border-[#232b37]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-[#16191f]/90 backdrop-blur-md px-2.5 py-1 rounded-[4px] border border-[#343d4d] text-[11px] font-mono text-[#00e582] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ff9900]" />
              <span>Spatial Compatibility: {product.compatibilityScore}%</span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="bg-[#1b222d] p-2.5 rounded-[4px] border border-[#232b37]">
              <span className="text-[#687078] block text-[10px] uppercase font-bold">Material</span>
              <span className="text-white font-medium">{product.material}</span>
            </div>
            <div className="bg-[#1b222d] p-2.5 rounded-[4px] border border-[#232b37]">
              <span className="text-[#687078] block text-[10px] uppercase font-bold">Style Category</span>
              <span className="text-white font-medium">{product.style} Design</span>
            </div>
          </div>
        </div>

        {/* Right Info Details */}
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="brand" size="md">
                {product.company}
              </Badge>
              <div className="flex items-center text-[#ff9900]">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 font-mono font-bold text-white text-[13px]">{product.rating} / 5.0</span>
              </div>
            </div>

            <div>
              <span className="text-[28px] font-bold text-white font-mono block">
                ${product.price}{' '}
                <span className="text-[14px] text-[#687078] font-normal">{product.currency}</span>
              </span>
            </div>

            <p className="text-[13px] text-[#8c8c94] leading-relaxed">
              {product.description}
            </p>

            {/* Geometric Dimensions Table */}
            <div className="bg-[#0f141a] p-3 rounded-[4px] border border-[#232b37] space-y-2">
              <span className="text-[11px] font-bold text-white uppercase tracking-wider block">
                Measured Physical Envelope
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[12px] font-mono">
                <div className="bg-[#16191f] p-1.5 rounded border border-[#232b37]">
                  <span className="text-[#687078] block text-[10px]">Width</span>
                  <span className="text-white font-bold">{product.dimensions.width}m</span>
                </div>
                <div className="bg-[#16191f] p-1.5 rounded border border-[#232b37]">
                  <span className="text-[#687078] block text-[10px]">Height</span>
                  <span className="text-white font-bold">{product.dimensions.height}m</span>
                </div>
                <div className="bg-[#16191f] p-1.5 rounded border border-[#232b37]">
                  <span className="text-[#687078] block text-[10px]">Depth</span>
                  <span className="text-white font-bold">{product.dimensions.depth}m</span>
                </div>
              </div>
            </div>

            {/* Renovation Perks */}
            <div className="space-y-1.5 text-[12px] text-[#8c8c94]">
              <div className="flex items-center gap-2">
                <Leaf className="w-3.5 h-3.5 text-[#00e582]" />
                <span>Eco-Certified low VOC finishes and FSC certified wood</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#ff9900]" />
                <span>Direct delivery & spatial placement assistance</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-[#232b37] flex items-center justify-end gap-3">
            <Button variant="outline" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onTryInModel(product);
                onClose();
              }}
              leftIcon={<Layers className="w-4 h-4" />}
            >
              Apply to 3D Space
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
