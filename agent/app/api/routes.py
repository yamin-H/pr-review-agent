from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm import get_llm
from app.graph.onboard.agent import onboard_graph
from app.graph.review.agent import review_graph
from langchain_core.messages import SystemMessage, HumanMessage

router = APIRouter()
llm = get_llm()

class ReviewRequest(BaseModel):
    job_id: str
    repo: str
    pr_number: int
    installation_id: int

class OnboardRequest(BaseModel):
    repo: str
    org_id: str
    months_back: int = 6

class DigestRequest(BaseModel):
    org_id: str
    prs_reviewed: int
    flags_raised: int
    flags_approved: int
    flags_dismissed: int
    reviews: list[dict]

@router.post("/review")
async def review_pr(body: ReviewRequest):
    print(f"Got review job: {body.job_id} for PR #{body.pr_number} on {body.repo}")

    result = await review_graph.ainvoke({
        "job_id": body.job_id,
        "repo": body.repo,
        "pr_number": body.pr_number,
        "installation_id": body.installation_id
    })

    return {
        "status": "completed",
        "job_id": body.job_id,
        "comments_posted": len(result.get("comments", [])),
        "comment_url": result.get("posted_urls", [None])[0]
    }


@router.post("/memory/test")
async def test_memory():
    from app.services.memory import store_decision, search_memory

    await store_decision(
        org_id="test-org",
        repo_id="yamin-H/bug-test-repo",
        content="Team rejected N+1 query pattern in UserService. Developer was fetching user inside a loop. Requested to use batch query with whereIn instead.",
        decision_type="performance",
        outcome="rejected",
        pr_number=5,
        file_path="src/services/UserService.ts"
    )

    results = await search_memory(
        repo_id="yamin-H/bug-test-repo",
        query="database call inside a for loop fetching users one by one"
    )

    return {"stored": True, "search_results": results}

@router.post("/onboard")
async def onboard_repo(body: OnboardRequest):
    print(f"Starting onboarding for {body.repo}")

    result = await onboard_graph.ainvoke({
        "repo": body.repo,
        "org_id": body.org_id,
        "months_back": body.months_back,
        "prs": [],
        "decisions": [],
        "stored_count": 0,
        "error": None
    })

    return {
        "status": "completed",
        "repo": body.repo,
        "stored_count": result["stored_count"],
        "message": f"Memory ready — {result['stored_count']} decisions stored"
    }

@router.post("/digest")
async def generate_digest(body: DigestRequest):
    all_comments = []
    for review in body.reviews:
        all_comments.extend(review.get('comments', []))

    comments_text = "\n".join([f"- {c}" for c in all_comments[:50]])

    response = llm.invoke([
        SystemMessage(content="You analyze code review patterns and summarize them concisely."),
        HumanMessage(content=f"""Analyze this week's code review activity:

            PRs reviewed: {body.prs_reviewed}
            Flags raised: {body.flags_raised}
            Flags approved: {body.flags_approved}
            Flags dismissed: {body.flags_dismissed}

            Comments made this week:
            {comments_text or 'none'}

            Respond ONLY with JSON, no markdown:
            {{
                "top_issue": "one sentence describing the most common issue flagged",
                "top_dismissed": "one sentence describing what was most often dismissed",
                "patterns_learned": <number of new patterns identified>
            }}""")
            ])

    import json
    raw = response.content.strip().replace("```json", "").replace("```", "").strip()
    result = json.loads(raw)

    return result