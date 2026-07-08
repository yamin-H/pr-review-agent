from app.graph.review.state import ReviewState

async def notify_complete(state: ReviewState) -> ReviewState:
    print(f"[Node 6] Review complete for PR #{state['pr_number']}")
    print(f"[Node 6] Posted {len(state['posted_urls'])} comments")
    print(f"[Node 6] Job {state['job_id']} done")
    # Later: call Node.js completion endpoint here
    return state