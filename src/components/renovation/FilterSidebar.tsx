'use client';

import React from 'react';
import { FilterCriteria } from '../../types/scene';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import { Button } from '../common/Button';

interface FilterSidebarProps {
  filters: FilterCriteria;
  onFilterChange: (newFilters: FilterCriteria) => void;
  onResetFilters: () => void;
  productCount: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  productCount,
}) => {
  const categories = [
    { label: 'All Products', value: 'all' },
    { label: 'Sofas & Lounges', value: 'sofa' },
    { label: 'Coffee & Dining Tables', value: 'table' },
    { label: 'Chairs & Armchairs', value: 'chair' },
    { label: 'Lighting Fixtures', value: 'lighting' },
    { label: 'Storage & TV Units', value: 'storage' },
    { label: 'Rugs & Decor', value: 'decor' },
  ];

  const styles = ['all', 'Modern', 'Scandinavian', 'Minimalist', 'Industrial', 'Boho'];

  return (
    <aside className="w-[280px] bg-[#16191f] border-r border-[#232b37] flex flex-col h-full font-ember select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-[#232b37] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#ff9900]" />
          <h2 className="text-[16px] font-bold text-white">Budget & Filters</h2>
        </div>
        <button
          onClick={onResetFilters}
          className="text-[11px] text-[#8c8c94] hover:text-[#ff9900] flex items-center gap-1 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5 flex-1">
        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#8c8c94] uppercase tracking-wider">
            Keyword Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#687078] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search sofa, oak, brass..."
              className="w-full bg-[#0f141a] border border-[#343d4d] pl-9 pr-3 py-1.5 rounded-[4px] text-white text-[13px] placeholder-[#687078] focus:outline-none focus:border-[#ff9900]"
            />
          </div>
        </div>

        {/* Category Radios / List */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-[#8c8c94] uppercase tracking-wider">
            Category
          </label>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => onFilterChange({ ...filters, category: cat.value })}
                className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-[13px] transition-colors flex items-center justify-between ${
                  filters.category === cat.value
                    ? 'bg-[#232b37] text-[#ff9900] font-semibold border-l-2 border-[#ff9900]'
                    : 'text-[#8c8c94] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-2 pt-2 border-t border-[#232b37]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-[#8c8c94] uppercase tracking-wider">
              Budget Cap
            </label>
            <span className="text-[13px] font-mono font-bold text-white">
              ${filters.maxPrice} USD
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-[#ff9900]"
          />
          <div className="flex justify-between text-[10px] text-[#687078] font-mono">
            <span>$100</span>
            <span>$750</span>
            <span>$1500+</span>
          </div>
        </div>

        {/* Style Selector */}
        <div className="space-y-1.5 pt-2 border-t border-[#232b37]">
          <label className="text-[11px] font-semibold text-[#8c8c94] uppercase tracking-wider">
            Aesthetic Style
          </label>
          <select
            value={filters.style}
            onChange={(e) => onFilterChange({ ...filters, style: e.target.value })}
            className="w-full bg-[#0f141a] border border-[#343d4d] text-white text-[13px] px-3 py-2 rounded-[4px] focus:outline-none focus:border-[#ff9900]"
          >
            {styles.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Styles' : s}
              </option>
            ))}
          </select>
        </div>

        {/* In-Stock Toggle */}
        <div className="pt-2 border-t border-[#232b37] flex items-center justify-between">
          <label htmlFor="instock" className="text-[12px] text-white font-medium cursor-pointer">
            In-Stock Items Only
          </label>
          <input
            id="instock"
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => onFilterChange({ ...filters, inStockOnly: e.target.checked })}
            className="w-4 h-4 accent-[#ff9900] rounded cursor-pointer"
          />
        </div>
      </div>

      {/* Matching Count Footer */}
      <div className="p-3 bg-[#0f141a] border-t border-[#232b37] text-[12px] text-[#8c8c94] flex items-center justify-between">
        <span>Matching Products:</span>
        <span className="text-white font-mono font-bold">{productCount} found</span>
      </div>
    </aside>
  );
};
