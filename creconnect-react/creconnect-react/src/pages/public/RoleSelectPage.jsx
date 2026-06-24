import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const ROLES = [
  {
    id:    'creator',
    icon:  '✦',
    title: 'I am a Creator',
    desc:  'Showcase your talent, connect with brands, get paid securely via escrow.',
    perks: ['AI-matched brand offers', 'Escrow payment protection', 'Portfolio analytics'],
    to:    ROUTES.CREATOR_SIGNUP,
  },
  {
    id:    'brand',
    icon:  '◈',
    title: 'I am a Brand',
    desc:  'Discover creators who align with your values and amplify your campaigns.',
    perks: ['Explainable AI matching', 'Fraud detection', 'Campaign analytics'],
    to:    ROUTES.BRAND_SIGNUP,
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-16">
      {/* Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(50% 60% at 50% 30%, rgba(109,92,255,0.12) 0, transparent 70%)' }}
      />

      <div className="relative z-10 text-center mb-12 animate-fade-up">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-brand-400 mb-5"
          style={{ background: 'rgba(109,92,255,0.12)', border: '1px solid rgba(109,92,255,0.2)' }}
        >
          ✦ Get started free
        </div>
        <h1
          className="text-4xl md:text-5xl font-bold text-fg mb-3"
          style={{ fontFamily: 'Sora, sans-serif', letterSpacing: '-0.025em' }}
        >
          Join CreConnect
        </h1>
        <p className="text-fg-muted text-base">Who are you joining as?</p>
      </div>

      <div className="relative z-10 grid md:grid-cols-2 gap-5 w-full max-w-2xl animate-fade-up-delay">
        {ROLES.map(({ id, icon, title, desc, perks, to }) => (
          <button
            key={id}
            onClick={() => navigate(to)}
            onMouseEnter={() => setHovered(id)}
            onMouseLeave={() => setHovered(null)}
            className="card rounded-2xl p-8 text-left flex flex-col gap-5 transition-all duration-200"
            style={{
              borderColor: hovered === id ? 'rgba(109,92,255,0.4)' : 'var(--border)',
              background: hovered === id ? 'rgba(109,92,255,0.05)' : 'var(--surface)',
              transform: hovered === id ? 'translateY(-2px)' : 'none',
              boxShadow: hovered === id ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: hovered === id
                  ? 'linear-gradient(135deg, #6d5cff, #4c2dd1)'
                  : 'rgba(109,92,255,0.12)',
                color: hovered === id ? '#fff' : 'var(--brand-400)',
                transition: 'background 0.2s',
              }}
            >
              {icon}
            </div>

            <div>
              <h2
                className="text-fg font-semibold text-xl mb-2"
                style={{ fontFamily: 'Sora, sans-serif' }}
              >
                {title}
              </h2>
              <p className="text-fg-muted text-sm leading-relaxed">{desc}</p>
            </div>

            <ul className="space-y-2">
              {perks.map(p => (
                <li key={p} className="flex items-center gap-2 text-sm text-fg">
                  <span className="text-success flex-shrink-0 text-xs">✓</span>
                  {p}
                </li>
              ))}
            </ul>

            <div
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-400"
            >
              Get started →
            </div>
          </button>
        ))}
      </div>

      <p className="relative z-10 mt-8 text-fg-muted text-sm">
        Already have an account?{' '}
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="text-brand-400 font-semibold hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
