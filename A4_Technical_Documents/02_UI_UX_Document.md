# A4 — Technical Documents
## Section 2: UI/UX Document

**Project:** CreConnect — Influencer–Brand Collaboration Platform  
**Frontend Stack:** React 18 (Vite), React Router v6, Axios, Socket.io-client  
**Design Approach:** Component-based SPA with role-separated page trees (Public / Brand / Creator / Admin)  
**Hosting:** `localhost:3000` (development)

---

### 2.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| Role-based layouts | Three distinct navigation shells: Brand sidebar, Creator sidebar, Admin panel |
| Mobile-first | Responsive grid using CSS Flexbox/Grid; breakpoints at 768 px and 1024 px |
| Consistent colour scheme | Brand palette: deep indigo (`#4F46E5`) primary, soft white (`#F9FAFB`) background, slate grey text |
| Minimal loading friction | Optimistic UI updates for messaging; skeleton loaders on dashboard cards |
| Accessibility | Semantic HTML (`<nav>`, `<main>`, `<section>`), ARIA labels on icon-only buttons |

---

### 2.2 Screen Inventory

#### 2.2.1 Public / Unauthenticated Screens

| Screen | File | Route | Purpose |
|--------|------|-------|---------|
| Landing Page | `pages/public/LandingPage.jsx` | `/` | Hero, feature highlights, CTA to register |
| Role Selection | `pages/public/RoleSelectPage.jsx` | `/register` | User chooses Creator or Brand before signup |
| Creator Sign-Up | `pages/public/CreatorSignupPage.jsx` | `/register/creator` | Multi-field form: email, password, username, display name |
| Brand Sign-Up | `pages/public/BrandSignupPage.jsx` | `/register/brand` | Multi-field form: email, password, company name, industry |
| Login | `pages/public/LoginPage.jsx` | `/login` | Email + password, "Forgot password?" link |
| Forgot Password | `pages/public/ForgotPasswordPage.jsx` | `/forgot-password` | Email input → OTP sent |
| Reset Password | `pages/public/ResetPasswordPage.jsx` | `/reset-password` | OTP + new password fields |

---

#### 2.2.2 Brand Screens

| Screen | File | Route | Purpose |
|--------|------|-------|---------|
| Brand Dashboard | `pages/brand/BrandDashboard.jsx` | `/brand/dashboard` | KPI cards (active campaigns, applications, spend), recent activity |
| Campaigns | `pages/brand/Campaigns.jsx` | `/brand/campaigns` | List + create campaigns; filter by status/niche |
| Search Creators | `pages/brand/SearchCreators.jsx` | `/brand/discover` | Filter creators by niche, platform, follower range; AI-match scores shown |
| Collaboration Request | `pages/brand/CollabRequest.jsx` | `/brand/collab/:id` | Send collaboration offer to a creator |
| Collaborations | `pages/brand/BrandCollaborations.jsx` | `/brand/collaborations` | Active / past collabs table; accept/reject applications |
| Messages | `pages/brand/BrandMessages.jsx` | `/brand/messages` | Real-time conversation threads (Socket.io) |
| Notifications | `pages/brand/BrandNotifications.jsx` | `/brand/notifications` | Bell-panel with unread count badge |
| Reminders | `pages/brand/BrandReminders.jsx` | `/brand/reminders` | Deadline reminders per campaign |
| Settings | `pages/brand/BrandSettings.jsx` | `/brand/settings` | Profile edit, password change, notification preferences |
| Activity Log | `pages/brand/BrandActivity.jsx` | `/brand/activity` | Timestamped log of brand actions |
| Portfolio | `pages/brand/BrandPortfolio.jsx` | `/brand/portfolio` | Brand media/past campaign showcase |

---

#### 2.2.3 Creator Screens

