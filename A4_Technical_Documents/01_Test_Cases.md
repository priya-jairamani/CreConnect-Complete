# A4 — Technical Documents
## Section 1: Test Cases

**Project:** CreConnect — Influencer–Brand Collaboration Platform  
**Testing Framework:** Jest 29 + Supertest 7  
**Test Environment:** Node.js 20 LTS, PostgreSQL 16 (real database — no mocks)  
**Test Runner Command:** `npm test` (inside `creconnect-backend/`)  
**Test Files:** `tests/auth.test.js`, `tests/campaigns.test.js`

---

### 1.1 How Tests Work

All tests are **integration tests** that hit the real PostgreSQL database via Supertest (which spins up the Express app in-process). There are no mocked services. Each test suite creates its own test data in `beforeAll` and cleans up in `afterAll` to keep the database clean.

---

### 1.2 Test Suite 1 — Authentication (`auth.test.js`)

**Setup:** `sequelize.authenticate()` — connects to the real DB.  
**Teardown:** Deletes all users whose email matches `%_test@%`.

| # | Test Case | Endpoint | HTTP Method | Input (Request Body / Headers) | Expected Output | Pass/Fail |
|---|-----------|----------|-------------|-------------------------------|-----------------|-----------|
| TC-A01 | Health check returns OK | `/api/v1/auth/health` | GET | *(none)* | `status: 200`, `body.data.status === 'ok'` | PASS |
| TC-A02 | Register a new creator | `/api/v1/auth/register` | POST | `{ email: "creator_test@test.com", password: "TestPass@1", role: "CREATOR", username: "testcreator99", displayName: "Test Creator" }` | `status: 201`, `body.success === true` | PASS |
| TC-A03 | Reject duplicate email on register | `/api/v1/auth/register` | POST | Same email as TC-A02 with `username: "testcreator100"` | `status: 409` (Conflict) | PASS |
| TC-A04 | Login fails with wrong credentials | `/api/v1/auth/login` | POST | `{ email: "nobody@test.com", password: "wrong" }` | `status: 401` (Unauthorized) | PASS |

---

### 1.3 Test Suite 2 — Campaigns (`campaigns.test.js`)

**Setup:** Creates a BRAND user and a CREATOR user directly in DB, logs both in to capture JWT tokens.  
**Teardown:** Deletes both test users (cascade deletes dependent rows).

| # | Test Case | Endpoint | HTTP Method | Input (Request Body / Headers) | Expected Output | Pass/Fail |
|---|-----------|----------|-------------|-------------------------------|-----------------|-----------|
| TC-C01 | Brand can create a campaign | `/api/v1/campaigns` | POST | Auth: `Bearer <brandToken>` · Body: `{ title: "Test Campaign", description: "A test campaign", objective: "AWARENESS", niche: "TECH", platforms: ["INSTAGRAM"], budgetType: "FIXED", budgetPKR: 50000, reels: 2, posts: 1, stories: 3, videos: 0, livestreams: 0, status: "PUBLISHED" }` | `status: 201`, returns `data.id` | PASS |
| TC-C02 | Fetch campaign by ID | `/api/v1/campaigns/:id` | GET | Auth: `Bearer <brandToken>` · Param: `id` from TC-C01 | `status: 200`, `body.data.title === "Test Campaign"` | PASS |
| TC-C03 | Creator can apply to campaign | `/api/v1/campaigns/:id/apply` | POST | Auth: `Bearer <creatorToken>` · Body: `{ note: "I am a great fit!" }` | `status: 201` (first apply) or `409` (already applied) | PASS |
| TC-C04 | Brand can delete campaign | `/api/v1/campaigns/:id` | DELETE | Auth: `Bearer <brandToken>` · Param: `id` from TC-C01 | `status: 200` | PASS |

---

### 1.4 Test Coverage Summary

| Area | Tests | Pass | Fail |
|------|-------|------|------|
| Auth — Health Check | 1 | 1 | 0 |
| Auth — Registration | 2 | 2 | 0 |
| Auth — Login | 1 | 1 | 0 |
| Campaigns — Create | 1 | 1 | 0 |
| Campaigns — Read | 1 | 1 | 0 |
| Campaigns — Apply | 1 | 1 | 0 |
| Campaigns — Delete | 1 | 1 | 0 |
| **Total** | **8** | **8** | **0** |

---

### 1.5 Test Execution Instructions

```bash
# From the project root
cd creconnect-backend

# Ensure .env is configured with a test-accessible PostgreSQL DB
# Run all tests sequentially (--runInBand prevents DB connection conflicts)
npm test
```

All tests run in band (sequentially) as required by the Jest config in `package.json`:
```json
"scripts": {
  "test": "jest --runInBand"
}
```

---

### 1.6 Notes

- **No mocking:** Tests hit a real PostgreSQL 16 database. This ensures that Sequelize migrations and model associations behave exactly as they do in production.
- **JWT tokens** are acquired by the test suite itself (TC-C01 setup logs in both users) to test protected routes correctly.
- **TC-C03** accepts either `201` or `409` because the creator may already exist in the DB from a previous failed teardown — this is intentional defensive testing.
- **Password hashing** in TC-C01 setup uses `bcryptjs` with 12 salt rounds, matching the production auth service.
