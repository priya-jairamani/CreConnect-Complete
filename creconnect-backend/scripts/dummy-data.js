/**
 * CreConnect Dummy Data Script
 * Run: node scripts/dummy-data.js
 *
 * Inserts realistic Pakistani creator/brand data including:
 *   5 creators, 3 brands, 1 admin
 *   8 campaigns, applications, collaborations, payments
 *   conversations, messages, notifications
 *
 * Requires: DATABASE_URL in .env, migrations already run
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const { sequelize } = require('../src/models');

const {
  User, CreatorProfile, BrandProfile, AdminProfile,
  SocialPlatform, Campaign, Application, Collaboration,
  Payment, Conversation, Message, Notification, UserNotification,
} = require('../src/models');

// ─── Helpers ─────────────────────────────────────────────────────────────────

const hash = (pw) => bcrypt.hashSync(pw, 10);

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

async function seed() {
  await sequelize.authenticate();
  console.log('Connected to database.\n');

  // ── 0. Wipe existing data (FK-safe order) ───────────────────────────────────
  console.log('Clearing existing data...');
  await sequelize.query('TRUNCATE TABLE user_notifications, notifications, messages, conversations, payments, collaborations, applications, social_platforms, campaigns, audit_logs, reports, otps, admin_profiles, brand_profiles, creator_profiles, users RESTART IDENTITY CASCADE');
  console.log('Cleared.\n');

  // ── 1. Users ────────────────────────────────────────────────────────────────

  console.log('Creating users...');

  const adminUser = await User.create({
    id: uuid(),
    email: 'admin@creconnect.pk',
    passwordHash: hash('Admin@12345'),
    role: 'ADMIN',
    status: 'APPROVED',
    emailVerified: true,
  });

  const brandUsers = await User.bulkCreate([
    {
      id: uuid(),
      email: 'khaadi@creconnect.pk',
      passwordHash: hash('Brand@12345'),
      role: 'BRAND',
      status: 'APPROVED',
      emailVerified: true,
    },
    {
      id: uuid(),
      email: 'daraz@creconnect.pk',
      passwordHash: hash('Brand@12345'),
      role: 'BRAND',
      status: 'APPROVED',
      emailVerified: true,
    },
    {
      id: uuid(),
      email: 'menu@creconnect.pk',
      passwordHash: hash('Brand@12345'),
      role: 'BRAND',
      status: 'APPROVED',
      emailVerified: true,
    },
  ]);

  const creatorUsers = await User.bulkCreate([
    {
      id: uuid(),
      email: 'zara.fashion@creconnect.pk',
      passwordHash: hash('Creator@12345'),
      role: 'CREATOR',
      status: 'APPROVED',
      emailVerified: true,
    },
    {
      id: uuid(),
      email: 'hamza.games@creconnect.pk',
      passwordHash: hash('Creator@12345'),
      role: 'CREATOR',
      status: 'APPROVED',
      emailVerified: true,
    },
    {
      id: uuid(),
      email: 'ayesha.beauty@creconnect.pk',
      passwordHash: hash('Creator@12345'),
      role: 'CREATOR',
      status: 'APPROVED',
      emailVerified: true,
    },
    {
      id: uuid(),
      email: 'bilal.tech@creconnect.pk',
      passwordHash: hash('Creator@12345'),
      role: 'CREATOR',
      status: 'APPROVED',
      emailVerified: true,
    },
    {
      id: uuid(),
      email: 'saira.food@creconnect.pk',
      passwordHash: hash('Creator@12345'),
      role: 'CREATOR',
      status: 'APPROVED',
      emailVerified: true,
    },
  ]);

  // ── 2. Admin Profile ────────────────────────────────────────────────────────

  await AdminProfile.create({ id: uuid(), userId: adminUser.id, name: 'Super Admin' });

  // ── 3. Brand Profiles ───────────────────────────────────────────────────────

  console.log('Creating brand profiles...');

  const brands = await BrandProfile.bulkCreate([
    {
      id: uuid(),
      userId: brandUsers[0].id,
      companyName: 'Khaadi',
      contactName: 'Fatima Malik',
      industry: 'Fashion & Apparel',
      website: 'https://khaadi.com',
      location: 'Karachi, Pakistan',
      brandSize: 'ENTERPRISE',
      isVerified: true,
    },
    {
      id: uuid(),
      userId: brandUsers[1].id,
      companyName: 'Daraz Pakistan',
      contactName: 'Ahmed Siddiqui',
      industry: 'E-Commerce',
      website: 'https://daraz.pk',
      location: 'Lahore, Pakistan',
      brandSize: 'ENTERPRISE',
      isVerified: true,
    },
    {
      id: uuid(),
      userId: brandUsers[2].id,
      companyName: 'Menu Restaurant Group',
      contactName: 'Sara Baig',
      industry: 'Food & Beverage',
      website: 'https://menurestaurant.pk',
      location: 'Islamabad, Pakistan',
      brandSize: 'GROWING',
      isVerified: false,
    },
  ]);

  // ── 4. Creator Profiles ─────────────────────────────────────────────────────

  console.log('Creating creator profiles...');

  const creators = await CreatorProfile.bulkCreate([
    {
      id: uuid(),
      userId: creatorUsers[0].id,
      username: 'zara_styles',
      displayName: 'Zara Ahmed',
      bio: 'Pakistani fashion blogger from Lahore. Covering modest fashion, street style, and local designer brands. 4+ years creating content.',
      niche: 'FASHION',
      followerCount: 285000,
      engagementRate: 4.2,
      rating: 4.8,
      isVerified: true,
      totalViews: 12500000,
      totalReach: 950000,
    },
    {
      id: uuid(),
      userId: creatorUsers[1].id,
      username: 'hamza_gaming_pk',
      displayName: 'Hamza Khan',
      bio: 'PUBG Mobile & Free Fire content creator from Karachi. Tournament clips, tips & tricks, and live streams every weekend.',
      niche: 'GAMING',
      followerCount: 520000,
      engagementRate: 6.1,
      rating: 4.6,
      isVerified: true,
      totalViews: 38000000,
      totalReach: 2100000,
    },
    {
      id: uuid(),
      userId: creatorUsers[2].id,
      username: 'ayesha_glam',
      displayName: 'Ayesha Raza',
      bio: 'MUA & beauty influencer based in Islamabad. Desi glam looks, wedding makeup, skincare for Pakistani skin tones.',
      niche: 'BEAUTY',
      followerCount: 145000,
      engagementRate: 5.8,
      rating: 4.9,
      isVerified: true,
      totalViews: 7800000,
      totalReach: 620000,
    },
    {
      id: uuid(),
      userId: creatorUsers[3].id,
      username: 'bilal_bytes',
      displayName: 'Bilal Chaudhry',
      bio: 'Software engineer turned tech YouTuber. Reviews, tutorials in Urdu. Covering mobiles, laptops, and gadgets available in Pakistan.',
      niche: 'TECH',
      followerCount: 98000,
      engagementRate: 7.3,
      rating: 4.7,
      isVerified: false,
      totalViews: 5200000,
      totalReach: 410000,
    },
    {
      id: uuid(),
      userId: creatorUsers[4].id,
      username: 'saira_cooks',
      displayName: 'Saira Hussain',
      bio: 'Home chef & food blogger from Peshawar. Traditional Pakistani recipes, fusion food, and restaurant reviews across KPK.',
      niche: 'FOOD',
      followerCount: 67000,
      engagementRate: 8.9,
      rating: 4.5,
      isVerified: false,
      totalViews: 3100000,
      totalReach: 280000,
    },
  ]);

  // ── 5. Social Platforms ─────────────────────────────────────────────────────

  console.log('Creating social platforms...');

  await SocialPlatform.bulkCreate([
    // Zara (Fashion)
    { id: uuid(), creatorId: creators[0].id, name: 'INSTAGRAM', handle: '@zara_styles', followerCount: 185000, isConnected: true },
    { id: uuid(), creatorId: creators[0].id, name: 'TIKTOK', handle: '@zara_styles_pk', followerCount: 100000, isConnected: true },
    // Hamza (Gaming)
    { id: uuid(), creatorId: creators[1].id, name: 'YOUTUBE', handle: 'HamzaGamingPK', followerCount: 380000, isConnected: true },
    { id: uuid(), creatorId: creators[1].id, name: 'TIKTOK', handle: '@hamzagaming', followerCount: 140000, isConnected: true },
    // Ayesha (Beauty)
    { id: uuid(), creatorId: creators[2].id, name: 'INSTAGRAM', handle: '@ayesha_glam', followerCount: 110000, isConnected: true },
    { id: uuid(), creatorId: creators[2].id, name: 'YOUTUBE', handle: 'AyeshaGlamPK', followerCount: 35000, isConnected: true },
    // Bilal (Tech)
    { id: uuid(), creatorId: creators[3].id, name: 'YOUTUBE', handle: 'BilalBytes', followerCount: 78000, isConnected: true },
    { id: uuid(), creatorId: creators[3].id, name: 'INSTAGRAM', handle: '@bilal_bytes', followerCount: 20000, isConnected: true },
    // Saira (Food)
    { id: uuid(), creatorId: creators[4].id, name: 'INSTAGRAM', handle: '@saira_cooks', followerCount: 48000, isConnected: true },
    { id: uuid(), creatorId: creators[4].id, name: 'FACEBOOK', handle: 'SairaCooksPK', followerCount: 19000, isConnected: false },
  ]);

  // ── 6. Campaigns ────────────────────────────────────────────────────────────

  console.log('Creating campaigns...');

  const campaigns = await Campaign.bulkCreate([
    // Khaadi – 3 campaigns
    {
      id: uuid(),
      brandId: brands[0].id,
      title: 'Khaadi Eid Collection 2025 Launch',
      description: 'Promote our premium Eid lawn collection targeting women aged 18-35 across Pakistan. We need authentic content showing styling versatility.',
      objective: 'AWARENESS',
      niche: 'FASHION',
      platforms: ['INSTAGRAM', 'TIKTOK'],
      followerMin: 50000,
      followerMax: 500000,
      engagementMin: 3.5,
      targetLocation: 'Pakistan',
      languages: ['Urdu', 'English'],
      budgetType: 'FIXED',
      budgetPKR: 150000,
      reels: 3,
      posts: 2,
      stories: 5,
      status: 'PUBLISHED',
      requirements: 'Must show Khaadi tag. No competitor brands in the same frame. Post within 72 hours of receiving product.',
      startDate: daysFromNow(7),
      deadline: daysFromNow(45),
    },
    {
      id: uuid(),
      brandId: brands[0].id,
      title: 'Khaadi Winter Pret — Cozy at Home',
      description: 'Winter unstitched and pret campaign. Creators should film in cozy home settings with warm aesthetics.',
      objective: 'ENGAGEMENT',
      niche: 'FASHION',
      platforms: ['INSTAGRAM'],
      followerMin: 30000,
      engagementMin: 4.0,
      budgetType: 'MILESTONE',
      budgetMin: 50000,
      budgetMax: 120000,
      reels: 2,
      stories: 4,
      status: 'PUBLISHED',
      requirements: 'Lifestyle content only. Must tag @khaadi and use #KhaadiWinter2025.',
      startDate: daysFromNow(14),
      deadline: daysFromNow(60),
    },
    {
      id: uuid(),
      brandId: brands[0].id,
      title: 'Khaadi Kids Summer Range',
      description: 'Seeking parent creators or family influencers to showcase our kids summer collection.',
      objective: 'CONVERSIONS',
      niche: 'FASHION',
      platforms: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK'],
      followerMin: 20000,
      budgetType: 'FIXED',
      budgetPKR: 80000,
      posts: 3,
      stories: 6,
      status: 'DRAFT',
      startDate: daysFromNow(30),
      deadline: daysFromNow(90),
    },
    // Daraz – 3 campaigns
    {
      id: uuid(),
      brandId: brands[1].id,
      title: 'Daraz 11.11 Sale Countdown',
      description: 'Biggest sale of the year! We need creators to build hype, share discount codes, and create unboxing content.',
      objective: 'CONVERSIONS',
      niche: 'TECH',
      platforms: ['YOUTUBE', 'INSTAGRAM', 'TIKTOK'],
      followerMin: 80000,
      engagementMin: 5.0,
      budgetType: 'FIXED',
      budgetPKR: 250000,
      reels: 4,
      videos: 2,
      stories: 8,
      status: 'PUBLISHED',
      requirements: 'Must include exclusive discount code. Unboxing video mandatory. Post by November 8.',
      startDate: daysFromNow(3),
      deadline: daysFromNow(20),
    },
    {
      id: uuid(),
      brandId: brands[1].id,
      title: 'Daraz Gadget Reviews Series',
      description: 'Ongoing partnership for tech creators to review gadgets purchased on Daraz and highlight delivery speed & authenticity.',
      objective: 'AWARENESS',
      niche: 'TECH',
      platforms: ['YOUTUBE'],
      followerMin: 50000,
      engagementMin: 6.0,
      budgetType: 'MILESTONE',
      budgetMin: 80000,
      budgetMax: 200000,
      videos: 4,
      status: 'PUBLISHED',
      requirements: '10 minute minimum video. Show unboxing to review. Honest opinion, no scripted lines.',
      startDate: daysAgo(5),
      deadline: daysFromNow(55),
    },
    {
      id: uuid(),
      brandId: brands[1].id,
      title: 'Daraz Fashion Haul',
      description: 'Fashion haul videos from Daraz Mall. Show your top picks from our fashion section with prices.',
      objective: 'ENGAGEMENT',
      niche: 'FASHION',
      platforms: ['TIKTOK', 'INSTAGRAM'],
      followerMin: 40000,
      engagementMin: 4.5,
      budgetType: 'FIXED',
      budgetPKR: 100000,
      reels: 3,
      stories: 5,
      status: 'PUBLISHED',
      requirements: 'Show Daraz app in 5 seconds. Tag @darazpakistan.',
      startDate: daysAgo(2),
      deadline: daysFromNow(30),
    },
    // Menu – 2 campaigns
    {
      id: uuid(),
      brandId: brands[2].id,
      title: 'Menu Restaurant — Iftar Special Review',
      description: 'Food creators to visit our Islamabad outlets and create authentic reviews of our Iftar buffet.',
      objective: 'AWARENESS',
      niche: 'FOOD',
      platforms: ['INSTAGRAM', 'TIKTOK'],
      followerMin: 20000,
      engagementMin: 6.0,
      targetLocation: 'Islamabad, Rawalpindi',
      budgetType: 'FIXED',
      budgetPKR: 45000,
      reels: 2,
      stories: 4,
      status: 'PUBLISHED',
      requirements: 'Complimentary meal provided. Visit between 6pm-9pm. Content must be posted within 48 hours.',
      startDate: daysAgo(1),
      deadline: daysFromNow(25),
    },
    {
      id: uuid(),
      brandId: brands[2].id,
      title: 'Menu x Home Chef Collaboration',
      description: 'Partner with home chef creators to recreate Menu\'s signature dishes at home using our recipe cards.',
      objective: 'ENGAGEMENT',
      niche: 'FOOD',
      platforms: ['INSTAGRAM', 'YOUTUBE'],
      followerMin: 30000,
      engagementMin: 7.0,
      budgetType: 'MILESTONE',
      budgetMin: 25000,
      budgetMax: 60000,
      reels: 2,
      videos: 1,
      status: 'PUBLISHED',
      requirements: 'Receive recipe card + ingredients kit from us. Cook and film the process. Tag @menurestaurant.',
      startDate: daysFromNow(5),
      deadline: daysFromNow(40),
    },
  ]);

  // ── 7. Applications ─────────────────────────────────────────────────────────

  console.log('Creating applications...');

  const apps = await Application.bulkCreate([
    // Zara applies to Khaadi Eid campaign → ACCEPTED
    {
      id: uuid(),
      campaignId: campaigns[0].id,
      creatorId: creators[0].id,
      note: 'I love Khaadi! I have worked with local fashion brands before and my audience is 70% women aged 18-35 in Pakistan. Would love to style your Eid collection.',
      status: 'ACCEPTED',
    },
    // Zara applies to Daraz Fashion Haul → PENDING
    {
      id: uuid(),
      campaignId: campaigns[5].id,
      creatorId: creators[0].id,
      note: 'Fashion hauls are my favourite content format. My TikTok engagement averages 5%+ on haul videos.',
      status: 'PENDING',
    },
    // Hamza applies to Daraz 11.11 → ACCEPTED
    {
      id: uuid(),
      campaignId: campaigns[3].id,
      creatorId: creators[1].id,
      note: 'My audience is tech-savvy and buys frequently on Daraz. I have done 3 successful Daraz campaigns before. Can deliver unboxing + review in one video.',
      status: 'ACCEPTED',
    },
    // Hamza applies to Daraz Gadget Reviews → PENDING
    {
      id: uuid(),
      campaignId: campaigns[4].id,
      creatorId: creators[1].id,
      note: 'Long-form tech review is my specialty. Average watch time 8+ minutes. Would love an ongoing series.',
      status: 'PENDING',
    },
    // Ayesha applies to Khaadi Winter → ACCEPTED
    {
      id: uuid(),
      campaignId: campaigns[1].id,
      creatorId: creators[2].id,
      note: 'My content aesthetic perfectly matches warm, cozy vibes. I can style the winter pret in a beautiful home setting.',
      status: 'ACCEPTED',
    },
    // Bilal applies to Daraz Gadget Reviews → ACCEPTED
    {
      id: uuid(),
      campaignId: campaigns[4].id,
      creatorId: creators[3].id,
      note: 'Gadget reviews are 100% my niche. My audience trusts my opinion for purchase decisions — 35% clickthrough on affiliate links.',
      status: 'ACCEPTED',
    },
    // Saira applies to Menu Iftar → ACCEPTED
    {
      id: uuid(),
      campaignId: campaigns[6].id,
      creatorId: creators[4].id,
      note: 'I cover Islamabad restaurants regularly and my followers are mostly local foodies. Would be happy to visit and create honest content.',
      status: 'ACCEPTED',
    },
    // Saira applies to Menu Home Chef → PENDING
    {
      id: uuid(),
      campaignId: campaigns[7].id,
      creatorId: creators[4].id,
      note: 'Home cooking content is my core format. This collaboration aligns perfectly with my content style.',
      status: 'PENDING',
    },
  ]);

  // ── 8. Collaborations ───────────────────────────────────────────────────────

  console.log('Creating collaborations...');

  const collabs = await Collaboration.bulkCreate([
    // Zara x Khaadi Eid
    {
      id: uuid(),
      campaignId: campaigns[0].id,
      creatorId: creators[0].id,
      brandId: brands[0].id,
      status: 'ACCEPTED',
      stage: 'IN_PROGRESS',
      priority: 'HIGH',
      offerAmountPKR: 150000,
      offerType: 'FIXED',
      paymentStatus: 'ESCROW',
      startDate: daysAgo(3),
      endDate: daysFromNow(42),
    },
    // Hamza x Daraz 11.11
    {
      id: uuid(),
      campaignId: campaigns[3].id,
      creatorId: creators[1].id,
      brandId: brands[1].id,
      status: 'ACCEPTED',
      stage: 'DELIVERED',
      priority: 'HIGH',
      offerAmountPKR: 250000,
      offerType: 'FIXED',
      paymentStatus: 'ESCROW',
      startDate: daysAgo(5),
      endDate: daysFromNow(15),
    },
    // Ayesha x Khaadi Winter
    {
      id: uuid(),
      campaignId: campaigns[1].id,
      creatorId: creators[2].id,
      brandId: brands[0].id,
      status: 'ACCEPTED',
      stage: 'NEGOTIATION',
      priority: 'MEDIUM',
      offerAmountPKR: 90000,
      offerType: 'FIXED',
      paymentStatus: 'PENDING',
      startDate: daysFromNow(7),
      endDate: daysFromNow(55),
    },
    // Bilal x Daraz Gadget Reviews
    {
      id: uuid(),
      campaignId: campaigns[4].id,
      creatorId: creators[3].id,
      brandId: brands[1].id,
      status: 'COMPLETED',
      stage: 'COMPLETED',
      priority: 'MEDIUM',
      offerAmountPKR: 120000,
      offerType: 'FIXED',
      paymentStatus: 'RELEASED',
      startDate: daysAgo(30),
      endDate: daysAgo(2),
    },
    // Saira x Menu Iftar
    {
      id: uuid(),
      campaignId: campaigns[6].id,
      creatorId: creators[4].id,
      brandId: brands[2].id,
      status: 'ACCEPTED',
      stage: 'CONTRACTED',
      priority: 'MEDIUM',
      offerAmountPKR: 45000,
      offerType: 'FIXED',
      paymentStatus: 'ESCROW',
      startDate: daysAgo(1),
      endDate: daysFromNow(23),
    },
  ]);

  // ── 9. Payments ─────────────────────────────────────────────────────────────

  console.log('Creating payments...');

  await Payment.bulkCreate([
    {
      id: uuid(),
      collaborationId: collabs[0].id,
      amountPKR: 150000,
      status: 'ESCROW',
      stripePaymentId: 'pi_fake_khaadi_zara_001',
    },
    {
      id: uuid(),
      collaborationId: collabs[1].id,
      amountPKR: 250000,
      status: 'ESCROW',
      stripePaymentId: 'pi_fake_daraz_hamza_001',
    },
    {
      id: uuid(),
      collaborationId: collabs[3].id,
      amountPKR: 120000,
      status: 'RELEASED',
      stripePaymentId: 'pi_fake_daraz_bilal_001',
      releasedAt: daysAgo(2),
    },
    {
      id: uuid(),
      collaborationId: collabs[4].id,
      amountPKR: 45000,
      status: 'ESCROW',
      stripePaymentId: 'pi_fake_menu_saira_001',
    },
  ]);

  // ── 10. Conversations & Messages ────────────────────────────────────────────

  console.log('Creating conversations and messages...');

  const conversations = await Conversation.bulkCreate([
    // Zara ↔ Khaadi
    {
      id: uuid(),
      creatorId: creators[0].id,
      brandId: brands[0].id,
      lastMessage: 'Please send the products to the Lahore address I shared.',
      lastMessageAt: daysAgo(1),
    },
    // Hamza ↔ Daraz
    {
      id: uuid(),
      creatorId: creators[1].id,
      brandId: brands[1].id,
      lastMessage: 'Content draft is uploaded to the shared Google Drive.',
      lastMessageAt: daysAgo(0),
    },
    // Bilal ↔ Daraz
    {
      id: uuid(),
      creatorId: creators[3].id,
      brandId: brands[1].id,
      lastMessage: 'Video is live! Here is the link: youtu.be/fake-link',
      lastMessageAt: daysAgo(3),
    },
    // Saira ↔ Menu
    {
      id: uuid(),
      creatorId: creators[4].id,
      brandId: brands[2].id,
      lastMessage: 'Will be at your Islamabad outlet this Friday at 7pm.',
      lastMessageAt: daysAgo(0),
    },
  ]);

  await Message.bulkCreate([
    // Zara ↔ Khaadi conversation
    {
      id: uuid(),
      conversationId: conversations[0].id,
      senderId: brandUsers[0].id,
      content: 'Hi Zara! We are so excited to have you on board for our Eid campaign. Our team will be in touch.',
    },
    {
      id: uuid(),
      conversationId: conversations[0].id,
      senderId: creatorUsers[0].id,
      content: 'Thank you so much! I am a huge fan of Khaadi. What are the next steps?',
    },
    {
      id: uuid(),
      conversationId: conversations[0].id,
      senderId: brandUsers[0].id,
      content: 'We will send you the brief and a set of 5 dresses. Can you confirm your address?',
    },
    {
      id: uuid(),
      conversationId: conversations[0].id,
      senderId: creatorUsers[0].id,
      content: 'Please send the products to the Lahore address I shared.',
    },
    // Hamza ↔ Daraz
    {
      id: uuid(),
      conversationId: conversations[1].id,
      senderId: brandUsers[1].id,
      content: 'Hi Hamza! Ready for 11.11? Here is your exclusive code: HAMZA11',
    },
    {
      id: uuid(),
      conversationId: conversations[1].id,
      senderId: creatorUsers[1].id,
      content: 'Let\'s go! I will start the countdown reel series from tomorrow.',
    },
    {
      id: uuid(),
      conversationId: conversations[1].id,
      senderId: brandUsers[1].id,
      content: 'Perfect. Make sure to pin the discount code link in bio.',
    },
    {
      id: uuid(),
      conversationId: conversations[1].id,
      senderId: creatorUsers[1].id,
      content: 'Content draft is uploaded to the shared Google Drive.',
    },
    // Bilal ↔ Daraz
    {
      id: uuid(),
      conversationId: conversations[2].id,
      senderId: brandUsers[1].id,
      content: 'Hi Bilal! Great review content. The video has already crossed 50k views.',
    },
    {
      id: uuid(),
      conversationId: conversations[2].id,
      senderId: creatorUsers[3].id,
      content: 'Video is live! Here is the link: youtu.be/fake-link',
    },
    // Saira ↔ Menu
    {
      id: uuid(),
      conversationId: conversations[3].id,
      senderId: brandUsers[2].id,
      content: 'Hi Saira! Complimentary Iftar table for 2 is reserved. Just ask for "Menu Collab" at the entrance.',
    },
    {
      id: uuid(),
      conversationId: conversations[3].id,
      senderId: creatorUsers[4].id,
      content: 'Will be at your Islamabad outlet this Friday at 7pm.',
    },
  ]);

  // ── 11. Notifications ───────────────────────────────────────────────────────

  console.log('Creating notifications...');

  const welcomeNotif = await Notification.create({
    id: uuid(),
    message: 'Welcome to CreConnect! Complete your profile to start getting discovered by top Pakistani brands.',
    audience: 'ALL',
    deliveryMode: 'IMMEDIATE',
    status: 'SENT',
  });

  const creatorNotif = await Notification.create({
    id: uuid(),
    message: 'New feature: Creators can now see their follower growth analytics on the dashboard.',
    audience: 'CREATORS',
    deliveryMode: 'IMMEDIATE',
    status: 'SENT',
  });

  const brandNotif = await Notification.create({
    id: uuid(),
    message: 'Tip for brands: Use the matching engine to find creators who fit your campaign criteria before posting.',
    audience: 'BRANDS',
    deliveryMode: 'IMMEDIATE',
    status: 'SENT',
  });

  // Link welcome notification to all users
  const allUsers = [adminUser, ...brandUsers, ...creatorUsers];
  await UserNotification.bulkCreate(
    allUsers.map((u) => ({
      id: uuid(),
      userId: u.id,
      notificationId: welcomeNotif.id,
      isRead: false,
    }))
  );

  // Creator-specific notification
  await UserNotification.bulkCreate(
    creatorUsers.map((u) => ({
      id: uuid(),
      userId: u.id,
      notificationId: creatorNotif.id,
      isRead: false,
    }))
  );

  // Brand-specific notification (mark as read for first brand)
  await UserNotification.bulkCreate(
    brandUsers.map((u, i) => ({
      id: uuid(),
      userId: u.id,
      notificationId: brandNotif.id,
      isRead: i === 0,
      readAt: i === 0 ? new Date() : null,
    }))
  );

  console.log('\n✅ Dummy data inserted successfully!\n');
  console.log('─'.repeat(50));
  console.log('Login credentials:');
  console.log('');
  console.log('  ADMIN');
  console.log('  Email:    admin@creconnect.pk');
  console.log('  Password: Admin@12345');
  console.log('');
  console.log('  BRANDS');
  console.log('  Email:    khaadi@creconnect.pk   / Brand@12345');
  console.log('  Email:    daraz@creconnect.pk    / Brand@12345');
  console.log('  Email:    menu@creconnect.pk     / Brand@12345');
  console.log('');
  console.log('  CREATORS');
  console.log('  Email:    zara.fashion@creconnect.pk  / Creator@12345  (Fashion, 285k)');
  console.log('  Email:    hamza.games@creconnect.pk   / Creator@12345  (Gaming, 520k)');
  console.log('  Email:    ayesha.beauty@creconnect.pk / Creator@12345  (Beauty, 145k)');
  console.log('  Email:    bilal.tech@creconnect.pk    / Creator@12345  (Tech, 98k)');
  console.log('  Email:    saira.food@creconnect.pk    / Creator@12345  (Food, 67k)');
  console.log('─'.repeat(50));
  console.log('');
  console.log('Swagger docs: http://localhost:5000/api/docs');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  });
