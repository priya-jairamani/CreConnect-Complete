# A4 — Technical Documents
## Section 5: User Manual

**Project:** CreConnect — Influencer–Brand Collaboration Platform  
**Version:** 1.0  
**Date:** June 2026  
**Audience:** End users (Creators and Brands) and system administrators

---

## Table of Contents

1. [Getting Started — Accessing the Application](#1-getting-started)
2. [Registration](#2-registration)
3. [Login & Password Recovery](#3-login--password-recovery)
4. [Brand — Complete Workflow](#4-brand-workflow)
5. [Creator — Complete Workflow](#5-creator-workflow)
6. [Real-Time Messaging](#6-real-time-messaging)
7. [Notifications](#7-notifications)
8. [Admin Panel](#8-admin-panel)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Getting Started

### 1.1 System Requirements

| Component | Requirement |
|-----------|-------------|
| Browser | Google Chrome 110+, Firefox 110+, Edge 110+, Safari 16+ |
| Internet | Stable connection (required for real-time messaging) |
| Screen | Minimum 360 px wide (mobile supported) |

### 1.2 Accessing the Application

Open your browser and navigate to:

```
http://localhost:3000
```

*(When deployed to a live server, replace with the hosted URL provided by your administrator.)*

You will see the **CreConnect Landing Page** with options to **Sign Up** or **Log In**.

---

## 2. Registration

### 2.1 Choosing Your Role

1. Click **Get Started** or **Sign Up** on the Landing Page.
2. The **Role Selection** screen appears with two options:
   - **I am a Creator** — influencer, content creator, social media personality
   - **I am a Brand** — business, company, or marketing team
3. Click the card that matches your role.

> **Screenshot placeholder:** Role Selection screen showing two cards side by side.

---

### 2.2 Creator Registration

1. After selecting **Creator**, fill in the sign-up form:
   | Field | Description |
   |-------|-------------|
   | Display Name | Your public name shown to brands |
   | Username | Unique handle (letters, numbers, underscores only) |
   | Email Address | Must be a valid email — used for login and notifications |
   | Password | Minimum 8 characters; must include a number and a symbol |

2. Click **Create Account**.
3. Check your email inbox for a **verification email** from CreConnect.
4. Click the link in the email to verify your address.
5. Your account is now **Pending Approval** — an admin will review and activate it.
6. You will receive an email once approved. Then you can log in.

> **Screenshot placeholder:** Creator sign-up form with all fields visible.

---

### 2.3 Brand Registration

1. After selecting **Brand**, fill in the sign-up form:
   | Field | Description |
   |-------|-------------|
   | Company Name | Official business name |
   | Contact Name | Name of the person managing this account |
   | Email Address | Business email preferred |
   | Industry | Select from dropdown (Tech, Fashion, Food, etc.) |
   | Password | Minimum 8 characters; must include a number and a symbol |

2. Click **Create Account**.
3. Verify your email (same process as Creator above).
4. Wait for admin approval email before logging in.

> **Screenshot placeholder:** Brand sign-up form.

---

## 3. Login & Password Recovery

### 3.1 Logging In

1. Click **Log In** on the Landing Page.
2. Enter your **Email Address** and **Password**.
3. Click **Sign In**.
4. You will be redirected to your role-specific dashboard.

> **Screenshot placeholder:** Login screen with email/password fields and Sign In button.

---

### 3.2 Forgot Password

1. On the Login screen, click **Forgot password?** below the password field.
2. Enter your registered email address and click **Send OTP**.
3. Check your email for a 6-digit One-Time Password (OTP).
4. Enter the OTP on the **Verify Code** screen.
5. Enter and confirm your new password.
6. Click **Reset Password**.
7. Log in with your new password.

> **Note:** The OTP expires after a limited time. If it expires, click **Resend OTP**.

---

## 4. Brand Workflow

### 4.1 Brand Dashboard

After login, the **Brand Dashboard** shows:
- **Active Campaigns** — number of campaigns currently running
- **Total Applications** — creators who have applied to your campaigns
- **Total Spend** — budget committed across active campaigns
- **Recent Activity** — a live feed of new applications and messages

> **Screenshot placeholder:** Brand Dashboard with KPI cards and activity feed.

---

### 4.2 Creating a Campaign

1. In the left sidebar, click **Campaigns**.
2. Click the **+ New Campaign** button (top right).
3. Fill in the Campaign Form:

   | Field | Description |
   |-------|-------------|
   | Title | Short, descriptive campaign name |
   | Description | Detailed brief for creators |
   | Objective | Choose: AWARENESS, ENGAGEMENT, SALES, or TRAFFIC |
   | Niche | Category: TECH, FASHION, FOOD, FITNESS, BEAUTY, LIFESTYLE, etc. |
   | Platforms | Select one or more: Instagram, TikTok, YouTube, Twitter, Facebook |
   | Budget Type | FIXED (set amount) or RANGE (min–max) |
   | Budget (PKR) | Amount you are willing to pay per creator |
   | Deliverables | Number of Reels, Posts, Stories, Videos, Livestreams required |
   | Status | DRAFT (save for later) or PUBLISHED (visible to creators immediately) |

4. Click **Publish Campaign**.
5. The campaign appears in the Campaigns list and is discoverable by creators.

> **Screenshot placeholder:** Campaign creation form.

---

### 4.3 Reviewing Creator Applications

1. Click **Collaborations** in the sidebar.
2. Open the **Applications** tab to see who has applied.
3. Each application shows:
   - Creator name and profile photo
   - Their note / pitch
   - Their niche, follower count, and AI match score
4. Click **View Profile** to see the creator's full portfolio.
5. Click **Accept** to start a collaboration, or **Decline** to reject.

> **Screenshot placeholder:** Applications list with Accept/Decline buttons.

---

### 4.4 Searching for Creators

1. Click **Discover Creators** in the sidebar.
2. Use the filter panel on the left:
   - **Niche** — filter by content category
   - **Platform** — Instagram, TikTok, YouTube, etc.
   - **Follower Range** — minimum and maximum followers
3. Results update in real time.
4. Click a creator card to view their full profile.
5. Click **Send Collab Request** to invite them to collaborate.

> **Screenshot placeholder:** Creator search results grid with filter panel.

---

### 4.5 Managing Collaborations

1. Click **Collaborations** → **Active** tab.
2. Each active collaboration shows:
   - Creator name
   - Campaign linked
   - Deliverable checklist (Reels, Posts, etc.)
   - Status: Active / Completed
3. When all deliverables are confirmed, click **Mark as Complete**.
4. You will be prompted to leave a **Star Rating and Review** for the creator.

---

### 4.6 Messaging

See [Section 6 — Real-Time Messaging](#6-real-time-messaging).

---

### 4.7 Brand Settings

1. Click **Settings** in the sidebar.
2. Update your **Company Profile**: name, industry, logo, website.
3. Change your **Password**: enter current password, then new password twice.
4. Manage **Notification Preferences**: toggle email or in-app alerts.
5. Click **Save Changes**.

---

## 5. Creator Workflow

### 5.1 Creator Dashboard

After login, the **Creator Dashboard** shows:
- **Pending Applications** — campaigns you have applied to, awaiting brand response
- **Active Collaborations** — current paid work with brands
- **Total Earnings** — cumulative payments received
- **Platform Stats** — your connected social media follower counts

> **Screenshot placeholder:** Creator Dashboard.

---

### 5.2 Completing Your Profile

A complete profile increases your chances of being discovered by brands.

1. Click **My Profile** in the sidebar.
2. Fill in:
   | Field | Description |
   |-------|-------------|
   | Bio | Short description of your content and style |
   | Niche | Your primary content category |
   | Platforms | Add your Instagram, TikTok, YouTube handles |
   | Location | City / Country |
   | Portfolio Media | Upload images or links to your best content |
3. Click **Save Profile**.

> **Screenshot placeholder:** Creator profile edit page.

---

### 5.3 Browsing and Applying to Campaigns

1. Click **Browse Campaigns** in the sidebar.
2. Filter by:
   - **Niche** — matches your content category
   - **Platform** — platforms you are active on
   - **Budget Range** — minimum campaign budget
3. Click a campaign card to read the full brief.
4. Click **Apply Now**.
5. Write your pitch note (why you are a good fit).
6. Click **Submit Application**.
7. Status appears in your **Collaborations** tab as **Pending**.

> **Screenshot placeholder:** Campaign browse page and apply modal.

---

### 5.4 Tracking Your Collaborations

1. Click **Collaborations** in the sidebar.
2. Tabs: **Pending** | **Active** | **Completed**
3. **Pending** — waiting for brand to accept your application
4. **Active** — accepted; deliverables are due
5. **Completed** — finished work; check for your star rating

---

### 5.5 Finding Brands

1. Click **Find Brands** in the sidebar.
2. Browse brand profiles; filter by **Industry** or **Budget Range**.
3. Click a brand card to view their profile and past campaigns.
4. If they have an open campaign, click **Apply to Campaign** directly from their profile.

---

### 5.6 Reviews

1. Click **Reviews** in the sidebar.
2. View all star ratings and written reviews that brands have left for your completed collaborations.
3. Your average rating is displayed on your public creator profile.

---

### 5.7 Reminders

1. Click **Reminders** in the sidebar.
2. View upcoming deliverable deadlines for your active collaborations.
3. Reminders are also sent via email notification before the due date.

---

## 6. Real-Time Messaging

CreConnect uses **Socket.io** for live, in-app messaging between brands and creators.

### 6.1 Starting a Conversation

**As a Brand:**
1. Go to **Collaborations** → select an active collaboration.
2. Click **Message Creator**.
3. A chat thread opens in the **Messages** section.

**As a Creator:**
1. Go to **Messages** in the sidebar.
2. An unread thread shows a blue dot indicator.
3. Click the thread to open the conversation.

### 6.2 Sending Messages

1. Type your message in the text field at the bottom of the chat window.
2. Press **Enter** or click the **Send** button (paper plane icon).
3. The message appears instantly on both sides (no page refresh needed).

### 6.3 Attachments

- You may share text messages in the chat.
- For file sharing (briefs, contracts), use external tools and paste the share link in the chat.

> **Screenshot placeholder:** Messaging interface with conversation thread and input box.

---

## 7. Notifications

### 7.1 In-App Notifications

- A **bell icon** in the top navigation bar shows your unread notification count (red badge).
- Click the bell to open the **Notification Panel**.
- Notifications include:
  - New application received (brand)
  - Application accepted / rejected (creator)
  - New message received
  - Collaboration marked complete
  - Account approved by admin

### 7.2 Email Notifications

The following events trigger automatic emails:

| Event | Recipient |
|-------|-----------|
| Account registered | User — welcome email with OTP |
| Account approved | User — login invitation |
| New campaign application | Brand |
| Application accepted | Creator |
| New message received (if offline) | Both parties |
| Password reset OTP | User |

---

## 8. Admin Panel

> **Note:** The Admin panel is accessible only to accounts with the ADMIN role. Contact your system administrator for access.

### 8.1 Accessing the Admin Panel

1. Log in with an ADMIN account.
2. You are redirected to the **Admin Dashboard**.

### 8.2 Approving New Users

1. In the sidebar, click **Verification Queue**.
2. New registrations appear with status **PENDING**.
3. Click a user's name to review their details.
4. Click **Approve** to activate the account (user receives email).
5. Click **Reject** to deny access (with optional reason).

### 8.3 Managing Users

1. Click **Users** in the sidebar.
2. Search by name, email, or role.
3. Actions available:
   - **View** — see full user profile
   - **Suspend** — temporarily disable access
   - **Delete** — permanently remove account

### 8.4 Viewing Reports

1. Click **Reports** in the sidebar.
2. View user-submitted reports (inappropriate behaviour, spam).
3. Take action: dismiss the report or suspend/ban the reported user.

### 8.5 Running the AI Recommender

1. Click **AI Matching** in the sidebar.
2. Click **Run AI Engine**.
3. The system computes match scores for all creator–brand pairs and stores results.
4. Brands can now see AI-recommended creators in their **Discover** page.

---

## 9. Troubleshooting

| Problem | Likely Cause | Solution |
|---------|-------------|----------|
| Cannot log in | Wrong password or unverified email | Use **Forgot Password** to reset; check email for verification link |
| Account says "Pending" | Not yet approved by admin | Wait for approval email; contact admin if delayed |
| Messages not arriving | Network connection issue | Refresh the page; check your internet connection |
| Campaign not appearing in creator browse | Campaign is set to DRAFT | Go to Campaigns → Edit → change Status to **PUBLISHED** |
| Forgot OTP and it expired | OTP has a time limit | Click **Resend OTP** on the verification screen |
| Cannot upload profile photo | File too large or wrong format | Use JPG or PNG under 5 MB |
| Application button greyed out | Already applied to this campaign | Check **Collaborations → Pending** for your existing application |

---

*For technical support, contact the CreConnect team at: creconnect2@gmail.com*
