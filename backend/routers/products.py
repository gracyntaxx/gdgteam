"""
GET /api/products   — returns curated product catalog with optional filters.
"""

from typing import Optional, Literal
from fastapi import APIRouter, Query
from schemas import ProductItem

router = APIRouter(tags=["products"])

# ---------------------------------------------------------------------------
# In-memory catalog (mirrors frontend CATALOG_PRODUCTS)
# In a production build replace this with a Supabase/Postgres query.
# ---------------------------------------------------------------------------
_CATALOG: list[ProductItem] = [
    ProductItem(
        id="prod-01", name="Nordvalla Modular 3-Seat Sofa", company="ScandiCraft Living",
        category="sofa", price=749, currency="USD", rating=4.8,
        dimensions={"width": 2.25, "height": 0.88, "depth": 0.95, "unit": "m"},
        material="Performance Bouclé Fabric", style="Modern", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
        description="High-resilience foam core with stain-resistant fabric.",
        color="#dcd6cd", compatibilityScore=98, dimensionsMm="2250 x 880 x 950 mm",
    ),
    ProductItem(
        id="prod-02", name="Kivik Deep Lounge Sofa - Charcoal", company="IKEA Design Studio",
        category="sofa", price=899, currency="USD", rating=4.7,
        dimensions={"width": 2.28, "height": 0.9, "depth": 0.98, "unit": "m"},
        material="Textured Weave Linen", style="Scandinavian", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80",
        description="Extra deep seating with memory foam armrests.",
        color="#343a40", compatibilityScore=95, dimensionsMm="2280 x 900 x 980 mm",
    ),
    ProductItem(
        id="prod-03", name="Oslo Minimalist Solid Oak Coffee Table", company="Muuto Nordic",
        category="table", price=429, currency="USD", rating=4.9,
        dimensions={"width": 1.35, "height": 0.42, "depth": 0.65, "unit": "m"},
        material="FSC-Certified Solid Oak", style="Minimalist", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80",
        description="Chamfered pill-profile edges with oil wax natural finish.",
        color="#c29b68", compatibilityScore=99, dimensionsMm="1350 x 420 x 650 mm",
    ),
    ProductItem(
        id="prod-04", name="Herman Lounge Accent Chair", company="Ferm Living",
        category="chair", price=520, currency="USD", rating=4.6,
        dimensions={"width": 0.8, "height": 0.82, "depth": 0.82, "unit": "m"},
        material="Cognac Leather & Powder-coated Steel", style="Modern", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=600&auto=format&fit=crop&q=80",
        description="Architectural silhouette with warm cognac leather upholstery.",
        color="#8b4513", compatibilityScore=93, dimensionsMm="800 x 820 x 820 mm",
    ),
    ProductItem(
        id="prod-05", name="Lumina Arc Suspended Floor Lamp", company="Flos Lighting",
        category="lighting", price=289, currency="USD", rating=4.9,
        dimensions={"width": 0.45, "height": 2.1, "depth": 1.1, "unit": "m"},
        material="Brushed Brass & Marble Base", style="Modern", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
        description="Overarching cantilevered arm directing warm ambient illumination.",
        color="#d4af37", compatibilityScore=91, dimensionsMm="450 x 2100 x 1100 mm",
    ),
    ProductItem(
        id="prod-06", name="Travertine Low Marble Plinth Table", company="CB2 Studio",
        category="table", price=799, currency="USD", rating=4.5,
        dimensions={"width": 1.2, "height": 0.38, "depth": 0.7, "unit": "m"},
        material="Honed Italian Travertine", style="Industrial", inStock=False,
        imageUrl="https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600&auto=format&fit=crop&q=80",
        description="Natural porous veining in warm ivory travertine.",
        color="#dfd7cc", compatibilityScore=89, dimensionsMm="1200 x 380 x 700 mm",
    ),
    ProductItem(
        id="prod-07", name="Linear Floating Media Storage Unit", company="Blu Dot",
        category="storage", price=650, currency="USD", rating=4.7,
        dimensions={"width": 1.85, "height": 0.5, "depth": 0.45, "unit": "m"},
        material="Walnut Veneer & Steel", style="Modern", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80",
        description="Concealed cable passages with perforated acoustic cloth front.",
        color="#4a3728", compatibilityScore=94, dimensionsMm="1850 x 500 x 450 mm",
    ),
    ProductItem(
        id="prod-08", name="Artisan Wool Berber Area Rug (2.5x3m)", company="West Elm",
        category="decor", price=380, currency="USD", rating=4.8,
        dimensions={"width": 2.5, "height": 0.02, "depth": 3.0, "unit": "m"},
        material="100% Handspun Wool", style="Boho", inStock=True,
        imageUrl="https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80",
        description="Plush hand-tufted pile inspired by traditional Moroccan high-Atlas crafts.",
        color="#f0ece1", compatibilityScore=96, dimensionsMm="2500 x 20 x 3000 mm",
    ),
]

_SORT_KEYS = {
    "price-asc": lambda p: p.price,
    "price-desc": lambda p: -p.price,
    "rating": lambda p: -p.rating,
    "compatibility": lambda p: -p.compatibilityScore,
}


@router.get("/products", response_model=list[ProductItem])
async def get_products(
    category: str = Query("all"),
    min_price: float = Query(0, alias="minPrice"),
    max_price: float = Query(9999, alias="maxPrice"),
    style: str = Query("all"),
    in_stock_only: bool = Query(False, alias="inStockOnly"),
    search: Optional[str] = Query(None),
    sort_by: str = Query("compatibility", alias="sortBy"),
):
    results = _CATALOG

    if category != "all":
        results = [p for p in results if p.category == category]
    results = [p for p in results if min_price <= p.price <= max_price]
    if style != "all":
        results = [p for p in results if p.style == style]
    if in_stock_only:
        results = [p for p in results if p.inStock]
    if search:
        q = search.lower()
        results = [
            p for p in results
            if q in p.name.lower() or q in p.company.lower() or q in p.material.lower()
        ]

    key_fn = _SORT_KEYS.get(sort_by, _SORT_KEYS["compatibility"])
    results.sort(key=key_fn)
    return results
