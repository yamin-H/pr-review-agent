# 🤖 PR Review Agent

> Your team's collective code review knowledge, automated.

A GitHub App that reviews every Pull Request using your team's own history as context. It remembers every past decision your team ever made and uses that memory to give reviews that are specific to **your team** — not generic best practices.

---

## What Makes This Different

| | CodeRabbit | PR Review Agent |
|---|---|---|
| Memory of past decisions | ✗ | ✓ |
| Team-specific feedback | ✗ | ✓ |
| References past PRs | ✗ | ✓ |
| Learns from dismissals | ✗ | ✓ |
| Weekly digest | ✗ | ✓ |
| Generic best practices | ✓ | ✓ |

Instead of:
> "This might cause performance issues."

You get:
> "Your team flagged this pattern in PR #234 (3 months ago) and requested batch queries instead. Confidence: 91%"

---

## Architecture

```
GitHub Marketplace
        ↓ user installs
GitHub App (webhooks)
        ↓ PR opened event
Node.js API (Express + TypeScript)
        ↓ job queued
BullMQ + Redis
        ↓ job picked up
Python Agent (FastAPI + LangGraph)
        ↓ searches memory
pgvector (PostgreSQL)
        ↓ posts comments
GitHub API
        ↓ developer responds
Feedback stored → agent gets smarter
        ↓
Next.js Dashboard + Weekly Digest → Slack / Email
```

---

## Tech Stack

| Layer | Tool | Cost |
|---|---|---|
| GitHub App | GitHub | Free |
| Frontend | Next.js → Vercel | Free |
| Node.js API | Express/TS → Render | Free |
| Python Agent | FastAPI → Render | Free |
| Queue | BullMQ + Upstash Redis | Free |
| Database | Neon PostgreSQL | Free |
| Vector Memory | pgvector on Neon | Free |
| Embeddings | sentence-transformers | Free |
| LLM | Groq Llama 3.3 70B | Free |
| Auth | GitHub OAuth + GitHub App | Free |
| Email | Resend | Free |
| Slack | Slack Webhooks | Free |
| **Total** | | **$0** |

---

## How It Works

### Phase 1 — Onboarding
When a user installs the app, the agent reads the last 6 months of merged PRs:
- Every inline review comment
- Who approved / requested changes
- What was changed and why
- Final decision (merged / closed)

Each decision gets embedded and stored in pgvector:
```
"Team rejected N+1 pattern — use batch queries instead"
→ vector(384 dimensions) + metadata stored in pgvector
```

### Phase 2 — PR Review (LangGraph Agent)
When a developer opens a PR:

```
Node 1: fetch_pr        → read every changed file and diff
Node 2: chunk_changes   → split diff into meaningful pieces
Node 3: search_memory   → find similar past decisions per chunk
Node 4: llm_review      → reason over chunk + memory context
Node 5: post_comments   → post inline GitHub PR comments
Node 6: notify_complete → mark job done in database
```

### Phase 3 — Feedback Loop
Every approve or dismiss gets embedded and stored. The agent gets smarter every week.

### Phase 4 — Weekly Digest
Every Monday at 9am, a report is generated and sent to Slack/email:
- PRs reviewed, flags raised, flags approved/dismissed
- Most common issue this week
- Most dismissed rule
- New patterns learned

---

## Project Structure

```
pr-review-agent/
├── api/                        # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/             # webhooks, auth, repos, reviews, memory
│   │   ├── workers/            # BullMQ review + digest workers
│   │   ├── queues/             # review-queue, digest-queue
│   │   ├── services/           # github, agent, notifications
│   │   ├── middleware/         # auth, webhook verification, error
│   │   └── lib/                # prisma, redis, octokit, cron
│   └── prisma/
│       └── schema.prisma       # all database models
│
├── agent/                      # Python + FastAPI + LangGraph
│   └── app/
│       ├── graph/
│       │   ├── review/         # 6-node PR review graph
│       │   └── onboard/        # repo history analysis graph
│       ├── services/           # github, llm, embeddings, memory
│       └── core/               # config, database, redis
│
└── frontend/                   # Next.js + shadcn/ui
    └── app/
        ├── page.tsx            # landing page
        └── dashboard/          # overview, reviews, memory, digest, settings
```

