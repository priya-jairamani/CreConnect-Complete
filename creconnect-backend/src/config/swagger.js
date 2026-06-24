const swaggerJsdoc = require('swagger-jsdoc');
const { PORT, FRONTEND_URL } = require('./env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CreConnect API',
      version: '1.0.0',
      description: `
## CreConnect — Influencer-Brand Collaboration Platform

REST API powering the CreConnect platform. Three user roles:
- **CREATOR** — influencer who applies to campaigns and gets paid
- **BRAND** — company that creates campaigns and hires creators
- **ADMIN** — platform operator with full moderation access

### Authentication
All protected endpoints require a **Bearer JWT** in the \`Authorization\` header.
Obtain tokens via \`POST /auth/login\`. Refresh with \`POST /auth/refresh\`.
      `,
      contact: { name: 'CreConnect Dev', email: 'creconnect2@gmail.com' },
    },
    servers: [
      { url: `http://localhost:${PORT || 5000}/api/v1`, description: 'Local development' },
      { url: `${FRONTEND_URL || 'https://api.creconnect.pk'}/api/v1`, description: 'Production' },
    ],
    tags: [
      { name: 'Auth',          description: 'Registration, login, token refresh, OTP, password reset' },
      { name: 'Creators',      description: 'Creator profile, platforms, stats, collaborations' },
      { name: 'Brands',        description: 'Brand profile, stats, campaigns listing' },
      { name: 'Campaigns',     description: 'Campaign CRUD, applications, workflow' },
      { name: 'Messages',      description: 'Conversations and direct messaging' },
      { name: 'Notifications', description: 'In-app notifications (REST + real-time Socket.io)' },
      { name: 'Search',        description: 'Full-text and filtered search across all resources' },
      { name: 'Matching',      description: 'AI-style recommendations and campaign-creator matching' },
      { name: 'Analytics',     description: 'Role-scoped platform statistics' },
      { name: 'Payments',      description: 'Escrow creation, payment release, history' },
      { name: 'Upload',        description: 'File uploads (avatar, campaign assets, chat attachments)' },
      { name: 'Admin',         description: 'User management, reports, announcements, audit logs' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },

      // ─── Reusable responses ─────────────────────────────────────────────────
      responses: {
        Unauthorized: {
          description: 'Missing or invalid access token',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Insufficient role permissions',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Conflict: {
          description: 'Resource already exists',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        ValidationError: {
          description: 'Request validation failed',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } },
        },
      },

      // ─── Schemas ────────────────────────────────────────────────────────────
      schemas: {

        // Primitives & Enums
        Role:            { type: 'string', enum: ['CREATOR', 'BRAND', 'ADMIN'] },
        UserStatus:      { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] },
        Niche:           { type: 'string', enum: ['FASHION','BEAUTY','GAMING','TECH','FITNESS','FOOD','LIFESTYLE','TRAVEL','EDUCATION','FINANCE'] },
        Platform:        { type: 'string', enum: ['INSTAGRAM','TIKTOK','YOUTUBE','TWITTER','FACEBOOK','LINKEDIN','SNAPCHAT'] },
        BrandSize:       { type: 'string', enum: ['STARTUP', 'GROWING', 'ENTERPRISE'] },
        CampaignStatus:  { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'PAUSED', 'COMPLETED'] },
        BudgetType:      { type: 'string', enum: ['FIXED', 'MILESTONE', 'PERFORMANCE'] },
        Objective:       { type: 'string', enum: ['AWARENESS', 'ENGAGEMENT', 'CONVERSIONS', 'LAUNCH'] },
        CollabStatus:    { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'] },
        CollabStage:     { type: 'string', enum: ['INQUIRY','NEGOTIATION','CONTRACTED','IN_PROGRESS','DELIVERED','COMPLETED'] },
        PaymentStatus:   { type: 'string', enum: ['PENDING', 'ESCROW', 'RELEASED', 'PAID'] },

        // Standard responses
        Error: {
          type: 'object',
          properties: {
            success:  { type: 'boolean', example: false },
            message:  { type: 'string', example: 'Resource not found' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors:  {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Must be a valid email' },
                },
              },
            },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page:  { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 150 },
            pages: { type: 'integer', example: 8 },
          },
        },

        // ── Auth ──
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'creator@creconnect.pk' },
            password: { type: 'string', minLength: 8, example: 'Creator@12345' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'role'],
          properties: {
            email:       { type: 'string', format: 'email' },
            password:    { type: 'string', minLength: 8 },
            role:        { $ref: '#/components/schemas/Role' },
            username:    { type: 'string', description: 'Required when role=CREATOR', example: 'ayesha_creates' },
            displayName: { type: 'string', example: 'Ayesha Malik' },
            companyName: { type: 'string', description: 'Required when role=BRAND', example: 'Sapphire Pvt Ltd' },
            contactName: { type: 'string', example: 'Zara Ahmed' },
            industry:    { type: 'string', example: 'Fashion' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success:      { type: 'boolean', example: true },
            message:      { type: 'string',  example: 'Login successful' },
            data: {
              type: 'object',
              properties: {
                user:         { $ref: '#/components/schemas/User' },
                accessToken:  { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                profile:      { $ref: '#/components/schemas/CreatorProfile' },
              },
            },
          },
        },
        TokenRefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
        },
        TokenRefreshResponse: {
          type: 'object',
          properties: {
            success:      { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                accessToken:  { type: 'string' },
                refreshToken: { type: 'string' },
              },
            },
          },
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['token', 'password'],
          properties: {
            token:    { type: 'string' },
            password: { type: 'string', minLength: 8 },
          },
        },
        OTPRequest:       { type: 'object', required: ['email'], properties: { email: { type: 'string', format: 'email' } } },
        VerifyOTPRequest: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: { type: 'string', format: 'email' },
            code:  { type: 'string', minLength: 6, maxLength: 6, example: '482910' },
          },
        },

        // ── User ──
        User: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            email:         { type: 'string', format: 'email' },
            role:          { $ref: '#/components/schemas/Role' },
            status:        { $ref: '#/components/schemas/UserStatus' },
            emailVerified: { type: 'boolean' },
            createdAt:     { type: 'string', format: 'date-time' },
            updatedAt:     { type: 'string', format: 'date-time' },
          },
        },

        // ── Creator ──
        SocialPlatform: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            name:          { $ref: '#/components/schemas/Platform' },
            handle:        { type: 'string', example: '@ayesha_creates' },
            url:           { type: 'string', example: 'https://instagram.com/ayesha_creates' },
            followerCount: { type: 'integer', example: 45000 },
            isConnected:   { type: 'boolean' },
          },
        },
        CreatorProfile: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            userId:         { type: 'string', format: 'uuid' },
            username:       { type: 'string', example: 'ayesha_creates' },
            displayName:    { type: 'string', example: 'Ayesha Malik' },
            bio:            { type: 'string', example: 'Fashion & lifestyle creator based in Lahore 🌸' },
            niche:          { $ref: '#/components/schemas/Niche' },
            avatarUrl:      { type: 'string', format: 'uri' },
            followerCount:  { type: 'integer', example: 85000 },
            engagementRate: { type: 'number', format: 'float', example: 4.2 },
            rating:         { type: 'number', format: 'float', example: 4.7 },
            isVerified:     { type: 'boolean' },
            platforms:      { type: 'array', items: { $ref: '#/components/schemas/SocialPlatform' } },
          },
        },
        UpdateCreatorRequest: {
          type: 'object',
          properties: {
            displayName:    { type: 'string' },
            bio:            { type: 'string' },
            niche:          { $ref: '#/components/schemas/Niche' },
            followerCount:  { type: 'integer' },
            engagementRate: { type: 'number' },
          },
        },
        AddPlatformRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name:          { $ref: '#/components/schemas/Platform' },
            handle:        { type: 'string' },
            url:           { type: 'string' },
            followerCount: { type: 'integer' },
          },
        },

        // ── Brand ──
        BrandProfile: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            userId:      { type: 'string', format: 'uuid' },
            companyName: { type: 'string', example: 'Sapphire Pvt Ltd' },
            contactName: { type: 'string', example: 'Zara Ahmed' },
            industry:    { type: 'string', example: 'Fashion' },
            website:     { type: 'string', format: 'uri' },
            logoUrl:     { type: 'string', format: 'uri' },
            location:    { type: 'string', example: 'Lahore, Pakistan' },
            brandSize:   { $ref: '#/components/schemas/BrandSize' },
            isVerified:  { type: 'boolean' },
          },
        },
        UpdateBrandRequest: {
          type: 'object',
          properties: {
            companyName: { type: 'string' },
            contactName: { type: 'string' },
            industry:    { type: 'string' },
            website:     { type: 'string' },
            location:    { type: 'string' },
            brandSize:   { $ref: '#/components/schemas/BrandSize' },
          },
        },

        // ── Campaign ──
        Campaign: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            brandId:        { type: 'string', format: 'uuid' },
            title:          { type: 'string', example: 'Eid Collection 2025 Launch' },
            description:    { type: 'string' },
            objective:      { $ref: '#/components/schemas/Objective' },
            niche:          { $ref: '#/components/schemas/Niche' },
            platforms:      { type: 'array', items: { $ref: '#/components/schemas/Platform' } },
            followerMin:    { type: 'integer', example: 10000 },
            followerMax:    { type: 'integer', example: 500000 },
            engagementMin:  { type: 'number', example: 3.0 },
            targetLocation: { type: 'string', example: 'Lahore' },
            languages:      { type: 'array', items: { type: 'string' }, example: ['Urdu', 'English'] },
            budgetType:     { $ref: '#/components/schemas/BudgetType' },
            budgetPKR:      { type: 'number', example: 75000 },
            reels:          { type: 'integer', example: 3 },
            posts:          { type: 'integer', example: 2 },
            stories:        { type: 'integer', example: 5 },
            status:         { $ref: '#/components/schemas/CampaignStatus' },
            startDate:      { type: 'string', format: 'date-time' },
            deadline:       { type: 'string', format: 'date-time' },
            brand:          { $ref: '#/components/schemas/BrandProfile' },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },
        CreateCampaignRequest: {
          type: 'object',
          required: ['title', 'description', 'objective', 'budgetType'],
          properties: {
            title:          { type: 'string' },
            description:    { type: 'string' },
            objective:      { $ref: '#/components/schemas/Objective' },
            niche:          { $ref: '#/components/schemas/Niche' },
            platforms:      { type: 'array', items: { $ref: '#/components/schemas/Platform' } },
            followerMin:    { type: 'integer' },
            followerMax:    { type: 'integer' },
            engagementMin:  { type: 'number' },
            targetLocation: { type: 'string' },
            languages:      { type: 'array', items: { type: 'string' } },
            budgetType:     { $ref: '#/components/schemas/BudgetType' },
            budgetPKR:      { type: 'number' },
            budgetMin:      { type: 'number' },
            budgetMax:      { type: 'number' },
            reels:          { type: 'integer', default: 0 },
            posts:          { type: 'integer', default: 0 },
            stories:        { type: 'integer', default: 0 },
            videos:         { type: 'integer', default: 0 },
            livestreams:    { type: 'integer', default: 0 },
            status:         { $ref: '#/components/schemas/CampaignStatus' },
            startDate:      { type: 'string', format: 'date-time' },
            deadline:       { type: 'string', format: 'date-time' },
            requirements:   { type: 'string' },
          },
        },
        ApplyRequest: {
          type: 'object',
          properties: { note: { type: 'string', example: 'I create fashion content for 85k engaged followers on Instagram.' } },
        },
        RespondApplicationRequest: {
          type: 'object',
          properties: {
            // action comes from URL param; body may carry offerAmountPKR for future use
          },
        },

        // ── Collaboration ──
        Collaboration: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            campaignId:     { type: 'string', format: 'uuid' },
            creatorId:      { type: 'string', format: 'uuid' },
            brandId:        { type: 'string', format: 'uuid' },
            status:         { $ref: '#/components/schemas/CollabStatus' },
            stage:          { $ref: '#/components/schemas/CollabStage' },
            offerAmountPKR: { type: 'number', example: 50000 },
            paymentStatus:  { $ref: '#/components/schemas/PaymentStatus' },
            startDate:      { type: 'string', format: 'date-time' },
            endDate:        { type: 'string', format: 'date-time' },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },

        // ── Payment ──
        Payment: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid' },
            collaborationId: { type: 'string', format: 'uuid' },
            amountPKR:       { type: 'number', example: 50000 },
            status:          { $ref: '#/components/schemas/PaymentStatus' },
            releasedAt:      { type: 'string', format: 'date-time' },
            createdAt:       { type: 'string', format: 'date-time' },
          },
        },

        // ── Messages ──
        Conversation: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            creatorId:     { type: 'string', format: 'uuid' },
            brandId:       { type: 'string', format: 'uuid' },
            lastMessage:   { type: 'string' },
            lastMessageAt: { type: 'string', format: 'date-time' },
            creator:       { $ref: '#/components/schemas/CreatorProfile' },
            brand:         { $ref: '#/components/schemas/BrandProfile' },
          },
        },
        CreateConversationRequest: {
          type: 'object',
          required: ['otherUserId'],
          properties: { otherUserId: { type: 'string', format: 'uuid' } },
        },
        Message: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            conversationId: { type: 'string', format: 'uuid' },
            senderId:       { type: 'string', format: 'uuid' },
            content:        { type: 'string', example: 'Hi! I am interested in your campaign.' },
            attachment:     { type: 'string', format: 'uri' },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },
        SendMessageRequest: {
          type: 'object',
          required: ['content'],
          properties: { content: { type: 'string' } },
        },

        // ── Notifications ──
        Notification: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            message:     { type: 'string' },
            audience:    { type: 'string', enum: ['ALL', 'CREATORS', 'BRANDS'] },
            isRead:      { type: 'boolean' },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },

        // ── Reports ──
        Report: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            reporterId:     { type: 'string', format: 'uuid' },
            reportedUserId: { type: 'string', format: 'uuid' },
            violationType:  { type: 'string', example: 'FAKE_FOLLOWERS' },
            description:    { type: 'string' },
            status:         { type: 'string', enum: ['OPEN', 'RESOLVED', 'DISMISSED'] },
            createdAt:      { type: 'string', format: 'date-time' },
          },
        },

        // ── Admin ──
        UpdateUserStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: { status: { $ref: '#/components/schemas/UserStatus' } },
        },
        AnnounceRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message:  { type: 'string', example: 'Platform maintenance scheduled for Sunday 2am PKT.' },
            audience: { type: 'string', enum: ['ALL', 'CREATORS', 'BRANDS'], default: 'ALL' },
          },
        },
        ResolveReportRequest: {
          type: 'object',
          properties: { resolution: { type: 'string', example: 'User warned for fake follower claims.' } },
        },

        // ── Analytics ──
        BrandAnalytics: {
          type: 'object',
          properties: {
            campaigns:           { type: 'array', items: { type: 'object' } },
            collaborations:      { type: 'array', items: { type: 'object' } },
            pendingApplications: { type: 'integer' },
          },
        },
        CreatorAnalytics: {
          type: 'object',
          properties: {
            collaborations:   { type: 'array', items: { type: 'object' } },
            totalEarningsPKR: { type: 'number' },
            followerCount:    { type: 'integer' },
            engagementRate:   { type: 'number' },
          },
        },

        // ── Upload ──
        UploadResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string',  example: 'Avatar uploaded' },
            data:    { type: 'object', properties: { url: { type: 'string', format: 'uri' } } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },

  // Files scanned for @swagger JSDoc comments
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
