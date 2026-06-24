import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import Avatar from '@/components/common/Avatar';
import Input from '@/components/common/Input';
import { timeAgo } from '@/utils/formatters';

export default function MessagesTab({ item, messages, activity }) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('messages');

  const pinned = messages.filter((m) => m.pinned);

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(q));
  }, [messages, search]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {[{ key: 'messages', label: '💬 Messages' }, { key: 'activity', label: '📋 Activity Feed' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={tab === t.key ? { background: 'var(--brand-500)', color: '#fff' } : { color: 'var(--fg-muted)' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'messages' ? (
        <>
          <Input name="search-messages" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages…" prefix="🔍" />

          {pinned.length > 0 && (
            <div className="rounded-xl p-3 space-y-1.5" style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)' }}>
              <p className="text-warning text-[10px] font-semibold uppercase tracking-wider">📌 Pinned</p>
              {pinned.map((m) => (
                <p key={m.id} className="text-fg text-sm">{m.text}</p>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {filtered.map((m) => (
              <div key={m.id} className={`flex gap-3 ${m.fromMe ? 'flex-row-reverse' : ''}`}>
                <Avatar initials={m.sender?.slice(0, 2)?.toUpperCase()} size="sm" />
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${m.fromMe ? 'bg-brand-gradient text-white' : ''}`} style={!m.fromMe ? { background: 'var(--surface-2)', border: '1px solid var(--border)' } : {}}>
                  <p className="text-sm">{m.text}</p>
                  {m.attachment && (
                    <div className={`mt-2 flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${m.fromMe ? 'bg-white/15' : ''}`} style={!m.fromMe ? { background: 'var(--surface)' } : {}}>
                      📎 {m.attachment}
                    </div>
                  )}
                  {m.isVoiceNote && (
                    <div className={`mt-2 flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 ${m.fromMe ? 'bg-white/15' : ''}`} style={!m.fromMe ? { background: 'var(--surface)' } : {}}>
                      🎙️ Voice note · 0:24
                    </div>
                  )}
                  <p className={`text-[10px] mt-1.5 ${m.fromMe ? 'text-white/70' : 'text-fg-muted'}`}>{m.sender} · {timeAgo(m.time)}</p>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p className="text-fg-muted text-sm text-center py-6">No messages match your search.</p>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              placeholder={`Message ${item.brandName}…`}
              className="flex-1 input-base text-sm"
              disabled
            />
            <button className="px-3.5 py-2.5 rounded-[10px] text-sm font-medium bg-brand-gradient text-white opacity-60 cursor-not-allowed">Send</button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {activity.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-400 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-fg text-sm">{a.text}</p>
                <p className="text-fg-muted text-xs mt-0.5">{timeAgo(a.time)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

MessagesTab.propTypes = {
  item: PropTypes.object.isRequired,
  messages: PropTypes.arrayOf(PropTypes.object).isRequired,
  activity: PropTypes.arrayOf(PropTypes.object).isRequired,
};
