import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import api from '@/api/client';

const VIOLATIONS = [
  'Spam or misleading content',
  'Harassment or bullying',
  'Fake followers or engagement',
  'Inappropriate content',
  'Intellectual property violation',
  'Fraudulent collaboration practices',
  'Other',
];

const VIOLATION_TYPE_MAP = {
  'Spam or misleading content':          'SPAM',
  'Harassment or bullying':              'HARASSMENT',
  'Fake followers or engagement':        'FAKE_ENGAGEMENT',
  'Inappropriate content':               'INAPPROPRIATE_CONTENT',
  'Intellectual property violation':     'COPYRIGHT',
  'Fraudulent collaboration practices':  'FRAUD',
  'Other':                               'OTHER',
};

export default function ReportCreator() {
  const [selected,   setSelected]  = useState('');
  const [details,    setDetails]   = useState('');
  const [submitted,  setSubmitted] = useState(false);
  const [isLoading,  setIsLoading] = useState(false);
  const [error,      setError]     = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const reportedId = searchParams.get('userId');
      await api.post('/reports', {
        reportedId: reportedId || 'unknown',
        type: VIOLATION_TYPE_MAP[selected] || 'OTHER',
        details,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <EmptyState
          icon="✅"
          title="Report Submitted"
          message="Thank you. Our moderation team will review the report within 24 hours."
          action={
            <Button variant="secondary" onClick={() => navigate(ROUTES.CREATOR_DASHBOARD)}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <header>
        <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
          Report a Creator
        </h1>
        <p className="text-fg-muted text-sm mt-0.5">Help keep CreConnect safe and authentic.</p>
      </header>

      <form onSubmit={handleSubmit} className="card rounded-2xl p-6 space-y-5">
        <div>
          <p className="text-fg font-medium text-sm mb-3">Select violation type</p>
          <div className="space-y-2">
            {VIOLATIONS.map((v) => (
              <label key={v} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl transition-colors" style={selected === v ? { background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.2)' } : { border: '1px solid transparent' }}>
                <input
                  type="radio"
                  name="violation"
                  value={v}
                  checked={selected === v}
                  onChange={() => setSelected(v)}
                  style={{ accentColor: 'var(--brand-500)' }}
                />
                <span className="text-sm" style={{ color: selected === v ? 'var(--brand-400)' : 'var(--fg-muted)' }}>
                  {v}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-fg">Additional details</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={4}
            placeholder="Describe the issue in detail…"
            className="input-base resize-none"
          />
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(240,68,95,0.08)', border: '1px solid rgba(240,68,95,0.2)', color: 'var(--danger)' }}>
            {error}
          </div>
        )}
        <Button type="submit" variant="danger" size="md" disabled={!selected || isLoading} isLoading={isLoading}>
          Submit Report
        </Button>
      </form>
    </div>
  );
}
