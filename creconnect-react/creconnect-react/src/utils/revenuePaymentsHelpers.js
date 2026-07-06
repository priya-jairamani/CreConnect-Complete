/**
 * Real-data helpers for the Admin "Revenue & Payments" page.
 * Pure functions that turn raw Payment / Subscription rows (from GET /admin/payments,
 * /admin/subscriptions, /admin/revenue) into the shapes the UI renders. No fabricated
 * numbers — every value here is either passed through or a straightforward sum/count/avg
 * over real rows.
 */

export const PAYMENT_STATUS_META = {
  PENDING:  { label: 'Pending',   variant: 'neutral' },
  ESCROW:   { label: 'In Escrow', variant: 'brand' },
  RELEASED: { label: 'Released',  variant: 'success' },
  PAID:     { label: 'Paid Out',  variant: 'success' },
  DISPUTED: { label: 'Disputed',  variant: 'danger' },
};

export const PAYMENT_STATUS_OPTIONS = ['All', ...Object.keys(PAYMENT_STATUS_META)];

const AVATAR_COLORS = ['#6d5cff', '#857fff', '#16b364', '#f59e0b', '#f0445f', '#0ea5e9', '#d946ef', '#10b981', '#f97316', '#6366f1'];

export function initialsFor(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0, 2).map((w) => w[0]).join('') || '?').toUpperCase();
}

export function colorFor(key = '') {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function creatorNameOf(collaboration) {
  return collaboration?.creator?.displayName || collaboration?.creator?.username || 'Unknown creator';
}

export function brandNameOf(collaboration) {
  return collaboration?.brand?.companyName || 'Unknown brand';
}

export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function monthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

/**
 * Bucket payments into monthly totals. Defaults to summing RELEASED/PAID amounts by
 * `releasedAt` — i.e. real settled revenue, bucketed by the month it actually cleared.
 */
export function bucketPaymentsByMonth(payments, { dateField = 'releasedAt', statuses = ['RELEASED', 'PAID'], months = 12 } = {}) {
  const buckets = new Map();
  (payments || []).forEach((p) => {
    if (statuses && !statuses.includes(p.status)) return;
    const raw = p[dateField];
    if (!raw) return;
    const key = monthKey(raw);
    buckets.set(key, (buckets.get(key) || 0) + Number(p.amountPKR || 0));
  });
  const sortedKeys = [...buckets.keys()].sort().slice(-months);
  return sortedKeys.map((k) => ({ label: monthLabel(k), total: Math.round(buckets.get(k)) }));
}

/** Group a page of Payments by creator, summing real amounts per status. */
export function aggregateByCreator(payments) {
  const map = new Map();
  (payments || []).forEach((p) => {
    const collab = p.collaboration;
    if (!collab?.creator) return;
    const key = collab.creator.username || collab.creator.displayName || `collab-${collab.id}`;
    if (!map.has(key)) {
      const name = creatorNameOf(collab);
      map.set(key, {
        id: key,
        name,
        initials: initialsFor(name),
        color: colorFor(key),
        campaignIds: new Set(),
        totalEarnings: 0,
        pendingAmount: 0,
        paidAmount: 0,
        releasedAmount: 0,
        lastPayout: null,
        payments: [],
      });
    }
    const entry = map.get(key);
    entry.campaignIds.add(collab.id);
    entry.payments.push(p);
    const amt = Number(p.amountPKR || 0);
    if (p.status === 'ESCROW') entry.pendingAmount += amt;
    if (p.status === 'RELEASED') { entry.releasedAmount += amt; entry.totalEarnings += amt; }
    if (p.status === 'PAID') { entry.paidAmount += amt; entry.totalEarnings += amt; }
    if ((p.status === 'RELEASED' || p.status === 'PAID') && p.releasedAt) {
      if (!entry.lastPayout || new Date(p.releasedAt) > new Date(entry.lastPayout)) entry.lastPayout = p.releasedAt;
    }
  });
  return [...map.values()]
    .map((e) => ({ ...e, campaigns: e.campaignIds.size }))
    .sort((a, b) => b.totalEarnings - a.totalEarnings);
}

/** Group a page of Payments by brand, summing real amounts per status. */
export function aggregateByBrand(payments) {
  const map = new Map();
  (payments || []).forEach((p) => {
    const collab = p.collaboration;
    if (!collab?.brand) return;
    const name = brandNameOf(collab);
    const key = name;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        name,
        initials: initialsFor(name),
        color: colorFor(key),
        campaignIds: new Set(),
        creatorIds: new Set(),
        totalSpend: 0,
        pendingSpend: 0,
        completedPayments: 0,
        disputedAmount: 0,
        payments: [],
      });
    }
    const entry = map.get(key);
    entry.campaignIds.add(collab.id);
    if (collab.creator) entry.creatorIds.add(collab.creator.username || collab.creator.displayName);
    entry.payments.push(p);
    const amt = Number(p.amountPKR || 0);
    if (['ESCROW', 'RELEASED', 'PAID', 'DISPUTED'].includes(p.status)) entry.totalSpend += amt;
    if (p.status === 'ESCROW') entry.pendingSpend += amt;
    if (p.status === 'RELEASED' || p.status === 'PAID') entry.completedPayments += amt;
    if (p.status === 'DISPUTED') entry.disputedAmount += amt;
  });
  return [...map.values()]
    .map((e) => ({ ...e, campaigns: e.campaignIds.size, creatorCount: e.creatorIds.size }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

/** Build a simple CSV string from Payment rows (for the "Export" button — no server export endpoint exists). */
export function paymentsToCSV(payments) {
  const header = ['Payment ID', 'Brand', 'Creator', 'Amount (PKR)', 'Status', 'Created', 'Released'];
  const rows = (payments || []).map((p) => [
    p.id,
    brandNameOf(p.collaboration),
    creatorNameOf(p.collaboration),
    p.amountPKR,
    p.status,
    p.createdAt ? new Date(p.createdAt).toISOString() : '',
    p.releasedAt ? new Date(p.releasedAt).toISOString() : '',
  ]);
  return [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
}

export function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
