import { useState, useRef, useEffect, useCallback } from 'react';
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

const BTN_SIZE = 56; // w-14 h-14
const STORAGE_KEY = 'cc-copilot-pos';

function loadPos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function AICopilot({ role }) {
  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const [showHint,  setShowHint]  = useState(false);
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // ── Drag state ─────────────────────────────────────────────────────
  const [pos, setPos] = useState(() => {
    const saved = loadPos();
    if (saved) return saved;
    return {
      x: window.innerWidth  - BTN_SIZE - 24,
      y: window.innerHeight - BTN_SIZE - 24,
    };
  });

  const dragging  = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  const moved     = useRef(false);   // true if pointer actually moved during press

  const onPointerDown = useCallback((e) => {
    // Only drag on left click / single touch
    if (e.button !== undefined && e.button !== 0) return;
    dragging.current  = true;
    moved.current     = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, bx: pos.x, by: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [pos]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;

    const nx = clamp(dragStart.current.bx + dx, 0, window.innerWidth  - BTN_SIZE);
    const ny = clamp(dragStart.current.by + dy, 0, window.innerHeight - BTN_SIZE);
    setPos({ x: nx, y: ny });
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    // Save position
    setPos((p) => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* noop */ }
      return p;
    });
    // If the pointer barely moved, treat it as a click (toggle panel)
    if (!moved.current) setIsOpen((v) => !v);
  }, []);

  // Clamp position on window resize
  useEffect(() => {
    const handler = () => {
      setPos((p) => ({
        x: clamp(p.x, 0, window.innerWidth  - BTN_SIZE),
        y: clamp(p.y, 0, window.innerHeight - BTN_SIZE),
      }));
    };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // ── Chat panel position: prefer opening above the button, stay on screen ─
  const panelW = Math.min(380, window.innerWidth - 32);
  const panelH = Math.min(560, window.innerHeight - 128);
  const panelLeft = clamp(pos.x + BTN_SIZE / 2 - panelW / 2, 8, window.innerWidth  - panelW - 8);
  const panelTop  = clamp(pos.y - panelH - 12, 8, window.innerHeight - panelH - 8);

  // ── Greeting & auto-scroll ─────────────────────────────────────────
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
    setMessages((m) => [...m, { id: `u-${Date.now()}`, sender: 'user', text: trimmed }]);
    setInput('');
    setIsTyping(true);
    try {
      const { data } = await copilotApi.chat(trimmed, { role });
      const result   = data || {};
      setMessages((m) => [...m, { id: `a-${Date.now()}`, sender: 'assistant', text: result.reply || 'Sorry, something went wrong.' }]);
      if (result.action?.type === 'navigate') setTimeout(() => navigate(result.action.to), 400);
    } catch (err) {
      const errMsg = err?.offline
        ? "I can't reach the server right now. Check that the backend is running."
        : err?.message || 'Something went wrong. Please try again.';
      setMessages((m) => [...m, { id: `e-${Date.now()}`, sender: 'assistant', text: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); send(input); };
  const suggestions  = SUGGESTIONS_BY_ROLE[role] ?? SUGGESTIONS_BY_ROLE.creator;

  return (
    <>
      {/* ── Draggable floating button ── */}
      <div className="fixed z-[150] select-none touch-none" style={{ left: pos.x, top: pos.y }}>
        <button
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onMouseEnter={() => setShowHint(true)}
          onMouseLeave={() => setShowHint(false)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-[0_8px_30px_-8px_rgba(109,92,255,0.7)] transition-transform hover:scale-105 active:scale-95 relative"
          style={{
            background: 'linear-gradient(135deg, #857fff, #4c2dd1)',
            cursor:     dragging.current ? 'grabbing' : 'grab',
          }}
          aria-label="Open AI Copilot"
        >
          {isOpen ? '✕' : '✨'}
          {!isOpen && (
            <span
              className="absolute inset-0 rounded-full animate-ping pointer-events-none"
              style={{ background: 'rgba(133,127,255,0.4)', animationDuration: '2.5s' }}
            />
          )}
        </button>

        {/* Drag hint tooltip */}
        {showHint && !dragging.current && (
          <div
            className="absolute whitespace-nowrap text-[11px] font-medium px-2.5 py-1.5 rounded-lg pointer-events-none"
            style={{
              bottom:     BTN_SIZE + 8,
              left:       '50%',
              transform:  'translateX(-50%)',
              background: 'var(--surface)',
              color:      'var(--fg)',
              border:     '1px solid var(--border)',
              boxShadow:  '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            ✦ Drag to move
            {/* Arrow */}
            <span
              className="absolute left-1/2 -bottom-1.5"
              style={{
                transform:   'translateX(-50%)',
                width:        0,
                height:       0,
                borderLeft:  '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop:   '6px solid var(--border)',
              }}
            />
          </div>
        )}
      </div>

      {/* ── Chat panel ── */}
      {isOpen && (
        <div
          className="fixed z-[149] flex flex-col overflow-hidden rounded-2xl animate-fade-up shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
          style={{
            left:    panelLeft,
            top:     panelTop,
            width:   panelW,
            height:  panelH,
            background: 'var(--surface)',
            border:     '1px solid var(--border)',
          }}
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
