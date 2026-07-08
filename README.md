# PR Review Agent

A GitHub App that reviews every Pull Request using your team's own history as context.

## Structure
- `api/` — Node.js + Express + TypeScript (orchestrator)
- `agent/` — Python + FastAPI + LangGraph (AI brain)
- `frontend/` — Next.js + shadcn/ui (dashboard)