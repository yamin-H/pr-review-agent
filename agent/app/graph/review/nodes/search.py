from app.graph.review.state import ReviewState
from app.services.memory import search_memory

async def search_memory_for_chunks(state: ReviewState) -> ReviewState:
    print(f"[Node 3] Searching memory for {len(state['chunks'])} chunks")
    chunks_with_memory = []

    for chunk in state['chunks']:
        results = await search_memory(
            repo_id=state['repo'],
            query=chunk['content'],
            limit=3
        )

        relevant = [r for r in results if r['similarity'] > 0.4]

        chunks_with_memory.append({
            **chunk,
            "memory": relevant
        })

    total_memory_hits = sum(1 for c in chunks_with_memory if c['memory'])
    print(f"[Node 3] Found memory context for {total_memory_hits}/{len(chunks_with_memory)} chunks")

    return {**state, "chunks_with_memory": chunks_with_memory}