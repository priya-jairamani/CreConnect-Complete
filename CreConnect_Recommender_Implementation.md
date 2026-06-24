# CreConnect AI Recommender — Implementation Tracking Document

**Status:** Complete (v1.0)
**Date:** 2026-06-22
**Approach:** Hybrid Recommender (Content-Based + Collaborative Filtering + Context-Aware Rules)

---

## 1. Folder Structure

```
CreConnect/
├── creconnect-backend/                   ← Existing Express backend
│   ├── src/
│   │   ├── models/
│   │   │   └── AiMatch.js               ← NEW: Sequelize model for ai_matches table
│   │   └── routes/
│   │       ├── index.js                 ← MODIFIED: added /ai route mount
│   │       └── ai.routes.js             ← NEW: all AI API endpoints
│   └── server.js                        ← MODIFIED: ai_matches table migration
│
└── ai-recommender/                       ← NEW: self-contained engine module
    ├── package.json
    ├── demo.js                           ← Standalone runner (no DB needed)
    ├── engine/
    │   ├── index.js                      ← HybridEngine class (main entry)
    │   ├── scorer.js                     ← Content-based 7-factor formula
    │   ├── collaborative.js              ← SGD Matrix Factorization
    │   └── utils.js                      ← cosine similarity, normalization, niche map
    ├── data/
    │   └── seed-data.json                ← 20 creators, 10 brands, 30 collaborations
    └── integration/
        ├── model.js                      ← AiMatch model (reference copy)
        ├── service.js                    ← DB-connected service layer
        └── routes.js                     ← Standalone route file (alternate mount)
```

---

## 2. How Each Component Was Built

### 2.1 `engine/utils.js` — Core Math Helpers

| Function | Purpose |
|---|---|
| `nicheIndustryScore(creator, brand)` | Returns 0–1 compatibility using a hard-coded niche↔industry table. Bonus for `preferredIndustries` match. |
| `engagementScore(rate)` | Normalizes 0–10% engagement to 0–1. |
| `audienceFitScore(creator, brand)` | 60% log-scale follower score + 40% budget range overlap. |
| `locationScore(creator, brand)` | 1.0 same city, 0.5 same country, 0.3 unknown. |
| `cosineSimilarity(a, b)` | Standard dot-product cosine similarity for feature vectors. |
| `nicheVector(creator)` | One-hot + 0.5 for secondary niches, over 10-niche NICHES array. |
| `brandNicheVector(brand)` | One-hot from `preferredCategories`. |

**Niche ↔ Industry Compatibility Table (key pairs):**

| Creator Niche | Brand Industry | Score |
|---|---|---|
| FASHION | Fashion | 1.0 |
| FASHION | Lifestyle | 0.7 |
| BEAUTY | Beauty | 1.0 |
| GAMING | Gaming | 1.0 |
| GAMING | Technology | 0.4 |
| TECH | Technology | 1.0 |
| FITNESS | Health & Fitness | 1.0 |
| FOOD | Food & Beverage | 1.0 |
| LIFESTYLE | Lifestyle | 1.0 |
| TRAVEL | Travel | 1.0 |
| EDUCATION | Education | 1.0 |
| FINANCE | Finance | 1.0 |

---

### 2.2 `engine/scorer.js` — Content-Based Score Formula

Implements the exact formula from the design document:

```
Score = (NicheMatch × 30%) + (Engagement × 20%) + (AudienceFit × 15%)
      + (Location × 10%) + (Rating × 10%) + (History × 10%) + (Feedback × 5%)
```

**Factor details:**

| Factor | Weight | Data Source | Notes |
|---|---|---|---|
| Niche Match | 30% | `creator.niche` + `brand.industry` | Via `nicheIndustryScore()` |
| Engagement | 20% | `creator.engagementRate` | 0–10% normalized to 0–1 |
| Audience Fit | 15% | `followerCount` + budget overlap | 60/40 split log/budget |
| Location | 10% | `creator.location` / `brand.location` | City match = 1.0 |
| Rating | 10% | `creator.rating` (0–5) | Divided by 5 |
| History | 10% | `collaborations` table | `completed / total`, 0.3 default for new |
| Feedback | 5% | `ai_matches.feedbackAccepted` | 0.5 neutral, 1.0 accepted, 0.0 rejected |

Output: `score` (0–100 integer) + `breakdown` object with each factor's contribution.

---

### 2.3 `engine/collaborative.js` — Matrix Factorization

**Algorithm:** Stochastic Gradient Descent (SGD) Matrix Factorization  
**Decomposition:** `R ≈ U × V^T`

- **U** = brands matrix `[nBrands × K]`
- **V** = creators matrix `[nCreators × K]`
- **K** = 10 latent factors (configurable)
- **Observed signals:** COMPLETED/ACCEPTED = 1.0, REJECTED = 0.0

