import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { useIsMockAdmin } from '@/hooks/useIsMockAdmin';
import LiveRevenuePayments from '@/components/revenuePayments/LiveRevenuePayments';

import OverviewTab from '@/components/revenuePayments/OverviewTab';
import TransactionsTab from '@/components/revenuePayments/TransactionsTab';
import CreatorPayoutsTab from '@/components/revenuePayments/CreatorPayoutsTab';
import BrandSpendingTab from '@/components/revenuePayments/BrandSpendingTab';
import EscrowDisputesTab from '@/components/revenuePayments/EscrowDisputesTab';
import FinancialAnalyticsTab from '@/components/revenuePayments/FinancialAnalyticsTab';

import TransactionDrawer from '@/components/revenuePayments/TransactionDrawer';
import CreatorFinancialDrawer from '@/components/revenuePayments/CreatorFinancialDrawer';
import BrandFinancialDrawer from '@/components/revenuePayments/BrandFinancialDrawer';
import DisputeDrawer from '@/components/revenuePayments/DisputeDrawer';
import RevenuePaymentsSearchBar from '@/components/revenuePayments/RevenuePaymentsSearchBar';

import { TRANSACTIONS, CREATOR_PAYOUTS, BRAND_SPENDING, PAYMENT_DISPUTES } from '@/utils/mockRevenuePayments';

const TABS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'transactions', label: 'Transactions', icon: '💳' },
  { id: 'payouts', label: 'Creator Payouts', icon: '🎙️' },
  { id: 'spending', label: 'Brand Spending', icon: '🏢' },
  { id: 'escrow', label: 'Escrow & Disputes', icon: '🔒' },
  { id: 'analytics', label: 'Financial Analytics', icon: '📈' },
];

const QUICK_ACTIONS = [
  { id: 'release_escrow', icon: '🔓', label: 'Release Escrow' },
  { id: 'review_disputes', icon: '⚖️', label: 'Review Disputes' },
  { id: 'export_financials', icon: '⬇', label: 'Export Financials' },
  { id: 'generate_report', icon: '📄', label: 'Generate Revenue Report' },
  { id: 'investigate_transactions', icon: '🔍', label: 'Investigate Transactions' },
];

const BULK_ACTION_MESSAGES = {
  approve_releases: 'approved for escrow release',
  export_transactions: 'exported',
  flag_transactions: 'flagged for review',
  assign_reviews: 'assigned for review',
  generate_reports: 'queued for report generation',
};

export default function RevenuePayments() {
  const isMock = useIsMockAdmin();
  return isMock ? <MockRevenuePayments /> : <LiveRevenuePayments />;
}

function MockRevenuePayments() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);

  function handleSearchSelect(result) {
    switch (result.type) {
      case 'transaction': {
        setActiveTab('transactions');
        const txn = TRANSACTIONS.find((t) => t.id === result.id);
        if (txn) setSelectedTransaction(txn);
        break;
      }
      case 'creator': {
        setActiveTab('payouts');
        const creator = CREATOR_PAYOUTS.find((c) => c.id === result.id);
        if (creator) setSelectedCreator(creator);
        break;
      }
      case 'brand': {
        setActiveTab('spending');
        const brand = BRAND_SPENDING.find((b) => b.id === result.id);
        if (brand) setSelectedBrand(brand);
        break;
      }
      case 'campaign': {
        setActiveTab('escrow');
        break;
      }
      case 'dispute': {
        setActiveTab('escrow');
        const dispute = PAYMENT_DISPUTES.find((d) => d.id === result.id);
        if (dispute) setSelectedDispute(dispute);
        break;
      }
      default:
        setActiveTab('overview');
        break;
    }
  }

  function handleTransactionAction(actionId, transaction) {
    const msg = actionId === 'release' ? 'escrow released' : 'flagged for review';
    toast.success(`${transaction.id} ${msg}.`);
    if (actionId === 'release') setSelectedTransaction(null);
  }

  function handleCreatorAction(actionId, creator) {
    if (actionId === 'export') {
      toast.success(`Earnings report for ${creator.name} exported.`);
    } else {
      toast.success(`Pending payout released for ${creator.name}.`);
      setSelectedCreator(null);
    }
  }

  function handleBrandAction(actionId, brand) {
    if (actionId === 'export') {
      toast.success(`Spend report for ${brand.name} exported.`);
    } else {
      setActiveTab('escrow');
      setSelectedBrand(null);
    }
  }

  function handleDisputeAction(actionId, dispute) {
    const msg = actionId === 'resolve' ? 'resolved in the creator\'s favor' : 'rejected';
    toast.success(`${dispute.id} ${msg}.`);
    setSelectedDispute(null);
  }

  function handleBulkAction(actionId, selectedIds) {
    const msg = BULK_ACTION_MESSAGES[actionId] ?? 'updated';
    toast.success(`${selectedIds.length} transaction(s) ${msg}.`);
  }

  function handleExport() {
    toast.success('Transaction export started.');
  }

  function handleQuickAction(actionId) {
    switch (actionId) {
      case 'release_escrow':
        setActiveTab('escrow');
        toast.success('Escrow release workspace opened.');
        break;
      case 'review_disputes':
        setActiveTab('escrow');
        break;
      case 'export_financials':
        toast.success('Financial export started.');
        break;
      case 'generate_report':
        setActiveTab('analytics');
        toast.success('Revenue report generation started.');
        break;
      case 'investigate_transactions':
        setActiveTab('transactions');
        break;
      default:
        break;
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Revenue &amp; Payments
          </h1>
          <p className="text-fg-muted text-sm mt-0.5">
            Monitor platform revenue, creator earnings, brand spending, escrow and financial health from one command center.
          </p>
        </div>
        <RevenuePaymentsSearchBar onSelect={handleSearchSelect} />
      </header>

      {/* Quick Actions */}
      <div className="card rounded-2xl p-3 flex items-center gap-2 overflow-x-auto sticky top-0 z-10">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => handleQuickAction(a.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 hover:bg-brand-500/12 hover:text-brand-400 text-fg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

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
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'transactions' && (
        <TransactionsTab onSelectTransaction={setSelectedTransaction} onBulkAction={handleBulkAction} onExport={handleExport} />
      )}
      {activeTab === 'payouts' && <CreatorPayoutsTab onSelectCreator={setSelectedCreator} />}
      {activeTab === 'spending' && <BrandSpendingTab onSelectBrand={setSelectedBrand} />}
      {activeTab === 'escrow' && <EscrowDisputesTab onSelectDispute={setSelectedDispute} />}
      {activeTab === 'analytics' && <FinancialAnalyticsTab onSelectTransaction={setSelectedTransaction} />}

      {/* Detail workspaces */}
      <TransactionDrawer transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} onAction={handleTransactionAction} />
      <CreatorFinancialDrawer creator={selectedCreator} onClose={() => setSelectedCreator(null)} onAction={handleCreatorAction} />
      <BrandFinancialDrawer brand={selectedBrand} onClose={() => setSelectedBrand(null)} onAction={handleBrandAction} />
      <DisputeDrawer dispute={selectedDispute} onClose={() => setSelectedDispute(null)} onAction={handleDisputeAction} />
    </div>
  );
}
