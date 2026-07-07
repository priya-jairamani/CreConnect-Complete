/** Map API ticket records to the Operations UI shape. */

const STATUS_MAP = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

const PRIORITY_MAP = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

const CATEGORY_LABELS = {
  GENERAL: 'General',
  CREATOR: 'Creator Support',
  BRAND: 'Brand Support',
  PAYMENTS: 'Payments',
  CAMPAIGNS: 'Campaigns',
  VERIFICATION: 'Verification',
  TECHNICAL: 'Technical Issues',
  COMPLIANCE: 'Compliance',
};

function reporterName(reporter) {
  if (!reporter) return 'Unknown user';
  return reporter.creatorProfile?.displayName
    || reporter.brandProfile?.companyName
    || reporter.email?.split('@')[0]
    || 'Unknown user';
}

function genInitials(name) {
  return (name || '?').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatCategory(raw = 'GENERAL') {
  const key = String(raw).toUpperCase().replace(/\s+/g, '_');
  return CATEGORY_LABELS[key] ?? raw.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function computeSla(ticket) {
  const status = String(ticket.status || '').toUpperCase();
  if (status === 'RESOLVED' || status === 'CLOSED') return 'on_track';
  const ageH = (Date.now() - new Date(ticket.createdAt)) / 3_600_000;
  if (ageH > 72) return 'breached';
  if (ageH > 48) return 'at_risk';
  return 'on_track';
}

export function normalizeTicket(t) {
  const user = reporterName(t.reporter);
  const agent = t.assignedAdmin?.email?.split('@')[0] || 'Unassigned';
  const created = t.createdAt;
  const status = STATUS_MAP[t.status] ?? 'open';
  const priority = PRIORITY_MAP[t.priority] ?? 'medium';
  const sla = computeSla(t);
  const category = formatCategory(t.category);

  return {
    id: String(t.id).slice(0, 8).toUpperCase(),
    rawId: t.id,
    subject: t.subject,
    description: t.description,
    user,
    userInitials: genInitials(user),
    userColor: '#6d5cff',
    category,
    priority,
    agent,
    status,
    created,
    sla,
    satisfaction: null,
    conversation: t.description
      ? [{ from: 'user', author: user, text: t.description, time: created }]
      : [],
    relatedUser: {
      name: user,
      role: t.reporter?.role === 'BRAND' ? 'Brand' : (t.reporter?.role === 'CREATOR' ? 'Creator' : 'User'),
      accountStatus: t.reporter?.status === 'APPROVED' ? 'Active' : (t.reporter?.status ?? 'Active'),
      joined: t.reporter?.createdAt ?? created,
      totalTickets: 1,
    },
    relatedCampaign: null,
    history: [
      { event: 'Ticket created', date: created },
      ...(t.assignedAdmin ? [{ event: `Assigned to ${agent}`, date: t.updatedAt ?? created }] : []),
      ...(t.resolvedAt ? [{ event: 'Marked resolved', date: t.resolvedAt }] : []),
    ],
    notes: [],
    aiSuggestions: {
      suggestedReply: `Hi ${user.split(' ')[0]}, thank you for reaching out about "${t.subject}". We're reviewing your request and will follow up shortly.`,
      resolutionSummary: `${category} ticket — ${t.subject}`,
      escalationRecommendation: priority === 'urgent' || sla === 'breached'
        ? 'Priority handling recommended — SLA at risk.'
        : 'Standard resolution path is sufficient.',
      relatedCases: [],
      riskAssessment: priority === 'urgent' ? 'high' : (sla === 'at_risk' ? 'medium' : 'low'),
    },
  };
}

export function computeSupportMetrics(rawTickets = []) {
  const today = new Date().toDateString();
  const open = rawTickets.filter((t) => ['OPEN', 'IN_PROGRESS'].includes(t.status));
  const resolvedToday = rawTickets.filter((t) => {
    if (!t.resolvedAt) return false;
    return new Date(t.resolvedAt).toDateString() === today;
  });

  return {
    openTickets: open.length,
    pendingResponses: rawTickets.filter((t) => t.status === 'OPEN').length,
    escalatedCases: rawTickets.filter((t) => t.priority === 'URGENT').length,
    resolvedToday: resolvedToday.length,
    avgResponseTimeMin: rawTickets.length ? '—' : 0,
    csat: rawTickets.length ? '—' : 0,
  };
}

export function buildTicketSearchIndex(tickets = []) {
  return tickets.map((t) => ({
    type: 'ticket',
    id: t.rawId ?? t.id,
    label: `${t.id} · ${t.subject}`,
    sub: `${t.category} · ${t.user}`,
  }));
}

export function unwrapTicketList(res) {
  return Array.isArray(res?.data) ? res.data : [];
}
