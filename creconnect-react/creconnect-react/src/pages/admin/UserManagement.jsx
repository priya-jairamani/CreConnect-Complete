import { useState } from 'react';
import { useToast } from '@/hooks/useToast';

import OverviewTab from '@/components/userIntelligence/OverviewTab';
import CreatorsTab from '@/components/userIntelligence/CreatorsTab';
import BrandsTab from '@/components/userIntelligence/BrandsTab';
import VerificationQueueTab from '@/components/userIntelligence/VerificationQueueTab';
import SuspendedTab from '@/components/userIntelligence/SuspendedTab';
import CreatorDrawer from '@/components/userIntelligence/CreatorDrawer';
import BrandDrawer from '@/components/userIntelligence/BrandDrawer';
import UserSearchBar from '@/components/userIntelligence/UserSearchBar';

import { CREATORS, BRANDS } from '@/utils/mockUserIntelligence';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'creators', label: 'Creators', icon: '✦' },
  { id: 'brands', label: 'Brands', icon: '🏢' },
  { id: 'verification', label: 'Verification Queue', icon: '🛂' },
  { id: 'suspended', label: 'Suspended Accounts', icon: '⛔' },
];

const ACTION_MESSAGES = {
  verify: 'verification approved',
  approve: 'verification approved',
  needs_review: 'flagged for manual review',
  reject: 'verification rejected',
  suspend: 'suspended',
  activate: 'restored to active',
  restore: 'restored to active',
  extend: 'suspension extended',
  delete: 'permanently removed',
  export: 'exported',
  tag: 'tagged',
};

export default function UserManagement() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  function handleSearchSelect(result) {
    if (result.type === 'creator') {
      setActiveTab('creators');
      setSelectedCreator(CREATORS.find((c) => c.id === result.id) ?? null);
    } else {
      setActiveTab('brands');
      setSelectedBrand(BRANDS.find((b) => b.id === result.id) ?? null);
    }
  }

  function handleSelectEntity(entityId, entityType) {
    if (entityType === 'creator') {
      setActiveTab('creators');
      setSelectedCreator(CREATORS.find((c) => c.id === entityId) ?? null);
    } else {
      setActiveTab('brands');
      setSelectedBrand(BRANDS.find((b) => b.id === entityId) ?? null);
    }
  }

  function describeTarget(target) {
    if (Array.isArray(target)) return `${target.length} account${target.length === 1 ? '' : 's'}`;
    return target?.name || target?.companyName || 'Account';
  }

  function handleAction(actionId, target) {
    const msg = ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${describeTarget(target)} ${msg}.`);
    if (['verify', 'approve', 'reject', 'needs_review', 'suspend', 'activate', 'restore', 'extend', 'delete'].includes(actionId)) {
      setSelectedCreator(null);
      setSelectedBrand(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Users &amp; Verification
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Analyze, manage, verify and monitor creators &amp; brands across the marketplace.
          </p>
        </div>
        <UserSearchBar onSelect={handleSearchSelect} />
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-surface-2 rounded-full p-1 w-fit overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'bg-brand-gradient text-white' : 'text-fg-muted hover:text-fg'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && <OverviewTab onSelectEntity={handleSelectEntity} />}
      {activeTab === 'creators' && (
        <CreatorsTab isLoading={false} onSelectCreator={setSelectedCreator} onAction={handleAction} />
      )}
      {activeTab === 'brands' && (
        <BrandsTab isLoading={false} onSelectBrand={setSelectedBrand} onAction={handleAction} />
      )}
      {activeTab === 'verification' && <VerificationQueueTab onAction={handleAction} />}
      {activeTab === 'suspended' && <SuspendedTab onAction={handleAction} />}

      {/* Slide-over intelligence panels */}
      <CreatorDrawer creator={selectedCreator} onClose={() => setSelectedCreator(null)} onAction={handleAction} />
      <BrandDrawer brand={selectedBrand} onClose={() => setSelectedBrand(null)} onAction={handleAction} />
    </div>
  );
}
