'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterCriteria, ProductItem } from '../../types/scene';
import { ArchiTechService } from '../../services/api';
import { useArchiTechScene } from '../../hooks/useArchiTechScene';
import { FilterSidebar } from './FilterSidebar';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import {
  ShoppingBag,
  ArrowUpDown,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function RenovationView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const { scene, applyProduct } = useArchiTechScene();

  const [filters, setFilters] = useState<FilterCriteria>({
    category: initialCategory,
    minPrice: 0,
    maxPrice: 1500,
    style: 'all',
    material: 'all',
    searchQuery: '',
    inStockOnly: false,
    sortBy: 'compatibility',
  });

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductItem | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Load products based on current filters
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    ArchiTechService.fetchProducts(filters).then((items) => {
      if (isMounted) {
        setProducts(items);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      category: 'all',
      minPrice: 0,
      maxPrice: 1500,
      style: 'all',
      material: 'all',
      searchQuery: '',
      inStockOnly: false,
      sortBy: 'compatibility',
    });
  };

  const handleTryInModel = async (product: ProductItem) => {
    await applyProduct(product);
    setAppliedNotification(`"${product.name}" has been placed in your 3D Workspace!`);
    setTimeout(() => {
      setAppliedNotification(null);
    }, 4000);
  };

  return (
    <div className="grid grid-cols-[280px_1fr] h-[calc(100vh-56px)] bg-[#16191f] text-white font-ember overflow-hidden">
      {/* Left Sidebar: Budget & Category Filters */}
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        productCount={products.length}
      />

      {/* Main Content Area */}
      <main className="flex flex-col h-full overflow-hidden bg-[#0f141a]">
        {/* Top Header & Sort Controls */}
        <header className="p-4 sm:px-6 bg-[#16191f] border-b border-[#232b37] flex flex-wrap items-center justify-between gap-4 select-none">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-bold text-white">Furniture & Renovation Catalog</h1>
              <Badge variant="brand" size="sm">
                AR Compatible
              </Badge>
            </div>
            <p className="text-[12px] text-[#8c8c94]">
              Select verified items to replace or augment your reconstructed room geometry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-[12px] text-[#8c8c94]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value as FilterCriteria['sortBy'] })
                }
                className="bg-[#0f141a] border border-[#343d4d] text-white px-2.5 py-1.5 rounded-[4px] text-[12px] focus:outline-none focus:border-[#ff9900]"
              >
                <option value="compatibility">Highest Spatial Compatibility</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Ratings</option>
              </select>
            </div>

            {/* Quick Link back to 3D Workspace */}
            <Link href="/workspace">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View in 3D Space
              </Button>
            </Link>
          </div>
        </header>

        {/* Applied Notification Banner */}
        {appliedNotification && (
          <div className="bg-[#00e582]/15 border-b border-[#00e582]/30 px-6 py-2.5 flex items-center justify-between text-[13px] text-[#00e582]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{appliedNotification}</span>
            </div>
            <Link href="/workspace" className="underline font-semibold hover:text-white">
              Open 3D Viewport &rarr;
            </Link>
          </div>
        )}

        {/* Product Comparison Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-[#8c8c94]">
              <span className="w-8 h-8 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
              <span className="text-[13px] font-mono">Filtering furniture database...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#16191f] border border-[#232b37] rounded-[4px]">
              <ShoppingBag className="w-10 h-10 text-[#687078] mb-2" />
              <h2 className="text-[16px] font-bold text-white">No products found</h2>
              <p className="text-[13px] text-[#8c8c94] mt-1 max-w-sm">
                Try widening your price cap or switching styles in the left filter panel.
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={handleResetFilters}>
                Clear Filter Constraints
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={(p) => setSelectedProductForModal(p)}
                  onTryInModel={handleTryInModel}
                  isApplied={scene?.objects.some((o) => o.name === product.name)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onTryInModel={handleTryInModel}
      />
    </div>
  );
}
