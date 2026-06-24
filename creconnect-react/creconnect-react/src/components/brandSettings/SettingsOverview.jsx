import PropTypes from 'prop-types';
import ScoreRing from '@/components/common/ScoreRing';
import Badge from '@/components/common/Badge';
import Button from '@/components/common/Button';

function ScoreCard({ label, value }) {
  return (
    <div className="card rounded-2xl p-4 flex flex-col items-center text-center gap-2">
      <ScoreRing value={value} size={60} strokeWidth={5} />
      <p className="text-fg-muted text-xs leading-tight">{label}</p>
    </div>
  );
}
ScoreCard.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.number.isRequired };

function InfoCard({ icon, label, value, badge }) {
  return (
    <div className="card rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="w-9 h-9 rounded-xl bg-brand-500/12 text-brand-400 flex items-center justify-center text-base flex-shrink-0">{icon}</span>
        {badge}
      </div>
      <div>
        <p className="text-lg font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{value}</p>
        <p className="text-fg-muted text-xs mt-0.5">{label}</p>
      </div>
    </div>
  );
}
InfoCard.propTypes = { icon: PropTypes.node.isRequired, label: PropTypes.string.isRequired, value: PropTypes.node.isRequired, badge: PropTypes.node };

export default function SettingsOverview({
  brandHealthScore, profileCompletion, isVerified, planName,
  activeCampaigns, satisfactionScore, trustScore, responseRate,
  onViewPortfolio, onVerifyBrand, onUpgradePlan, onInviteTeam,
}) {
  return (
    <div className="card rounded-2xl p-5 sm:p-6 space-y-5" style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.10), rgba(76,45,209,0.04))', border: '1px solid var(--border)' }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>Brand Administration</h1>
          <p className="text-fg-muted text-sm mt-0.5">Your workspace at a glance — manage profile, team, billing, and more.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreCard label="Brand Health" value={brandHealthScore} />
        <ScoreCard label="Trust Score" value={trustScore} />
        <ScoreCard label="Creator Satisfaction" value={satisfactionScore} />
        <ScoreCard label="Response Rate" value={responseRate} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <InfoCard icon="📋" label="Profile Completion" value={`${profileCompletion}%`} />
        <InfoCard
          icon="🛡️"
          label="Verification Status"
          value={isVerified ? 'Verified' : 'Pending'}
          badge={<Badge variant={isVerified ? 'success' : 'warning'} label={isVerified ? '✓' : '⏳'} />}
        />
        <InfoCard icon="💎" label="Subscription Plan" value={planName} />
        <InfoCard icon="📣" label="Active Campaigns" value={activeCampaigns} />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button variant="primary" size="sm" onClick={onViewPortfolio}>🪪 View Brand Portfolio</Button>
        {!isVerified && <Button variant="outline" size="sm" onClick={onVerifyBrand}>🛡️ Verify Brand</Button>}
        <Button variant="secondary" size="sm" onClick={onUpgradePlan}>⬆ Upgrade Plan</Button>
        <Button variant="ghost" size="sm" onClick={onInviteTeam}>+ Invite Team Members</Button>
      </div>
    </div>
  );
}

SettingsOverview.propTypes = {
  brandHealthScore: PropTypes.number.isRequired,
  profileCompletion: PropTypes.number.isRequired,
  isVerified: PropTypes.bool,
  planName: PropTypes.string.isRequired,
  activeCampaigns: PropTypes.number.isRequired,
  satisfactionScore: PropTypes.number.isRequired,
  trustScore: PropTypes.number.isRequired,
  responseRate: PropTypes.number.isRequired,
  onViewPortfolio: PropTypes.func.isRequired,
  onVerifyBrand: PropTypes.func.isRequired,
  onUpgradePlan: PropTypes.func.isRequired,
  onInviteTeam: PropTypes.func.isRequired,
};
