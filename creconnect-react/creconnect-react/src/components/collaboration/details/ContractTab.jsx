import EmptyState from '@/components/common/EmptyState';

export default function ContractTab() {
  return (
    <EmptyState
      icon="📜"
      title="Contracts not available yet"
      message="Formal contract generation and e-signing for collaborations isn't implemented yet."
    />
  );
}
