export interface SceneObject {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number; depth: number };
  rotation: { x: number; y: number; z: number };
  movable: boolean;
  confidence?: number | null;
  color?: string;
  material?: string;
  category?: string;
  price?: number;
  selected?: boolean;
}

export interface RoomSpecification {
  type: string;
  dimensions: {
    width: number;
    length: number;
    height: number;
    status: string;
  };
  wallColor?: string;
  floorColor?: string;
  accentWallColor?: string;
}

export interface SceneConstraint {
  type: string;
  target: string;
  description?: string;
  satisfied?: boolean;
}

export interface SceneValidation {
  collisions: number;
  clearanceOk: boolean;
  pathwayClear: boolean;
  messages: string[];
}

export interface ArchiTechScene {
  scene_id: string;
  name: string;
  units: string;
  room: RoomSpecification;
  objects: SceneObject[];
  constraints: SceneConstraint[];
  version: number;
  timestamp: string;
  promptHistory?: string[];
  validation?: SceneValidation;
}

export interface SceneVersionSnapshot {
  versionId: string;
  versionNumber: number;
  description: string;
  timestamp: string;
  scene: ArchiTechScene;
  author: 'AI' | 'User';
}

export interface ProductItem {
  id: string;
  name: string;
  company: string;
  category: 'sofa' | 'table' | 'chair' | 'lighting' | 'storage' | 'bed' | 'decor';
  price: number;
  currency: string;
  rating: number;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: string;
  };
  material: string;
  style: 'Modern' | 'Scandinavian' | 'Minimalist' | 'Industrial' | 'Boho';
  inStock: boolean;
  imageUrl: string;
  description: string;
  color: string;
  compatibilityScore: number;
  dimensionsMm: string;
}

export interface FilterCriteria {
  category: string;
  minPrice: number;
  maxPrice: number;
  style: string;
  material: string;
  searchQuery: string;
  inStockOnly: boolean;
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'compatibility';
}
