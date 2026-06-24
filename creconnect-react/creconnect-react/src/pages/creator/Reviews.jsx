import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/common/StatCard';
import Badge from '@/components/common/Badge';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import { seededRandom } from '@/utils/mockAnalytics';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

/* ─── Mock data generators ──────────────────────────────────────────── */

const BRAND_POOL = [
  { name: 'NutriLife Pakistan', initials: 'NL', color: '#16b364' },
  { name: 'TechVault PK',       initials: 'TV', color: '#6d5cff' },
  { name: 'StyleHouse',         initials: 'SH', color: '#f59e0b' },
  { name: 'GlowBeauty',         initials: 'GB', color: '#f0445f' },
  { name: 'AdventureGear',      initials: 'AG', color: '#22d3ee' },
  { name: 'UrbanEats',          initials: 'UE', color: '#a78bfa' },
  { name: 'PakFashion Co.',     initials: 'PF', color: '#fb923c' },
  { name: 'DigitalEdge',        initials: 'DE', color: '#38bdf8' },
];

const CAMPAIGN_NAMES = [
  'Ramadan Campaign 2024', 'Summer Collection Launch', 'Brand Awareness Drive',
  'Product Launch – Pro Series', 'Festive Season Campaign', 'Digital Rebranding',
  'Eid ul Adha Special', 'Health & Wellness Month', 'Back to School Drive',
  'Winter Collection 2024', 'New Year Campaign', 'Mega Sale Promo',
];

const COLLAB_TYPES = ['Sponsored Post', 'Story Series', 'YouTube Video', 'Reel', 'Brand Ambassador', 'Live Session', 'UGC Content'];

const REVIEW_TEXTS = [
  'Outstanding content quality and delivered everything ahead of schedule. The engagement metrics blew our expectations out of the water. Highly recommended for any brand looking for authentic reach.',
  'Professional, creative, and easy to communicate with throughout the entire campaign. Our reach grew 5x the projected audience. Will definitely partner again next season.',
  'The creator understood our brand voice immediately. Content was authentic, high quality, and performed extremely well across all our target platforms.',
  'Responsive throughout the campaign and delivered exactly what was agreed upon. The audience interaction was genuine and impressively high for our niche.',
  'One of the best collaborations we\'ve had this year. Incredible attention to detail and a genuine passion for our brand story.',
  'Very creative and delivered content that truly resonated with our target audience. Looking forward to our next long-term collaboration.',
  'Exceeded our KPIs significantly. Professional communication, timely delivery, and the final content was polished and perfectly on-brand.',
  'Great experience from briefing to final delivery. Clear communication, fast turnarounds, and a real understanding of our campaign goals.',
  'Highly professional and talented creator. The content quality was exceptional and the audience response was phenomenal.',
  'Smooth collaboration from start to finish. Clear communication, fast turnarounds, and a real understanding of our brand requirements.',
  'The campaign performance exceeded our projections by 40%. A pleasure to work with — organized, creative, and deeply professional.',
  'Amazing results! The creator brought fresh ideas that elevated our brand positioning. The content felt organic and deeply resonated with the audience.',
];

const TAG_POOL = [
  'Professional', 'Responsive', 'High Quality Content', 'On Time Delivery', 'Great Communication',
];

function generateReviews(seed, count = 12) {
  const rand = seededRandom(`${seed}-reviews-v2`);
  return Array.from({ length: count }, (_, i) => {
    const brand      = BRAND_POOL[Math.floor(rand() * BRAND_POOL.length)];
    const campaign   = CAMPAIGN_NAMES[Math.floor(rand() * CAMPAIGN_NAMES.length)];
    const collabType = COLLAB_TYPES[Math.floor(rand() * COLLAB_TYPES.length)];
    const rating     = Math.floor(rand() > 0.3 ? 5 : 4);
    const text       = REVIEW_TEXTS[Math.floor(rand() * REVIEW_TEXTS.length)];
    const tagCount   = 2 + Math.floor(rand() * 3);
    const shuffled   = [...TAG_POOL].sort(() => rand() - 0.5);
    const tags       = shuffled.slice(0, tagCount);
    const daysAgo    = Math.floor(rand() * 330);
    const date       = new Date(Date.now() - daysAgo * 86_400_000);
    const isFeatured = rand() > 0.68;
    return { id: `rev-${seed}-${i}`, brand, campaign, collabType, rating, text, tags, date, isFeatured };
  });
}

