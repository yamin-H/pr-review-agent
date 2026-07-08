from typing import TypedDict, List, Optional

class ReviewComment(TypedDict):
    filename: str
    line: int
    severity: str       
    comment: str
    confidence: float
    past_pr_number: Optional[int]

class ReviewState(TypedDict, total=False):
    job_id: str
    repo: str
    pr_number: int
    installation_id: int
    changed_files: List[dict]       
    chunks: List[dict]             
    chunks_with_memory: List[dict] 
    comments: List[ReviewComment]  
    posted_urls: List[str]         
    error: Optional[str]