"""
One-time ingestion script — embeds all Lumière products and upserts them
into the Pinecone index defined by PINECONE_INDEX_NAME in .env.

Run once (or any time the product catalog changes):
    source venv/bin/activate
    python scripts/ingest_products.py
"""

import sys
import logging
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
logging.basicConfig(level=logging.INFO, format="%(message)s")

from openai import OpenAI
from pinecone import Pinecone

from config import get_settings
from data.products_catalog import PRODUCTS, make_embed_text
from rag.indexer import get_or_create_index, ingest_products


def main() -> None:
    settings = get_settings()

    if not settings.openai_api_key:
        print("ERROR: OPENAI_API_KEY not set in .env"); sys.exit(1)
    if not settings.pinecone_api_key:
        print("ERROR: PINECONE_API_KEY not set in .env"); sys.exit(1)

    openai_client = OpenAI(api_key=settings.openai_api_key)
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = get_or_create_index(pc, settings.pinecone_index_name)

    count = ingest_products(openai_client, index, PRODUCTS, make_embed_text)
    print(f"\nDone — {count} product vectors upserted into '{settings.pinecone_index_name}'.")


if __name__ == "__main__":
    main()
