import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';
import EmptyState from '@/components/common/EmptyState';
import { formatPKR } from '@/utils/formatters';
import { seededRandom } from '@/utils/mockAnalytics';

export default function CollabTimeline({ collaborations, seed }) {
  return (
    <div className="card rounded-2xl p-5">
      <h2 className="font-semibold text-fg mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
        Brand Collaborations
      </h2>

      {!collaborations?.length ? (
        <EmptyState
          icon="◈"
          title="No collaborations yet"
          message="Completed brand collaborations will appear here as a timeline."
        />
      ) : (
        <ol className="relative space-y-6 ml-3 border-l" style={{ borderColor: 'var(--border)' }}>
          {collaborations.map((c) => {
            const brandName = c.brand?.companyName ?? 'Brand';
            const initials = brandName.slice(0, 2).toUpperCase();
            const rand = seededRandom(`${seed}-${c.id}`);
            const earnings = c.agreedRate ?? Math.round(20000 + rand() * 180000);
            const score = Math.round(65 + rand() * 33);

            return (
              <li key={c.id} className="ml-5 relative">
                <span
                  className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2"
                  style={{ background: 'var(--brand-500)', borderColor: 'var(--surface)' }}
                />
                <div className="flex items-center gap-4 rounded-xl p-4" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-fg text-sm truncate">{brandName}</h3>
                    <p className="text-fg-muted text-xs truncate">{c.campaign?.title ?? c.campaign?.niche ?? c.status}</p>
                    <p className="text-success text-xs font-medium mt-0.5">{formatPKR(earnings)} earned</p>
                  </div>
                  <ScoreRing value={score} size={44} strokeWidth={4} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

CollabTimeline.propTypes = {
  collaborations: PropTypes.array,
  seed: PropTypes.string.isRequired,
};