---

## Local Development

### Prerequisites
- Node.js v18+
- Python 3.11+
- Docker (for Redis)
- Git

### 1. Clone the repo

```bash
git clone https://github.com/your-username/pr-review-agent.git
cd pr-review-agent
```

### 2. Set up Redis

```bash
docker run -d --name pr-review-redis -p 6379:6379 redis:alpine
```

### 3. Set up the Node.js API

```bash
cd api
npm install
cp .env.example .env   # fill in your values
npx prisma migrate dev
npm run dev
```

### 4. Set up the Python Agent

```bash
cd agent
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # fill in your values
uvicorn app.main:app --reload --port 8000
```

### 5. Set up the Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev -- --port 4000
```

### 6. Expose local server with ngrok

```bash
ngrok http 3000
```

Update your GitHub App webhook URL to the ngrok URL.

---

## Environment Variables

### `api/.env`

```env
PORT=3000
DATABASE_URL=your_neon_connection_string
REDIS_URL=redis://localhost:6379
GITHUB_APP_ID=your_app_id
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_PRIVATE_KEY_PATH=./your-app.private-key.pem
GITHUB_CLIENT_ID=your_oauth_client_id
GITHUB_CLIENT_SECRET=your_oauth_client_secret
SESSION_SECRET=random_32_char_string
AGENT_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4000
RESEND_API_KEY=your_resend_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### `agent/.env`

```env
GROQ_API_KEY=your_groq_key
GITHUB_TOKEN=your_personal_access_token
DATABASE_URL=your_neon_connection_string
NODE_API_URL=http://localhost:3000
```

### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## GitHub App Setup

1. Go to `github.com → Settings → Developer Settings → GitHub Apps → New GitHub App`
2. Set webhook URL to `https://your-ngrok-url/webhooks/github`
3. Set permissions: Pull requests (R/W), Contents (R), Metadata (R), Issues (R/W)
4. Subscribe to events: Pull request, Pull request review, Pull request review comment
5. Generate and download the private key
6. Install the app on your repos

---

## Database Setup (Neon)

1. Create a project at [neon.tech](https://neon.tech)
2. Enable pgvector:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  repo_id TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(384),
  decision_type TEXT,
  outcome TEXT,
  pr_number INT,
  file_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON memory
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

3. Run Prisma migrations:

```bash
cd api && npx prisma migrate dev
```

---

## Deployment

### Frontend → Vercel
- Root directory: `frontend`
- Framework: Next.js
- Env: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`

### API → Render
- Root directory: `api`
- Build: `npm install && npx prisma generate && npm run build`
- Start: `node dist/app.js`
- Add all `api/.env` variables

### Agent → Render
- Root directory: `agent`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Add all `agent/.env` variables

### Redis → Upstash
- Create a database at [upstash.com](https://upstash.com)
- Replace `REDIS_URL` with the Upstash connection string in both API and production env

---

## API Routes

### Webhooks
| Method | Path | Description |
|---|---|---|
| POST | `/webhooks/github` | Receive GitHub webhook events |

### Auth
| Method | Path | Description |
|---|---|---|
| GET | `/auth/github` | Start GitHub OAuth flow |
| GET | `/auth/github/callback` | Handle OAuth callback |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Sign out |

### API
| Method | Path | Description |
|---|---|---|
| GET | `/api/repos` | List connected repos |
| GET | `/api/reviews` | List recent PR reviews |
| GET | `/api/reviews/:id` | Single review with comments |
| GET | `/api/memory/stats` | Memory statistics |
| GET | `/api/digest/preview` | Past weekly digests |

### Agent (Internal)
| Method | Path | Description |
|---|---|---|
| POST | `/review` | Trigger PR review |
| POST | `/onboard` | Analyze repo history |
| POST | `/digest` | Generate weekly digest |

---

## License

MIT
