'use client';

import React from 'react';
import { ProductItem } from '../../types/scene';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Star, Check, Layers, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: ProductItem;
  onViewDetails: (product: ProductItem) => void;
  onTryInModel: (product: ProductItem) => void;
  isApplied?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onTryInModel,
  isApplied = false,
}) => {
  return (
    <Card
      variant="default"
      noPadding
      className="flex flex-col justify-between overflow-hidden group hover:border-[#ff9900]/70 transition-all duration-200 font-ember"
    >
      <div>
        {/* Product Image & Badges */}
        <div className="relative h-48 w-full bg-[#0f141a] overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5">
            <Badge variant="brand" size="sm">
              {product.category}
            </Badge>
            <Badge variant="neutral" size="sm">
              {product.style}
            </Badge>
          </div>

          <div className="absolute top-2 right-2 bg-[#16191f]/90 backdrop-blur-sm px-2 py-0.5 rounded-[2px] border border-[#343d4d] flex items-center gap-1 text-[11px] text-[#ff9900] font-mono">
            <Sparkles className="w-3 h-3" />
            <span>{product.compatibilityScore}% Fit</span>
          </div>

          {!product.inStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-[12px] font-bold text-white uppercase bg-[#d9383a] px-2.5 py-1 rounded-[2px]">
                Made to Order
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] text-[#8c8c94] font-medium block">
                {product.company}
              </span>
              <h3 className="text-[15px] font-bold text-white group-hover:text-[#ff9900] transition-colors line-clamp-1">
                {product.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-[18px] font-bold text-white font-mono block">
                ${product.price}
              </span>
              <span className="text-[10px] text-[#687078]">USD</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[12px] text-[#8c8c94]">
            <div className="flex items-center text-[#ff9900]">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="ml-1 font-mono font-bold text-white">{product.rating}</span>
            </div>
            <span>•</span>
            <span className="truncate">{product.material}</span>
          </div>

          <div className="bg-[#0f141a] px-2.5 py-1.5 rounded-[4px] border border-[#232b37] text-[11px] text-[#8c8c94] font-mono flex items-center justify-between">
            <span>Dimensions:</span>
            <span className="text-white">{product.dimensionsMm}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2 border-t border-[#232b37] mt-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewDetails(product)}
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          Details
        </Button>

        <Button
          variant={isApplied ? 'outline' : 'primary'}
          size="sm"
          onClick={() => onTryInModel(product)}
          leftIcon={
            isApplied ? <Check className="w-3.5 h-3.5 text-[#00e582]" /> : <Layers className="w-3.5 h-3.5" />
          }
        >
          {isApplied ? 'In Scene' : 'Try in Model'}
        </Button>
      </div>
    </Card>
  );
};
