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
  const { createCampaign, updateCampaign } = useCampaignContext();
  const toast = useToast();
  const [campaigns,        setCampaigns]        = useState([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [tab,              setTab]              = useState('all');
  const [showWizard,       setShowWizard]       = useState(false);
  const [isCreating,       setIsCreating]       = useState(false);
  const [isSavingDraft,    setIsSavingDraft]    = useState(false);
  const [editCampaign,     setEditCampaign]     = useState(null); // draft being edited
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

  const handleSaveDraft = async (payload) => {
    setIsSavingDraft(true);
    try {
      const draft = await createCampaign({ ...payload, status: 'DRAFT' });
      setCampaigns((prev) => [draft, ...prev]);
      toast.success('Draft saved — you can finish it anytime.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save draft.');
    }
    setIsSavingDraft(false);
  };

  const handleUpdateCampaign = async (id, payload) => {
    setIsCreating(true);
    try {
      const { data } = await updateCampaign(id, payload);
      const updated = data?.data ?? data;
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, ...updated } : c));
      setShowWizard(false);
      setEditCampaign(null);
      toast.success(payload.status === 'PUBLISHED' ? 'Campaign published!' : 'Draft updated.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update campaign.');
    }
    setIsCreating(false);
  };

  const openEditWizard = (campaign) => {
    setEditCampaign(campaign);
    setDetailCampaign(null); // close drawer if open
    setShowWizard(true);
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
            {t !== 'all' && (() => {
              const count = campaigns.filter(c => c.status?.toUpperCase() === t).length;
              if (!count) return null;
              return (
                <span
                  className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                  style={t === 'DRAFT' && tab !== t
                    ? { background: 'rgba(234,179,8,0.2)', color: '#eab308' }
                    : { opacity: 0.7 }
                  }
                >
                  {count}
                </span>
              );
            })()}
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
            <CampaignCard
              key={c.id}
              campaign={c}
              onViewDetails={setDetailCampaign}
              onEdit={openEditWizard}
            />
          ))}
        </div>
      )}

      <CampaignWizard
        isOpen={showWizard}
        onClose={() => { setShowWizard(false); setEditCampaign(null); }}
        onSubmit={handleCreate}
        onSaveDraft={handleSaveDraft}
        onUpdate={handleUpdateCampaign}
        editCampaign={editCampaign}
        isSavingDraft={isSavingDraft}
        isSubmitting={isCreating}
      />

      <CampaignDetailDrawer
        campaign={detailCampaign}
        isOpen={!!detailCampaign}
        onClose={() => setDetailCampaign(null)}
        onEditDraft={openEditWizard}
        onUpdate={(updated) => {
          setCampaigns((prev) => prev.map((c) => c.id === updated.id ? { ...c, ...updated } : c));
          setDetailCampaign((prev) => prev ? { ...prev, ...updated } : prev);
        }}
      />
    </div>
  );
}
