import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { formatPKR } from '@/utils/formatters';
import {
  getMatchBreakdown, getCampaignSuccessPrediction, getCreatorOutreachIntel,
} from '@/utils/mockOutreachIntel';

const CAPABILITIES = [
  { key: 'suggestCreators', icon: '🧑‍🤝‍🧑', label: 'Suggest Creators' },
  { key: 'suggestBudget', icon: '💰', label: 'Suggest Budget' },
  { key: 'generateBrief', icon: '📝', label: 'Generate Brief' },
  { key: 'predictSuccess', icon: '🔮', label: 'Predict Campaign Success' },
];

export default function BrandCopilotModal({ isOpen, onClose, proposal, candidates, selectedCreators, onChange, onShortlistCreator }) {
  const [messages, setMessages] = useState([
    { from: 'copilot', text: "Hi! I'm your Brand Copilot. I can suggest creators, recommend a budget, draft your brief, or predict how this campaign will perform. Pick an action below." },
  ]);

  const topMatches = useMemo(() => {
    return [...candidates]
      .map((creator) => ({ creator, match: getMatchBreakdown(creator, proposal) }))
      .sort((a, b) => b.match.overall - a.match.overall)
      .slice(0, 3);
  }, [candidates, proposal]);

  const suggestedBudget = useMemo(() => {
    const pool = selectedCreators.length ? selectedCreators : topMatches.map((m) => m.creator);
    if (!pool.length) return { min: 50000, max: 150000 };
    let min = 0;
    let max = 0;
    pool.forEach((creator) => {
      const intel = getCreatorOutreachIntel(creator);
      min += intel.pricingMin;
      max += intel.pricingMax;
    });
    return { min, max };
  }, [selectedCreators, topMatches]);

  const prediction = useMemo(() => getCampaignSuccessPrediction(proposal, selectedCreators), [proposal, selectedCreators]);

  const pushMessage = (msg) => setMessages((m) => [...m, msg]);

  const runCapability = (key) => {
    const userMsg = { from: 'user', text: CAPABILITIES.find((c) => c.key === key).label };

    if (key === 'suggestCreators') {
      pushMessage(userMsg);
      pushMessage({ from: 'copilot', type: 'creators', creators: topMatches });
      return;
    }

    if (key === 'suggestBudget') {
      const text = `Based on ${selectedCreators.length || topMatches.length} creator${(selectedCreators.length || topMatches.length) === 1 ? '' : 's'} at this profile, a budget of ${formatPKR(suggestedBudget.min)}–${formatPKR(suggestedBudget.max)} should comfortably cover deliverables and incentives.`;
      pushMessage(userMsg);
      pushMessage({ from: 'copilot', text, type: 'budget', value: Math.round((suggestedBudget.min + suggestedBudget.max) / 2) });
      return;
    }

    if (key === 'generateBrief') {
      const niche = proposal.category ?? proposal.niches?.[0] ?? 'this category';
      const objective = proposal.objective ?? 'brand awareness';
      const brief = `Create authentic, scroll-stopping content for ${proposal.title || 'this campaign'} that highlights our product naturally within your ${niche.toLowerCase()} content. Focus on ${objective.toLowerCase()} — keep the tone genuine and on-brand, mention key talking points early, and include a clear call to action.`;
      pushMessage(userMsg);
      pushMessage({ from: 'copilot', text: `Here's a draft brief: "${brief}"`, type: 'brief', value: brief });
      return;
    }

    if (key === 'predictSuccess') {
      const factorsText = prediction.factors.length ? ` ${prediction.factors.join(' ')}` : '';
      const text = `This campaign has a confidence score of ${prediction.confidenceScore}/100, projecting ~${prediction.expectedReach.toLocaleString()} reach, ~${prediction.expectedEngagement.toLocaleString()} engagements, and an estimated ROI of ${prediction.estimatedROI}%.${factorsText}`;
      pushMessage(userMsg);
      pushMessage({ from: 'copilot', text });
      return;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Brand Copilot" description="AI assistance for creator selection, budgeting, and campaign planning" size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
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

        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.from === 'user' ? 'flex-row-reverse' : ''}`}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={m.from === 'copilot' ? { background: 'var(--brand-500)', color: '#fff' } : { background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {m.from === 'copilot' ? '🤖' : '🙂'}
              </span>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm space-y-2 ${m.from === 'user' ? 'bg-brand-gradient text-white' : ''}`} style={m.from === 'copilot' ? { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' } : {}}>
                {m.text && <p>{m.text}</p>}

                {m.type === 'creators' && (
                  <div className="space-y-2">
                    {m.creators.map(({ creator, match }) => {
                      const id = creator.id ?? creator.userId;
                      return (
                        <div key={id} className="flex items-center gap-2 rounded-xl p-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                          <Avatar src={creator.avatarUrl} initials={creator.displayName?.slice(0, 2)?.toUpperCase()} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-fg text-xs font-medium truncate">{creator.displayName}</p>
                            <p className="text-fg-muted text-[10px]">{match.overall}% match · {creator.niche}</p>
                          </div>
                          <Button variant="outline" size="xs" onClick={() => onShortlistCreator(creator)}>Shortlist</Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {m.type === 'budget' && (
                  <Button variant="outline" size="xs" onClick={() => onChange({ budgetTotal: m.value })}>Apply suggested budget</Button>
                )}

                {m.type === 'brief' && (
                  <Button variant="outline" size="xs" onClick={() => onChange({ brief: { ...(proposal.brief ?? {}), instructions: m.value } })}>Use this brief</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

BrandCopilotModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  proposal: PropTypes.object.isRequired,
  candidates: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedCreators: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func.isRequired,
  onShortlistCreator: PropTypes.func.isRequired,
};
