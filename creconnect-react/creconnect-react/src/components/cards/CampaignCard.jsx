import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';
import Avatar from '@/components/common/Avatar';
import { formatPKR } from '@/utils/formatters';
import { ROUTES } from '@/constants/routes';

function formatBudget(campaign) {
  const { budgetMin, budgetMax, budgetPKR, currency = 'PKR' } = campaign;
  if (budgetMin != null && budgetMax != null) {
    return budgetMin === budgetMax
      ? `${currency} ${budgetMin.toLocaleString('en-PK')}`
      : `${currency} ${budgetMin.toLocaleString('en-PK')} – ${budgetMax.toLocaleString('en-PK')}`;
  }
  return formatPKR(budgetPKR);
}

export default function CampaignCard({ campaign, onViewDetails, onEdit }) {
  const navigate      = useNavigate();
  const brandName     = campaign.brand?.companyName;
  const collaborators = Array.isArray(campaign.collaborations) ? campaign.collaborations : [];
  const MAX_SHOWN     = 4;
  const shown  = collaborators.slice(0, MAX_SHOWN);
  const extra  = collaborators.length - MAX_SHOWN;

  const [showList, setShowList] = useState(false);
  const listRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!showList) return;
    const handler = (e) => { if (listRef.current && !listRef.current.contains(e.target)) setShowList(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showList]);

  return (
    <div className="card card-hover rounded-2xl p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="font-semibold text-fg text-base leading-snug min-w-0 line-clamp-2"
          style={{ fontFamily: 'Sora, sans-serif' }}
        >
          {campaign.title}
        </h3>
        <Badge status={campaign.status} className="flex-shrink-0" />
      </div>

      {/* Budget */}
      <div
        className="flex items-center justify-between rounded-xl px-4 py-3"
        style={{ background: 'var(--surface-2)' }}
      >
        <div>
          <p className="text-fg-muted text-xs uppercase tracking-widest mb-0.5">Budget</p>
          <p className="text-fg font-semibold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
            {formatBudget(campaign)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {campaign.status === 'DRAFT' && onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(campaign)}>
              ✏️ Edit
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => onViewDetails?.(campaign)}>
            Details
          </Button>
        </div>
      </div>

      {/* Creators row — click to open list */}
      {collaborators.length > 0 && (
        <div className="relative" ref={listRef}>
          <button
            type="button"
            onClick={() => setShowList(v => !v)}
            className="w-full text-left space-y-2 rounded-xl p-2 -m-2 transition-colors hover:bg-white/[0.04]"
          >
            <p className="text-xs font-medium text-fg-muted uppercase tracking-wide">
              Creators ({collaborators.length}) <span className="normal-case">↓</span>
            </p>
            <div className="flex items-center gap-2">
              {/* Stacked avatars */}
              <div className="flex items-center">
                {shown.map((col, i) => {
                  const creator  = col.creator ?? col;
                  const name     = creator.displayName ?? creator.username ?? '?';
                  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div
                      key={col.id ?? i}
                      title={name}
                      className="w-7 h-7 rounded-full ring-2 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden flex-shrink-0"
                      style={{
                        marginLeft: i > 0 ? -8 : 0,
                        background: creator.avatarUrl ? 'transparent' : 'linear-gradient(135deg,#6d5cff,#4c2dd1)',
                        zIndex: shown.length - i,
                      }}
                    >
                      {creator.avatarUrl
                        ? <img src={creator.avatarUrl} alt={name} className="w-full h-full object-cover" />
                        : initials
                      }
                    </div>
                  );
                })}
                {extra > 0 && (
                  <div
                    className="w-7 h-7 rounded-full ring-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ marginLeft: -8, background: 'var(--surface-2)', color: 'var(--fg-muted)' }}
                  >
                    +{extra}
                  </div>
                )}
              </div>
              <p className="text-xs text-fg truncate min-w-0">
                {shown.slice(0, 2).map(col => (col.creator ?? col).displayName ?? 'Creator').join(', ')}
                {collaborators.length > 2 && ` +${collaborators.length - 2} more`}
              </p>
            </div>
          </button>

          {/* Dropdown list */}
          {showList && (
            <div
              className="absolute left-0 right-0 z-50 mt-2 rounded-2xl shadow-2xl overflow-hidden"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p
                className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider border-b"
                style={{ color: 'var(--fg-muted)', borderColor: 'var(--border)' }}
              >
                {collaborators.length} creator{collaborators.length !== 1 ? 's' : ''} on this campaign
              </p>
              <div className="max-h-60 overflow-y-auto">
                {collaborators.map((col) => {
                  const creator  = col.creator ?? col;
                  const name     = creator.displayName ?? creator.username ?? 'Creator';
                  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                  const creatorId = creator.id ?? col.creatorId;
                  return (
                    <div
                      key={col.id ?? creatorId}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      {/* Avatar */}
                      <div
                        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden"
                        style={{ background: creator.avatarUrl ? 'transparent' : 'linear-gradient(135deg,#6d5cff,#4c2dd1)' }}
                      >
                        {creator.avatarUrl
                          ? <img src={creator.avatarUrl} alt={name} className="w-full h-full object-cover" />
                          : initials
                        }
                      </div>

                      {/* Name + username */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-fg truncate">{name}</p>
                        {creator.username && (
                          <p className="text-xs text-fg-muted">@{creator.username}</p>
                        )}
                      </div>

                      {/* View profile */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowList(false);
                          navigate(`${ROUTES.BRAND_CREATOR_PROFILE}?creatorId=${creatorId}`, {
                            state: { creator },
                          });
                        }}
                        className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                        style={{ background: 'rgba(109,92,255,0.1)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.2)' }}
                      >
                        View ↗
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand / deadline row */}
      <div
        className="flex items-center gap-2.5 pt-1 border-t"
        style={{ borderColor: 'var(--border)' }}
      >
        {brandName ? (
          <>
            <Avatar initials={brandName.slice(0, 2)} size="sm" />
            <span className="text-fg-muted text-xs">{brandName}</span>
          </>
        ) : campaign.niche ? (
          <span className="text-fg-muted text-xs">{campaign.niche}</span>
        ) : null}
        {campaign.deadline && (
          <span className="ml-auto text-fg-muted text-xs">
            Due {new Date(campaign.deadline).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}

CampaignCard.propTypes = {
  campaign: PropTypes.shape({
    id:             PropTypes.string.isRequired,
    title:          PropTypes.string.isRequired,
    status:         PropTypes.string.isRequired,
    niche:          PropTypes.string,
    budgetMin:      PropTypes.number,
    budgetMax:      PropTypes.number,
    budgetPKR:      PropTypes.number,
    currency:       PropTypes.string,
    brand:          PropTypes.shape({ companyName: PropTypes.string }),
    deadline:       PropTypes.string,
    collaborations: PropTypes.arrayOf(PropTypes.shape({
      id:      PropTypes.string,
      creator: PropTypes.shape({
        displayName: PropTypes.string,
        username:    PropTypes.string,
        avatarUrl:   PropTypes.string,
      }),
    })),
  }).isRequired,
  onViewDetails: PropTypes.func,
  onEdit:        PropTypes.func,
};