**Update rule (SGD):**
```
error  = rating - U[b]·V[c]
U[b][k] += lr × (2 × error × V[c][k] - λ × U[b][k])
V[c][k] += lr × (2 × error × U[b][k] - λ × V[c][k])
```

**Default hyperparameters:**
| Param | Value |
|---|---|
| factors (K) | 10 |
| epochs | 60 |
| learning rate | 0.01 |
| L2 regularization (λ) | 0.02 |

Handles cold-start: returns `null` for unseen IDs, engine falls back to content-based score.

---

### 2.4 `engine/index.js` — HybridEngine

The top-level class that combines all three pillars.

**Dynamic weighting (cold-start aware):**

| Brand Collaboration Count | Content-Based Weight | Collaborative Weight |
|---|---|---|
| 0 (new brand) | 90% | 10% |
| 1–3 (growing) | 70% | 30% |
| 4+ (established) | 50% | 50% |

**Context-Aware Rules applied:**
- Skips creators with `availabilityStatus = BUSY / ON_BREAK / NOT_ACCEPTING`
- Skips creators whose niche appears in `brand.blockedCategories`

**Public API:**

```js
const engine = new HybridEngine();
engine.loadData({ creators, brands, collaborations, feedback });

engine.getMatches(brandId, topN)          // → matches[] for one brand
engine.getMatchesForCreator(creatorId, N) // → brand matches for a creator
engine.runForAll(topN)                    // → { [brandId]: matches[] }
```

---

### 2.5 `data/seed-data.json` — Training & Test Data

| Collection | Count | Details |
|---|---|---|
| creators | 20 | All 10 niches, 3 cities (Karachi/Lahore/Islamabad), 31K–325K followers |
| brands | 10 | All 10 industries, budget ranges 20K–1M PKR |
| campaigns | 20 | 2 per brand, all objectives, full content requirements + real deliverables |
| collaborations | 30 | Full fields: stage, priority, offerType, paymentStatus, startDate, endDate |
| applications | 23 | Realistic applicant notes, ACCEPTED/REJECTED statuses |
| aiFeedback | 25 | Positive/negative decisions seeded for brand feedback loop |

**Collaboration fields included:**

| Field | Example Values |
|---|---|
| status | COMPLETED, ACCEPTED, REJECTED |
| stage | INQUIRY, NEGOTIATION, CONTRACTED, IN_PROGRESS, DELIVERED, COMPLETED |
| priority | LOW, MEDIUM, HIGH |
| offerType | FIXED, MILESTONE, PERFORMANCE |
| paymentStatus | PENDING, ESCROW, RELEASED, PAID |
| offerAmountPKR | 50,000 – 500,000 |
| startDate / endDate | Real Pakistani campaign windows (2025–2026) |

Creator follower range: 31,000 – 325,000  
Brand budget range: PKR 20,000 – PKR 1,000,000  
Locations: Karachi, Lahore, Islamabad

---

### 2.6 `creconnect-backend/src/models/AiMatch.js` — Database Model

Table: **`ai_matches`**

| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| brandId | UUID | FK → brand_profiles |
| creatorId | UUID | FK → creator_profiles |
| matchScore | FLOAT | 0–100 |
| breakdown | JSONB | Per-factor scores |
| method | ENUM | `content-based` or `hybrid` |
| weights | JSONB | CB/CF weights used |
| feedbackAccepted | BOOLEAN nullable | Brand's explicit decision |
| feedbackAt | TIMESTAMPTZ | When feedback was given |
| generatedAt | TIMESTAMPTZ | When engine ran |

Unique constraint: `(brandId, creatorId)` — upsert-safe.

Migration runs automatically in `server.js` on startup.

---

### 2.7 API Endpoints (`/api/v1/ai/*`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ai/run` | ADMIN | Run engine for all brands, store in `ai_matches` |
| GET | `/ai/matches/brand/:brandId` | Any | Fetch stored top matches for a brand |
| GET | `/ai/matches/creator/:creatorId` | Any | Fetch stored brand matches for a creator |
| POST | `/ai/feedback` | Any | Record brand accept/reject decision |
| GET | `/ai/matches/brand/:brandId/live` | Any | Run engine live (skips cache) |

---

---

### 2.8 Frontend Integration

#### Brand Side — `SearchCreators.jsx`

**"✦ AI Match" button added to page header.**

| Element | Behaviour |
|---|---|
| Toggle button | Purple gradient when ON, muted when OFF |
| Info banner | Explains scoring factors when AI mode is active |
| Score badge | `✦ 87/100` overlay on each creator card (top-right) |
| Rank badge | `1`, `2`, `3`… overlay (top-left) |
| Feedback row | 👍 Yes / 👎 No under each card — POSTs to `/ai/feedback` |

