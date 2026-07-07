import { useAuthContext } from '@/context/AuthContext';
import { isPending } from '@/utils/accountStatus';

export default function PendingApprovalBanner() {
  const { user } = useAuthContext();

  if (!isPending(user)) return null;

  return (
    <div
      className="mx-6 mt-4 mb-0 px-4 py-3 rounded-xl flex items-start gap-3 text-sm"
      style={{
        background: 'rgba(245,166,35,0.1)',
        border: '1px solid rgba(245,166,35,0.35)',
        color: 'var(--fg)',
      }}
    >
      <span className="text-lg leading-none mt-0.5" aria-hidden>⏳</span>
      <div>
        <p className="font-semibold">Account pending approval</p>
        <p className="text-fg-muted mt-0.5 leading-relaxed">
          Your account has been created. An admin will review it shortly. You can explore your dashboard and update your profile — collaborations, campaigns, messages, and payments unlock once approved.
        </p>
      </div>
    </div>
  );
}
