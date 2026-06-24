# CreConnect Backend — Complete Code Overview

> Generated: 2026-06-16  
> Stack: Node.js 20 · Express 4 · Prisma 5 · PostgreSQL 16 · Socket.io 4

---

## Table of Contents

1. [Project at a Glance](#1-project-at-a-glance)
2. [Complete File Map](#2-complete-file-map)
3. [Layer Architecture](#3-layer-architecture)
4. [Request Lifecycle (end-to-end)](#4-request-lifecycle-end-to-end)
5. [Authentication Flow](#5-authentication-flow)
6. [Real-time (Socket.io) Flow](#6-real-time-socketio-flow)
7. [Database Schema (all 15 models)](#7-database-schema-all-15-models)
8. [Config Layer — `src/config/`](#8-config-layer--srcconfig)
9. [Utility Layer — `src/utils/`](#9-utility-layer--srcutils)
10. [Middleware Layer — `src/middleware/`](#10-middleware-layer--srcmiddleware)
11. [Service Layer — `src/services/`](#11-service-layer--srcservices)
12. [Controller Layer — `src/controllers/`](#12-controller-layer--srccontrollers)
13. [Route Layer — `src/routes/`](#13-route-layer--srcroutes)
14. [Complete API Reference](#14-complete-api-reference)
15. [Error Handling System](#15-error-handling-system)
16. [File Upload Pipeline](#16-file-upload-pipeline)
17. [Testing Strategy](#17-testing-strategy)
18. [Environment Variables Reference](#18-environment-variables-reference)
19. [Data Flow Examples](#19-data-flow-examples)

---

## 1. Project at a Glance

**What it is:** REST API + WebSocket server for a three-role platform:
- **CREATOR** — influencer who applies to campaigns and gets paid
- **BRAND** — company that creates campaigns and hires creators
- **ADMIN** — platform operator with full moderation access

**Key numbers:**
- 60 source files
- 13 route groups → 50+ HTTP endpoints
- 1 WebSocket namespace (`/notifications`)
- 15 Prisma database models
- 12 services (all business logic lives here)
- 12 controllers (each ~10 lines — just calls service + sends response)
- 6 middleware functions
- 6 utility modules

---

## 2. Complete File Map

```
creconnect-backend/
│
├── server.js                        ← ENTRY POINT — creates HTTP server, attaches Socket.io, connects DB
├── package.json                     ← dependencies, npm scripts
├── .env.example                     ← template for all required environment variables
├── .gitignore
├── README.md                        ← setup guide
├── OVERVIEW.md                      ← THIS FILE
│
├── prisma/
│   ├── schema.prisma                ← ALL 15 database models + enums + relations
│   └── seed.js                      ← creates admin + demo brand + demo creator accounts
│
├── src/
│   ├── app.js                       ← Express app: CORS, Helmet, body parsing, routes, error handler
│   │
│   ├── config/
│   │   ├── env.js                   ← validates .env at startup, exports typed constants
│   │   ├── db.js                    ← Prisma singleton (import this everywhere you need DB)
│   │   ├── redis.js                 ← Redis client (graceful fallback if Redis is absent)
│   │   └── socket.js                ← Socket.io server init, auth middleware, emitToUser()
│   │
│   ├── middleware/
│   │   ├── auth.js                  ← authenticate() — reads Bearer token, sets req.user
│   │   ├── authorize.js             ← authorize('BRAND') — checks req.user.role
│   │   ├── errorHandler.js          ← converts any thrown error → JSON response
│   │   ├── rateLimiter.js           ← authLimiter (20/15min), apiLimiter (120/min)
│   │   ├── upload.js                ← Multer + Cloudinary: uploadAvatar, uploadCampaignAsset, uploadChatAttachment
│   │   └── validate.js              ← reads express-validator result, throws ValidationError
│   │
│   ├── routes/
│   │   ├── index.js                 ← mounts all 12 route files under /api/v1
│   │   ├── auth.routes.js           ← /auth/* (register, login, logout, refresh, me, otp, reset)
│   │   ├── creators.routes.js       ← /creators/* (me, stats, collabs, offers, platforms, public profile)
│   │   ├── brands.routes.js         ← /brands/* (me, stats, campaigns, list)
│   │   ├── campaigns.routes.js      ← /campaigns/* (CRUD, apply, applications, respond)
│   │   ├── messages.routes.js       ← /messages/conversations (list, create, messages)
│   │   ├── notifications.routes.js  ← /notifications (list, unread-count, mark-read, delete)
│   │   ├── search.routes.js         ← /search/creators|brands|campaigns
│   │   ├── matching.routes.js       ← /matching/recommended, /matching/campaign/:id
│   │   ├── analytics.routes.js      ← /analytics/brand|creator|admin
│   │   ├── payments.routes.js       ← /payments/escrow, /release, /history
│   │   ├── upload.routes.js         ← /upload/avatar, /campaign/:id/asset, /chat/:id/attachment
│   │   └── admin.routes.js          ← /admin/users|campaigns|reports|announce|audit-logs
│   │
│   ├── controllers/
│   │   ├── auth.controller.js       ← register, login, logout, refresh, me, verifyEmail, forgotPassword, resetPassword, sendOTP, verifyOTP, health
│   │   ├── creators.controller.js   ← getMe, updateMe, getStats, getCollaborations, getOffers, addPlatform, removePlatform, getPublicProfile
│   │   ├── brands.controller.js     ← getMe, updateMe, getStats, getMyCampaigns, listBrands
│   │   ├── campaigns.controller.js  ← create, list, getById, update, remove, apply, getApplications, respondToApplication
│   │   ├── messages.controller.js   ← getConversations, createConversation, getMessages, sendMessage
│   │   ├── notifications.controller.js ← getAll, getUnreadCount, markRead, markAllRead, deleteOne
│   │   ├── search.controller.js     ← creators, brands, campaigns
│   │   ├── analytics.controller.js  ← brand, creator, admin
│   │   ├── payments.controller.js   ← createEscrow, releasePayment, getHistory
│   │   ├── upload.controller.js     ← uploadAvatar, uploadCampaignAsset, uploadChatAttachment
│   │   └── admin.controller.js      ← listUsers, updateUserStatus, listCampaigns, listReports, resolveReport, announce, getAuditLogs
│   │
│   ├── services/
│   │   ├── auth.service.js          ← register, login, refresh, me, verifyEmail, forgotPassword, resetPassword, OTP
│   │   ├── creators.service.js      ← profile CRUD, stats, collaborations, offers, platforms, public profile
│   │   ├── brands.service.js        ← profile CRUD, stats, campaigns, listing
│   │   ├── campaigns.service.js     ← CRUD, apply, applications, respond (auto-creates Collaboration on accept)
│   │   ├── messages.service.js      ← conversations, messages, participant validation
│   │   ├── notifications.service.js ← DB notifications + Socket.io push via emitToUser()
│   │   ├── search.service.js        ← full-text + filter search for all three resources
│   │   ├── analytics.service.js     ← aggregated stats per role
│   │   ├── payments.service.js      ← escrow creation, payment release, history
│   │   ├── admin.service.js         ← user management, reports, announcements, audit logs
│   │   └── email.service.js         ← Nodemailer: verification, password reset, OTP emails
│   │
│   └── utils/
│       ├── jwt.js                   ← signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
│       ├── otp.js                   ← createOTP (stores in DB), verifyOTP
│       ├── response.js              ← ok(), created(), paginated(), error() — standard JSON shapes
│       ├── pagination.js            ← parsePagination(query) → { page, limit, skip }
│       ├── logger.js                ← Winston: colorized dev, JSON prod
│       └── errors.js                ← AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError
│
└── tests/
    ├── auth.test.js                 ← health check, register, duplicate email, bad login
    └── campaigns.test.js            ← brand creates, creator applies, brand deletes
```

---

## 3. Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│              axios HTTP  +  socket.io-client                     │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP  /  WebSocket
┌────────────────────────▼────────────────────────────────────────┐
│                         server.js                                │
│          http.createServer(app)  +  initSocket(server)           │
└────────┬───────────────────────────────────────┬────────────────┘
         │ HTTP                                   │ WebSocket
┌────────▼──────────┐                  ┌──────────▼──────────────┐
│      src/app.js   │                  │  src/config/socket.js   │
│  Helmet · CORS    │                  │  /notifications ns.      │
│  body-parser      │                  │  auth middleware         │
│  morgan · gzip    │                  │  emitToUser()           │
│  rate limiting    │                  └─────────────────────────┘
│  /api/v1 routes   │
└────────┬──────────┘
         │
┌────────▼──────────────────────────────────────────────────────┐
│                    src/routes/index.js                          │
│          mounts 12 route files under /api/v1                   │
└────────┬──────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────┐
│                 MIDDLEWARE (per-route)                          │
│  rateLimiter → authenticate → authorize → validate → upload    │
└────────┬──────────────────────────────────────────────────────┘
         │  req.user, req.file available here
┌────────▼──────────────────────────────────────────────────────┐
│                     CONTROLLERS                                 │
│  • Extract params/body/query from req                          │
│  • Call exactly ONE service function                           │
│  • Call response helper (ok / created / paginated)             │
│  • Pass errors to next(err)                                    │
└────────┬──────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────┐
│                      SERVICES                                   │
│  • All business logic lives here                               │
│  • Query Prisma, enforce ownership, throw AppErrors            │
│  • Call other services (e.g. notifications.service → socket)   │
└────────┬──────────────────────────────────────────────────────┘
         │
┌────────▼──────────────────────────────────────────────────────┐
│              src/config/db.js  (Prisma Client)                  │
│                      PostgreSQL 16                              │
└────────────────────────────────────────────────────────────────┘

Error path:
  service throws AppError → controller calls next(err)
  → errorHandler middleware → JSON error response
```

---

## 4. Request Lifecycle (end-to-end)

Example: `PATCH /api/v1/creators/me` (creator updates their profile)

```
1. HTTP PATCH /api/v1/creators/me
   │
2. app.js — Helmet sets headers, CORS verified, body parsed
   │
3. apiLimiter — checks 120 req/min, passes
   │
4. routes/index.js → routes/creators.routes.js
   │   router.patch('/me', authenticate, authorize('CREATOR'), ctrl.updateMe)
   │
5. middleware/auth.js — authenticate()
   │   reads "Authorization: Bearer <token>"
   │   calls verifyAccessToken(token)
   │   sets req.user = { id, role, status }
   │
6. middleware/authorize.js — authorize('CREATOR')
   │   checks req.user.role === 'CREATOR', passes
   │
7. controllers/creators.controller.js — updateMe()
   │   calls creators.service.updateMyProfile(req.user.id, req.body)
   │
8. services/creators.service.js — updateMyProfile()
   │   finds CreatorProfile where userId = req.user.id
   │   if not found → throws NotFoundError('Creator profile not found')
   │   calls prisma.creatorProfile.update({ where: { userId }, data })
   │   returns updated profile
   │
9. controller receives result
   │   calls response.ok(res, result, 'Profile updated')
   │
10. HTTP 200 { success: true, message: 'Profile updated', data: { ...profile } }
```

Error variant (not a creator):
```
Step 6 — authorize('CREATOR') sees role = 'BRAND'
  → throws ForbiddenError('You do not have permission...')
  → next(err) → errorHandler → HTTP 403 { success: false, message: '...' }
```

---

## 5. Authentication Flow

```
┌───────────────┐     POST /auth/register        ┌───────────────┐
│               │ ─────────────────────────────► │ auth.service  │
│  React SPA    │   { email, password, role }     │               │
│               │                                 │ 1. check dupe │
│               │ ◄───────────────────────────── │ 2. bcrypt(12) │
│               │   201 { user }                  │ 3. create User│
└───────────────┘                                 │ 4. send email │
                                                  └───────────────┘

┌───────────────┐     POST /auth/login            ┌───────────────┐
│               │ ─────────────────────────────► │ auth.service  │
│  React SPA    │   { email, password }           │               │
│               │                                 │ 1. find user  │
│               │ ◄───────────────────────────── │ 2. bcrypt.cmp │
│               │   200 {                         │ 3. sign tokens│
│               │     user,                       └───────────────┘
│               │     accessToken  (15m JWT),
│               │     refreshToken (7d JWT),
│               │     profile
│               │   }
└─┬─────────────┘
  │ stores in localStorage:
  │  accessToken, refreshToken, userId, cc_user
  │
  │  Every subsequent request:
  │  Authorization: Bearer <accessToken>
  │
  ▼
┌───────────────┐   POST /auth/refresh            ┌───────────────┐
│  (on 401)     │ ─────────────────────────────► │               │
│               │   { refreshToken }              │ verifies 7d   │
│               │ ◄───────────────────────────── │ issues new    │
│               │   { accessToken, refreshToken } │ token pair    │
└───────────────┘                                 └───────────────┘

JWT payload structure:
  Access token:   { id, role, status, iat, exp (15m) }
  Refresh token:  { id, iat, exp (7d) }

Secrets:
  JWT_ACCESS_SECRET   → signs access tokens
  JWT_REFRESH_SECRET  → signs refresh tokens (different secret = more secure)
```

---

## 6. Real-time (Socket.io) Flow

```
Frontend (NotificationContext.jsx):
  const socket = io('http://localhost:5000/notifications', {
    auth: { token: accessToken }
  })

                              ┌─────────────────────────────┐
                              │   src/config/socket.js      │
                              │                             │
  connect ──────────────────► │ middleware: verifyAccessToken│
                              │ socket.user = { id, role }  │
                              │ socket.join(`user:${id}`)   │
                              └──────────────┬──────────────┘
                                             │
  Backend service (e.g. campaign accepted):  │
    notifications.service.push(              │
      [creatorUserId],                       │
      'Your application was accepted!'       │
    )                                        │
    ↓                                        │
    prisma: create Notification + UserNotification
    ↓                                        │
    emitToUser(creatorUserId, 'notification', { id, message, createdAt })
    ↓                                        │
    emitToUser(creatorUserId, 'unread-count', { count })
                                             │
                              ┌──────────────▼──────────────┐
  Frontend receives:          │  io.of('/notifications')    │
    socket.on('notification') │  .to(`user:${userId}`)      │
    socket.on('unread-count') │  .emit(event, data)         │
                              └─────────────────────────────┘
```

---

## 7. Database Schema (all 15 models)

### Entity Relationship Diagram

```
┌──────────┐         ┌─────────────────┐        ┌────────────────┐
│   User   │ 1───1   │ CreatorProfile  │ 1───N  │ SocialPlatform │
│──────────│         │─────────────────│        └────────────────┘
│ id (PK)  │         │ id              │
│ email    │         │ userId (FK)     │        ┌────────────────┐
│ passHash │         │ username        │ 1───N  │  Collaboration │
│ role     │         │ displayName     │        │────────────────│
│ status   │         │ niche           │        │ campaignId(FK) │
│ emailVer │         │ followerCount   │        │ creatorId (FK) │
│ emailTok │         │ engagementRate  │        │ brandId  (FK)  │
│ resetTok │         │ rating          │        │ status         │
└──────────┘         └─────────────────┘        │ stage          │
     │ 1───1                 │ N───N             │ paymentStatus  │
     │               via Conversation            └───────┬────────┘
     │          ┌─────────────────┐                      │ 1───N
     │ 1───1    │  BrandProfile   │             ┌────────▼───────┐
     │          │─────────────────│             │    Payment     │
     │          │ id              │             │────────────────│
     │          │ userId (FK)     │             │ amountPKR      │
     │          │ companyName     │             │ status         │
     │          │ industry        │             │ releasedAt     │
     │          │ logoUrl         │             └────────────────┘
     │          └─────────────────┘
     │                 │ 1───N
     │                 │
     │          ┌──────▼──────────┐
     │          │    Campaign     │
     │          │─────────────────│
     │          │ id              │
     │          │ brandId (FK)    │
     │          │ title           │
     │          │ objective       │
     │          │ niche           │
     │          │ budgetType      │
     │          │ budgetPKR       │
     │          │ deliverables    │
     │          │ status          │
     │          └──────┬──────────┘
     │                 │ 1───N
     │          ┌──────▼──────────┐
     │          │  Application    │
     │          │─────────────────│
     │          │ campaignId (FK) │
     │          │ creatorId (FK)  │
     │          │ status          │
     │          └─────────────────┘
     │
     │ 1───N  ┌─────────────────────┐
     │        │   UserNotification   │ N───1 ┌──────────────┐
     │        │─────────────────────│       │ Notification │
     │        │ userId (FK)         │       │──────────────│
     │        │ notificationId (FK) │       │ message      │
     │        │ isRead              │       │ audience     │
     │        └─────────────────────┘       │ status       │
     │                                      └──────────────┘
     │ 1───N  ┌──────────┐
     │        │  Report  │
     │        │──────────│
     │        │ reporter │
     │        │ reported │
     │        │ violation│
     │        └──────────┘
     │
     │ 1───N  ┌──────────┐     ┌─────────────────┐
     │        │AuditLog  │     │      OTP        │
     │        │──────────│     │─────────────────│
     └────────│ userId   │     │ email           │
              │ action   │     │ code (6-digit)  │
              │ entity   │     │ expiresAt       │
              └──────────┘     │ used            │
                               └─────────────────┘
```

### Enums Reference

| Enum | Values |
|------|--------|
| Role | CREATOR, BRAND, ADMIN |
| UserStatus | PENDING, APPROVED, REJECTED, SUSPENDED |
| Platform | INSTAGRAM, TIKTOK, YOUTUBE, TWITTER, FACEBOOK, LINKEDIN, SNAPCHAT |
| Niche | FASHION, BEAUTY, GAMING, TECH, FITNESS, FOOD, LIFESTYLE, TRAVEL, EDUCATION, FINANCE |
| BrandSize | STARTUP, GROWING, ENTERPRISE |
| CampaignObjective | AWARENESS, ENGAGEMENT, CONVERSIONS, LAUNCH |
| BudgetType | FIXED, MILESTONE, PERFORMANCE |
| CampaignStatus | DRAFT, PUBLISHED, PAUSED, COMPLETED |
| CollabStage | INQUIRY, NEGOTIATION, CONTRACTED, IN_PROGRESS, DELIVERED, COMPLETED |
| CollabStatus | PENDING, ACCEPTED, REJECTED, COMPLETED |
| PaymentStatus | PENDING, ESCROW, RELEASED, PAID |
| Priority | LOW, MEDIUM, HIGH |

---

## 8. Config Layer — `src/config/`

### `env.js`
- Runs `require('dotenv').config()` so it must be imported first (`require('./config/env')` at top of `app.js`)
- Validates that `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` exist — throws on startup if missing
- Exports typed constants (`PORT` as int, `IS_PROD` as bool, etc.)

### `db.js`
```js
const prisma = new PrismaClient({ log: [...] })
module.exports = prisma  // singleton — import wherever you need DB
```
- Every service imports this directly: `const prisma = require('../config/db')`
- Query logging in dev, errors-only in production

### `redis.js`
- Uses `ioredis` with `lazyConnect: true` and `enableOfflineQueue: false`
- Calls `redis.connect().catch(() => {})` — if Redis is down, the app still starts
- Currently used for: OTP TTL (future), rate-limit store (future)
- If Redis is absent: OTP falls back to DB table, rate-limiter uses in-memory

### `socket.js`
Three exports:
| Export | Purpose |
|--------|---------|
| `initSocket(httpServer)` | Called once in `server.js`. Sets up Socket.io with CORS, registers `/notifications` namespace with JWT auth middleware |
| `getIO()` | Returns the `io` instance (throws if not initialised) |
| `emitToUser(userId, event, data)` | Called from services to push real-time events to a specific user's socket room |

---

## 9. Utility Layer — `src/utils/`

### `errors.js` — Custom error class hierarchy
```
Error
  └── AppError(message, statusCode)          ← base: sets isOperational = true
        ├── NotFoundError                     ← 404
        ├── ValidationError(msg, errors[])   ← 422, carries field-level errors array
        ├── UnauthorizedError                 ← 401
        ├── ForbiddenError                    ← 403
        └── ConflictError                     ← 409
```
Usage: `throw new NotFoundError('Campaign not found')` — errorHandler converts to JSON.

### `response.js` — Standard response shapes
```js
ok(res, data, message, statusCode=200)          // { success: true, message, data }
created(res, data, message)                      // 201 wrapper
paginated(res, data, { page, limit, total })     // adds meta.pages
error(res, message, statusCode, errors)          // { success: false, ... }
```

### `jwt.js`
```js
signAccessToken(payload)   // signs with JWT_ACCESS_SECRET, 15m expiry
signRefreshToken(payload)  // signs with JWT_REFRESH_SECRET, 7d expiry
verifyAccessToken(token)   // throws JsonWebTokenError if invalid
verifyRefreshToken(token)  // throws JsonWebTokenError if invalid
```

### `otp.js`
```js
createOTP(email)            // invalidates old codes, creates 6-digit code, stores in OTP table
verifyOTP(email, code)      // checks DB, marks used, returns true/false
```
OTP TTL: 10 minutes. Stored in DB `otps` table (not Redis) for reliability.

### `pagination.js`
```js
parsePagination(query, defaultLimit=20)
  → { page, limit, skip }
  // page min=1, limit min=1 max=100
  // skip = (page-1) * limit  →  fed directly to prisma.findMany({ skip, take: limit })
```

### `logger.js`
- Development: colorized `timestamp LEVEL: message` via `morgan`-style format
- Production: JSON lines to stdout + `logs/error.log`
- All services/config import this instead of `console.log`

---

## 10. Middleware Layer — `src/middleware/`

### `auth.js` — `authenticate()`
```
Request header:  Authorization: Bearer eyJhbGc...
                                         │
                          verifyAccessToken()
                                         │
                    req.user = { id, role, status }
                                         │
                              next() or 401
```

### `authorize.js` — `authorize(...roles)`
```js
router.patch('/me', authenticate, authorize('CREATOR'), ctrl.updateMe)
//                                 ↑
//          checks req.user.role === 'CREATOR', else ForbiddenError(403)
```
Accepts multiple roles: `authorize('ADMIN', 'BRAND')`

### `errorHandler.js`
```
thrown error
    ├── ValidationError  → 422 + errors[] array
    ├── AppError         → statusCode from error
    ├── Prisma P2002     → 409 "X already exists"
    ├── Prisma P2025     → 404 "Record not found"
    └── anything else    → 500 "Internal server error" + logger.error
```

### `rateLimiter.js`
| Limiter | Window | Max | Applied to |
|---------|--------|-----|-----------|
| `authLimiter` | 15 min | 20 requests | All `/auth/*` routes |
| `apiLimiter` | 1 min | 120 requests | All `/api/*` routes (global) |

### `upload.js`
Three Multer instances, each with a different Cloudinary folder:
| Instance | Folder | Size Limit | Used on |
|----------|--------|-----------|---------|
| `uploadAvatar` | `creconnect/avatars` | 5 MB | `POST /upload/avatar` |
| `uploadCampaignAsset` | `creconnect/campaigns` | 20 MB | `POST /upload/campaign/:id/asset` |
| `uploadChatAttachment` | `creconnect/chat` | 10 MB | `POST /upload/chat/:id/attachment`, `POST /messages/conversations/:id/messages` |

After upload: `req.file.path` = Cloudinary CDN URL.

### `validate.js`
```js
// Usage in route:
router.post('/register',
  [body('email').isEmail(), body('password').isLength({ min: 8 })],
  validate,   // ← this middleware
  ctrl.register
)
// If invalid → throws ValidationError → errorHandler → 422 + field errors
```

---

## 11. Service Layer — `src/services/`

> **Rule:** Controllers call services. Services contain ALL business logic. Services call Prisma. Services may call other services. Services throw AppErrors.

### `auth.service.js`
| Function | What it does |
|----------|-------------|
| `register(data)` | Checks dupe email, bcrypt hashes password, creates User + profile in one Prisma transaction, sends verification email |
| `login({ email, password })` | Finds user, compares hash, checks status !== SUSPENDED, signs token pair |
| `refresh(token)` | Verifies refresh token, re-issues both tokens |
| `me(userId)` | Fetches user + all profile types, strips sensitive fields |
| `verifyEmail(token)` | Finds user by emailToken, sets emailVerified=true, status=APPROVED |
| `forgotPassword(email)` | Silent if not found (prevents enumeration), creates reset token (1h TTL), sends email |
| `resetPassword(token, newPassword)` | Validates token expiry, bcrypt hashes, clears reset fields |
| `sendOTPService(email)` | Calls `createOTP` → `sendOTP` email |
| `verifyOTPService(email, code)` | Calls `verifyOTP`, throws if false |

### `creators.service.js`
| Function | Notes |
|----------|-------|
| `getMyProfile(userId)` | Includes user + platforms |
| `updateMyProfile(userId, data)` | Ownership checked by userId FK |
| `getStats(userId)` | Counts total + completed collabs |
| `getMyCollaborations(userId, query)` | Filterable by status, paginated |
| `getMyOffers(userId)` | Pending applications with campaign + brand data |
| `addPlatform(userId, data)` | Finds creator by userId, creates SocialPlatform |
| `removePlatform(userId, platformId)` | Asserts platform belongs to this creator |
| `getPublicProfile(username)` | By username field, includes platforms |

### `brands.service.js`
| Function | Notes |
|----------|-------|
| `getMyCampaigns(userId, query)` | Includes `_count` of applications + collaborations |
| `listBrands(query)` | Supports `?q=` text search, `?industry=` filter |

### `campaigns.service.js`
| Function | Notes |
|----------|-------|
| `create(userId, data)` | Asserts user has BrandProfile, creates Campaign |
| `list(query)` | Defaults to `status: PUBLISHED`, supports niche/objective/q filters |
| `apply(campaignId, userId, note)` | Asserts user has CreatorProfile, creates Application (unique per creator+campaign) |
| `respondToApplication(appId, action, userId)` | **On accept:** automatically creates a Collaboration record |
| `_assertOwner(campaignId, userId)` | Private helper: verifies campaign.brand.userId === userId |

### `messages.service.js`
| Function | Notes |
|----------|-------|
| `createConversation` | Uses Prisma `upsert` on `[creatorId, brandId]` unique — idempotent |
| `sendMessage` | Validates participant, creates Message, updates `Conversation.lastMessage` |
| `_assertParticipant` | Ensures requester is either the creator or brand in the conversation |

### `notifications.service.js`
| Function | Notes |
|----------|-------|
| `push(userIds, message, audience)` | Creates Notification + UserNotification records, then calls `emitToUser()` for real-time delivery |
| `getUnreadCount(userId)` | Used both in REST endpoint AND emitted via socket after each push |

### `search.service.js`
All three functions (`searchCreators`, `searchBrands`, `searchCampaigns`) use Prisma's `contains` + `mode: 'insensitive'` for case-insensitive full-text search. Support `?q=`, `?page=`, `?limit=` plus resource-specific filters.

### `analytics.service.js`
Uses Prisma `groupBy` and `aggregate` — no raw SQL. Returns grouped counts/sums per status.

### `payments.service.js`
Simple escrow model: `PENDING → ESCROW → RELEASED`. No real payment gateway wired yet — add Stripe/PayFast in this file.

### `admin.service.js`
`announce(message, audience)` — fetches all user IDs matching audience role, calls `notifications.service.push()` for broadcast.

### `email.service.js`
All sends are fire-and-forget (no `await` throw to caller). If SMTP config missing, logs a warning and skips — app never crashes on email failure.

---

## 12. Controller Layer — `src/controllers/`

Controllers are intentionally thin. The pattern is always:

```js
const doSomething = async (req, res, next) => {
  try {
    const result = await service.doSomething(req.user.id, req.params.id, req.body);
    ok(res, result, 'Success message');
  } catch (err) {
    next(err);  // ← errorHandler takes it from here
  }
};
```

Never put business logic in controllers. If you need to add a feature, add it to the service.

---

## 13. Route Layer — `src/routes/`

### `index.js` — Master mount point
```js
app.use('/api/v1', routes)   // in app.js

// routes/index.js:
router.use('/auth',          require('./auth.routes'));
router.use('/creators',      require('./creators.routes'));
router.use('/brands',        require('./brands.routes'));
router.use('/campaigns',     require('./campaigns.routes'));
router.use('/messages',      require('./messages.routes'));
router.use('/notifications', require('./notifications.routes'));
router.use('/search',        require('./search.routes'));
router.use('/matching',      require('./matching.routes'));
router.use('/analytics',     require('./analytics.routes'));
router.use('/payments',      require('./payments.routes'));
router.use('/upload',        require('./upload.routes'));
router.use('/admin',         require('./admin.routes'));
```

### Middleware stacking pattern
```js
// Public
router.get('/health', ctrl.health)

// Authenticated only
router.get('/me', authenticate, ctrl.getMe)

// Role-restricted
router.post('/', authenticate, authorize('BRAND'), ctrl.create)

// With validation
router.post('/register', authLimiter, [body('email').isEmail()], validate, ctrl.register)

// With file upload
router.post('/avatar', uploadAvatar.single('avatar'), ctrl.uploadAvatar)
```

---

## 14. Complete API Reference

### `/api/v1/auth`
| Method | Path | Auth | Body / Params | Response |
|--------|------|------|---------------|----------|
| GET | `/health` | None | — | `{ status: 'ok', timestamp }` |
| POST | `/register` | None | `email, password, role, username?/companyName?` | 201 `{ user }` |
| POST | `/login` | None | `email, password` | 200 `{ user, accessToken, refreshToken, profile }` |
| POST | `/logout` | Bearer | — | 200 |
| POST | `/refresh` | None | `{ refreshToken }` | 200 `{ accessToken, refreshToken }` |
| GET | `/me` | Bearer | — | 200 `{ user, profile }` |
| GET | `/verify-email/:token` | None | URL param | 200 |
| POST | `/forgot-password` | None | `{ email }` | 200 (silent) |
| POST | `/reset-password` | None | `{ token, password }` | 200 |
| POST | `/send-otp` | None | `{ email }` | 200 |
| POST | `/verify-otp` | None | `{ email, code }` | 200 |

### `/api/v1/creators`
| Method | Path | Role | Notes |
|--------|------|------|-------|
| GET | `/me` | CREATOR | Full profile + platforms |
| PATCH | `/me` | CREATOR | Partial update |
| GET | `/me/stats` | CREATOR | Collab counts, follower/engagement |
| GET | `/me/collaborations` | CREATOR | Paginated, `?status=` filter |
| GET | `/me/offers` | CREATOR | Pending applications |
| POST | `/me/platforms` | CREATOR | `{ name, handle, url, followerCount }` |
| DELETE | `/me/platforms/:id` | CREATOR | — |
| GET | `/:username` | Any | Public profile |

### `/api/v1/brands`
| Method | Path | Role |
|--------|------|------|
| GET | `/me` | BRAND |
| PATCH | `/me` | BRAND |
| GET | `/me/stats` | BRAND |
| GET | `/me/campaigns` | BRAND |
| GET | `/list` | Any |

### `/api/v1/campaigns`
| Method | Path | Role | Notes |
|--------|------|------|-------|
| GET | `/` | Any | `?q=&niche=&objective=&status=&page=&limit=` |
| POST | `/` | BRAND | Full campaign object |
| GET | `/:id` | Any | With brand + counts |
| PATCH | `/:id` | BRAND | Owner only |
| DELETE | `/:id` | BRAND | Owner only |
| POST | `/:id/apply` | CREATOR | `{ note }` |
| GET | `/:id/applications` | BRAND | Owner only, paginated |
| PATCH | `/applications/:appId/:action` | BRAND | action = `accept` or `reject` |

### `/api/v1/messages`
| Method | Path | Notes |
|--------|------|-------|
| GET | `/conversations` | All conversations for current user |
| POST | `/conversations` | `{ otherUserId }` — idempotent |
| GET | `/conversations/:id/messages` | Paginated, 50/page default |
| POST | `/conversations/:id/messages` | `{ content }` + optional `attachment` file |

### `/api/v1/notifications`
| Method | Path |
|--------|------|
| GET | `/` |
| GET | `/unread-count` |
| PATCH | `/:id/read` |
| PATCH | `/read-all` |
| DELETE | `/:id` |

### `/api/v1/search`
All accept `?q=&page=&limit=` plus resource-specific filters:

| Path | Extra filters |
|------|---------------|
| `/creators` | `?niche=&minFollowers=&maxFollowers=&minEngagement=&sort=engagement` |
| `/brands` | `?industry=` |
| `/campaigns` | `?niche=&objective=` |

### `/api/v1/matching`
| Path | Notes |
|------|-------|
| `/recommended` | Brand → top-rated creators; Creator → latest campaigns |
| `/campaign/:id` | Creators matching campaign's follower/engagement/niche criteria |

### `/api/v1/analytics`
| Path | Role | Returns |
|------|------|---------|
| `/brand` | BRAND | Campaign status breakdown, pending applications |
| `/creator` | CREATOR | Collab status breakdown, total earnings PKR |
| `/admin` | ADMIN | Platform-wide user/campaign/payment aggregates |

### `/api/v1/payments`
| Method | Path | Role |
|--------|------|------|
| POST | `/escrow/:collabId` | BRAND |
| POST | `/release/:paymentId` | BRAND |
| GET | `/history` | Any |

### `/api/v1/upload`
All require `multipart/form-data`:
| Path | Field name | Max size |
|------|-----------|---------|
| `/avatar` | `avatar` | 5 MB |
| `/campaign/:id/asset` | `asset` | 20 MB |
| `/chat/:id/attachment` | `attachment` | 10 MB |

### `/api/v1/admin` (ADMIN only)
| Method | Path | Notes |
|--------|------|-------|
| GET | `/users` | `?role=&status=&q=&page=` |
| PATCH | `/users/:id/status` | `{ status: 'APPROVED'|'SUSPENDED'|... }` |
| GET | `/campaigns` | `?status=&page=` |
| GET | `/reports` | `?status=OPEN|RESOLVED|DISMISSED` |
| PATCH | `/reports/:id/:action` | action = `resolve` or `dismiss`, `{ resolution }` |
| POST | `/announce` | `{ message, audience: 'ALL'|'CREATORS'|'BRANDS' }` |
| GET | `/audit-logs` | Paginated |

---

## 15. Error Handling System

```
Any code in services:
  throw new NotFoundError('Campaign not found')
                    │
              caught by controller:
  catch (err) { next(err) }
                    │
         ┌──────────▼─────────────────┐
         │     errorHandler.js        │
         │                            │
         │  ValidationError (422)     │  → { success:false, message, errors:[] }
         │  AppError (any status)     │  → { success:false, message }
         │  Prisma P2002 (409)        │  → { success:false, message: "X already exists" }
         │  Prisma P2025 (404)        │  → { success:false, message: "Record not found" }
         │  Unknown (500)             │  → { success:false, message: "Internal server error" }
         │                            │     + logger.error (stack trace in logs)
         └────────────────────────────┘
```

**Important:** 500 errors log the full stack trace but never expose it to the client.

---

## 16. File Upload Pipeline

```
Client: multipart/form-data POST /api/v1/upload/avatar
                    │
         middleware/upload.js
         uploadAvatar.single('avatar')
                    │
         Multer reads file from request
                    │
         CloudinaryStorage streams to:
         cloud_name/creconnect/avatars/<filename>
                    │
         req.file = {
           path: 'https://res.cloudinary.com/.../avatar.jpg',
           filename: 'creconnect/avatars/...',
           ...
         }
                    │
         controllers/upload.controller.js
         url = req.file.path
                    │
         Prisma: creatorProfile.update({ avatarUrl: url })
                    │
         Response: { url: 'https://res.cloudinary.com/...' }
```

---

## 17. Testing Strategy

**Type:** Integration tests (Supertest + real database)

**Why not mocks?** The app's correctness depends on Prisma's actual SQL — mocking it would create false confidence.

**Test files:**
```
tests/auth.test.js
  ✓ GET /api/v1/auth/health → 200
  ✓ POST /api/v1/auth/register (creator) → 201
  ✓ POST /api/v1/auth/register (duplicate email) → 409
  ✓ POST /api/v1/auth/login (wrong password) → 401

tests/campaigns.test.js
  ✓ Brand creates campaign → 201
  ✓ Get campaign by id → 200
  ✓ Creator applies → 201 (or 409 if already applied)
  ✓ Brand deletes campaign → 200
```

**Run:**
```bash
npm test                   # runs both files
npm test -- auth           # runs only auth.test.js
npm test -- --watch        # watch mode
```

**Setup needed:** A real Postgres DB accessible during tests. The `afterAll` hook cleans up test records.

---

## 18. Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Controls logging, error verbosity |
| `PORT` | No | `5000` | HTTP server port |
| `DATABASE_URL` | **YES** | — | PostgreSQL connection string |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis URL (app works without it) |
| `JWT_ACCESS_SECRET` | **YES** | — | Min 32 chars. Signs access tokens |
| `JWT_REFRESH_SECRET` | **YES** | — | Min 32 chars. Signs refresh tokens (use different value) |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `SMTP_HOST` | No | — | Email host. If absent, emails are logged only |
| `SMTP_PORT` | No | `587` | |
| `SMTP_USER` | No | — | |
| `SMTP_PASS` | No | — | |
| `EMAIL_FROM` | No | `CreConnect <no-reply@creconnect.pk>` | |
| `CLOUDINARY_CLOUD_NAME` | No | — | Required for file uploads |
| `CLOUDINARY_API_KEY` | No | — | |
| `CLOUDINARY_API_SECRET` | No | — | |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS allow-origin + email links |
| `ADMIN_EMAIL` | No | `admin@creconnect.pk` | Used by `seed.js` only |
| `ADMIN_PASSWORD` | No | `Admin@12345` | Used by `seed.js` only |

---

## 19. Data Flow Examples

### Flow A: Brand creates a campaign and a creator applies

```
1. Brand: POST /campaigns
   → campaigns.service.create(userId, data)
   → Prisma: find BrandProfile, create Campaign { status: DRAFT }
   → 201 Campaign

2. Brand: PATCH /campaigns/:id  { status: 'PUBLISHED' }
   → campaigns.service.update(id, userId, { status: 'PUBLISHED' })
   → 200 Campaign (now visible in /search/campaigns)

3. Creator: GET /search/campaigns?niche=TECH
   → search.service.searchCampaigns({ niche: 'TECH' })
   → Prisma: findMany where status=PUBLISHED, niche=TECH
   → paginated list

4. Creator: POST /campaigns/:id/apply  { note: 'I am perfect!' }
   → campaigns.service.apply(campaignId, creatorUserId, note)
   → Prisma: find CreatorProfile, create Application { status: PENDING }
   → 201 Application

5. Brand: GET /campaigns/:id/applications
   → campaigns.service.getApplications(campaignId, brandUserId, query)
   → Prisma: applications where campaignId, includes creator + platforms
   → paginated list

6. Brand: PATCH /campaigns/applications/:appId/accept
   → campaigns.service.respondToApplication(appId, 'accept', brandUserId)
   → Prisma: Application { status: ACCEPTED }
   → Prisma: create Collaboration { status: ACCEPTED, stage: INQUIRY }
   → notifications.service.push([creatorUserId], 'Your application was accepted!')
   → Socket.io: emitToUser(creatorUserId, 'notification', {...})
   → Socket.io: emitToUser(creatorUserId, 'unread-count', { count: 1 })
```

### Flow B: Admin suspends a user

```
1. Admin: PATCH /admin/users/:id/status  { status: 'SUSPENDED' }
   → admin.service.updateUserStatus(id, 'SUSPENDED')
   → Prisma: user.update { status: SUSPENDED }
   → 200 updated user

2. Suspended user next request:
   → POST /auth/login
   → auth.service.login checks user.status === 'SUSPENDED'
   → throw UnauthorizedError('Account suspended')
   → 401 { success: false, message: 'Account suspended' }
```

### Flow C: Token refresh

```
1. Frontend interceptor catches 401 from any API call
2. POST /auth/refresh { refreshToken }
   → auth.service.refresh(token)
   → verifyRefreshToken(token) — validates 7d JWT
   → prisma.user.findUnique(id) — confirms user still exists
   → signAccessToken({ id, role, status }) — new 15m token
   → signRefreshToken({ id }) — new 7d token (rotation)
   → 200 { accessToken, refreshToken }
3. Frontend retries original failed request with new accessToken
```
