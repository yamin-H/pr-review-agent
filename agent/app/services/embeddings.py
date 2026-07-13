from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('paraphrase-MiniLM-L3-v2')

def embed(text: str) -> list[float]:
    """Convert text to a 384-dimensional vector."""
    vector = model.encode(text, normalize_embeddings=True)
    return vector.tolist()