/* ─── Chart styles ──────────────────────────────────────────────────── */

const tooltipStyle = {
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 12, color: 'var(--fg)',
};
const axisTick = { fill: 'var(--fg-muted)', fontSize: 11 };

/* ─── Sub-components ────────────────────────────────────────────────── */

function StarRating({ value, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < value ? '#f59e0b' : 'var(--border)', fontSize: size, lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const { brand, campaign, collabType, rating, text, tags, date, isFeatured } = review;
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div
      className="card rounded-2xl p-5 space-y-3.5 relative transition-shadow hover:shadow-[0_4px_24px_rgba(109,92,255,0.12)]"
      style={isFeatured ? { border: '1px solid rgba(245,166,35,0.35)' } : {}}
    >
      {isFeatured && (
        <span
          className="absolute top-4 right-4 text-[11px] px-2.5 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(245,166,35,0.15)', color: '#f59e0b' }}
        >
          ★ Featured
        </span>
      )}

      {/* Brand header */}
      <div className="flex items-center gap-3 pr-16">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: brand.color }}
        >
          {brand.initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-fg text-sm leading-tight">{brand.name}</p>
          <p className="text-fg-muted text-xs truncate mt-0.5">{campaign}</p>
        </div>
        <div className="ml-auto flex flex-col items-end gap-1 flex-shrink-0">
          <StarRating value={rating} />
          <p className="text-fg-muted text-[10px]">{dateStr}</p>
        </div>
      </div>

      {/* Collab type */}
      <Badge variant="neutral" label={collabType} />

      {/* Review text */}
      <p className="text-fg-muted text-sm leading-relaxed">{text}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[11px] px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(109,92,255,0.1)', color: '#857fff' }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */

export default function Reviews() {
  const { user } = useAuth();
  const seed = user?.email ?? 'creator';

  const reviews = useMemo(() => generateReviews(seed, 14), [seed]);

  const [search,       setSearch]       = useState('');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [sortBy,       setSortBy]       = useState('newest');
  const [showFeatured, setShowFeatured] = useState(false);

  /* Metrics */
  const avgRating = useMemo(() => {
    const sum = reviews.reduce((a, r) => a + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const fiveStarPct = useMemo(
    () => Math.round((reviews.filter((r) => r.rating === 5).length / reviews.length) * 100),
    [reviews],
  );

  const metaRand         = useMemo(() => seededRandom(`${seed}-review-meta`), [seed]);
  const repeatBrandRate  = useMemo(() => Math.round(28 + metaRand() * 42), [metaRand]);
  const successRate      = useMemo(() => Math.round(82 + metaRand() * 16), [metaRand]);

  /* Monthly bar chart */
  const monthlyData = useMemo(() => {
    const r = seededRandom(`${seed}-monthly-rev`);
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => ({
      month, reviews: Math.floor(1 + r() * 4),
    }));
  }, [seed]);

  /* Rating trend line chart */
  const ratingTrend = useMemo(() => {
    const r = seededRandom(`${seed}-rating-trend-v2`);
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => ({
      month, rating: Math.round((4 + r() * 0.95) * 10) / 10,
    }));
  }, [seed]);

  /* Rating distribution */
  const ratingDist = useMemo(() => [5, 4, 3, 2, 1].map((r) => {
    const count = reviews.filter((rev) => rev.rating === r).length;
    return { label: `${r}★`, count, pct: Math.round((count / reviews.length) * 100) };
  }), [reviews]);

  /* Filtered + sorted list */
  const filtered = useMemo(() => {
    let list = [...reviews];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) =>
        r.brand.name.toLowerCase().includes(q) ||
        r.campaign.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q)
      );
    }
    if (ratingFilter > 0) list = list.filter((r) => r.rating === ratingFilter);
    if (showFeatured)      list = list.filter((r) => r.isFeatured);

    if (sortBy === 'newest')  list.sort((a, b) => b.date - a.date);
    if (sortBy === 'oldest')  list.sort((a, b) => a.date - b.date);
    if (sortBy === 'highest') list.sort((a, b) => b.rating - a.rating);
    return list;
  }, [reviews, search, ratingFilter, sortBy, showFeatured]);

  const handleExport = useCallback(() => {
    const csv = [
      ['Brand', 'Campaign', 'Type', 'Rating', 'Date', 'Review', 'Tags'].join(','),
      ...reviews.map((r) => [
        `"${r.brand.name}"`, `"${r.campaign}"`, `"${r.collabType}"`, r.rating,
        r.date.toLocaleDateString(), `"${r.text.replace(/"/g, '""')}"`, `"${r.tags.join('; ')}"`,
      ].join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'reviews.csv';
    a.click();
  }, [reviews]);

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ── */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Reviews Center
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Your social proof, brand feedback, and collaboration reputation — all in one place.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 hover:text-fg"
          style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
        >
          ↓ Export Reviews
        </button>
      </header>

      {/* ── Top metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard value={avgRating}                                               label="Average Rating"      icon="★" highlight />
        <StatCard value={<AnimatedCounter value={reviews.length} />}              label="Total Reviews"       icon="◉" />
        <StatCard value={`${fiveStarPct}%`}                                       label="5-Star Reviews"      icon="⭐" />
        <StatCard value={`${repeatBrandRate}%`}                                   label="Repeat Brand Rate"   icon="♻" />
        <StatCard value={`${successRate}%`}                                       label="Collaboration Success" icon="✓" />
      </div>

      {/* ── Analytics row ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Monthly reviews bar chart */}
        <div className="card rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Monthly Reviews Received
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} margin={{ left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} axisLine={false} tickLine={false} width={24} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="reviews" name="Reviews" fill="#6d5cff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating distribution */}
        <div className="card rounded-2xl p-5">
          <h3 className="font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
            Rating Distribution
          </h3>
          <div className="space-y-3">
            {ratingDist.map(({ label, count, pct }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span className="text-xs text-fg-muted w-6 text-right flex-shrink-0">{label}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 60 ? '#16b364' : pct >= 30 ? '#f59e0b' : '#f0445f',
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
                <span className="text-xs text-fg-muted w-16 flex-shrink-0">{count} ({pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating trend line chart */}
      <div className="card rounded-2xl p-5">
        <h3 className="font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
          Average Rating Trend
        </h3>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={ratingTrend} margin={{ left: -8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={axisTick} axisLine={false} tickLine={false} />
            <YAxis domain={[3.5, 5]} tick={axisTick} axisLine={false} tickLine={false} width={30} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} / 5`, 'Avg. Rating']} />
            <Line
              type="monotone" dataKey="rating" stroke="#f59e0b" strokeWidth={2.5}
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Brand Feedback summary ── */}
      <div className="card rounded-2xl p-5">
        <h3 className="font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
          Brand Feedback Tags
        </h3>
        <div className="flex flex-wrap gap-3">
          {TAG_POOL.map((tag) => {
            const count = reviews.flatMap((r) => r.tags).filter((t) => t === tag).length;
            const pct   = Math.round((count / reviews.length) * 100);
            return (
              <div key={tag} className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <span className="text-sm text-fg font-medium">{tag}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(109,92,255,0.15)', color: '#857fff' }}>
                  {count}x
                </span>
                <span className="text-xs text-fg-muted">({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, campaign, or keyword…"
            className="input-base w-full pl-9"
          />
        </div>

        {/* Rating filter chips */}
        <div className="flex items-center gap-1.5">
          {[0, 5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={ratingFilter === r
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
              }
            >
              {r === 0 ? 'All Ratings' : `${r}★`}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-base"
          style={{ width: 'auto', minWidth: 150 }}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
        </select>

        {/* Featured toggle */}
        <button
          onClick={() => setShowFeatured((v) => !v)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5"
          style={showFeatured
            ? { background: 'rgba(245,166,35,0.15)', color: '#f59e0b', border: '1px solid rgba(245,166,35,0.35)' }
            : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
          }
        >
          ★ Featured Only
        </button>

        <span className="text-fg-muted text-xs ml-auto">{filtered.length} review{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Review cards ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-fg-muted">
          <p className="text-5xl mb-3 opacity-40">★</p>
          <p className="font-medium text-fg mb-1">No reviews match your filters</p>
          <p className="text-sm">Try adjusting the rating filter or search term.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map((review) => <ReviewCard key={review.id} review={review} />)}
        </div>
      )}
    </div>
  );
}
