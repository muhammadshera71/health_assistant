"""
Parse uploaded files into raw text.
Supported: .pdf, .txt, .md, .docx
"""

import io
from pathlib import Path

from pypdf import PdfReader
from docx import Document


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx"}


def parse_file(filename: str, content: bytes) -> str:
    """
    Parse a file's bytes into a plain-text string.
    Raises ValueError for unsupported file types.
    """
    ext = Path(filename).suffix.lower()

    if ext not in SUPPORTED_EXTENSIONS:
        raise ValueError(
            f"Unsupported file type '{ext}'. "
            f"Allowed: {', '.join(sorted(SUPPORTED_EXTENSIONS))}"
        )

    if ext == ".pdf":
        return _parse_pdf(content)
    if ext in {".txt", ".md"}:
        return content.decode("utf-8", errors="replace")
    if ext == ".docx":
        return _parse_docx(content)

    raise ValueError(f"Unhandled extension: {ext}")


def _parse_pdf(content: bytes) -> str:
    reader = PdfReader(io.BytesIO(content))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text.strip())
    return "\n\n".join(pages)


def _parse_docx(content: bytes) -> str:
    doc = Document(io.BytesIO(content))
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    return "\n\n".join(paragraphs)
