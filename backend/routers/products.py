"""
GET  /api/products              — filtered product catalog
POST /api/products/apply        — apply a product to a scene object
"""

from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from models.product_schema import ProductItem, FilterCriteria
from models.scene_schema import WorldcraftScene

router = APIRouter(tags=["products"])


# ---------------------------------------------------------------------------
# Catalog (FR-65 — product catalog)
# In production, replace with a Supabase/Postgres query.
# ---------------------------------------------------------------------------
CATALOG: list[ProductItem] = [
    ProductItem(
        id="prod-01", name="Nordvalla Modular 3-Seat Sofa", company="ScandiCraft Living",
        category="sofa", price=749, currency="USD", rating=4.8,
        dimensions={"width": 2.25, "height": 0.88, "depth": 0.95, "unit": "m"},
        dimensions_mm="2250 x 880 x 950 mm",
        material="Performance Bouclé Fabric", style="Modern", in_stock=True,
        image_url="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
        description="High-resilience foam core with stain-resistant fabric.",
        color="#dcd6cd", compatibility_score=98,
    ),
    ProductItem(
        id="prod-02", name="Kivik Deep Lounge Sofa - Charcoal", company="IKEA Design Studio",
        category="sofa", price=899, currency="USD", rating=4.7,
        dimensions={"width": 2.28, "height": 0.9, "depth": 0.98, "unit": "m"},
        dimensions_mm="2280 x 900 x 980 mm",
        material="Textured Weave Linen", style="Scandinavian", in_stock=True,
        image_url="https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop&q=80",
        description="Extra deep seating with memory foam armrests.",
        color="#343a40", compatibility_score=95,
    ),
    ProductItem(
        id="prod-03", name="Oslo Minimalist Solid Oak Coffee Table", company="Muuto Nordic",
        category="table", price=429, currency="USD", rating=4.9,
        dimensions={"width": 1.35, "height": 0.42, "depth": 0.65, "unit": "m"},
        dimensions_mm="1350 x 420 x 650 mm",
        material="FSC-Certified Solid Oak", style="Minimalist", in_stock=True,
        image_url="https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600&auto=format&fit=crop&q=80",
        description="Chamfered pill-profile edges with oil wax natural finish.",
        color="#c29b68", compatibility_score=99,
    ),
    ProductItem(
        id="prod-04", name="Herman Lounge Accent Chair", company="Ferm Living",
        category="chair", price=520, currency="USD", rating=4.6,
        dimensions={"width": 0.8, "height": 0.82, "depth": 0.82, "unit": "m"},
        dimensions_mm="800 x 820 x 820 mm",
        material="Cognac Leather & Powder-coated Steel", style="Modern", in_stock=True,
        image_url="https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=600&auto=format&fit=crop&q=80",
        description="Architectural silhouette with warm cognac leather upholstery.",
        color="#8b4513", compatibility_score=93,
    ),
    ProductItem(
        id="prod-05", name="Lumina Arc Suspended Floor Lamp", company="Flos Lighting",
        category="lighting", price=289, currency="USD", rating=4.9,
        dimensions={"width": 0.45, "height": 2.1, "depth": 1.1, "unit": "m"},
        dimensions_mm="450 x 2100 x 1100 mm",
        material="Brushed Brass & Marble Base", style="Modern", in_stock=True,
        image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
        description="Overarching cantilevered arm with 2700K warm ambient illumination.",
        color="#d4af37", compatibility_score=91,
    ),
    ProductItem(
        id="prod-06", name="Travertine Low Marble Plinth Table", company="CB2 Studio",
        category="table", price=799, currency="USD", rating=4.5,
        dimensions={"width": 1.2, "height": 0.38, "depth": 0.7, "unit": "m"},
        dimensions_mm="1200 x 380 x 700 mm",
        material="Honed Italian Travertine", style="Industrial", in_stock=False,
        image_url="https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=600&auto=format&fit=crop&q=80",
        description="Natural porous veining in warm ivory travertine.",
        color="#dfd7cc", compatibility_score=89,
    ),
    ProductItem(
        id="prod-07", name="Linear Floating Media Storage Unit", company="Blu Dot",
        category="storage", price=650, currency="USD", rating=4.7,
        dimensions={"width": 1.85, "height": 0.5, "depth": 0.45, "unit": "m"},
        dimensions_mm="1850 x 500 x 450 mm",
        material="Walnut Veneer & Steel", style="Modern", in_stock=True,
        image_url="https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80",
        description="Concealed cable passages with drop-down perforated front.",
        color="#4a3728", compatibility_score=94,
    ),
    ProductItem(
        id="prod-08", name="Artisan Wool Berber Area Rug (2.5x3m)", company="West Elm",
        category="rug", price=380, currency="USD", rating=4.8,
        dimensions={"width": 2.5, "height": 0.02, "depth": 3.0, "unit": "m"},
        dimensions_mm="2500 x 20 x 3000 mm",
        material="100% Handspun Wool", style="Boho", in_stock=True,
        image_url="https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600&auto=format&fit=crop&q=80",
        description="Plush hand-tufted pile inspired by traditional Moroccan crafts.",
        color="#f0ece1", compatibility_score=96,
    ),
]