| Screen | File | Route | Purpose |
|--------|------|-------|---------|
| Creator Dashboard | `pages/creator/CreatorDashboard.jsx` | `/creator/dashboard` | Earnings summary, open applications, platform stats |
| My Profile | `pages/creator/CreatorProfile.jsx` | `/creator/profile` | Bio, niche tags, social links, media portfolio |
| Creator Info | `pages/creator/CreatorInfo.jsx` | `/creator/info` | View-only public profile as brands see it |
| Find Brands | `pages/creator/FindBrands.jsx` | `/creator/brands` | Browse brands; filter by industry, budget range |
| Browse Campaigns | `pages/creator/CreatorCampaigns.jsx` | `/creator/campaigns` | Discover and apply to open campaigns |
| Collaborations | `pages/creator/Collaborations.jsx` | `/creator/collaborations` | Status tracker: Pending → Active → Completed |
| Messages | `pages/creator/CreatorMessages.jsx` | `/creator/messages` | Real-time messaging with brands |
| Reviews | `pages/creator/Reviews.jsx` | `/creator/reviews` | View star ratings received from brands |
| Notifications | `pages/creator/Notifications.jsx` | `/creator/notifications` | System and brand-action alerts |
| Reminders | `pages/creator/CreatorReminders.jsx` | `/creator/reminders` | Deliverable deadline reminders |
| Report Creator | `pages/creator/ReportCreator.jsx` | `/creator/report/:id` | Flag inappropriate user to admin |

---

#### 2.2.4 Admin Screens

| Folder | Route | Purpose |
|--------|-------|---------|
| `pages/admin/` | `/admin/*` | Admin dashboard, user management, verification queue, reports |

---

### 2.3 Component Library Overview

| Component Group | Folder | Key Components |
|-----------------|--------|----------------|
| Navigation | `components/navigation/` | BrandSidebar, CreatorSidebar, TopNav, MobileDrawer |
| Cards | `components/cards/` | CampaignCard, CreatorCard, StatCard, CollabCard |
| Filters | `components/filters/` | NicheFilter, PlatformFilter, BudgetRangeSlider |
| Common | `components/common/` | Button, Modal, Spinner, Toast, Avatar, Badge |
| Tables | `components/tables/` | DataTable, PaginationBar |
| Notifications | `components/notifications/` | NotificationBell, NotificationPanel |
| Discovery | `components/discovery/` | CreatorGrid, BrandGrid, SearchBar |
| Collaboration | `components/collaboration/` | CollabTimeline, DeliverableChecklist |
| Campaigns | `components/campaigns/` | CampaignForm, CampaignStatusBadge |

---

### 2.4 Key User Flows (Wireframe Descriptions)

#### Flow 1 — Brand Posts a Campaign
```
Landing Page
  └─ [Sign Up as Brand] → BrandSignupPage
       └─ [Verify Email OTP] → LoginPage
            └─ BrandDashboard
                 └─ [+ New Campaign] → CampaignForm (modal/page)
                      └─ Fill: title, niche, budget, platforms, deliverables
                           └─ [Publish] → Campaign appears in creator browse feed
```

#### Flow 2 — Creator Applies to Campaign
```
CreatorDashboard
  └─ [Browse Campaigns] → CreatorCampaigns
       └─ [View Campaign] → CampaignCard expanded
            └─ [Apply] → Application note textarea → Submit
                 └─ Status: "Pending" shown in Collaborations tab
```

#### Flow 3 — Real-Time Messaging
```
Brand selects a creator → CollabRequest sent
  └─ Creator receives notification (Socket.io push)
       └─ Creator opens Messages → new thread appears
            └─ Both parties chat in real time
                 └─ Brand clicks [Mark Complete] → review prompt
```

#### Flow 4 — Admin Approval
```
New user registers → status: PENDING
  └─ Admin receives alert → AdminDashboard verification queue
       └─ [Approve] or [Reject] → User receives email notification
            └─ Approved user can now access full dashboard
```

---

### 2.5 Responsive Layout Notes

| Breakpoint | Layout Behaviour |
|------------|------------------|
| < 768 px (mobile) | Sidebar collapses to bottom tab bar; cards stack single column |
| 768 px – 1024 px (tablet) | Sidebar icons-only (collapsed); cards in 2-column grid |
| > 1024 px (desktop) | Full sidebar with labels; cards in 3–4 column grid |

---

### 2.6 Design Tools

- **Figma** — wireframes and high-fidelity mockups (role-specific flows)
- **Vite** — fast dev server and HMR for iterative UI development
- **CSS Modules / Tailwind** — scoped styling per component

> **Note:** Actual screenshots of the live application should be inserted here. Use browser DevTools (F12 → Device toolbar) to capture mobile and desktop views for the following key screens: Landing, Login, Brand Dashboard, Creator Campaigns, and the Messaging interface.
