// Maps the DB `stage` column (Collaboration.stage) to the frontend Kanban column name.
// DB statuses: PENDING → Applied, ACCEPTED → depends on stage, REJECTED/COMPLETED → terminal
export const DB_STAGE_TO_KANBAN = {
  INQUIRY:     'Approved',
  NEGOTIATION: 'Under Review',
  CONTRACTED:  'Approved',
  IN_PROGRESS: 'In Progress',
  DELIVERED:   'Content Review',
  COMPLETED:   'Completed',
};

export const DB_STATUS_TO_KANBAN = {
  PENDING:   'Applied',
  ACCEPTED:  'Approved',
  REJECTED:  'Cancelled',
  COMPLETED: 'Completed',
};

export const KANBAN_STAGES = [
  'Invitation Received',
  'Applied',
  'Under Review',
  'Approved',
  'In Progress',
  'Content Review',
  'Completed',
  'Cancelled',
];

export const STAGE_BADGE_VARIANT = {
  'Invitation Received': 'accent',
  'Applied': 'neutral',
  'Under Review': 'warning',
  'Approved': 'brand',
  'In Progress': 'brand',
  'Content Review': 'warning',
  'Completed': 'success',
  'Cancelled': 'danger',
};

export const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export const PRIORITY_VARIANT = {
  Low: 'neutral',
  Medium: 'brand',
  High: 'warning',
  Urgent: 'danger',
};

export const ASSIGNED_MANAGERS = [
  'Ayesha Raza', 'Bilal Hassan', 'Sara Ahmed', 'Hamza Tariq', 'Fatima Sheikh',
];

export const PAYMENT_STATUSES = ['Pending', 'Processing', 'Released', 'Completed'];

export const PAYMENT_STATUS_VARIANT = {
  Pending: 'warning',
  Processing: 'accent',
  Released: 'brand',
  Completed: 'success',
};

export const DELIVERABLE_TYPES = ['Reel', 'Story', 'Post', 'Video', 'Livestream', 'UGC Content'];

export const APPROVAL_STATUSES = ['Draft', 'Submitted', 'Needs Revision', 'Approved', 'Rejected'];

export const APPROVAL_STATUS_VARIANT = {
  Draft: 'neutral',
  Submitted: 'accent',
  'Needs Revision': 'warning',
  Approved: 'success',
  Rejected: 'danger',
};

export const CONTRACT_TYPES = ['Single Campaign Agreement', 'Monthly Retainer', 'Usage Rights License', 'Brand Ambassadorship'];

export const HEALTH_LABELS = ['Excellent', 'Good', 'At Risk', 'Needs Attention'];

export const HEALTH_LABEL_VARIANT = {
  Excellent: 'success',
  Good: 'brand',
  'At Risk': 'warning',
  'Needs Attention': 'danger',
};

export const VIEW_MODES = [
  { key: 'kanban', label: 'Kanban', icon: '▦' },
  { key: 'list', label: 'List', icon: '☰' },
  { key: 'table', label: 'Table', icon: '▤' },
  { key: 'calendar', label: 'Calendar', icon: '📅' },
  { key: 'timeline', label: 'Timeline', icon: '⏳' },
];

export const DRAWER_TABS = [
  { key: 'overview', label: 'Overview', icon: '🧭' },
  { key: 'timeline', label: 'Timeline', icon: '⏳' },
  { key: 'deliverables', label: 'Deliverables', icon: '🎬' },
  { key: 'messages', label: 'Messages', icon: '💬' },
  { key: 'payments', label: 'Payments', icon: '💳' },
  { key: 'analytics', label: 'Analytics', icon: '📊' },
  { key: 'documents', label: 'Documents', icon: '📁' },
  { key: 'contract', label: 'Contract', icon: '📜' },
  { key: 'copilot', label: 'AI Copilot', icon: '🤖' },
];

export const DOCUMENT_FOLDERS = ['Campaign Assets', 'Brand Guidelines', 'Contracts', 'Submitted Content'];
