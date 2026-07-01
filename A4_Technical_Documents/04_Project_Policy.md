# A4 — Technical Documents
## Section 4: Project Policy

**Project:** CreConnect — Influencer–Brand Collaboration Platform  
**Team Type:** Student project team  
**Version Control:** Git (GitHub)  
**Development Period:** 2025–2026

---

### 4.1 Meeting Schedule

| Meeting Type | Frequency | Day / Time | Platform | Purpose |
|-------------|-----------|------------|----------|---------|
| Sprint Planning | Every 2 weeks (Monday) | Monday, 10:00 AM | In-person / Google Meet | Plan tasks for the upcoming sprint; assign issues |
| Daily Stand-up | Daily (Mon–Fri) | 9:00 AM, 10 min max | WhatsApp group / Meet | What did you do yesterday? What will you do today? Any blockers? |
| Code Review Meeting | Weekly | Wednesday, 2:00 PM | VS Code Live Share | Walk through open PRs; discuss implementation decisions |
| Sprint Retrospective | Every 2 weeks (Friday) | Friday, 4:00 PM | Google Meet | What went well? What to improve? |
| Documentation Review | Monthly | Last Friday of month | In-person | Ensure all documentation is up to date with code changes |

**Stand-up Rules:**
- Maximum 10 minutes; each person has 2 minutes
- Blockers are flagged immediately — do not wait for the next stand-up
- Absences must be notified at least 1 hour in advance via the team WhatsApp group

---

### 4.2 Git Branching Strategy

The project follows a simplified **Git Flow** branching model.

#### 4.2.1 Branch Types

| Branch | Pattern | Purpose | Who Creates It |
|--------|---------|---------|----------------|
| `main` | `main` | Stable, production-ready code | Protected — only merged via PR |
| `develop` | `develop` | Integration branch; latest working code | Team lead maintains |
| Feature branches | `feature/<short-description>` | New features or user stories | Any developer |
| Bug fix branches | `fix/<short-description>` | Bug fixes | Any developer |
| Hotfix branches | `hotfix/<short-description>` | Critical fixes on `main` | Team lead only |
| Release branches | `release/v<x.y>` | Preparing a tagged release | Team lead only |

#### 4.2.2 Branch Naming Examples

```
feature/campaign-create-endpoint
feature/creator-profile-page
fix/jwt-refresh-token-expiry
fix/duplicate-email-409-response
hotfix/auth-middleware-null-crash
release/v1.0
```

#### 4.2.3 Workflow for a New Feature

```
1. Pull latest develop
   git checkout develop
   git pull origin develop

2. Create a feature branch
   git checkout -b feature/your-feature-name

3. Implement and commit (small, atomic commits)
   git add src/controllers/campaigns.controller.js
   git commit -m "feat: add campaign creation endpoint"

4. Push branch and open Pull Request to develop
   git push origin feature/your-feature-name
   → Open PR on GitHub: feature/... → develop

5. PR reviewed and approved → merge via Squash & Merge

6. Delete the feature branch after merge
```

#### 4.2.4 Merge to Main

- `develop` is merged into `main` only at the end of each sprint or for a release
- Requires at least **one approving review** from a team member other than the author
- All CI tests must pass before merge is allowed

---

### 4.3 Code Review Process

#### 4.3.1 Pull Request Rules

| Rule | Detail |
|------|--------|
| Minimum reviewers | 1 (ideally the team member most familiar with the affected module) |
| PR size | Aim for < 400 lines changed; break large features into smaller PRs |
| PR description | Must include: what changed, why, and how to test it |
| Self-review first | Author reviews their own diff before requesting review |
| No force-push on shared branches | `develop` and `main` are protected |
| Tests required | Any new endpoint or service must include or update test cases |
| Lint must pass | `npm run lint` must exit with 0 errors before marking PR ready |

#### 4.3.2 Review Checklist (for Reviewer)

- [ ] Does the code follow the Airbnb style guide?
- [ ] Are all new routes protected with the correct middleware (auth, role-check)?
- [ ] Are inputs validated (using `express-validator` on the backend)?
- [ ] Are errors handled and passed to `next(err)`?
- [ ] Do any SQL queries risk N+1 problems? (Check Sequelize `include` depth)
- [ ] Are secrets hard-coded? (Must use `.env` variables)
- [ ] Are any new environment variables documented in `.env.example`?
- [ ] Do tests cover the happy path and at least one error case?

#### 4.3.3 Review Labels Used on GitHub

| Label | Meaning |
|-------|---------|
| `ready for review` | Author has finished; awaiting reviewer |
| `changes requested` | Reviewer has left comments; author must address |
| `approved` | Reviewer is satisfied; ready to merge |
| `do not merge` | Blocked for external reason (pending decision, dependency) |
| `wip` | Work in progress — not ready for review |

---

### 4.4 Commit Message Policy

Follow the **Conventional Commits** specification:

```
<type>(<optional scope>): <short summary>

[optional body — explain WHY, not what]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature or endpoint |
| `fix` | Bug fix |
| `refactor` | Code change with no behaviour change |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `chore` | Build scripts, dependencies, config |
| `style` | Formatting, linting (no logic change) |

**Examples:**
```
feat(campaigns): add creator apply endpoint
fix(auth): return 409 on duplicate email registration
test(campaigns): add brand create campaign integration test
docs: update API route table in OVERVIEW.md
chore: upgrade sequelize to 6.37.3
```

---

### 4.5 Environment and Secrets Policy

| Rule | Detail |
|------|--------|
| `.env` files must never be committed | `.gitignore` excludes `.env`, `.env.local`, `.env.production` |
| `.env.example` must be kept updated | Any new env variable added must be documented in `.env.example` with a placeholder value |
| Secrets in production | Use the host's environment variable manager (e.g., Railway, Heroku config vars) — never hardcode |
| Database credentials | Must differ between development and production environments |

---

### 4.6 Definition of Done

A task is considered **done** when:

1. Code is implemented and works locally
2. ESLint passes with no errors (`npm run lint`)
3. Relevant tests are written and pass (`npm test`)
4. PR is opened, reviewed, and approved by at least one team member
5. PR is merged into `develop`
6. Any relevant documentation (API docs, README, `.env.example`) is updated

---

### 4.7 Communication Policy

| Channel | Used For |
|---------|----------|
| WhatsApp group | Quick questions, daily stand-up updates, urgent blockers |
| GitHub Issues | Task tracking, bug reports, feature requests |
| GitHub PR comments | Code-specific feedback and discussions |
| Google Meet | Scheduled meetings and code review sessions |
| Email | Formal communications; supervisor correspondence |

**Response time expectation:** Team members should respond to messages within **4 hours** during working hours (9 AM – 6 PM, Mon–Fri).
