import EmptyState from '@/components/common/EmptyState';

export default function DocumentsTab() {
  return (
    <EmptyState
      icon="📁"
      title="Document storage not available yet"
      message="A shared file/document library for this collaboration isn't implemented yet — share files via message attachments in the meantime."
    />
  );
}
