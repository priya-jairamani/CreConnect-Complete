import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { copilotApi } from '@/api/copilot.api';

const SUGGESTIONS_BY_ROLE = {
  brand: [
    'Find fashion creators in Lahore',
    'Create a campaign for skincare products',
    'Suggest a campaign budget',
    'Generate an outreach message',
  ],
  creator: [
    'Find brands looking for tech creators',
    'Generate an outreach message',
    'Explain why this creator matches',
    'Show my collaborations',
  ],
};

function GREETING(role) {
  return role === 'brand'
    ? "Hi! I'm your AI Copilot. Ask me to find creators, draft outreach, suggest budgets, or jump anywhere in CreConnect."
    : "Hi! I'm your AI Copilot. Ask me to find brands, draft a pitch, explain match scores, or jump anywhere in CreConnect.";
}

export default function AICopilot({ role }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'greeting', sender: 'assistant', text: GREETING(role) }]);
    }
  }, [isOpen, messages.length, role]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await copilotApi.chat(trimmed, { role });
      const result   = data || {};
      const assistantMsg = { id: `a-${Date.now()}`, sender: 'assistant', text: result.reply || 'Sorry, something went wrong.' };
      setMessages((m) => [...m, assistantMsg]);
      if (result.action?.type === 'navigate') {
        setTimeout(() => navigate(result.action.to), 400);
      }
    } catch (err) {
      const offline = err?.offline;
      const errMsg = offline
        ? "I can't reach the server right now. Check that the backend is running."
        : err?.message || 'Something went wrong. Please try again.';
      setMessages((m) => [...m, { id: `e-${Date.now()}`, sender: 'assistant', text: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const suggestions = SUGGESTIONS_BY_ROLE[role] ?? SUGGESTIONS_BY_ROLE.creator;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-[150] w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_8px_30px_-8px_rgba(109,92,255,0.7)] transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #857fff, #4c2dd1)' }}
        aria-label="Open AI Copilot"
      >
        {isOpen ? '✕' : '✨'}
        {!isOpen && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(133,127,255,0.4)', animationDuration: '2.5s' }}
          />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-[150] w-[min(380px,calc(100vw-2rem))] h-[min(560px,calc(100vh-8rem))] rounded-2xl flex flex-col overflow-hidden animate-fade-up shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #857fff, #4c2dd1)' }}
            >
              ✨
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-fg text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>AI Copilot</p>
              <p className="text-fg-muted text-[11px]">Always here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-white/8 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line"
                  style={
                    m.sender === 'user'
                      ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: 'var(--surface-2)', color: 'var(--fg)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div
                  className="rounded-2xl px-4 py-3 flex items-center gap-1"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderBottomLeftRadius: 4 }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: 'var(--fg-muted)', animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Suggestion chips (only when conversation just started) */}
            {messages.length <= 1 && !isTyping && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    style={{ background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-400)'; e.currentTarget.style.borderColor = 'rgba(109,92,255,0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-fg-muted px-2"
              style={{ background: 'var(--surface-2)', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--border)' }}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)' }}
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}

AICopilot.propTypes = {
  role: PropTypes.oneOf(['creator', 'brand', 'admin']).isRequired,
};
