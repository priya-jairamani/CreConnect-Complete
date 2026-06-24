import { useState } from 'react';
import PropTypes from 'prop-types';

const CAPABILITIES = [
  { key: 'reply', icon: '✍️', label: 'Generate Reply' },
  { key: 'summarize', icon: '📋', label: 'Summarize Feedback' },
  { key: 'revisions', icon: '🛠️', label: 'Suggest Revisions' },
  { key: 'performance', icon: '📊', label: 'Analyze Performance' },
  { key: 'metrics', icon: '🧮', label: 'Explain Metrics' },
  { key: 'ideas', icon: '💡', label: 'Generate Deliverable Ideas' },
];

export default function CopilotTab({ item, intel, deliverables, performance, aiInsights }) {
  const [messages, setMessages] = useState([
    { from: 'copilot', text: `Hi! I'm your Collaboration Copilot for "${item.campaignTitle}" with ${item.brandName}. Pick an action below or ask me anything about this collaboration.` },
  ]);

  const needsRevision = deliverables.find((d) => d.approvalStatus === 'Needs Revision');

  const RESPONSES = {
    reply: () => `Here's a draft reply: "Hi ${item.brandName} team — thanks for the update! I'm on track with the current deliverables and will share the next draft shortly. Let me know if there's anything else you'd like me to prioritize."`,
    summarize: () => needsRevision
      ? `Feedback summary: On "${needsRevision.title}", the brand asked for: "${needsRevision.feedback}" — ${needsRevision.revisionCount} revision(s) requested so far.`
      : `No outstanding feedback right now — all reviewed deliverables are approved. Nice work!`,
    revisions: () => needsRevision
      ? `Suggested next steps for "${needsRevision.title}": address the feedback ("${needsRevision.feedback}"), keep the brand's tone of voice consistent, and resubmit within 48 hours to stay on schedule.`
      : `Everything looks approved — consider proposing a bonus piece of content to strengthen this relationship.`,
    performance: () => `This campaign reached ${performance.reach.toLocaleString()} people with a ${performance.engagement}% engagement rate and an estimated ${performance.roi}% ROI — ${performance.roi >= 150 ? 'one of your stronger campaigns' : 'in line with your typical results'}.`,
    metrics: () => `Quick breakdown: Reach is unique people who saw your content, Impressions counts every view (including repeats), and ROI estimates the value generated relative to the campaign budget. Your conversion rate here is roughly ${((performance.conversions / Math.max(performance.clicks, 1)) * 100).toFixed(1)}%.`,
    ideas: () => `A few deliverable ideas for ${item.brandName}: a "behind-the-scenes" Reel showing your creative process, a UGC-style testimonial Post, and a Story series documenting first impressions of the product.`,
  };

  const runCapability = (key) => {
    const userMsg = { from: 'user', text: CAPABILITIES.find((c) => c.key === key).label };
    const reply = { from: 'copilot', text: RESPONSES[key]() };
    setMessages((m) => [...m, userMsg, reply]);
  };

  return (
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

      <div className="space-y-3">
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

      <div className="rounded-xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        <p className="text-fg-muted text-[10px] font-semibold uppercase tracking-wider mb-2">Health snapshot</p>
        <p className="text-fg text-xs">Health score {intel.healthScore}/100 ({intel.healthLabel}). {aiInsights[0]}</p>
      </div>
    </div>
  );
}

CopilotTab.propTypes = {
  item: PropTypes.object.isRequired,
  intel: PropTypes.object.isRequired,
  deliverables: PropTypes.arrayOf(PropTypes.object).isRequired,
  performance: PropTypes.object.isRequired,
  aiInsights: PropTypes.arrayOf(PropTypes.string).isRequired,
};
