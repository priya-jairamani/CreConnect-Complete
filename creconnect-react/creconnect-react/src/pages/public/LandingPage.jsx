import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/common/Button';
import ScoreRing from '@/components/common/ScoreRing';
import Skeleton from '@/components/common/Skeleton';
import Avatar from '@/components/common/Avatar';
import { publicApi } from '@/api/public.api';
import { formatFollowers } from '@/utils/formatters';

/* ── Stat banner data (fallback when API unavailable) ── */
const DEFAULT_STATS = [
  { key: 'creators', value: '12K+',    label: 'Verified creators'  },
  { key: 'brands',   value: '850+',    label: 'Active brands'       },
  { key: 'escrow',   value: 'Rs 420M', label: 'Paid via escrow'     },
  { key: 'delivery', value: '98%',     label: 'On-time delivery'    },
];

function formatStatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return null;
  const num = Number(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M+`;
  if (num >= 1_000) return `${Math.floor(num / 1_000)}K+`;
  return String(num);
}

function formatNiche(niche) {
  if (!niche) return 'Creator';
  return String(niche).charAt(0) + String(niche).slice(1).toLowerCase();
}

function cityFromLocation(location) {
  if (!location) return 'Pakistan';
  return location.split(',')[0].trim() || location;
}

/* ── Feature grid ── */
const FEATURES = [
  { icon: '🔍', title: 'Natural-language discovery',   desc: 'Type "Karachi food creators under 50K" and AI turns it into precise filters instantly.'   },
  { icon: '✦',  title: 'Explainable AI matching',      desc: 'Every recommendation shows a transparent match score with clear reasons behind it.'        },
  { icon: '🛡',  title: 'Fraud & bot detection',        desc: 'Authenticity scoring flags fake followers and inflated engagement before you spend.'       },
  { icon: '💳', title: 'Escrow payments',               desc: 'Funds held securely in escrow, released per approved milestone — zero payment risk.'      },
  { icon: '💬', title: 'Collaboration workspace',       desc: 'Chat, files, tasks, contracts and approvals all in one unified collaboration hub.'        },
  { icon: '📈', title: 'Campaign analytics',            desc: 'Track reach, ROI and cost-per-engagement live as campaigns run in real time.'             },
];

/* ── Testimonials ── */
const TESTIMONIALS = [
  {
    name: 'Zara Ahmed',
    role: 'Marketing Director, Khaadi',
    avatar: 'ZA',
    quote: 'CreConnect cut our influencer research time by 80%. The AI matching is incredibly accurate — every creator we hired delivered beyond expectations.',
    rating: 5,
  },
  {
    name: 'Hamza Malik',
    role: 'Fashion Creator · 280K',
    avatar: 'HM',
    quote: 'I used to spend weeks cold-pitching brands. Now inbound offers come to me daily, and the escrow payment system means I always get paid on time.',
    rating: 5,
  },
  {
    name: 'Sadia Faisal',
    role: 'CMO, Sapphire',
    avatar: 'SF',
    quote: 'The fraud detection alone saved us from a Rs 2M campaign disaster. The authenticity reports are detailed and actionable.',
    rating: 5,
  },
];

/* ── Pricing plans ── */
const PLANS = [
  {
    name:     'Starter',
    price:    'Free',
    period:   '',
    desc:     'Perfect for getting started with influencer discovery.',
    features: ['5 creator searches/mo', 'Basic match scores', 'Profile analytics', 'Email support'],
    cta:      'Start for free',
    popular:  false,
  },
  {
    name:     'Growth',
    price:    'Rs 12,000',
    period:   '/mo',
    desc:     'Everything you need to run effective campaigns at scale.',
    features: ['Unlimited searches', 'Explainable AI match', 'Fraud detection', 'Escrow payments', 'Campaign analytics', 'Priority support'],
    cta:      'Start free trial',
    popular:  true,
  },
  {
    name:     'Enterprise',
    price:    'Custom',
    period:   '',
    desc:     'Dedicated infrastructure and white-glove onboarding for large teams.',
    features: ['Everything in Growth', 'Custom integrations', 'Dedicated CSM', 'SLA guarantee', 'Custom reporting', 'Team accounts'],
    cta:      'Contact sales',
    popular:  false,
  },
];

/* ── FAQ ── */
const FAQ = [
  {
    q: 'How does the AI matching work?',
    a: 'Our model scores creators against your campaign goals across 14 dimensions including audience fit, niche alignment, engagement quality, location, and estimated CPE. Each score is fully explainable.',
  },
  {
    q: 'How does the escrow system protect me?',
    a: 'Funds are held in a secure third-party escrow account. Payment is released to the creator only after you approve the delivered content — you\'re never charged upfront.',
  },
  {
    q: 'What platforms does CreConnect cover?',
    a: 'We index creators across Instagram, TikTok, YouTube, Twitter/X, and Facebook. Platform-specific engagement analytics are included on all plans.',
  },
  {
    q: 'Is CreConnect only for Pakistan?',
    a: 'We\'re built for Pakistan\'s creator economy first, with PKR pricing and local payment rails. International expansion is on our roadmap for Q1 2026.',
  },
];

function BrandPreviewCard({ name, industry, location, verified }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
    >
      <div className="flex items-center gap-3">
        <Avatar initials={(name || '?').slice(0, 2).toUpperCase()} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
            {name}
            {verified && <span className="text-success ml-1">✓</span>}
          </p>
          <p className="text-xs text-fg-muted truncate">{industry || 'Brand'} · {cityFromLocation(location)}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Product preview card ── */
function PreviewCard({ name, city, niche, followers, score, best }) {
  const initials = name.split(' ').map(w => w[0]).join('');
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: `1px solid ${best ? 'rgba(109,92,255,0.4)' : 'var(--border)'}`,
        background: best ? 'rgba(109,92,255,0.05)' : 'var(--surface-2)',
        boxShadow: best ? '0 8px 40px -8px rgba(109,92,255,0.4)' : 'none',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
              {name}
            </p>
            <p className="text-xs text-fg-muted truncate">{city} · {niche}</p>
          </div>
        </div>
        <ScoreRing value={score} size={42} strokeWidth={4} />
      </div>
      <div className="flex items-center justify-between mt-3 text-xs text-fg-muted">
        <span>{followers} followers</span>
        {best && (
          <span
            className="px-2 py-0.5 rounded-full text-success font-semibold"
            style={{ background: 'rgba(22,179,100,0.14)' }}
          >
            ✓ Best match
          </span>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [discover, setDiscover] = useState(null);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  useEffect(() => {
    publicApi.getDiscover()
      .then(({ data }) => setDiscover(data))
      .catch(() => setDiscover(null))
      .finally(() => setDiscoverLoading(false));
  }, []);

  const featuredCreators = discover?.creators ?? [];
  const featuredBrands = discover?.brands ?? [];
  const topCreator = featuredCreators[0];

  const stats = useMemo(() => {
    const creatorCount = formatStatCount(discover?.stats?.creators);
    const brandCount = formatStatCount(discover?.stats?.brands);
    return DEFAULT_STATS.map((s) => {
      if (s.key === 'creators' && creatorCount) return { ...s, value: creatorCount };
      if (s.key === 'brands' && brandCount) return { ...s, value: brandCount };
      return s;
    });
  }, [discover]);

  const ctaCountLabel = useMemo(() => {
    const c = discover?.stats?.creators;
    const b = discover?.stats?.brands;
    if (c && b) {
      return `Join ${formatStatCount(c) ?? c} creators and ${formatStatCount(b) ?? b} brands already growing on CreConnect.`;
    }
    return 'Join creators and brands already growing on CreConnect.';
  }, [discover]);

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ─── Hero ─── */}
      <section
        className="relative overflow-hidden text-center px-6 pt-16 pb-24"
        id="hero"
        style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Mesh gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 60% at 18% 12%, rgba(109,92,255,.22) 0, transparent 62%), radial-gradient(48% 48% at 88% 18%, rgba(245,158,11,.12) 0, transparent 58%), radial-gradient(50% 50% at 70% 95%, rgba(76,45,209,.18) 0, transparent 60%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-up">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-brand-400 mb-6"
            style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.25)' }}>
            <span>✦</span>
            Built for Pakistan's creator economy
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
            style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.025em' }}
          >
            Where brands meet creators,{' '}
            <span className="grad-text">intelligently.</span>
          </h1>

          <p className="text-fg-muted text-lg md:text-xl max-w-[640px] mx-auto leading-relaxed mb-8">
            Explainable AI matches brands with the right creators, detects influencer fraud, and runs campaigns
            end-to-end — from discovery to escrow-secured payment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(ROUTES.ROLE_SELECT)}
            >
              Start free →
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              See AI matching
            </Button>
          </div>
        </div>

        {/* Product preview window */}
        <div
          className="relative z-10 w-full max-w-[900px] mx-auto mt-16 rounded-2xl overflow-hidden animate-fade-up-delay"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.7)',
          }}
        >
          {/* Window chrome */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <span className="w-3 h-3 rounded-full bg-danger/70" />
            <span className="w-3 h-3 rounded-full bg-warning/70" />
            <span className="w-3 h-3 rounded-full bg-success/70" />
            <div
              className="ml-3 flex items-center gap-2 px-3 py-1 rounded-lg text-xs text-fg-muted"
              style={{ background: 'var(--surface)' }}
            >
              🔍 Find Lahore fashion creators under Rs 120,000
            </div>
          </div>

          {/* Creators */}
          <div className="grid md:grid-cols-3 gap-4 p-6 pb-3">
            <p className="md:col-span-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">Featured creators</p>
            {discoverLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : featuredCreators.length > 0 ? (
              featuredCreators.map((c, i) => (
                <PreviewCard
                  key={c.id}
                  name={c.displayName || c.username}
                  city={cityFromLocation(c.location)}
                  niche={formatNiche(c.niche)}
                  followers={formatFollowers(c.followerCount ?? 0)}
                  score={c.trustScore ?? 70}
                  best={i === 0}
                />
              ))
            ) : (
              <p className="md:col-span-3 text-sm text-fg-muted text-center py-4">No creators listed yet — be the first to join.</p>
            )}
          </div>

          {/* Brands */}
          <div className="grid md:grid-cols-3 gap-4 px-6 pb-6 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="md:col-span-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">Featured brands</p>
            {discoverLoading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)
            ) : featuredBrands.length > 0 ? (
              featuredBrands.map((b) => (
                <BrandPreviewCard
                  key={b.id}
                  name={b.companyName}
                  industry={b.industry}
                  location={b.location}
                  verified={b.isVerified}
                />
              ))
            ) : (
              <p className="md:col-span-3 text-sm text-fg-muted text-center py-2">No brands listed yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* ─── Stats banner ─── */}
      <section className="px-6 py-6" id="stats">
        <div
          className="glass max-w-[1080px] mx-auto rounded-2xl px-8 py-7 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="grad-text text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
              <p className="text-fg-muted text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-6 py-20 text-center" id="features">
        <div className="max-w-[1080px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-400 mb-4"
            style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.2)' }}>
            Platform
          </div>
          <h2
            className="text-3xl md:text-4xl font-bold max-w-[600px] mx-auto mb-12"
            style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
          >
            Everything a collaboration needs, in one place
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card card-hover rounded-2xl p-6">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                  style={{ background: 'rgba(109,92,255,0.12)', color: 'var(--brand-400)' }}
                >
                  {icon}
                </div>
                <h3 className="font-semibold text-fg mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {title}
                </h3>
                <p className="text-fg-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Match Explainer ─── */}
      <section className="px-6 py-20" id="ai">
        <div className="max-w-[1080px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-400 mb-4"
                style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.2)' }}>
                Explainable AI
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-5"
                style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
              >
                Know <em className="grad-text not-italic">exactly</em> why a creator is a match
              </h2>
              <p className="text-fg-muted leading-relaxed mb-6">
                Every recommendation comes with a transparent score breakdown across audience fit,
                niche alignment, location, engagement quality, and budget compatibility.
                No black boxes, ever.
              </p>
              <ul className="space-y-3">
                {['94% overall match score with reasons','Fraud & bot detection per creator','Budget fit estimation','Brand safety score'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-fg">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                      style={{ background: 'rgba(22,179,100,0.15)', color: '#16b364' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: match card */}
            <div className="card rounded-2xl p-6">
              {discoverLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : topCreator ? (
              <>
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  src={topCreator.avatarUrl}
                  initials={(topCreator.displayName || topCreator.username || '?').slice(0, 2).toUpperCase()}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{topCreator.displayName || topCreator.username}</p>
                  <p className="text-fg-muted text-sm">{cityFromLocation(topCreator.location)} · {formatNiche(topCreator.niche)} · {formatFollowers(topCreator.followerCount ?? 0)}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-xs px-2 py-0.5 rounded-full text-success"
                      style={{ background: 'rgba(22,179,100,0.14)' }}>🛡 {topCreator.trustScore ?? 70}% trust score</span>
                  </div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <ScoreRing value={topCreator.trustScore ?? 70} size={72} />
                </div>
              </div>

              {/* Score bars */}
              {[['Audience match', 96], ['Industry match', 98], ['Location match', 100], ['Budget match', 92], ['Brand safety', 94]].map(([k, v]) => (
                <div key={k} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-fg-muted">{k}</span>
                    <span className="text-fg font-medium">{v}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--surface-2)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${v}%`,
                        background: 'linear-gradient(90deg, #6d5cff, #4c2dd1)',
                        transition: 'width 0.8s cubic-bezier(.22,1,.36,1)',
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Reasons */}
              <div className="mt-4 rounded-xl p-3 space-y-2"
                style={{ background: 'rgba(109,92,255,0.06)', border: '1px solid rgba(109,92,255,0.15)' }}>
                <p className="text-xs font-medium text-brand-400 mb-1">✦ Why CreConnect matched</p>
                {[
                  `Creates in your niche: ${formatNiche(topCreator.niche)}.`,
                  `Based in ${cityFromLocation(topCreator.location)} — a strong fit for local campaigns.`,
                  `${formatFollowers(topCreator.followerCount ?? 0)} followers with verified platform presence.`,
                ].map(r => (
                  <p key={r} className="text-xs text-fg-muted">• {r}</p>
                ))}
              </div>
              </>
              ) : (
                <p className="text-sm text-fg-muted py-8 text-center">Featured creator profiles appear here once creators join the platform.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="px-6 py-20" id="testimonials">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-400 mb-4"
            style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.2)' }}>
            Testimonials
          </div>
          <h2
            className="text-3xl font-bold mb-12"
            style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
          >
            Trusted by Pakistan's top brands & creators
          </h2>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, avatar, quote }) => (
              <div key={name} className="card rounded-2xl p-6 text-left">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-accent text-sm">★</span>
                  ))}
                </div>
                <p className="text-fg-muted text-sm leading-relaxed mb-5">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
                  >
                    {avatar}
                  </div>
                  <div>
                    <p className="text-fg text-sm font-semibold">{name}</p>
                    <p className="text-fg-muted text-xs">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="px-6 py-20" id="pricing">
        <div className="max-w-[1080px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-400 mb-4"
            style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.2)' }}>
            Pricing
          </div>
          <h2
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
          >
            Simple, transparent pricing
          </h2>
          <p className="text-fg-muted mb-12">Start free. Upgrade when you're ready to scale.</p>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map(({ name, price, period, desc, features, cta, popular }) => (
              <div
                key={name}
                className="card rounded-2xl p-6 text-left flex flex-col relative"
                style={popular ? {
                  borderColor: 'rgba(109,92,255,0.4)',
                  background: 'rgba(109,92,255,0.05)',
                } : {}}
              >
                {popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
                  >
                    Most popular
                  </div>
                )}
                <p className="text-fg-muted text-sm font-medium mb-3">{name}</p>
                <div className="flex items-end gap-1 mb-3">
                  <span className="text-4xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {price}
                  </span>
                  <span className="text-fg-muted text-sm mb-1">{period}</span>
                </div>
                <p className="text-fg-muted text-sm mb-6">{desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-fg">
                      <span className="text-success flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={popular ? 'primary' : 'secondary'}
                  size="full"
                  onClick={() => navigate(ROUTES.ROLE_SELECT)}
                >
                  {cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 py-20" id="faq">
        <div className="max-w-[720px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-400 mb-4"
            style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.2)' }}>
            FAQ
          </div>
          <h2
            className="text-3xl font-bold mb-12"
            style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}
          >
            Frequently asked questions
          </h2>

          <div className="space-y-4 text-left">
            {FAQ.map(({ q, a }) => (
              <details
                key={q}
                className="card rounded-xl"
                style={{ padding: 0 }}
              >
                <summary
                  className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-fg font-medium text-sm select-none list-none"
                  style={{ fontFamily: 'Sora, sans-serif' }}
                >
                  {q}
                  <span className="text-fg-muted text-lg flex-shrink-0">+</span>
                </summary>
                <p className="px-5 pb-5 text-fg-muted text-sm leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="px-6 py-24">
        <div
          className="max-w-[1080px] mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.15), rgba(76,45,209,0.08))', border: '1px solid rgba(109,92,255,0.2)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(60% 80% at 50% 100%, rgba(109,92,255,0.15) 0, transparent 70%)' }}
          />
          <div className="relative z-10">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.025em' }}
            >
              Ready to connect smarter?
            </h2>
            <p className="text-fg-muted text-lg max-w-lg mx-auto mb-8">
              {ctaCountLabel}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate(ROUTES.ROLE_SELECT)}
              >
                Create free account →
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="px-6 py-8 border-t text-center text-fg-muted text-xs"
        style={{ borderColor: 'var(--border)' }}
      >
        <p>© 2026 CreConnect · Built for Pakistan's creator economy</p>
      </footer>
    </div>
  );
}
