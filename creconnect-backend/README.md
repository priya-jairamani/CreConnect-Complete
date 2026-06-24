# CreConnect Backend

Node.js/Express REST API + WebSocket server for the CreConnect influencer-brand collaboration platform.

---

## 1. Assumed Tech Stack & Why

| Layer | Choice | Reason |
|---|---|---|
| Runtime | **Node.js 20 LTS** | Frontend already calls `localhost:5000`; JS everywhere simplifies the team |
| Framework | **Express 4** | Lightweight, battle-tested, huge middleware ecosystem |
| ORM | **Prisma 5** | Type-safe queries, auto-migrations, great Postgres support |
| Database | **PostgreSQL 16** | Highly relational data (users→profiles→campaigns→collaborations→payments) needs referential integrity and JOINs |
| Real-time | **Socket.io 4** | Frontend already imports `socket.io-client`; namespace support for notifications |
| Auth | **JWT** (access + refresh) | Frontend stores `accessToken`/`refreshToken` in localStorage and sends `Bearer` header |
| File uploads | **Cloudinary** via Multer | CDN delivery, image transformations, free tier sufficient for MVP |
| Email | **Nodemailer** | OTP, verification, password reset |
| Caching / OTP store | **Redis** (optional, graceful fallback) | OTP TTL, future rate-limit store |
| Logging | **Winston** | Structured JSON in production |

---

## 2. API Design

**Base URL:** `http://localhost:5000/api/v1`

All responses follow:
```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": true, "data": [...], "meta": { "page":1, "limit":20, "total":100, "pages":5 } }
{ "success": false, "message": "...", "errors": [...] }
```

### Auth  `/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register creator or brand |
| POST | `/login` | Public | Login, returns `{ user, accessToken, refreshToken, profile }` |
| POST | `/logout` | Bearer | Logout (client clears tokens) |
| POST | `/refresh` | Public | Rotate access + refresh tokens |
| GET | `/me` | Bearer | Current user + profile |
| GET | `/verify-email/:token` | Public | Email verification |
| POST | `/forgot-password` | Public | Send reset email |
| POST | `/reset-password` | Public | Apply new password |
| POST | `/send-otp` | Public | Send 6-digit OTP |
| POST | `/verify-otp` | Public | Verify OTP |
| GET | `/health` | Public | Health check |

### Creators  `/creators`
| Method | Path | Role |
|--------|------|------|
| GET/PATCH | `/me` | CREATOR |
| GET | `/me/stats` | CREATOR |
| GET | `/me/collaborations` | CREATOR |
| GET | `/me/offers` | CREATOR |
| POST | `/me/platforms` | CREATOR |
| DELETE | `/me/platforms/:id` | CREATOR |
| GET | `/:username` | Any authenticated |

### Brands  `/brands`
| Method | Path | Role |
|--------|------|------|
| GET/PATCH | `/me` | BRAND |
| GET | `/me/stats` | BRAND |
| GET | `/me/campaigns` | BRAND |
| GET | `/list` | Any authenticated |

### Campaigns  `/campaigns`
| Method | Path | Role |
|--------|------|------|
| GET | `/` | Any authenticated |
| POST | `/` | BRAND |
| GET/PATCH/DELETE | `/:id` | Any / BRAND |
| POST | `/:id/apply` | CREATOR |
| GET | `/:id/applications` | BRAND |
| PATCH | `/applications/:appId/:action` | BRAND (`accept`/`reject`) |

### Messages  `/messages`
| Method | Path |
|--------|------|
| GET/POST | `/conversations` |
| GET | `/conversations/:id/messages` |
| POST | `/conversations/:id/messages` |

### Notifications  `/notifications`
| Method | Path |
|--------|------|
| GET | `/` |
| GET | `/unread-count` |
| PATCH | `/:id/read` |
| PATCH | `/read-all` |
| DELETE | `/:id` |

### Search  `/search`
`GET /creators`, `/brands`, `/campaigns` — supports `?q=`, `?niche=`, `?page=`, `?limit=`

### Matching  `/matching`
`GET /recommended`, `GET /campaign/:id`

### Analytics  `/analytics`
`GET /brand`, `/creator`, `/admin`

### Payments  `/payments`
`POST /escrow/:collabId`, `POST /release/:paymentId`, `GET /history`

### Upload  `/upload`
`POST /avatar`, `/campaign/:id/asset`, `/chat/:id/attachment`

### Admin  `/admin` (ADMIN role)
`GET/PATCH /users`, `GET /campaigns`, `GET/PATCH /reports`, `POST /announce`, `GET /audit-logs`

---

## 3. Authentication & Authorization

```
Register/Login → { accessToken (15m JWT), refreshToken (7d JWT) }
  ↓
All protected routes: Authorization: Bearer <accessToken>
  ↓
On 401: POST /auth/refresh { refreshToken } → new token pair
  ↓
Logout: client deletes both tokens from localStorage
```

**JWT Payload:**
```json
{ "id": "uuid", "role": "CREATOR|BRAND|ADMIN", "status": "APPROVED", "iat": ..., "exp": ... }
```

**Role middleware:** `authorize('BRAND')` — checks `req.user.role`

**Admin login:** Uses the same `/auth/login` endpoint. A separate admin-specific OTP flow (`/admin/otp`) is available via `/auth/verify-otp`.

