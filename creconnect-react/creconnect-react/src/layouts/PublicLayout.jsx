import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/common/ThemeToggle';

const NAV_LINKS = [
  { label: 'Features',    href: '#features'    },
  { label: 'AI Matching', href: '#ai'          },
  { label: 'Pricing',     href: '#pricing'     },
  { label: 'FAQ',         href: '#faq'         },
];

export default function PublicLayout() {
  const location = useLocation();
  const isHome   = location.pathname === ROUTES.HOME;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 px-6 pt-4 pb-2">
        <nav className="glass max-w-[1080px] mx-auto flex items-center justify-between px-5 py-3 rounded-full">
          {/* Brand */}
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 min-w-0">
            <Logo size={28} textClassName="font-semibold text-lg" />
          </Link>

          {/* Nav links — only on landing */}
          {isHome && (
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-fg-muted hover:text-fg transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          {/* Auth actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <Link
              to={ROUTES.LOGIN}
              className="hidden sm:block text-sm text-fg-muted hover:text-fg transition-colors px-3 py-2"
            >
              Log in
            </Link>
            <Link
              to={ROUTES.ROLE_SELECT}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full text-sm font-semibold text-white bg-brand-gradient btn-brand-glow"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 page-enter">
        <Outlet />
      </main>
    </div>
  );
}
