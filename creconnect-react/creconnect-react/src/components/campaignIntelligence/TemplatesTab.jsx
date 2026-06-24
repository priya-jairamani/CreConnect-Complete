import { useState } from 'react';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import { TEMPLATES } from '@/utils/mockCampaignIntelligence';

/* ─── Policy metadata overlaid on top of template data ─────────────
   Admin governs these policies — brands must comply when running
   campaigns in each category.
 */
const POLICY_META = {
  Fashion:     { scope: 'All Fashion & Apparel Campaigns', icon: '👗', compliance: 'Required' },
  Technology:  { scope: 'Tech Product & SaaS Campaigns',  icon: '💻', compliance: 'Required' },
  Beauty:      { scope: 'Beauty & Personal Care Campaigns', icon: '💄', compliance: 'Required' },
  Food:        { scope: 'Food & Beverage Campaigns',       icon: '🍽️', compliance: 'Required' },
  Fitness:     { scope: 'Health & Fitness Campaigns',      icon: '💪', compliance: 'Recommended' },
  Travel:      { scope: 'Travel & Hospitality Campaigns',  icon: '✈️', compliance: 'Recommended' },
  Education:   { scope: 'EdTech & Online Learning',        icon: '📚', compliance: 'Required' },
  Finance:     { scope: 'Financial Services Campaigns',    icon: '🏦', compliance: 'Mandatory' },
};

const COMPLIANCE_VARIANT = {
  Mandatory:    'danger',
  Required:     'warning',
  Recommended:  'brand',
};

export default function TemplatesTab({ onAction }) {
  const [expandedId, setExpandedId] = useState(null);
  const [search,     setSearch]     = useState('');

  const filtered = TEMPLATES.filter((t) =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Campaign Policy Templates
          </h3>
          <p className="text-xs text-fg-muted mt-0.5">
            Admin-governed compliance policies that brands must follow when launching campaigns in each category.
            Applying a policy sets content guidelines, required disclosures, and review checkpoints.
          </p>
        </div>
        <div className="relative flex-shrink-0 w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted text-sm pointer-events-none">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search policies…"
            className="input-base w-full pl-9 text-sm"
          />
        </div>
      </div>

      {/* Policy cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tpl) => {
          const meta       = Object.entries(POLICY_META).find(([k]) => tpl.name?.toLowerCase().includes(k.toLowerCase()));
          const policyMeta = meta ? meta[1] : { scope: 'General Campaigns', icon: '📋', compliance: 'Recommended' };
          const isOpen     = expandedId === tpl.id;

          return (
            <div
              key={tpl.id}
              className="card rounded-2xl p-5 flex flex-col transition-shadow hover:shadow-[0_4px_24px_rgba(109,92,255,0.12)]"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center text-xl flex-shrink-0">
                    {policyMeta.icon}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-fg leading-tight">{tpl.name}</h4>
                    <p className="text-[11px] text-fg-muted mt-0.5 truncate">{policyMeta.scope}</p>
                  </div>
                </div>
                <Badge variant={COMPLIANCE_VARIANT[policyMeta.compliance] ?? 'neutral'} label={policyMeta.compliance} />
              </div>

              {/* Description */}
              <p className="text-xs text-fg-muted leading-relaxed flex-1">{tpl.description}</p>

              {/* Policy requirements chips */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tpl.deliverables.map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded-lg text-[11px] bg-surface-2 text-fg-muted"
                  >
                    {d}
                  </span>
                ))}
              </div>

              {/* Expandable policy details */}
              {isOpen && (
                <div className="mt-3 pt-3 space-y-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider">Policy Details</p>
                  <div className="space-y-1.5">
                    {[
                      `Avg. Campaign ROI benchmark: ${tpl.avgROI}%`,
                      `${tpl.usageCount} campaigns currently under this policy`,
                      `Compliance check: Content must include required disclosures`,
                      `Review checkpoint: Mid-campaign content audit enabled`,
                    ].map((detail) => (
                      <p key={detail} className="text-xs text-fg-muted flex items-start gap-1.5">
                        <span className="text-success mt-0.5">✓</span>
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div
                className="flex items-center justify-between mt-4 pt-3 gap-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isOpen ? null : tpl.id)}
                  className="text-xs text-fg-muted hover:text-fg transition-colors"
                >
                  {isOpen ? '▲ Hide details' : '▾ View details'}
                </button>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => onAction?.('apply_policy', tpl)}
                  >
                    Apply Policy
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => onAction?.('edit_policy', tpl)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-fg-muted">
            <p className="text-3xl mb-2 opacity-40">📜</p>
            <p className="font-medium text-fg mb-1">No policies match your search</p>
            <p className="text-sm">Try a different keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
}
