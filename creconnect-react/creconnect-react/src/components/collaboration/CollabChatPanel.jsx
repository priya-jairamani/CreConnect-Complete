import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { clsx } from 'clsx';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Skeleton from '@/components/common/Skeleton';
import { messagesApi } from '@/api/messages.api';
import { useAuthContext } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';

const _backendRoot = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1')
  .replace(/\/api\/v1\/?$/, '');

function resolveUrl(url = '') {
  if (!url) return url;
  if (url.startsWith('/uploads/')) return `${_backendRoot}${url}`;
  return url;
}

function msgTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function showDateSep(msgs, i) {
  if (i === 0 || !msgs[i]?.createdAt) return !!msgs[i]?.createdAt;
  return new Date(msgs[i].createdAt).toDateString() !== new Date(msgs[i - 1].createdAt).toDateString();
}

function DateSep({ iso }) {
  const d = new Date(iso);
  const now = new Date();
  const label = d.toDateString() === now.toDateString()
    ? 'Today'
    : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <div className="flex items-center gap-2 my-4">
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)' }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  );
}
DateSep.propTypes = { iso: PropTypes.string.isRequired };

export default function CollabChatPanel({
  conversationId,
  partnerUserId,
  partnerName,
  partnerAvatar,
  detailLoading = false,
}) {
  const { user, accessToken } = useAuthContext();
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [resolving, setResolving] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const activeIdRef = useRef(null);
  activeIdRef.current = activeId;

  const { emit } = useSocket('/chat', {
    token: accessToken,
    events: {
      'receive-message': (msg) => {
        if (msg.senderId === user?.id) return;
        if (msg.conversationId === activeIdRef.current) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      },
    },
  });

  // Resolve (or create) the conversation for this collaboration partner
  useEffect(() => {
    if (detailLoading && !conversationId && !partnerUserId) return;

    let cancelled = false;
    async function resolveConversation() {
      setResolving(true);
      setError(null);
      try {
        let convId = conversationId || null;
        if (!convId && partnerUserId) {
          const { data } = await messagesApi.createConversation(partnerUserId);
          convId = data?.id ?? null;
        }
        if (!cancelled) setActiveId(convId);
      } catch {
        if (!cancelled) {
          setActiveId(null);
          setError('Could not load chat for this collaboration.');
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    }

    resolveConversation();
    return () => { cancelled = true; };
  }, [conversationId, partnerUserId, detailLoading]);

  // Load history and join the socket room when the conversation is known
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    setLoadingMessages(true);
    emit('join-conversation', activeId);

    messagesApi.getMessages(activeId)
      .then(({ data }) => {
        if (!cancelled) {
          setMessages(Array.isArray(data) ? data : (data?.data ?? []));
        }
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });

    messagesApi.markRead(activeId).catch(() => {});

    return () => { cancelled = true; };
  }, [activeId, emit]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const content = text.trim();
    if (!content || !activeId || sending) return;
    setText('');
    setSending(true);
    try {
      const { data } = await messagesApi.sendMessage(activeId, { content });
      const msg = data?.data ?? data;
      if (msg?.id) setMessages((prev) => [...prev, msg]);
    } catch { /* ignore */ }
    setSending(false);
    inputRef.current?.focus();
  }, [text, activeId, sending]);

  if (resolving || (detailLoading && !partnerUserId && !conversationId)) {
    return (
      <div className="space-y-3 py-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    );
  }

  if (!activeId) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface-2)' }}>
        <p className="text-fg-muted text-sm">
          {error || `Could not start a conversation with ${partnerName || 'this partner'}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden" style={{ height: 420, border: '1px solid var(--border)', background: 'var(--surface-2)' }}>
      <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <Avatar src={partnerAvatar} initials={(partnerName || '?').slice(0, 2).toUpperCase()} size="sm" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg truncate">{partnerName}</p>
          <p className="text-[10px] text-fg-muted">Live chat · synced with Messages</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loadingMessages ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-fg-muted text-sm py-8">No messages yet — say hello to {partnerName}.</p>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === user?.id;
            return (
              <div key={m.id}>
                {showDateSep(messages, i) && <DateSep iso={m.createdAt} />}
                <div className={clsx('flex mb-2', mine ? 'justify-end' : 'justify-start')}>
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-2xl text-sm"
                    style={mine
                      ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--fg)', borderBottomLeftRadius: 4 }}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    {m.attachment && (
                      <a href={resolveUrl(m.attachment)} target="_blank" rel="noreferrer" className="text-xs underline mt-1 block opacity-90">
                        📎 Attachment
                      </a>
                    )}
                    <p className="text-[10px] mt-1 opacity-70 text-right">{msgTime(m.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-end gap-2 px-3 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={1}
          placeholder={`Message ${partnerName}…`}
          className="flex-1 rounded-xl px-3 py-2 text-sm resize-none outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--fg)', maxHeight: 80 }}
        />
        <Button variant="primary" size="sm" disabled={!text.trim() || sending} isLoading={sending} onClick={handleSend}>
          Send
        </Button>
      </div>
    </div>
  );
}

CollabChatPanel.propTypes = {
  conversationId: PropTypes.string,
  partnerUserId:  PropTypes.string,
  partnerName:    PropTypes.string,
  partnerAvatar:  PropTypes.string,
  detailLoading:  PropTypes.bool,
};
