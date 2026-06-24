import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Skeleton from '@/components/common/Skeleton';
import { clsx } from 'clsx';
import { messagesApi } from '@/api/messages.api';
import { useAuthContext } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';

/* ─── Helpers ───────────────────────────────────────────────────── */

function getInitials(name = '') {
  return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function formatPresence(isOnline, lastSeen) {
  if (isOnline) return { text: 'Active now', color: '#16b364', dot: true };
  if (!lastSeen) return { text: 'Offline', color: 'var(--fg-muted)', dot: false };
  const diff = Math.floor((Date.now() - new Date(lastSeen).getTime()) / 1000);
  if (diff < 60)    return { text: 'Active just now', color: 'var(--fg-muted)', dot: false };
  if (diff < 3600)  return { text: `Active ${Math.floor(diff / 60)}m ago`, color: 'var(--fg-muted)', dot: false };
  if (diff < 86400) return { text: `Active ${Math.floor(diff / 3600)}h ago`, color: 'var(--fg-muted)', dot: false };
  return { text: `Active ${Math.floor(diff / 86400)}d ago`, color: 'var(--fg-muted)', dot: false };
}

function shortTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor((now - d) / 86_400_000);
  if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function msgTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function showDateSep(msgs, i) {
  if (i === 0 || !msgs[i]?.createdAt) return !!msgs[i]?.createdAt;
  return new Date(msgs[i].createdAt).toDateString() !== new Date(msgs[i - 1].createdAt).toDateString();
}

/* ─── Date Separator ────────────────────────────────────────────── */
function DateSep({ iso }) {
  const d   = new Date(iso);
  const now = new Date();
  const isToday     = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86_400_000).toDateString() === d.toDateString();
  const label = isToday ? 'Today'
    : isYesterday ? 'Yesterday'
    : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-3 my-5 select-none">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-[11px] font-semibold px-3 py-1 rounded-full tracking-wide" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}
DateSep.propTypes = { iso: PropTypes.string.isRequired };

/* ─── Typing Dots ───────────────────────────────────────────────── */
function TypingDots() {
  return (
    <span className="flex items-center gap-0.5 ml-1">
      {[0, 150, 300].map((d, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full bg-brand-400 animate-bounce"
          style={{ animationDelay: `${d}ms`, animationDuration: '0.9s' }}
        />
      ))}
    </span>
  );
}

