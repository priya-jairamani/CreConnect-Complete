import { useEffect, useState, useCallback } from 'react';
import { useCampaignContext } from '@/context/CampaignContext';
import { brandsApi } from '@/api/brands.api';
import CampaignCard from '@/components/cards/CampaignCard';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import CampaignWizard from '@/components/campaigns/CampaignWizard';
import CampaignDetailDrawer from '@/components/campaigns/CampaignDetailDrawer';
import { useToast } from '@/hooks/useToast';

const STATUS_TABS = ['all', 'DRAFT', 'PUBLISHED', 'COMPLETED', 'PAUSED'];

export default function Campaigns() {
  const { createCampaign } = useCampaignContext();
  const toast = useToast();
  const [campaigns,        setCampaigns]        = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [tab,              setTab]              = useState('all');
  const [showWizard,       setShowWizard]       = useState(false);
  const [isCreating,       setIsCreating]       = useState(false);
  const [detailCampaign,   setDetailCampaign]   = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await brandsApi.getCampaigns();
      setCampaigns(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === 'all'
    ? campaigns
    : campaigns.filter((c) => c.status?.toUpperCase() === tab);

  const handleCreate = async (payload) => {
    setIsCreating(true);
    try {
      const created = await createCampaign(payload);
      setCampaigns((prev) => [created, ...prev]);
      setShowWizard(false);
      toast.success('Campaign launched successfully.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create campaign.');
    }
    setIsCreating(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Campaigns
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">Manage and track all your brand campaigns.</p>
        </div>
        <Button variant="primary" onClick={() => setShowWizard(true)}>
          + New Campaign
        </Button>
      </header>

      {/* Status tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all"
            style={
              tab === t
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'transparent', color: 'var(--fg-muted)' }
            }
          >
            {t === 'all' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            {t !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {campaigns.filter(c => c.status?.toUpperCase() === t).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="◈"
          title={tab === 'all' ? 'No campaigns yet' : `No ${tab.toLowerCase()} campaigns`}
          message="Create your first campaign to start connecting with creators."
          action={<Button variant="primary" onClick={() => setShowWizard(true)}>Create Campaign</Button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <CampaignCard key={c.id} campaign={c} onViewDetails={setDetailCampaign} />
          ))}
        </div>
      )}

      <CampaignWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      <CampaignDetailDrawer
        campaign={detailCampaign}
        isOpen={!!detailCampaign}
        onClose={() => setDetailCampaign(null)}
        onUpdate={(updated) => {
          setCampaigns((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
          setDetailCampaign((prev) => prev ? { ...prev, ...updated } : prev);
        }}
      />
    </div>
  );
}
