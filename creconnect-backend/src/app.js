require('./config/env'); // validates env vars first
const path    = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { FRONTEND_URL, NODE_ENV } = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const paymentsCtrl = require('./controllers/payments.controller');

const app = express();

// ─── Security headers (relaxed for Swagger UI assets) ────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'"],
        styleSrc:    ["'self'", "'unsafe-inline'"],
        imgSrc:      ["'self'", 'data:', 'https:'],
        connectSrc:  ["'self'"],
      },
    },
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.BACKEND_URL,                      // Cloudflare tunnel URL
  ...(process.env.EXTRA_ORIGINS ? process.env.EXTRA_ORIGINS.split(',').map((o) => o.trim()) : []),
].filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server (no origin) and any listed origin
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Vite may pick 3001+ when 3000 is busy — allow any localhost port in dev
    if (NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
    cb(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Stripe webhook (needs the raw body for signature verification —
// must be registered before express.json() consumes the request stream) ───────
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), paymentsCtrl.handleWebhook);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Swagger UI ───────────────────────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CreConnect API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; } .swagger-ui .topbar-wrapper img { display: none; } .swagger-ui .topbar-wrapper::before { content: "CreConnect API"; color: #e94560; font-size: 1.4rem; font-weight: bold; }',
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true, filter: true, tryItOutEnabled: true },
  })
);

// Expose raw OpenAPI JSON for tooling (Postman import, etc.)
app.get('/api/docs.json', (_req, res) => res.json(swaggerSpec));

// ─── Global rate limit ────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Static uploads (local fallback when Cloudinary is not configured) ────────
// Override Helmet's Cross-Origin-Resource-Policy so the frontend (different port)
// can load these images in <img> tags.
app.use('/uploads',
  (_req, res, next) => { res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); next(); },
  express.static(path.join(__dirname, '../uploads'))
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