/* ─── Call Overlay ──────────────────────────────────────────────── */
function CallOverlay({ callType, callState, otherName, otherAvatar, onEnd, onAccept }) {
  const [elapsed, setElapsed] = useState(0);
  const [muted,   setMuted]   = useState(false);
  const [camOff,  setCamOff]  = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (callState === 'connected') timer.current = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(timer.current);
  }, [callState]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(8,9,18,0.97)', backdropFilter: 'blur(24px)' }}
    >
      <div className="flex flex-col items-center gap-8 w-full max-w-xs text-center animate-fade-up px-6">

        {/* Avatar + ripple */}
        <div className="relative flex items-center justify-center">
          {callState === 'calling' && <>
            <span className="absolute w-36 h-36 rounded-full animate-ping" style={{ background: 'rgba(109,92,255,0.15)', animationDuration: '1.4s' }} />
            <span className="absolute w-28 h-28 rounded-full animate-ping" style={{ background: 'rgba(109,92,255,0.2)', animationDuration: '1s' }} />
          </>}
          <div className="relative w-24 h-24 rounded-full ring-4" style={{ '--tw-ring-color': 'rgba(109,92,255,0.5)' }}>
            {otherAvatar
              ? <img src={otherAvatar} alt="" className="w-24 h-24 rounded-full object-cover" />
              : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}>
                  {getInitials(otherName)}
                </div>
              )
            }
          </div>
        </div>

        {/* Name + state */}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>{otherName}</h2>
          <p className="text-white/50 text-sm font-medium">
            {callState === 'calling'   && (callType === 'video' ? 'Video calling…' : 'Voice calling…')}
            {callState === 'ringing'   && 'Incoming call…'}
            {callState === 'connected' && fmt(elapsed)}
          </p>
        </div>

        {/* Video preview */}
        {callState === 'connected' && callType === 'video' && !camOff && (
          <div className="w-full h-40 rounded-2xl flex flex-col items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #12131f, #1c1e30)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span className="text-3xl">📹</span>
            <span className="text-xs text-white/30">Camera preview</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-5">
          {callState === 'ringing' && (
            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
              style={{ background: '#16b364', boxShadow: '0 8px 24px rgba(22,179,100,0.4)' }}
            >
              📞
            </button>
          )}

          {callState === 'connected' && (
            <>
              <button
                onClick={() => setMuted(m => !m)}
                className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-base transition-all hover:scale-110"
                style={{ background: muted ? 'rgba(240,68,95,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${muted ? 'rgba(240,68,95,0.4)' : 'rgba(255,255,255,0.1)'}`, color: muted ? '#f0445f' : '#fff' }}
              >
                {muted ? '🔇' : '🎤'}
                <span className="text-[9px] font-medium" style={{ color: muted ? '#f0445f' : 'rgba(255,255,255,0.4)' }}>{muted ? 'Muted' : 'Mute'}</span>
              </button>
              {callType === 'video' && (
                <button
                  onClick={() => setCamOff(c => !c)}
                  className="w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5 text-base transition-all hover:scale-110"
                  style={{ background: camOff ? 'rgba(240,68,95,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${camOff ? 'rgba(240,68,95,0.4)' : 'rgba(255,255,255,0.1)'}`, color: camOff ? '#f0445f' : '#fff' }}
                >
                  {camOff ? '📷' : '📹'}
                  <span className="text-[9px] font-medium" style={{ color: camOff ? '#f0445f' : 'rgba(255,255,255,0.4)' }}>Camera</span>
                </button>
              )}
            </>
          )}

          {/* End / Decline */}
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full flex flex-col items-center justify-center gap-0.5 text-2xl transition-all hover:scale-110 active:scale-95"
            style={{ background: '#f0445f', boxShadow: '0 8px 24px rgba(240,68,95,0.4)' }}
          >
            📵
            <span className="text-[9px] font-medium text-white/70">{callState === 'ringing' ? 'Decline' : 'End'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
CallOverlay.propTypes = {
  callType:    PropTypes.oneOf(['voice', 'video']).isRequired,
  callState:   PropTypes.oneOf(['calling', 'ringing', 'connected']).isRequired,
  otherName:   PropTypes.string.isRequired,
  otherAvatar: PropTypes.string,
  onEnd:       PropTypes.func.isRequired,
  onAccept:    PropTypes.func,
};

/* ─── Icon buttons ──────────────────────────────────────────────── */
function IconBtn({ title, onClick, children, active, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all hover:scale-105 active:scale-95 flex-shrink-0"
      style={{
        background: active ? 'rgba(109,92,255,0.15)' : danger ? 'rgba(240,68,95,0.12)' : 'var(--surface-2)',
        border: `1px solid ${active ? 'rgba(109,92,255,0.35)' : danger ? 'rgba(240,68,95,0.3)' : 'var(--border)'}`,
        color: active ? 'var(--brand-400)' : danger ? '#f0445f' : 'var(--fg-muted)',
      }}
    >
      {children}
    </button>
  );
}
IconBtn.propTypes = { title: PropTypes.string, onClick: PropTypes.func, children: PropTypes.node, active: PropTypes.bool, danger: PropTypes.bool };

/* ─── Main ──────────────────────────────────────────────────────── */

export default function MessagesLayout({ resolveOther, sidebarTitle }) {
  const { user, accessToken } = useAuthContext();

  const [search,        setSearch]        = useState('');
  const [conversations, setConversations] = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [message,       setMessage]       = useState('');
  const [isLoading,     setIsLoading]     = useState(true);
  const [isSending,     setIsSending]     = useState(false);
  const [typing,        setTyping]        = useState(false);
  const [otherOnline,   setOtherOnline]   = useState(false);
  const [otherLastSeen, setOtherLastSeen] = useState(null);
  // Persist last-seen across conversation switches
  const lastSeenRef = useRef({});  // { [userId]: ISO string }

  /* Call */
  const [callType,  setCallType]  = useState(null);
  const [callState, setCallState] = useState(null);

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const typingTimer = useRef(null);
  const callTimer   = useRef(null);

  const active      = conversations.find(c => c.id === activeId);
  const otherUserId = active ? resolveOther(active).userId  : null;
  const otherName   = active ? resolveOther(active).name    : '';
  const otherAvatar = active ? resolveOther(active).avatar  : null;
  const presence    = formatPresence(otherOnline, otherLastSeen);

  const { emit } = useSocket('/chat', {
    token: accessToken,
    events: {
      'receive-message': msg => {
        if (msg.senderId === user?.id) return;
        if (msg.conversationId === activeId) setMessages(p => [...p, msg]);
        setConversations(p => p.map(c =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg.content, updatedAt: msg.createdAt, unread: c.id !== activeId ? (c.unread ?? 0) + 1 : 0 }
            : c
        ));
      },
      'user-online':  ({ userId: uid }) => {
        if (uid === otherUserId) { setOtherOnline(true); setOtherLastSeen(null); }
      },
      'user-offline': ({ userId: uid, lastSeen }) => {
        lastSeenRef.current[uid] = lastSeen;          // persist across switches
        if (uid === otherUserId) { setOtherOnline(false); setOtherLastSeen(lastSeen); }
      },
      'typing':      ({ conversationId, userId }) => { if (conversationId === activeId && userId !== user?.id) setTyping(true); },
      'stop-typing': ({ conversationId, userId }) => { if (conversationId === activeId && userId !== user?.id) setTyping(false); },
      'call-incoming': ({ from, callType: ct }) => { if (from === otherUserId) { setCallType(ct); setCallState('ringing'); } },
      'call-accepted': () => setCallState('connected'),
      'call-ended':    () => { setCallType(null); setCallState(null); clearTimeout(callTimer.current); },
    },
  });

  useEffect(() => {
    messagesApi.getConversations()
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : (data?.data ?? []);
        setConversations(list);
        if (list.length) setActiveId(list[0].id);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setOtherOnline(false);
    // Restore persisted last-seen for this conversation's other participant
    setOtherLastSeen(otherUserId ? (lastSeenRef.current[otherUserId] ?? null) : null);
    setTyping(false);
    emit('join-conversation', activeId);
    messagesApi.getMessages(activeId)
      .then(({ data }) => setMessages(Array.isArray(data) ? data : (data?.data ?? [])))
      .catch(() => setMessages([]));
    // Mark conversation as read locally and on the backend, then refresh the sidebar count
    setConversations(p => p.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
    messagesApi.markRead(activeId)
      .then(() => window.dispatchEvent(new Event('cc:messages:read')))
      .catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [activeId, emit, otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const content = message.trim();
    if (!content || !activeId || isSending) return;
    setMessage('');
    setIsSending(true);
    emit('stop-typing', { conversationId: activeId });
    try {
      const { data } = await messagesApi.sendMessage(activeId, { content });
      const msg = data?.data ?? data ?? { id: Date.now(), senderId: user?.id, content, createdAt: new Date().toISOString() };
      setMessages(p => [...p, msg]);
      setConversations(p => p.map(c => c.id === activeId ? { ...c, lastMessage: content, updatedAt: new Date().toISOString() } : c));
    } catch {}
    setIsSending(false);
  }, [message, activeId, isSending, emit, user?.id]);

  const handleTyping = e => {
    setMessage(e.target.value);
    if (!activeId) return;
    emit('typing', { conversationId: activeId });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emit('stop-typing', { conversationId: activeId }), 1500);
  };

  const startCall = type => {
    if (!activeId || !otherUserId) return;
    setCallType(type);
    setCallState('calling');
    emit('call-start', { to: otherUserId, callType: type, conversationId: activeId });
    callTimer.current = setTimeout(() => setCallState('connected'), 3000);
  };

  const endCall = () => {
    emit('call-end', { to: otherUserId, conversationId: activeId });
    setCallType(null);
    setCallState(null);
    clearTimeout(callTimer.current);
  };

  const acceptCall = () => {
    emit('call-accept', { to: otherUserId, conversationId: activeId });
    setCallState('connected');
  };

  const filtered = conversations.filter(c =>
    resolveOther(c).name.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = conversations.reduce((s, c) => s + (c.unread ?? 0), 0);

  /* ── Render ── */
  return (
    <div
      className="flex overflow-hidden"
      style={{ height: 'calc(100vh - 0px)', background: 'var(--bg)' }}
    >
      {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
      <aside
        className="w-80 flex-shrink-0 flex flex-col"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 space-y-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>{sidebarTitle}</h2>
              {totalUnread > 0 && (
                <span className="text-[10px] font-bold text-white min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center" style={{ background: 'var(--brand-500)' }}>
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </div>
            <span className="text-xs text-fg-muted px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              {conversations.length}
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] pointer-events-none" style={{ color: 'var(--fg-muted)' }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl outline-none transition-all"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)' }}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-28 rounded" />
                    <Skeleton className="h-2.5 w-40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                {search ? '🔍' : '💬'}
              </div>
              <div>
                <p className="text-fg text-sm font-semibold">{search ? 'No results' : 'No conversations yet'}</p>
                <p className="text-fg-muted text-xs mt-1">{search ? 'Try a different name' : 'Start by messaging a creator or brand'}</p>
              </div>
            </div>
          ) : (
            <div className="py-2">
              {filtered.map(conv => {
                const other    = resolveOther(conv);
                const isActive = conv.id === activeId;
                const unread   = conv.unread ?? 0;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveId(conv.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all relative"
                    style={{ background: isActive ? 'rgba(109,92,255,0.08)' : 'transparent' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ background: 'var(--brand-500)' }} />
                    )}

                    {/* Avatar + online dot */}
                    <div className="relative flex-shrink-0">
                      <Avatar src={other.avatar} initials={getInitials(other.name)} size="sm" />
                      {conv.online && (
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                          style={{ background: '#16b364', borderColor: 'var(--surface)' }}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p
                          className={clsx('text-sm truncate', unread > 0 ? 'font-bold' : 'font-medium')}
                          style={{ color: isActive ? 'var(--brand-400)' : 'var(--fg)' }}
                        >
                          {other.name}
                        </p>
                        <span className="text-[10px] text-fg-muted flex-shrink-0">{shortTime(conv.updatedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <p className={clsx('text-xs truncate', unread > 0 ? 'text-fg font-medium' : 'text-fg-muted')}>
                          {conv.lastMessage || 'Start the conversation'}
                        </p>
                        {unread > 0 && (
                          <span
                            className="text-[10px] font-bold text-white flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--brand-500)' }}
                          >
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* ══ CHAT ═════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', height: 64 }}
        >
          {activeId && otherName ? (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar src={otherAvatar} initials={getInitials(otherName)} size="md" />
                  {presence.dot && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ background: '#16b364', borderColor: 'var(--surface)' }} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-fg text-sm truncate" style={{ fontFamily: 'Sora, sans-serif' }}>{otherName}</p>
                  {typing ? (
                    <span className="flex items-center gap-1">
                      <span className="text-xs text-brand-400">typing</span>
                      <TypingDots />
                    </span>
                  ) : (
                    <p className="text-xs" style={{ color: presence.color }}>{presence.text}</p>
                  )}
                </div>
              </div>

              {/* Call buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <IconBtn title="Voice call" onClick={() => startCall('voice')}>📞</IconBtn>
                <IconBtn title="Video call" onClick={() => startCall('video')}>🎥</IconBtn>
              </div>
            </>
          ) : (
            <p className="text-fg-muted text-sm">Select a conversation</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ background: 'var(--bg)' }}>
          {!activeId ? (
            /* No conversation selected */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-brand-md"
                style={{ background: 'linear-gradient(135deg, rgba(109,92,255,0.15), rgba(76,45,209,0.08))', border: '1px solid rgba(109,92,255,0.2)' }}
              >
                💬
              </div>
              <div className="space-y-1">
                <p className="font-bold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>Your Messages</p>
                <p className="text-fg-muted text-sm">Pick a conversation from the left to start chatting</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {['Collaborations 💼', 'Campaign briefs 📋', 'Rate cards 💰'].map(tag => (
                  <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* Empty conversation */
            <div className="flex flex-col items-center justify-center h-full text-center space-y-5">
              <div className="relative">
                <Avatar src={otherAvatar} initials={getInitials(otherName)} size="2xl" />
                {presence.dot && (
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2" style={{ background: '#16b364', borderColor: 'var(--bg)' }} />
                )}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-fg text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{otherName}</p>
                <p className="text-fg-muted text-sm">No messages yet. Say hello! 👋</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                {["👋 Hey there!", "💼 Let's collaborate", "📋 Share your rates", "🎯 Campaign idea?"].map(q => (
                  <button
                    key={q}
                    onClick={() => { setMessage(q); inputRef.current?.focus(); }}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            <div className="space-y-1 pb-2">
              {messages.map((m, i) => {
                const isMe    = m.senderId === user?.id;
                const showSep = showDateSep(messages, i);
                const showAvatar = !isMe && (i === messages.length - 1 || messages[i + 1]?.senderId !== m.senderId);
                return (
                  <div key={m.id ?? i}>
                    {showSep && m.createdAt && <DateSep iso={m.createdAt} />}
                    <div className={clsx('flex items-end gap-2', isMe ? 'justify-end' : 'justify-start')}>
                      {/* Other-side avatar — only on last message in a group */}
                      {!isMe && (
                        <div className="flex-shrink-0 w-7 h-7 mb-0.5">
                          {showAvatar && <Avatar src={otherAvatar} initials={getInitials(otherName)} size="xs" />}
                        </div>
                      )}

                      <div className={clsx('group flex flex-col max-w-sm', isMe ? 'items-end' : 'items-start')}>
                        <div
                          className="px-4 py-2.5 text-sm leading-relaxed"
                          style={{
                            borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            maxWidth: '100%',
                            wordBreak: 'break-word',
                            ...(isMe
                              ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                              : { background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)' }
                            ),
                          }}
                        >
                          {m.content}
                        </div>
                        {/* Timestamp on hover */}
                        <span className="text-[10px] text-fg-muted mt-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                          {msgTime(m.createdAt)}{isMe && ' ✓'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2 transition-all"
            style={{
              background: 'var(--surface-2)',
              border: `1px solid ${message.trim() ? 'rgba(109,92,255,0.4)' : 'var(--border)'}`,
              boxShadow: message.trim() ? '0 0 0 3px rgba(109,92,255,0.08)' : 'none',
            }}
          >
            <button
              title="Emoji"
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-base rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ color: 'var(--fg-muted)' }}
            >
              😊
            </button>

            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={handleTyping}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={activeId ? `Message ${otherName || '…'}` : 'Select a conversation first'}
              disabled={!activeId}
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: 'var(--fg)' }}
            />

            <button
              title="Attach file"
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-base rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ color: 'var(--fg-muted)' }}
            >
              📎
            </button>

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!message.trim() || isSending || !activeId}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
              style={{
                background: message.trim() && activeId ? 'linear-gradient(135deg, #6d5cff, #4c2dd1)' : 'var(--border)',
                boxShadow: message.trim() && activeId ? '0 4px 14px rgba(109,92,255,0.4)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {isSending
                ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : '➤'
              }
            </button>
          </div>

          <div className="flex items-center justify-between mt-1.5 px-1">
            <p className="text-[10px] text-fg-muted">Enter to send · Shift+Enter for new line</p>
            {message.length > 0 && (
              <p className="text-[10px]" style={{ color: message.length > 480 ? '#f0445f' : 'var(--fg-muted)' }}>
                {message.length}/500
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ══ CALL OVERLAY ════════════════════════════════════════════ */}
      {callType && callState && (
        <CallOverlay
          callType={callType}
          callState={callState}
          otherName={otherName}
          otherAvatar={otherAvatar}
          onEnd={endCall}
          onAccept={acceptCall}
        />
      )}
    </div>
  );
}

MessagesLayout.propTypes = {
  resolveOther: PropTypes.func.isRequired,
  sidebarTitle: PropTypes.string,
};
MessagesLayout.defaultProps = {
  sidebarTitle: 'Messages',
};