_SORT_FNS = {
    "price-asc":     lambda p: p.price,
    "price-desc":    lambda p: -p.price,
    "rating":        lambda p: -p.rating,
    "compatibility": lambda p: -p.compatibility_score,
}


@router.get("/products", response_model=list[ProductItem])
async def get_products(
    category: str = Query("all"),
    min_price: float = Query(0, alias="minPrice"),
    max_price: float = Query(99999, alias="maxPrice"),
    style: str = Query("all"),
    in_stock_only: bool = Query(False, alias="inStockOnly"),
    search: Optional[str] = Query(None),
    sort_by: str = Query("compatibility", alias="sortBy"),
    budget: Optional[float] = Query(None),
):
    results = CATALOG[:]
    if category != "all":
        results = [p for p in results if p.category == category]
    cap = min(max_price, budget or max_price)
    results = [p for p in results if min_price <= p.price <= cap]
    if style != "all":
        results = [p for p in results if p.style == style]
    if in_stock_only:
        results = [p for p in results if p.in_stock]
    if search:
        q = search.lower()
        results = [
            p for p in results
            if q in p.name.lower() or q in p.company.lower() or q in p.material.lower()
        ]
    key_fn = _SORT_FNS.get(sort_by, _SORT_FNS["compatibility"])
    results.sort(key=key_fn)
    return results


# ---------------------------------------------------------------------------
# Apply product to scene (FR-68, FR-76)
# ---------------------------------------------------------------------------

class ApplyProductRequest(BaseModel):
    product_id: str
    target_object_id: Optional[str] = None
    current_scene: WorldcraftScene


@router.post("/products/apply", response_model=WorldcraftScene)
async def apply_product(body: ApplyProductRequest):
    """Replace or add a catalog product in the scene."""
    from copy import deepcopy
    from datetime import datetime, timezone
    from models.scene_schema import SceneObject, Vec3, Dimensions

    product = next((p for p in CATALOG if p.id == body.product_id), None)
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Product '{body.product_id}' not found.")

    scene = deepcopy(body.current_scene)
    target_idx = next(
        (i for i, o in enumerate(scene.objects)
         if o.id == body.target_object_id or o.type == product.category),
        None,
    )

    if target_idx is not None:
        old = scene.objects[target_idx]
        scene.objects[target_idx] = SceneObject(
            id=old.id,
            type=old.type,
            name=product.name,
            position=old.position,
            dimensions=Dimensions(
                width=product.dimensions.width,
                height=product.dimensions.height,
                depth=product.dimensions.depth,
            ),
            rotation=old.rotation,
            movable=True,
            confidence=1.0,
            color=product.color,
            material=product.material,
            category=product.category,
            price=product.price,
            provenance="user",
        )
    else:
        scene.objects.append(SceneObject(
            type=product.category,
            name=product.name,
            position=Vec3(x=0, y=product.dimensions.height / 2, z=0),
            dimensions=Dimensions(
                width=product.dimensions.width,
                height=product.dimensions.height,
                depth=product.dimensions.depth,
            ),
            movable=True,
            confidence=1.0,
            color=product.color,
            material=product.material,
            category=product.category,
            price=product.price,
            provenance="user",
        ))

    scene.version += 1
    scene.timestamp = datetime.now(timezone.utc).isoformat()
    scene.prompt_history.append(f"Applied catalog product: {product.name}")
    return scene
