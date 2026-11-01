"""
Product catalog models — FR-63 to FR-73.
"""

from __future__ import annotations
from typing import Optional, Literal, List
from pydantic import BaseModel


class ProductDimensions(BaseModel):
    width: float
    height: float
    depth: float
    unit: str = "m"


class ProductItem(BaseModel):
    id: str
    name: str
    company: str
    category: Literal["sofa", "table", "chair", "lighting", "storage", "bed", "decor", "rug", "paint"]
    price: float
    currency: str = "USD"
    rating: float
    dimensions: ProductDimensions
    dimensions_mm: str
    material: str
    style: Literal["Modern", "Scandinavian", "Minimalist", "Industrial", "Boho", "Traditional"]
    in_stock: bool = True
    image_url: str
    description: str
    color: str
    compatibility_score: int = 90
    seller_url: Optional[str] = None
    is_affiliate: bool = False             # FR-72 — affiliate disclosure
    estimated_price: bool = False          # FR-70 — price transparency


class FilterCriteria(BaseModel):
    category: str = "all"
    min_price: float = 0
    max_price: float = 100000
    style: str = "all"
    material: str = "all"
    search_query: str = ""
    in_stock_only: bool = False
    sort_by: Literal["price-asc", "price-desc", "rating", "compatibility"] = "compatibility"
    budget: Optional[float] = None         # FR-63 — total budget cap