When OFF → normal search/filter results (unchanged).  
When ON → calls `GET /ai/matches/brand/:brandId` and replaces grid.

#### Creator Side — `FindBrands.jsx`

**"✦ AI Match" button added to page header.**

Same score + rank badges on each brand card.  
When ON → calls `GET /ai/matches/creator/:creatorId`, enriches results with full brand objects from the already-loaded `allBrands` list.

#### `src/api/ai.api.js` — API Layer

```js
aiApi.getBrandMatches(brandId, limit)            // GET /ai/matches/brand/:id
aiApi.getCreatorMatches(creatorId, limit)         // GET /ai/matches/creator/:id
aiApi.sendFeedback(brandId, creatorId, accepted)  // POST /ai/feedback
aiApi.getLiveBrandMatches(brandId, limit)         // GET /ai/matches/brand/:id/live
```

Shares the same Axios client as the rest of the app — auth token, refresh logic, and demo-mode fallback all apply automatically.

---

## 3. How to Run

### 3a. Standalone Demo (No Database)

```bash
cd ai-recommender

# Full run for all brands (top 5 each)
node demo.js

# Single brand
node demo.js --brand b2000000-0000-0000-0000-000000000001

# Single creator
node demo.js --creator c1000000-0000-0000-0000-000000000004
```

### 3b. Live Backend Integration

1. Start the backend normally — `ai_matches` table is created on first boot.
2. Trigger a match run via the API:
   ```
   POST /api/v1/ai/run
   Authorization: Bearer <admin-token>
   ```
3. Read matches:
   ```
   GET /api/v1/ai/matches/brand/<brandId>?limit=10
   GET /api/v1/ai/matches/creator/<creatorId>?limit=10
   ```
4. Record feedback:
   ```
   POST /api/v1/ai/feedback
   { "brandId": "...", "creatorId": "...", "accepted": true }
   ```

---

## 4. Implementation Decisions

| Decision | Reason |
|---|---|
| Pure JS SGD (no ML library) | Zero extra dependencies; Node.js compatible; sufficient for the data scale |
| Separate `ai-recommender/` folder | Engine is self-contained and testable without the backend running |
| Upsert on `(brandId, creatorId)` | Engine can re-run without duplicating rows |
| 0.3 default history score | Avoids cold-penalizing new creators; treated as "neutral" |
| `engineReady` flag in routes | Avoids re-loading DB on every request; resets only after feedback |
| `gen_random_uuid()` in SQL migration | Works on PostgreSQL 13+ without pgcrypto extension |

---

## 5. Improvement Roadmap (Post v1.0)

| Phase | Target | Improvement |
|---|---|---|
| Month 1–3 | Baseline | 30–35% match acceptance |
| Month 4–6 | Learning | 45–50% — CF model accumulates real signals |
| Month 7+ | Optimized | 60–70% — feedback loop fully operational |

**Next steps to implement:**
- [ ] Scheduled cron job to auto-run `/ai/run` nightly
- [ ] Admin dashboard widget to monitor average match score over time
- [ ] Seasonal boost: weight `generatedAt` recency in ranking
- [ ] A/B test: compare AI matches vs manual search acceptance rate
- [ ] Expand CF to use `applications` table (not just `collaborations`) for more signal

---

## 6. File Checklist

| File | Status |
|---|---|
| `ai-recommender/package.json` | ✅ Created |
| `ai-recommender/data/seed-data.json` | ✅ Created (20 creators, 10 brands, 20 campaigns, 30 collabs, 23 applications, 25 feedback) |
| `ai-recommender/engine/utils.js` | ✅ Created |
| `ai-recommender/engine/scorer.js` | ✅ Created |
| `ai-recommender/engine/collaborative.js` | ✅ Created |
| `ai-recommender/engine/index.js` | ✅ Created |
| `ai-recommender/integration/model.js` | ✅ Created |
| `ai-recommender/integration/service.js` | ✅ Created |
| `ai-recommender/integration/routes.js` | ✅ Created |
| `ai-recommender/demo.js` | ✅ Created |
| `creconnect-backend/src/models/AiMatch.js` | ✅ Created |
| `creconnect-backend/src/routes/ai.routes.js` | ✅ Created |
| `creconnect-backend/src/routes/index.js` | ✅ Modified — `/ai` route registered |
| `creconnect-backend/server.js` | ✅ Modified — `ai_matches` table migration added |
| `creconnect-react/src/api/ai.api.js` | ✅ Created |
| `creconnect-react/src/pages/brand/SearchCreators.jsx` | ✅ Modified — AI Match button + results grid |
| `creconnect-react/src/pages/creator/FindBrands.jsx` | ✅ Modified — AI Match button + results grid |
