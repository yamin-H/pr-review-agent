from app.core.database import get_pool
from app.services.embeddings import embed

async def store_decision(
    org_id: str,
    repo_id: str,
    content: str,
    decision_type: str,
    outcome: str,
    pr_number: int,
    file_path: str = None
):
    """Embed a past decision and store it in pgvector."""
    pool = await get_pool()
    vector = embed(content)

    await pool.execute("""
        INSERT INTO memory 
        (org_id, repo_id, content, embedding, decision_type, outcome, pr_number, file_path)
        VALUES ($1, $2, $3, $4::vector, $5, $6, $7, $8)
    """, org_id, repo_id, content, str(vector), decision_type, outcome, pr_number, file_path)

    print(f"Stored decision for PR #{pr_number}: {content[:60]}...")


async def search_memory(
    repo_id: str,
    query: str,
    limit: int = 5
) -> list[dict]:
    """Search for similar past decisions using cosine similarity."""
    pool = await get_pool()
    vector = embed(query)

    rows = await pool.fetch("""
        SELECT 
            content,
            decision_type,
            outcome,
            pr_number,
            file_path,
            1 - (embedding <=> $1::vector) as similarity
        FROM memory
        WHERE repo_id = $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
    """, str(vector), repo_id, limit)

    return [dict(row) for row in rows]