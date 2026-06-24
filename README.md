<div align="center">

<img src="https://img.shields.io/badge/CreConnect-AI%20Powered%20Platform-6d5cff?style=for-the-badge&logo=sparkles&logoColor=white" alt="CreConnect" height="40"/>

<br/>
<br/>

**The smart influencer-brand collaboration platform for Pakistan.**  
Connect creators with brands through AI matching, real-time chat, and intelligent automation.

<br/>

![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socket.io&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

<br/>

[Getting Started](#-getting-started) · [Features](#-features) · [API Reference](#-api-reference) · [AI Engine](#-ai-recommender-engine) · [CoPilot](#-ai-copilot)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [AI Recommender Engine](#-ai-recommender-engine)
- [AI CoPilot](#-ai-copilot)
- [Demo Accounts](#-demo-accounts)
- [Scripts](#-scripts)
- [Security](#-security)

---

## 🌟 Overview

CreConnect is a three-role collaboration marketplace:

| Role | Description |
|---|---|
| 🎨 **CREATOR** | Discover campaigns, apply, deliver content, get paid |
| 🏢 **BRAND** | Create campaigns, discover creators, manage collaborations |
| 🛡️ **ADMIN** | Moderate the platform, manage users, view analytics |

---

## 🛠 Tech Stack

<table>
<tr>
<td valign="top" width="33%">

### Backend
- **Node.js 20 LTS** — runtime
- **Express 4** — API framework
- **Sequelize 6** — ORM
- **PostgreSQL 16** — database
- **Socket.io 4** — real-time
- **JWT** — authentication
- **Cloudinary** — file uploads
- **Nodemailer** — email
- **Redis** — caching (optional)
- **Winston** — logging

</td>
<td valign="top" width="33%">

### Frontend
- **React 18** — UI framework
- **Vite 5** — build tool
- **Tailwind CSS 3** — styling
- **React Router v6** — navigation
- **Axios** — HTTP client
- **Socket.io client** — real-time
- **Context API** — state management

</td>
<td valign="top" width="33%">

### AI Engine
- **Content-Based Filtering** — 7-factor scoring
- **Collaborative Filtering** — SGD Matrix Factorization
- **Hybrid Engine** — dynamic weight blending
- **PostgreSQL** — pre-computed match storage
- **Pure Node.js** — no ML dependencies

</td>
</tr>
</table>

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  React SPA  (Port 3000)                       │
│                                                               │
│  ✦ AI Match Button   ✨ CoPilot Widget   💬 Real-time Chat   │
│  Brand Dashboard  ·  Creator Dashboard  ·  Admin Panel        │
└───────────────────────────┬──────────────────────────────────┘
                            │  HTTP + WebSocket
┌───────────────────────────▼──────────────────────────────────┐
│               Express API Server  (Port 5000)                 │
│                                                               │
│  /auth        JWT auth · OTP · password reset                 │
│  /creators    Profile · stats · collaborations                │
│  /brands      Profile · campaigns · analytics                 │
│  /campaigns   CRUD · applications · accept/reject             │
│  /matching    Role-aware recommendations                      │
│  /ai          ✦ AI match engine · run · feedback              │
│  /copilot     ✨ CoPilot chat (backend-controlled)            │
│  /search      Full-text search                                │
│  /messages    Conversations · real-time chat                  │
│  /payments    Escrow · release                                │
│  /analytics   Stats per role                                  │
│  /admin       Moderation · audit logs                         │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                     PostgreSQL 16                              │
│                                                               │
│  Users · Profiles · Campaigns · Collaborations                │
│  Payments · Messages · Notifications · AI Matches             │
└──────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

<details>
<summary><strong>🏢 For Brands</strong></summary>
<br/>

- Create and publish campaigns with full targeting controls (niche, location, follower range, budget)
- **✦ AI Match Engine** — scored creator recommendations (0–100) based on 7 weighted factors
- **✨ AI CoPilot** — chat assistant backed by real DB data: find creators, check pipeline status, suggest budgets, draft outreach messages
- Real-time messaging via Socket.io
- Full collaboration pipeline — Inquiry → Negotiation → Contracted → In Progress → Delivered → Completed
- Escrow-based payment system
- Analytics dashboard with campaign and collab breakdowns

</details>

<details>
<summary><strong>🎨 For Creators</strong></summary>
<br/>

- Discover and apply to brand campaigns
- **✦ AI Match** — see which brands best match your niche, engagement rate, and collaboration history
- **✨ AI CoPilot** — find brands, check earnings, draft pitches, explain why a brand matches you
- Collaboration tracking with stage and deliverable management
- Real-time notifications and chat
- Earnings overview and payment history
- Rich profile with social handles, content formats, niche tags, and media kit link

</details>

<details>
<summary><strong>🛡️ For Admins</strong></summary>
<br/>

- Full user management — approve, suspend, verify accounts
- Platform-wide analytics
- Content moderation and report resolution
- Broadcast announcements to ALL / CREATORS / BRANDS
- Complete audit log

</details>

<details>
<summary><strong>✦ AI Recommender System</strong></summary>
<br/>

- Hybrid engine — content-based filtering + collaborative filtering (SGD matrix factorization)
- Cold-start handling with dynamic weight blending based on collaboration count
- Feedback loop — brand thumbs up/down improves future recommendations
- Pre-computed scores in `ai_matches` table — API response in under 500ms
- Standalone demo mode — runs against seed data with no database required

</details>

<details>
<summary><strong>✨ AI CoPilot</strong></summary>
<br/>

- Floating chat widget on every page (bottom-right `✨` button)
- 12 intent categories — all responses powered by **real database queries**
- Role-aware responses — different capabilities for brands vs creators
- Navigation shortcuts — "open my messages" navigates to the correct page
- Zero LLM dependency — pure Node.js intent matching + Sequelize data fetching

</details>

---

## 📁 Project Structure

```
CreConnect/
│
├── 📄 .gitignore                              ← Covers all subprojects
├── 📄 README.md                               ← You are here
├── 📄 CreConnect_Recommender_Implementation.md ← AI engine implementation doc
│
├── 📦 creconnect-backend/                     ← Express API + WebSocket server
│   ├── server.js                              ← Entry point
│   ├── .env.example                           ← Required environment variables
│   └── src/
│       ├── app.js                             ← Express setup (CORS, Helmet, routes)
│       ├── config/                            ← DB, Redis, Socket.io, env validation
│       ├── controllers/                       ← Thin request handlers
│       ├── services/
│       │   └── copilot/                       ← AI CoPilot: intentDetector, dataFetcher, responseBuilder
│       ├── models/
│       │   └── AiMatch.js                     ← AI match results table
│       ├── routes/
│       │   ├── ai.routes.js                   ← ✦ AI engine endpoints
│       │   └── copilot.routes.js              ← ✨ CoPilot chat endpoint
│       ├── middleware/                        ← Auth, authorize, rate-limit, upload
│       └── utils/                             ← JWT, OTP, logger, response helpers
│
├── 🤖 ai-recommender/                         ← Self-contained AI engine module
│   ├── demo.js                                ← CLI runner (no DB needed)
│   ├── engine/
│   │   ├── utils.js                           ← Cosine similarity, niche-industry mapping
│   │   ├── scorer.js                          ← 7-factor content-based formula
│   │   ├── collaborative.js                   ← SGD Matrix Factorization
│   │   └── index.js                           ← HybridEngine class
│   ├── integration/
│   │   ├── service.js                         ← DB bridge (load, run, store, feedback)
│   │   └── routes.js                          ← Standalone route file
│   └── data/
│       └── seed-data.json                     ← 20 creators · 10 brands · 20 campaigns · 30 collabs
│
└── ⚛️  creconnect-react/creconnect-react/      ← React + Vite frontend
    └── src/
        ├── api/
        │   ├── ai.api.js                      ← AI match API calls
        │   └── copilot.api.js                 ← CoPilot chat API call
        ├── components/
        │   └── copilot/AICopilot.jsx          ← Floating chat widget
        ├── pages/
        │   ├── brand/SearchCreators.jsx        ← ✦ AI Match button (brand side)
        │   └── creator/FindBrands.jsx          ← ✦ AI Match button (creator side)
        └── layouts/                            ← BrandLayout + CreatorLayout (mount CoPilot)
```

---

## 🚀 Getting Started

### Prerequisites

![Node](https://img.shields.io/badge/Node.js-≥20-339933?style=flat-square&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-optional-DC382D?style=flat-square&logo=redis&logoColor=white)

### Step 1 — Clone

```bash
git clone https://github.com/your-username/creconnect.git
cd creconnect
```

### Step 2 — Backend Setup

```bash
cd creconnect-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# → Edit .env with your DATABASE_URL, JWT secrets, etc.

# Start dev server (auto-creates all tables on first run)
npm run dev
```

> ✅ Backend running at `http://localhost:5000/api/v1/auth/health`

### Step 3 — Frontend Setup

```bash
cd creconnect-react/creconnect-react

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# → Set VITE_API_BASE_URL=http://localhost:5000/api/v1

# Start dev server
npm run dev
```

> ✅ Frontend running at `http://localhost:3000`

### Step 4 — Seed Demo Data

```bash
cd creconnect-backend

# Seed all demo accounts and sample data
node database/seeders/20240101000001-demo-users.js

# Seed test accounts (Bhavish1 creator + B Company brand)
node scripts/seed-bhavish-bcompany.js
```

### Step 5 — Run the AI Engine

```bash
# Standalone demo — no DB required
cd ai-recommender
node demo.js

# Or trigger via API (requires running backend + admin token)
curl -X POST http://localhost:5000/api/v1/ai/run \
  -H "Authorization: Bearer <admin-token>"
```

> ✅ AI matches are now stored in the database and the **✦ AI Match** button is active.

---

## 🔐 Environment Variables

### Backend — `creconnect-backend/.env`

| Variable | Required | Default | Description |
|---|:---:|---|---|
| `NODE_ENV` | — | `development` | Controls logging verbosity |
| `PORT` | — | `5000` | API server port |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `REDIS_URL` | — | `redis://localhost:6379` | Redis URL (app works without it) |
| `JWT_ACCESS_SECRET` | ✅ | — | Min 32 chars — signs access tokens (15m) |
| `JWT_REFRESH_SECRET` | ✅ | — | Min 32 chars — signs refresh tokens (7d) |
| `JWT_ACCESS_EXPIRES_IN` | — | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | — | `7d` | Refresh token TTL |
| `SMTP_HOST` | — | — | If absent, emails are logged only |
| `SMTP_PORT` | — | `587` | SMTP port |
| `SMTP_USER` | — | — | SMTP username |
| `SMTP_PASS` | — | — | SMTP password |
| `EMAIL_FROM` | — | `CreConnect <no-reply@creconnect.pk>` | Sender address |
| `CLOUDINARY_CLOUD_NAME` | — | — | Required for file uploads |
| `CLOUDINARY_API_KEY` | — | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | — | Cloudinary API secret |
| `FRONTEND_URL` | — | `http://localhost:3000` | CORS allow-origin |
| `ADMIN_EMAIL` | — | `admin@creconnect.pk` | Admin seed account |
| `ADMIN_PASSWORD` | — | `Admin@12345` | Admin seed password |

### Frontend — `creconnect-react/creconnect-react/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API URL (default: `http://localhost:5000/api/v1`) |

---

## 📡 API Reference

**Base URL:** `http://localhost:5000/api/v1`

**Response envelope:**
```json
{ "success": true,  "data": { ... } }
{ "success": true,  "data": [...], "meta": { "page": 1, "limit": 20, "total": 100 } }
{ "success": false, "message": "Error description" }
```

### Route Groups

| Prefix | Auth | Description |
|---|---|---|
| `/auth` | Public / Bearer | Register, login, logout, OTP, password reset |
| `/creators` | Bearer · CREATOR | Profile, stats, collaborations, platforms |
| `/brands` | Bearer · BRAND | Profile, stats, campaigns, listing |
| `/campaigns` | Bearer | CRUD, apply, applications, accept/reject |
| `/matching` | Bearer | Role-aware creator/campaign recommendations |
| `/ai` | Bearer | ✦ AI engine — run, results, feedback |
| `/copilot` | Bearer | ✨ CoPilot chat backend |
| `/search` | Bearer | Full-text search across creators, brands, campaigns |
| `/messages` | Bearer | Conversations and real-time messaging |
| `/notifications` | Bearer | Read, mark-read, delete notifications |
| `/payments` | Bearer | Escrow creation and release |
| `/analytics` | Bearer | Aggregated statistics per role |
| `/upload` | Bearer | Avatar, campaign asset, chat attachment |
| `/admin` | Bearer · ADMIN | User management, reports, audit logs |

### AI Endpoints

```http
POST   /ai/run                           →  Run engine for all brands (Admin)
GET    /ai/matches/brand/:brandId        →  Top creator matches for a brand
GET    /ai/matches/creator/:creatorId    →  Top brand matches for a creator
POST   /ai/feedback                      →  Record brand thumbs-up/down
GET    /ai/matches/brand/:brandId/live   →  Live score, bypasses cache

POST   /copilot/chat                     →  AI CoPilot chat response
```

---

## 🤖 AI Recommender Engine

### Scoring Formula

$$\text{Score} = (\text{Niche} \times 30\%) + (\text{Engagement} \times 20\%) + (\text{AudienceFit} \times 15\%) + (\text{Location} \times 10\%) + (\text{Rating} \times 10\%) + (\text{History} \times 10\%) + (\text{Feedback} \times 5\%)$$

| Factor | Weight | Source |
|---|:---:|---|
| Niche ↔ Industry match | 30% | `creator.niche` vs `brand.industry` (compatibility table) |
| Engagement quality | 20% | `creator.engagementRate` normalised 0–10% → 0–100 |
| Audience fit | 15% | Log-scale follower score + budget range overlap |
| Location match | 10% | Same city = 100, same country = 50, different = 30 |
| Rating | 10% | `creator.rating / 5 × 100` |
| Collaboration history | 10% | Completed collab ratio from `collaborations` table |
| Brand feedback | 5% | Past thumbs up/down from `ai_matches.feedbackAccepted` |

### Dynamic Weight Blending

```
New brand   (0 collabs)   →  90% Content-Based  +  10% Collaborative
Growing     (1–3 collabs) →  70% Content-Based  +  30% Collaborative
Established (4+ collabs)  →  50% Content-Based  +  50% Collaborative
```

### End-to-End Flow

```
Admin triggers POST /ai/run
         │
         ▼
Load all creators + brands + collaborations + feedback from DB
         │
         ▼
HybridEngine scores every brand × creator pair
         │
         ▼
Top 10–50 results stored in ai_matches table
         │
         ▼
Brand clicks "✦ AI Match" → instant read from ai_matches
         │
         ▼
Brand gives 👍/👎 → feedbackAccepted saved → next run improves
```

### Standalone Demo

```bash
cd ai-recommender

node demo.js                                              # All brands, top 5 each
node demo.js --brand b2000000-0000-0000-0000-000000000001 # Single brand
node demo.js --creator c1000000-0000-0000-0000-000000000004 # Single creator
```

---

## ✨ AI CoPilot

A backend-controlled assistant embedded as a floating `✨` button on every page.

### Architecture

```
User message
    │
    ▼  POST /api/v1/copilot/chat
    │
    ├── intentDetector.js   →  classifies into 1 of 12 intents
    ├── dataFetcher.js       →  queries real DB (Sequelize)
    ├── responseBuilder.js   →  builds reply with real data
    │
    └── { reply, action?, data? }  →  chat UI
```

### Supported Intents

| You say | What happens |
|---|---|
| `"Find fashion creators in Lahore"` | Queries `creator_profiles`, returns real names + stats |
| `"Show my AI matches"` | Reads `ai_matches` table for logged-in user |
| `"Suggest a campaign budget"` | `AVG(offerAmountPKR)` from real `collaborations` |
| `"How are my collaborations going?"` | Queries collab counts + recent records |
| `"How much have I earned?"` | Sums `payments` table for logged-in creator |
| `"Generate an outreach message"` | Template personalised with real profile data |
| `"Explain my top match score"` | Shows actual `breakdown` JSON from `ai_matches` |
| `"Open my messages"` | Navigates to correct route for the user's role |
| `"Help"` | Lists all capabilities |

> **No LLM required** — all responses come from real Sequelize queries.

---

## 👥 Demo Accounts

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin | `admin@creconnect.pk` | `Admin@12345` |
| 🏢 Brand — Khaadi | `khaadi@creconnect.pk` | *(see seeder)* |
| 🏢 Brand — B Company | `bcompany@gmail.com` | *(see seeder)* |
| 🎨 Creator — Bhavish Kumar | `bhavish1@gmail.com` | *(see seeder)* |
| 🎨 Creator — Zara Ahmed | `zara.fashion@creconnect.pk` | *(see seeder)* |
| 🎨 Creator — Hamza Khan | `hamza.games@creconnect.pk` | *(see seeder)* |

---

## 📜 Scripts

### Backend

```bash
npm run dev                              # Development server with hot reload
npm start                                # Production server
npm test                                 # Run integration tests
node scripts/seed-bhavish-bcompany.js   # Seed dummy data for test accounts
```

### AI Engine

```bash
node demo.js                             # Full demo — all brands
node demo.js --brand <id>               # Single brand analysis
node demo.js --creator <id>             # Find best brands for a creator
```

### Frontend

```bash
npm run dev                              # Development server
npm run build                            # Production build
npm run preview                          # Preview production build
```

---

## 🔒 Security

| Measure | Implementation |
|---|---|
| Secure headers | Helmet middleware |
| CORS | Restricted to `FRONTEND_URL` only |
| Rate limiting | 20 req/15 min on auth · 120 req/min globally |
| Password hashing | bcrypt with cost factor 12 |
| Token auth | JWT — short-lived access (15m) + rotating refresh (7d) |
| Input validation | express-validator on all endpoints |
| SQL injection | Sequelize parameterised queries — no raw SQL |
| Secret management | Environment variables, validated at startup, never committed |

---

<div align="center">

Made with ❤️ for the Pakistani creator economy

![MIT License](https://img.shields.io/badge/License-MIT-6d5cff?style=flat-square)

</div>
