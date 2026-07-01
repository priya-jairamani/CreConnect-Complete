# A4 — Technical Documents
## Section 3: Coding Standards

**Project:** CreConnect — Influencer–Brand Collaboration Platform  
**Style Guide:** Airbnb JavaScript Style Guide  
**Linter:** ESLint 8 (configured in `creconnect-backend/`)  
**Formatter:** Prettier (recommended, consistent with Airbnb config)

---

### 3.1 Style Guide Adopted

The project follows the **Airbnb JavaScript Style Guide** — one of the most widely adopted JS/Node.js standards in the industry. ESLint enforces these rules automatically during development.

**ESLint command (backend):**
```bash
npm run lint
# Runs: eslint src/ --ext .js
```

---

### 3.2 Key Rules Enforced

#### 3.2.1 Variable Declarations

| Rule | Standard | Example |
|------|----------|---------|
| Use `const` by default | Always `const` unless reassignment needed | `const router = Router();` |
| Use `let` when reassigning | Avoid `var` entirely | `let campaignId;` |
| No `var` | `var` is banned | ❌ `var x = 1;` → ✅ `const x = 1;` |

#### 3.2.2 Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Variables & functions | `camelCase` | `brandToken`, `createCampaign()` |
| Classes & Models | `PascalCase` | `BrandProfile`, `CreatorProfile` |
| Constants (global) | `UPPER_SNAKE_CASE` | `JWT_SECRET`, `MAX_FILE_SIZE` |
| File names (backend) | `kebab-case` or `camelCase.type.js` | `auth.service.js`, `campaigns.routes.js` |
| File names (frontend) | `PascalCase.jsx` for components | `BrandDashboard.jsx`, `CreatorCard.jsx` |
| Database columns | `camelCase` (Sequelize auto-maps to `snake_case`) | `passwordHash`, `displayName` |

#### 3.2.3 Functions

```js
// Preferred: async/await (not .then().catch())
const getUser = async (id) => {
  const user = await User.findByPk(id);
  return user;
};

// Named functions for services/controllers (not anonymous)
async function handleLogin(req, res, next) { ... }

// Arrow functions for callbacks and inline handlers
router.get('/health', (req, res) => res.json({ status: 'ok' }));
```

#### 3.2.4 Imports and Exports

```js
// CommonJS (backend — Node.js/Express)
const express = require('express');
const { User, BrandProfile } = require('../models');
module.exports = router;

// ES Modules (frontend — React/Vite)
import React from 'react';
import { useNavigate } from 'react-router-dom';
export default BrandDashboard;
```

#### 3.2.5 Error Handling

All async route handlers are wrapped in try/catch and pass errors to Express's `next(err)`:

```js
// Standard pattern used across all controllers
export const createCampaign = async (req, res, next) => {
  try {
    const campaign = await campaignService.create(req.body, req.user.id);
    return res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    next(err);
  }
};
```

A global error handler in `src/middleware/` maps error types to HTTP status codes.

#### 3.2.6 Comments

Comments are used only where the intent is non-obvious. Self-documenting code is preferred:

```js
// ✅ Acceptable — explains a non-obvious constraint
// bcrypt cost factor 12 matches production; do not lower for tests
const hash = await bcrypt.hash(password, 12);

// ❌ Avoid — obvious from the code itself
// Get the user by id
const user = await User.findByPk(id);
```

#### 3.2.7 String Formatting

```js
// Use template literals for interpolation
const msg = `Welcome, ${user.displayName}!`;

// Use single quotes for static strings
const role = 'CREATOR';

// Avoid string concatenation
// ❌ 'Hello ' + name     ✅ `Hello ${name}`
```

#### 3.2.8 Object and Array Destructuring

```js
// ✅ Destructure from req.body and model returns
const { email, password, role } = req.body;
const { id: userId, brandProfile } = await User.findByPk(req.user.id, {
  include: ['brandProfile'],
});
```

---

### 3.3 React / Frontend Standards

| Area | Rule |
|------|------|
| Components | Functional components only — no class components |
| State | `useState`, `useReducer`, `useContext` — no legacy lifecycle methods |
| Side effects | `useEffect` with explicit dependency arrays |
| Props | Destructured in function signature |
| Keys | Unique, stable keys in list renders (`item.id`, not index) |
| API calls | Centralised in `src/services/` or `src/api/` — not inside components |
| Routing | React Router v6 `<Routes>` / `<Route>` with `useNavigate()` |

Example component structure:

```jsx
// ✅ Correct component pattern
const CampaignCard = ({ campaign, onApply }) => {
  const { title, niche, budgetPKR, status } = campaign;

  return (
    <div className="campaign-card">
      <h3>{title}</h3>
      <span>{niche} — PKR {budgetPKR.toLocaleString()}</span>
      {status === 'PUBLISHED' && (
        <button onClick={() => onApply(campaign.id)}>Apply</button>
      )}
    </div>
  );
};

export default CampaignCard;
```

---

### 3.4 Database / Sequelize Standards

| Convention | Example |
|------------|---------|
| Models defined with `sequelize.define()` | `sequelize.define('User', { ... })` |
| Associations declared in `index.js` | `User.hasOne(BrandProfile, { as: 'brandProfile' })` |
| All DB changes via migrations | `database/migrations/` — never alter schema manually |
| Seeds for demo data | `database/seeders/` via `npx sequelize-cli db:seed:all` |
| Timestamps auto-managed | `createdAt`, `updatedAt` via Sequelize defaults |

---

### 3.5 Git Commit Standards

```
feat:     New feature
fix:      Bug fix
refactor: Code change with no functional change
test:     Adding or updating tests
docs:     Documentation only
chore:    Config, dependency, tooling changes
```

Example: `feat: add creator campaign apply endpoint`

---

### 3.6 ESLint Configuration

The project uses ESLint's recommended rules extended with Airbnb base:

```json
// .eslintrc (backend)
{
  "extends": ["airbnb-base"],
  "env": {
    "node": true,
    "es2021": true
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "arrow-body-style": ["error", "as-needed"]
  }
}
```

Running `npm run lint` surfaces violations before code is committed or pushed.
