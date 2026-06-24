import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import { formatPKR } from '@/utils/formatters';

const CAPABILITIES = [
  { key: 'overview', icon: '📊', label: 'Summarize My Pipeline' },
  { key: 'attention', icon: '⚠️', label: "What Needs Attention?" },
  { key: 'earnings', icon: '💰', label: 'Earnings Outlook' },
  { key: 'topbrand', icon: '🏆', label: 'Best Performing Brand' },
  { key: 'ideas', icon: '💡', label: 'Content Ideas For My Pipeline' },
  { key: 'tips', icon: '🚀', label: 'Growth Tips' },
];

export default function CollabCopilotModal({ isOpen, onClose, enriched }) {
  const [messages, setMessages] = useState([
    { from: 'copilot', text: "Hi! I'm your Collaboration Copilot. I can summarize your pipeline, flag what needs attention, and surface insights across all your brand partnerships. Pick an action below." },
  ]);

  const stats = useMemo(() => {
    const active = enriched.filter((e) => !['Completed', 'Cancelled'].includes(e.intel.stage));
    const needsReview = enriched.filter((e) => e.deliverables?.some((d) => d.approvalStatus === 'Submitted'));
    const needsRevision = enriched.filter((e) => e.deliverables?.some((d) => d.approvalStatus === 'Needs Revision'));
    const totalEarnings = enriched.reduce((sum, e) => sum + (e.payment?.paid ?? 0), 0);
    const pendingEarnings = enriched.reduce((sum, e) => sum + (e.payment?.pending ?? 0), 0);
    const topBrand = [...enriched].sort((a, b) => (b.performance?.roi ?? 0) - (a.performance?.roi ?? 0))[0];
    const atRisk = enriched.filter((e) => ['At Risk', 'Needs Attention'].includes(e.intel.healthLabel));
    return { active, needsReview, needsRevision, totalEarnings, pendingEarnings, topBrand, atRisk };
  }, [enriched]);

  const RESPONSES = {
    overview: () => `You currently have ${stats.active.length} active collaboration${stats.active.length === 1 ? '' : 's'} out of ${enriched.length} total. ${stats.needsReview.length} item${stats.needsReview.length === 1 ? '' : 's'} are awaiting brand review, and ${stats.needsRevision.length} need revisions from you.`,
    attention: () => {
      const parts = [];
      if (stats.needsRevision.length) parts.push(`${stats.needsRevision.length} deliverable${stats.needsRevision.length === 1 ? '' : 's'} need revisions`);
      if (stats.atRisk.length) parts.push(`${stats.atRisk.length} collaboration${stats.atRisk.length === 1 ? '' : 's'} flagged "At Risk" or "Needs Attention"`);
      if (stats.needsReview.length) parts.push(`${stats.needsReview.length} submission${stats.needsReview.length === 1 ? '' : 's'} pending brand review`);
      return parts.length ? `Here's what needs your attention: ${parts.join('; ')}.` : `Nothing urgent right now — all your collaborations are in good shape!`;
    },
    earnings: () => `You've earned ${formatPKR(stats.totalEarnings)} so far across all collaborations, with ${formatPKR(stats.pendingEarnings)} still pending release. Keep deliverables on schedule to speed up payouts.`,
    topbrand: () => stats.topBrand
      ? `${stats.topBrand.item.brandName} is your top performer with an estimated ${stats.topBrand.performance?.roi ?? 0}% ROI on "${stats.topBrand.item.campaignTitle}". This brand has a ${stats.topBrand.intel.healthFactors.paymentScore}% payment reliability score.`
      : `I need at least one collaboration to analyze brand performance.`,
    ideas: () => `Based on your active campaigns, consider: short-form Reels showing your creative process, UGC-style testimonials, before/after comparisons, and Story polls to boost engagement with your audience.`,
    tips: () => `To grow faster: respond to brand messages within a few hours, submit deliverables ahead of deadlines, keep your portfolio updated with recent campaign results, and ask satisfied brands for reviews.`,
  };

  const runCapability = (key) => {
    const userMsg = { from: 'user', text: CAPABILITIES.find((c) => c.key === key).label };
    const reply = { from: 'copilot', text: RESPONSES[key]() };
    setMessages((m) => [...m, userMsg, reply]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collaboration Copilot" description="AI insights across all your brand partnerships" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CAPABILITIES.map((c) => (
            <button
              key={c.key}
              onClick={() => runCapability(c.key)}
              className="rounded-xl p-3 text-left text-xs font-medium transition-colors hover:bg-brand-500/10 hover:border-brand-500/40"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <span className="text-base block mb-1">{c.icon}</span>
              <span className="text-fg">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={m.from === 'copilot' ? { background: 'var(--brand-500)', color: '#fff' } : { background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {m.from === 'copilot' ? '🤖' : '🙂'}
              </span>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${m.from === 'user' ? 'bg-brand-gradient text-white' : ''}`} style={m.from === 'copilot' ? { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' } : {}}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

CollabCopilotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  enriched: PropTypes.arrayOf(PropTypes.object).isRequired,
};