---

## 4. Data Persistence

**Database:** PostgreSQL 16  
**ORM:** Prisma with migrations  
**Schema highlights:**

```
User (1) ─── (1) CreatorProfile ─── (N) SocialPlatform
User (1) ─── (1) BrandProfile   ─── (N) Campaign ─── (N) Application
                                              │
                                              └─── (N) Collaboration ─── (N) Payment
CreatorProfile (N) ─── (N) BrandProfile via Conversation ─── (N) Message
User (N) ─── (N) Notification via UserNotification
```

**Running migrations:**
```bash
npx prisma migrate dev --name init     # development
npx prisma migrate deploy              # production
node prisma/seed.js                    # seed admin + demo accounts
```

---

## 5. Folder Structure

```
creconnect-backend/
├── server.js                  # HTTP + Socket.io entry point
├── prisma/
│   ├── schema.prisma          # All models, enums, relations
│   └── seed.js                # Admin + demo data
├── src/
│   ├── app.js                 # Express setup (CORS, middleware, routes)
│   ├── config/
│   │   ├── env.js             # Env validation + export
│   │   ├── db.js              # Prisma singleton
│   │   ├── redis.js           # Redis (optional, graceful fallback)
│   │   └── socket.js          # Socket.io init + emitToUser()
│   ├── middleware/
│   │   ├── auth.js            # authenticate() — verifies Bearer JWT
│   │   ├── authorize.js       # authorize('ROLE') — checks req.user.role
│   │   ├── errorHandler.js    # Global error → JSON response
│   │   ├── rateLimiter.js     # authLimiter (20/15min), apiLimiter (120/min)
│   │   ├── upload.js          # Multer + Cloudinary storages
│   │   └── validate.js        # express-validator result → ValidationError
│   ├── routes/
│   │   ├── index.js           # Aggregates all route modules
│   │   └── *.routes.js        # One file per resource
│   ├── controllers/
│   │   └── *.controller.js    # Thin: calls service, sends response
│   ├── services/
│   │   └── *.service.js       # Business logic, Prisma queries
│   └── utils/
│       ├── jwt.js             # sign/verify access + refresh tokens
│       ├── otp.js             # createOTP / verifyOTP (stored in DB)
│       ├── response.js        # ok(), created(), paginated(), error()
│       ├── pagination.js      # parsePagination(query)
│       ├── logger.js          # Winston instance
│       └── errors.js          # AppError, NotFoundError, etc.
└── tests/
    ├── auth.test.js
    └── campaigns.test.js
```

---

## 6. Security, Testing & Deployment

### Security
- **Helmet** — sets secure HTTP headers (X-Content-Type, CSP, etc.)
- **CORS** — restricted to `FRONTEND_URL` only
- **Rate limiting** — 20 req/15 min on auth routes; 120 req/min globally
- **bcrypt** with cost factor 12 for passwords
- **JWT** — short-lived access tokens (15m), refresh tokens (7d)
- **express-validator** — all user inputs validated and sanitized
- **Prisma parameterized queries** — no raw SQL injection surface
- **env vars** — secrets never committed, validated at startup

### Testing
```bash
npm test           # jest --runInBand (integration tests, real DB)
npm test -- --watch
```
Tests use Supertest against the real app (no mocks). Supply a separate `TEST_DATABASE_URL`.

### Deployment Checklist
1. Set all env vars (see `.env.example`)
2. `npx prisma migrate deploy` (runs pending migrations)
3. `node prisma/seed.js` (first deploy only)
4. `npm start` (or use PM2 / Docker)
5. Reverse-proxy (nginx) in front for SSL termination
6. Health check endpoint: `GET /api/v1/auth/health`

---

## 7. Running Locally

```bash
# 1. Install dependencies
cd creconnect-backend
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Copy and fill env vars
cp .env.example .env
# Edit DATABASE_URL, JWT secrets, etc.

# 4. Start PostgreSQL (Docker example)
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password -e POSTGRES_DB=creconnect postgres:16

# 5. Run migrations + seed
npx prisma migrate dev --name init
node prisma/seed.js

# 6. Start dev server (hot reload)
npm run dev
# → http://localhost:5000/api/v1/auth/health
```

**Production build (Docker):**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npx prisma generate
CMD ["node", "server.js"]
```
```bash
docker build -t creconnect-backend .
docker run -p 5000:5000 --env-file .env creconnect-backend
```

---

## 8. Extending the Backend

| Feature | Where to add |
|---------|-------------|
| New endpoint | `routes/*.routes.js` → `controllers/*.controller.js` → `services/*.service.js` |
| New DB table | `prisma/schema.prisma` → `npx prisma migrate dev --name <name>` |
| Real-time event | `services/*.service.js` calls `emitToUser(userId, 'event', data)` from `config/socket.js` |
| New role | Add to `Role` enum in schema + `authorize('NEW_ROLE')` calls |
| Payment gateway | Add Stripe/PayFast keys to `.env`; extend `payments.service.js` |
| AI copilot | Add `services/ai.service.js` calling OpenAI/Anthropic; wire to a new route |

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@creconnect.pk | Admin@12345 |
| Brand | brand@creconnect.pk | Brand@12345 |
| Creator | creator@creconnect.pk | Creator@12345 |
