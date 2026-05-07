"""
Seed all 12 Lumière products into lumiere.products.
Idempotent — safe to run multiple times (ON CONFLICT DO NOTHING).

Usage (venv active, from project root):
    python scripts/seed_products.py
"""

import asyncio
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from database.session import create_engine

# Complete product data (merges data/products_catalog.py + frontend products.js)
PRODUCTS = [
    {
        "slug": "luminous-vitamin-c-serum",
        "name": "Luminous Vitamin C Serum",
        "type": "Serum",
        "price": 68.0,
        "size": "30ml",
        "short_desc": "High-potency brightening antioxidant complex",
        "description": (
            "Our flagship brightening serum delivers 15% stabilised L-Ascorbic Acid alongside "
            "ferulic acid and vitamin E for amplified efficacy. Daily use visibly fades dark spots, "
            "firms skin and imparts a lasting luminosity. Lightweight, fast-absorbing texture glides "
            "effortlessly on all skin types."
        ),
        "skin_types": ["all", "normal", "combination", "dull"],
        "concerns": ["brightening", "anti-aging", "uneven-tone", "pigmentation"],
        "ingredients": ["15% L-Ascorbic Acid", "Ferulic Acid", "Vitamin E", "Hyaluronic Acid", "Niacinamide 5%", "Panthenol"],
        "how_to_use": "Apply 4–5 drops to cleansed face and neck each morning. Follow with moisturiser and SPF50.",
        "image": "https://picsum.photos/seed/lum1/600/800",
        "images": ["https://picsum.photos/seed/lum1/600/800", "https://picsum.photos/seed/lum1b/600/800", "https://picsum.photos/seed/lum1c/600/800"],
        "rating": 4.8,
        "review_count": 234,
        "badge": "Bestseller",
        "in_stock": True,
        "featured": True,
    },
    {
        "slug": "hydra-cloud-moisturizer",
        "name": "Hydra Cloud Moisturiser",
        "type": "Moisturiser",
        "price": 58.0,
        "size": "50ml",
        "short_desc": "Deep-sea hydration for parched, thirsty skin",
        "description": (
            "A cloud-light moisturiser that delivers 72-hour hydration through a multi-layer "
            "hyaluronic acid complex. Fortified with ceramides and shea butter, it rebuilds the "
            "moisture barrier while marine collagen peptides improve firmness over time."
        ),
        "skin_types": ["dry", "normal", "dehydrated"],
        "concerns": ["dryness", "barrier-repair", "plumping", "comfort"],
        "ingredients": ["Triple-Weight Hyaluronic Acid", "Ceramide NP", "Shea Butter", "Marine Collagen Peptides", "Squalane", "Niacinamide 3%"],
        "how_to_use": "Apply morning and evening to cleansed skin. Layer over serums, under SPF.",
        "image": "https://picsum.photos/seed/lum2/600/800",
        "images": ["https://picsum.photos/seed/lum2/600/800", "https://picsum.photos/seed/lum2b/600/800"],
        "rating": 4.7,
        "review_count": 189,
        "badge": "Fan Favourite",
        "in_stock": True,
        "featured": True,
    },
    {
        "slug": "pore-refining-toner",
        "name": "Pore Refining Toner",
        "type": "Toner",
        "price": 42.0,
        "size": "120ml",
        "short_desc": "BHA exfoliant to minimise pores and control oil",
        "description": (
            "A 2% salicylic acid toner that deeply cleanses pores, controls excess sebum and smooths "
            "texture. Witch hazel and niacinamide work in harmony to visibly tighten pores and refine "
            "skin surface. Use daily as part of an oily or acne-prone routine."
        ),
        "skin_types": ["oily", "combination", "acne-prone"],
        "concerns": ["pores", "oiliness", "acne", "texture"],
        "ingredients": ["2% Salicylic Acid", "Witch Hazel", "Niacinamide 10%", "Glycolic Acid 1%", "Tea Tree Oil", "Aloe Vera"],
        "how_to_use": "Apply to cotton pad and sweep over cleansed face morning or evening. Avoid eye area.",
        "image": "https://picsum.photos/seed/lum3/600/800",
        "images": ["https://picsum.photos/seed/lum3/600/800", "https://picsum.photos/seed/lum3b/600/800"],
        "rating": 4.5,
        "review_count": 142,
        "badge": None,
        "in_stock": True,
        "featured": False,
    },
    {
        "slug": "retinol-night-renewal",
        "name": "Retinol Night Renewal",
        "type": "Night Treatment",
        "price": 85.0,
        "size": "30ml",
        "short_desc": "Encapsulated retinol for visible age reversal",
        "description": (
            "Our advanced night treatment combines 0.5% encapsulated retinol with bakuchiol for a "
            "potent yet gentle anti-ageing effect. Works overnight to accelerate cell turnover, smooth "
            "fine lines and rebuild collagen. Enriched with peptides and squalane."
        ),
        "skin_types": ["normal", "combination", "mature", "aging"],
        "concerns": ["anti-aging", "fine-lines", "firmness", "texture"],
        "ingredients": ["0.5% Encapsulated Retinol", "Bakuchiol 0.5%", "Peptide Complex", "Squalane", "Niacinamide 4%", "Vitamin E"],
        "how_to_use": "Apply 2–3 drops to cleansed face at night, 2–3 times per week. Always use SPF the following morning.",
        "image": "https://picsum.photos/seed/lum4/600/800",
        "images": ["https://picsum.photos/seed/lum4/600/800", "https://picsum.photos/seed/lum4b/600/800"],
        "rating": 4.9,
        "review_count": 312,
        "badge": "Award Winner",
        "in_stock": True,
        "featured": True,
    },
    {
        "slug": "calming-rose-mist",
        "name": "Calming Rose Mist",
        "type": "Facial Mist",
        "price": 34.0,
        "size": "100ml",
        "short_desc": "Soothing rosewater mist for reactive, red skin",
        "description": (
            "A gentle mist distilled from Bulgarian rose petals, infused with centella asiatica and "
            "allantoin to instantly calm redness, soothe irritation and refresh skin throughout the day."
        ),
        "skin_types": ["sensitive", "dry", "normal", "all"],
        "concerns": ["redness", "sensitivity", "soothing", "hydration"],
        "ingredients": ["Bulgarian Rose Water", "Centella Asiatica", "Allantoin", "Bisabolol", "Panthenol", "Aloe Vera"],
        "how_to_use": "Mist over bare skin or makeup at any time of day. Hold 20cm from face.",
        "image": "https://picsum.photos/seed/lum5/600/800",
        "images": ["https://picsum.photos/seed/lum5/600/800", "https://picsum.photos/seed/lum5b/600/800"],
        "rating": 4.6,
        "review_count": 98,
        "badge": "Cult Favourite",
        "in_stock": True,
        "featured": False,
    },
    {
        "slug": "brightening-eye-cream",
        "name": "Brightening Eye Cream",
        "type": "Eye Cream",
        "price": 52.0,
        "size": "15ml",
        "short_desc": "Depuff, brighten, and firm the delicate eye area",
        "description": (
            "A luxurious eye cream that targets dark circles, puffiness and fine lines simultaneously. "
            "Caffeine and vitamin K reduce under-eye darkness, while peptides firm and smooth crow's feet."
        ),
        "skin_types": ["all"],
        "concerns": ["dark-circles", "puffiness", "fine-lines", "anti-aging"],
        "ingredients": ["Caffeine 3%", "Vitamin K", "Tripeptide-1", "Vitamin C 5%", "Hyaluronic Acid", "Cucumber Extract"],
        "how_to_use": "Pat gently around orbital bone morning and evening using ring finger.",
        "image": "https://picsum.photos/seed/lum6/600/800",
        "images": ["https://picsum.photos/seed/lum6/600/800"],
        "rating": 4.4,
        "review_count": 76,
        "badge": None,
        "in_stock": True,
        "featured": False,
    },
    {
        "slug": "cleansing-oil-balm",
        "name": "Cleansing Oil Balm",
        "type": "Cleanser",
        "price": 38.0,
        "size": "100ml",
        "short_desc": "Melt-away balm cleanser that dissolves all makeup",
        "description": (
            "A luxuriant oil-to-milk balm that melts away makeup, SPF and impurities without stripping "
            "the skin. Jojoba, rosehip and sweet almond oils leave skin nourished and balanced."
        ),
        "skin_types": ["all", "dry", "sensitive", "normal"],
        "concerns": ["cleansing", "makeup-removal", "hydration", "barrier"],
        "ingredients": ["Jojoba Oil", "Rosehip Oil", "Sweet Almond Oil", "Vitamin E", "Chamomile Extract", "Squalane"],
        "how_to_use": "Massage onto dry face, add water to emulsify, rinse thoroughly. Use morning or evening.",
        "image": "https://picsum.photos/seed/lum7/600/800",
        "images": ["https://picsum.photos/seed/lum7/600/800"],
        "rating": 4.7,
        "review_count": 203,
        "badge": "Bestseller",
        "in_stock": True,
        "featured": True,
    },
    {
        "slug": "barrier-repair-serum",
        "name": "Barrier Repair Serum",
        "type": "Serum",
        "price": 74.0,
        "size": "30ml",
        "short_desc": "Ceramide-rich serum that heals a compromised barrier",
        "description": (
            "Formulated for skin that feels tight, reactive or irritated, this serum uses a "
            "ceramide-peptide complex to rapidly restore the skin barrier. Madecassoside from centella "
            "asiatica accelerates repair while beta-glucan calms inflammation."
        ),
        "skin_types": ["sensitive", "dry", "compromised"],
        "concerns": ["barrier-repair", "sensitivity", "redness", "dryness"],
        "ingredients": ["Ceramide NP, AP, EOP", "Madecassoside", "Beta-Glucan", "Peptide Complex", "Panthenol", "Allantoin"],
        "how_to_use": "Apply 4–5 drops morning and evening after toner, before moisturiser.",
        "image": "https://picsum.photos/seed/lum8/600/800",
        "images": ["https://picsum.photos/seed/lum8/600/800"],
        "rating": 4.8,
        "review_count": 167,
        "badge": "Dermatologist Approved",
        "in_stock": True,
        "featured": False,
    },
    {
        "slug": "glow-enzyme-mask",
        "name": "Glow Enzyme Mask",
        "type": "Mask",
        "price": 46.0,
        "size": "75ml",
        "short_desc": "Weekly papaya enzyme exfoliant for instant radiance",
        "description": (
            "A weekly treat combining papaya and pineapple enzymes with 5% AHA to gently resurface "
            "dull skin. Kaolin clay draws out impurities while rose hip and pomegranate oils replenish "
            "moisture. Skin is visibly smoother and brighter after one use."
        ),
        "skin_types": ["all", "normal", "combination", "dull"],
        "concerns": ["brightening", "texture", "exfoliation", "dullness"],
        "ingredients": ["Papaya Enzyme", "Pineapple Extract", "AHA Complex 5%", "Kaolin Clay", "Rosehip Oil", "Pomegranate Extract"],
        "how_to_use": "Apply a thin layer to cleansed skin once or twice weekly. Leave 10–15 minutes, rinse well.",
        "image": "https://picsum.photos/seed/lum9/600/800",
        "images": ["https://picsum.photos/seed/lum9/600/800"],
        "rating": 4.5,
        "review_count": 88,
        "badge": None,
        "in_stock": True,
        "featured": False,
    },
    {
        "slug": "mineral-sun-shield-spf50",
        "name": "Mineral Sun Shield SPF50",
        "type": "SPF / Sunscreen",
        "price": 48.0,
        "size": "50ml",
        "short_desc": "Invisible mineral SPF50 with zero white cast",
        "description": (
            "A next-generation mineral sunscreen with micronised zinc oxide that provides broad-spectrum "
            "UVA/UVB protection without a white cast. The weightless gel-serum texture layers beautifully "
            "under makeup and is enriched with antioxidant vitamin E and niacinamide."
        ),
        "skin_types": ["all", "sensitive", "acne-prone"],
        "concerns": ["sun-protection", "anti-aging", "brightening"],
        "ingredients": ["Micronised Zinc Oxide 18%", "Niacinamide 5%", "Vitamin E", "Hyaluronic Acid", "Aloe Vera", "Green Tea Extract"],
        "how_to_use": "Apply liberally as the last step of your morning routine. Reapply every 2 hours in sun.",
        "image": "https://picsum.photos/seed/lum10/600/800",
        "images": ["https://picsum.photos/seed/lum10/600/800"],
        "rating": 4.6,
        "review_count": 155,
        "badge": None,
        "in_stock": True,
        "featured": True,
    },
    {
        "slug": "blemish-control-serum",
        "name": "Blemish Control Serum",
        "type": "Serum",
        "price": 54.0,
        "size": "30ml",
        "short_desc": "Targeted serum to clear breakouts and prevent future ones",
        "description": (
            "A dual-action serum combining 2% salicylic acid and 10% niacinamide to combat active "
            "breakouts while preventing new ones. Zinc PCA regulates sebum production and panthenol "
            "soothes inflammation. Clear skin in 14 days, proven."
        ),
        "skin_types": ["oily", "acne-prone", "combination"],
        "concerns": ["acne", "breakouts", "oiliness", "pores", "redness"],
        "ingredients": ["2% Salicylic Acid", "Niacinamide 10%", "Zinc PCA", "Panthenol", "Tea Tree Oil 2%", "Azelaic Acid 5%"],
        "how_to_use": "Apply 3–4 drops to affected areas morning and evening on cleansed skin.",
        "image": "https://picsum.photos/seed/lum11/600/800",
        "images": ["https://picsum.photos/seed/lum11/600/800"],
        "rating": 4.7,
        "review_count": 271,
        "badge": "Clear Skin Hero",
        "in_stock": True,
        "featured": True,
    },
    {
        "slug": "plumping-lip-serum",
        "name": "Plumping Lip Serum",
        "type": "Lip Treatment",
        "price": 29.0,
        "size": "10ml",
        "short_desc": "Volume-enhancing lip serum with hyaluronic acid",
        "description": (
            "A cushioning serum that visibly plumps lips with triple-weight hyaluronic acid and "
            "lip-plumping peptides. Vitamin E and jojoba oil condition and protect lip texture."
        ),
        "skin_types": ["all"],
        "concerns": ["lip-plumping", "hydration", "fine-lines"],
        "ingredients": ["Triple-Weight Hyaluronic Acid", "Lip Peptide Complex", "Vitamin E", "Jojoba Oil", "Peppermint Extract", "Squalane"],
        "how_to_use": "Apply to lips morning and evening or throughout the day as needed.",
        "image": "https://picsum.photos/seed/lum12/600/800",
        "images": ["https://picsum.photos/seed/lum12/600/800"],
        "rating": 4.3,
        "review_count": 64,
        "badge": None,
        "in_stock": True,
        "featured": False,
    },
]


async def main() -> None:
    engine = create_engine()
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async with SessionLocal() as session:
        for p in PRODUCTS:
            await session.execute(
                text("""
                    INSERT INTO lumiere.products
                        (slug, name, type, price, size, short_desc, description,
                         skin_types, concerns, ingredients, how_to_use,
                         image, images, rating, review_count, badge, in_stock, featured)
                    VALUES
                        (:slug, :name, :type, :price, :size, :short_desc, :description,
                         :skin_types, :concerns, :ingredients, :how_to_use,
                         :image, :images, :rating, :review_count, :badge, :in_stock, :featured)
                    ON CONFLICT (slug) DO NOTHING
                """),
                {
                    **p,
                    "skin_types": p["skin_types"],
                    "concerns": p["concerns"],
                    "ingredients": p["ingredients"],
                    "images": p["images"],
                },
            )
        await session.commit()

    await engine.dispose()
    print(f"Seeded {len(PRODUCTS)} products into lumiere.products.")


if __name__ == "__main__":
    asyncio.run(main())
