"""
Canonical product catalog — used by the ingestion script and the RAG chat endpoint.
Mirrors skincare-frontend/src/data/products.js.
"""

PRODUCTS = [
    {
        "id": 1,
        "name": "Luminous Vitamin C Serum",
        "type": "Serum",
        "price": 68,
        "size": "30ml",
        "shortDesc": "High-potency brightening antioxidant complex",
        "description": (
            "Our flagship brightening serum delivers 15% stabilised L-Ascorbic Acid alongside "
            "ferulic acid and vitamin E for amplified efficacy. Daily use visibly fades dark spots, "
            "firms skin and imparts a lasting luminosity. Lightweight, fast-absorbing."
        ),
        "skinTypes": ["all", "normal", "combination", "dull"],
        "concerns": ["brightening", "anti-aging", "uneven-tone", "pigmentation"],
        "ingredients": ["15% L-Ascorbic Acid", "Ferulic Acid", "Vitamin E", "Hyaluronic Acid", "Niacinamide 5%", "Panthenol"],
        "badge": "Bestseller",
    },
    {
        "id": 2,
        "name": "Hydra Cloud Moisturiser",
        "type": "Moisturiser",
        "price": 58,
        "size": "50ml",
        "shortDesc": "Deep-sea hydration for parched, thirsty skin",
        "description": (
            "A cloud-light moisturiser that delivers 72-hour hydration through a multi-layer "
            "hyaluronic acid complex. Fortified with ceramides and shea butter, it rebuilds the "
            "moisture barrier while marine collagen peptides improve firmness over time."
        ),
        "skinTypes": ["dry", "normal", "dehydrated"],
        "concerns": ["dryness", "barrier-repair", "plumping", "comfort"],
        "ingredients": ["Triple-Weight Hyaluronic Acid", "Ceramide NP", "Shea Butter", "Marine Collagen Peptides", "Squalane", "Niacinamide 3%"],
        "badge": "Fan Favourite",
    },
    {
        "id": 3,
        "name": "Pore Refining Toner",
        "type": "Toner",
        "price": 42,
        "size": "120ml",
        "shortDesc": "BHA exfoliant to minimise pores and control oil",
        "description": (
            "A 2% salicylic acid toner that deeply cleanses pores, controls excess sebum and smooths "
            "texture. Witch hazel and niacinamide work in harmony to visibly tighten pores and refine "
            "skin surface. Use daily as part of an oily or acne-prone routine."
        ),
        "skinTypes": ["oily", "combination", "acne-prone"],
        "concerns": ["pores", "oiliness", "acne", "texture"],
        "ingredients": ["2% Salicylic Acid", "Witch Hazel", "Niacinamide 10%", "Glycolic Acid 1%", "Tea Tree Oil", "Aloe Vera"],
        "badge": None,
    },
    {
        "id": 4,
        "name": "Retinol Night Renewal",
        "type": "Night Treatment",
        "price": 85,
        "size": "30ml",
        "shortDesc": "Encapsulated retinol for visible age reversal",
        "description": (
            "Our advanced night treatment combines 0.5% encapsulated retinol with bakuchiol for a "
            "potent yet gentle anti-ageing effect. Works overnight to accelerate cell turnover, smooth "
            "fine lines and rebuild collagen. Enriched with peptides and squalane."
        ),
        "skinTypes": ["normal", "combination", "mature", "aging"],
        "concerns": ["anti-aging", "fine-lines", "firmness", "texture"],
        "ingredients": ["0.5% Encapsulated Retinol", "Bakuchiol 0.5%", "Peptide Complex", "Squalane", "Niacinamide 4%", "Vitamin E"],
        "badge": "Award Winner",
    },
    {
        "id": 5,
        "name": "Calming Rose Mist",
        "type": "Facial Mist",
        "price": 34,
        "size": "100ml",
        "shortDesc": "Soothing rosewater mist for reactive, red skin",
        "description": (
            "A gentle mist distilled from Bulgarian rose petals, infused with centella asiatica and "
            "allantoin to instantly calm redness, soothe irritation and refresh skin throughout the day."
        ),
        "skinTypes": ["sensitive", "dry", "normal", "all"],
        "concerns": ["redness", "sensitivity", "soothing", "hydration"],
        "ingredients": ["Bulgarian Rose Water", "Centella Asiatica", "Allantoin", "Bisabolol", "Panthenol", "Aloe Vera"],
        "badge": "Cult Favourite",
    },
    {
        "id": 6,
        "name": "Brightening Eye Cream",
        "type": "Eye Cream",
        "price": 52,
        "size": "15ml",
        "shortDesc": "Depuff, brighten, and firm the delicate eye area",
        "description": (
            "A luxurious eye cream that targets dark circles, puffiness and fine lines simultaneously. "
            "Caffeine and vitamin K reduce under-eye darkness, while peptides firm and smooth crow's feet."
        ),
        "skinTypes": ["all"],
        "concerns": ["dark-circles", "puffiness", "fine-lines", "anti-aging"],
        "ingredients": ["Caffeine 3%", "Vitamin K", "Tripeptide-1", "Vitamin C 5%", "Hyaluronic Acid", "Cucumber Extract"],
        "badge": None,
    },
    {
        "id": 7,
        "name": "Cleansing Oil Balm",
        "type": "Cleanser",
        "price": 38,
        "size": "100ml",
        "shortDesc": "Melt-away balm cleanser that dissolves all makeup",
        "description": (
            "A luxuriant oil-to-milk balm that melts away makeup, SPF and impurities without stripping "
            "the skin. Jojoba, rosehip and sweet almond oils leave skin nourished and balanced."
        ),
        "skinTypes": ["all", "dry", "sensitive", "normal"],
        "concerns": ["cleansing", "makeup-removal", "hydration", "barrier"],
        "ingredients": ["Jojoba Oil", "Rosehip Oil", "Sweet Almond Oil", "Vitamin E", "Chamomile Extract", "Squalane"],
        "badge": "Bestseller",
    },
    {
        "id": 8,
        "name": "Barrier Repair Serum",
        "type": "Serum",
        "price": 74,
        "size": "30ml",
        "shortDesc": "Ceramide-rich serum that heals a compromised barrier",
        "description": (
            "Formulated for skin that feels tight, reactive or irritated, this serum uses a "
            "ceramide-peptide complex to rapidly restore the skin barrier. Madecassoside from centella "
            "asiatica accelerates repair while beta-glucan calms inflammation."
        ),
        "skinTypes": ["sensitive", "dry", "compromised"],
        "concerns": ["barrier-repair", "sensitivity", "redness", "dryness"],
        "ingredients": ["Ceramide NP, AP, EOP", "Madecassoside", "Beta-Glucan", "Peptide Complex", "Panthenol", "Allantoin"],
        "badge": "Dermatologist Approved",
    },
    {
        "id": 9,
        "name": "Glow Enzyme Mask",
        "type": "Mask",
        "price": 46,
        "size": "75ml",
        "shortDesc": "Weekly papaya enzyme exfoliant for instant radiance",
        "description": (
            "A weekly treat combining papaya and pineapple enzymes with 5% AHA to gently resurface "
            "dull skin. Kaolin clay draws out impurities while rose hip and pomegranate oils replenish "
            "moisture. Skin is visibly smoother and brighter after one use."
        ),
        "skinTypes": ["all", "normal", "combination", "dull"],
        "concerns": ["brightening", "texture", "exfoliation", "dullness"],
        "ingredients": ["Papaya Enzyme", "Pineapple Extract", "AHA Complex 5%", "Kaolin Clay", "Rosehip Oil", "Pomegranate Extract"],
        "badge": None,
    },
    {
        "id": 10,
        "name": "Mineral Sun Shield SPF50",
        "type": "SPF / Sunscreen",
        "price": 48,
        "size": "50ml",
        "shortDesc": "Invisible mineral SPF50 with zero white cast",
        "description": (
            "A next-generation mineral sunscreen with micronised zinc oxide that provides broad-spectrum "
            "UVA/UVB protection without a white cast. The weightless gel-serum texture layers beautifully "
            "under makeup and is enriched with antioxidant vitamin E and niacinamide."
        ),
        "skinTypes": ["all", "sensitive", "acne-prone"],
        "concerns": ["sun-protection", "anti-aging", "brightening"],
        "ingredients": ["Micronised Zinc Oxide 18%", "Niacinamide 5%", "Vitamin E", "Hyaluronic Acid", "Aloe Vera", "Green Tea Extract"],
        "badge": None,
    },
    {
        "id": 11,
        "name": "Blemish Control Serum",
        "type": "Serum",
        "price": 54,
        "size": "30ml",
        "shortDesc": "Targeted serum to clear breakouts and prevent future ones",
        "description": (
            "A dual-action serum combining 2% salicylic acid and 10% niacinamide to combat active "
            "breakouts while preventing new ones. Zinc PCA regulates sebum production and panthenol "
            "soothes inflammation. Clear skin in 14 days, proven."
        ),
        "skinTypes": ["oily", "acne-prone", "combination"],
        "concerns": ["acne", "breakouts", "oiliness", "pores", "redness"],
        "ingredients": ["2% Salicylic Acid", "Niacinamide 10%", "Zinc PCA", "Panthenol", "Tea Tree Oil 2%", "Azelaic Acid 5%"],
        "badge": "Clear Skin Hero",
    },
    {
        "id": 12,
        "name": "Plumping Lip Serum",
        "type": "Lip Treatment",
        "price": 29,
        "size": "10ml",
        "shortDesc": "Volume-enhancing lip serum with hyaluronic acid",
        "description": (
            "A cushioning serum that visibly plumps lips with triple-weight hyaluronic acid and "
            "lip-plumping peptides. Vitamin E and jojoba oil condition and protect lip texture."
        ),
        "skinTypes": ["all"],
        "concerns": ["lip-plumping", "hydration", "fine-lines"],
        "ingredients": ["Triple-Weight Hyaluronic Acid", "Lip Peptide Complex", "Vitamin E", "Jojoba Oil", "Peppermint Extract", "Squalane"],
        "badge": None,
    },
]


def make_embed_text(product: dict) -> str:
    """Build the text string that gets embedded for each product."""
    return (
        f"Product Name: {product['name']}\n"
        f"Product Type: {product['type']}\n"
        f"Suitable for skin types: {', '.join(product['skinTypes'])}\n"
        f"Addresses concerns: {', '.join(product['concerns'])}\n"
        f"Description: {product['description']}\n"
        f"Key Ingredients: {', '.join(product['ingredients'])}\n"
        f"Price: ${product['price']} for {product['size']}"
    )
