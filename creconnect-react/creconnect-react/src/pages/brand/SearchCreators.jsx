import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import CreatorCard from '@/components/cards/CreatorCard';
import Skeleton from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { searchApi } from '@/api/search.api';
import { brandsApi } from '@/api/brands.api';
import { aiApi } from '@/api/ai.api';
import { useToast } from '@/hooks/useToast';

const NICHES = ['All', 'Fashion', 'Gaming', 'Food', 'Tech', 'Beauty', 'Lifestyle', 'Travel'];
const SAVED_KEY = 'cc-brand-saved-creators';

function readSavedSet() {
  try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY)) ?? []); }
  catch { return new Set(); }
}

export default function SearchCreators() {
  const navigate      = useNavigate();
  const toast         = useToast();
  const [searchParams] = useSearchParams();

  const [query,       setQuery]       = useState(() => searchParams.get('q') || '');
  const [activeNiche, setActiveNiche] = useState('All');
  const [results,     setResults]     = useState([]);
  const [total,       setTotal]       = useState(0);
  const [isLoading,   setIsLoading]   = useState(false);
  const [savedIds,    setSavedIds]    = useState(readSavedSet);
  const [showSaved,   setShowSaved]   = useState(false);

  // AI Match state
  const [aiMode,      setAiMode]      = useState(false);
  const [aiResults,   setAiResults]   = useState([]);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [brandId,     setBrandId]     = useState(null);
  const [aiFeedback,  setAiFeedback]  = useState({});  // creatorId → 'accepted'|'rejected'

  // Load brand's own profile ID on mount (needed for AI calls)
  useEffect(() => {
    brandsApi.getProfile().then(({ data }) => {
      if (data?.id) setBrandId(data.id);
    }).catch(() => {});
  }, []);

  // Fetch AI matches when AI mode is toggled on
  const fetchAiMatches = useCallback(async (id) => {
    if (!id) { toast.warning('Could not load your brand profile — try refreshing.'); return; }
    setAiLoading(true);
    try {
      const { data } = await aiApi.getBrandMatches(id, 20);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      if (list.length === 0) {
        toast.info('No AI matches yet — run the engine from the admin panel first.');
      }
      setAiResults(list);
    } catch {
      toast.error('Could not load AI matches. Make sure the AI engine has been run.');
      setAiResults([]);
    }
    setAiLoading(false);
  }, [toast]);

  const toggleAiMode = useCallback(() => {
    setAiMode((prev) => {
      const next = !prev;
      if (next) fetchAiMatches(brandId);
      return next;
    });
  }, [brandId, fetchAiMatches]);

  const handleAiFeedback = useCallback(async (creator, accepted) => {
    if (!brandId) return;
    const creatorId = creator.creatorId || creator.id;
    setAiFeedback((prev) => ({ ...prev, [creatorId]: accepted ? 'accepted' : 'rejected' }));
    try {
      await aiApi.sendFeedback(brandId, creatorId, accepted);
      toast.success(accepted ? 'Marked as good match ✓' : 'Feedback recorded');
    } catch {
      toast.error('Could not save feedback');
    }
  }, [brandId, toast]);

  const doSearch = useCallback(async (q, niche) => {
    setIsLoading(true);
    try {
      const params = {};
      if (q.trim())              params.q     = q.trim();
      if (niche && niche !== 'All') params.niche = niche;
      const { data } = await searchApi.creators(params);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setResults(list);
      setTotal(data?.meta?.total ?? list.length);
    } catch {
      setResults([]);
      setTotal(0);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query, activeNiche), 350);
    return () => clearTimeout(timer);
  }, [query, activeNiche, doSearch]);

  const handleSave = useCallback((creator) => {
    const id = creator.userId || creator.id;
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(`Removed ${creator.displayName} from saved list`);
      } else {
        next.add(id);
        toast.success(`${creator.displayName} saved to your list`);
      }
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...next])); } catch { /* noop */ }
      return next;
    });
  }, [toast]);

  const clearAll = () => { setQuery(''); setActiveNiche('All'); setShowSaved(false); setAiMode(false); };

  /* When "Saved" view is on, filter to only saved results */
  const displayed = showSaved
    ? results.filter((c) => savedIds.has(c.userId || c.id))
    : results;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-fg" style={{ fontFamily: 'Sora, sans-serif' }}>
            Discover Creators
          </h1>
          <p className="text-fg-muted text-sm mt-1">
            {aiMode
              ? 'AI-ranked creators based on your brand profile, past collaborations, and engagement quality.'
              : 'Search and filter creators to find the perfect match for your campaign.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Match button */}
          <button
            onClick={toggleAiMode}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={aiMode
              ? { background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff', border: 'none', boxShadow: '0 0 12px rgba(109,92,255,0.4)' }
              : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {aiLoading ? '⏳ Loading…' : aiMode ? '✦ AI Match ON' : '✦ AI Match'}
          </button>

          <button
            onClick={() => setShowSaved((v) => !v)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={showSaved
              ? { background: 'rgba(109,92,255,0.15)', color: 'var(--brand-400)', border: '1px solid rgba(109,92,255,0.35)' }
              : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            ★ Saved{savedIds.size > 0 && ` (${savedIds.size})`}
          </button>
        </div>
      </header>

      {/* AI mode banner */}
      {aiMode && (
        <div
          className="rounded-2xl p-4 flex items-start gap-3"
          style={{ background: 'rgba(109,92,255,0.08)', border: '1px solid rgba(109,92,255,0.2)' }}
        >
          <span className="text-brand-400 text-xl mt-0.5">✦</span>
          <div>
            <p className="text-sm font-semibold text-fg">AI Matching Engine Active</p>
            <p className="text-xs text-fg-muted mt-0.5">
              Creators are ranked by a hybrid score (0–100) combining niche fit, engagement quality,
              audience size, location, rating, collaboration history, and your past feedback.
            </p>
          </div>
          <button
            onClick={() => setAiMode(false)}
            className="ml-auto text-fg-muted hover:text-fg text-sm transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search bar */}
      <div className="card rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <span className="text-brand-400 text-base flex-shrink-0">✦</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, niche, location…"
            className="flex-1 bg-transparent text-fg text-sm outline-none placeholder:text-fg-muted"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-fg-muted hover:text-fg text-sm transition-colors">
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-fg-muted">Try:</span>
          {['fashion', 'gaming', 'beauty'].map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-xs px-3 py-1 rounded-full text-fg-muted hover:text-brand-400 transition-colors"
              style={{ border: '1px solid var(--border)', background: 'var(--surface-2)' }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Niche pills */}
      <div className="flex gap-2 flex-wrap">
        {NICHES.map((n) => (
          <button
            key={n}
            onClick={() => setActiveNiche(n)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={
              activeNiche === n
                ? { background: 'linear-gradient(135deg, #6d5cff, #4c2dd1)', color: '#fff' }
                : { background: 'var(--surface-2)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
            }
          >
            {n}
          </button>
        ))}
      </div>

      {/* Results count */}
      {!isLoading && !aiMode && (
        <p className="text-fg-muted text-sm">
          {showSaved
            ? `${displayed.length} saved creator${displayed.length !== 1 ? 's' : ''}`
            : `${total} creator${total !== 1 ? 's' : ''} found`
          }
        </p>
      )}
      {aiMode && !aiLoading && (
        <p className="text-fg-muted text-sm">{aiResults.length} AI-matched creator{aiResults.length !== 1 ? 's' : ''}</p>
      )}

      {/* AI Results */}
      {aiMode ? (
        aiLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : aiResults.length === 0 ? (
          <EmptyState
            icon="✦"
            title="No AI matches yet"
            message="The AI engine hasn't been run yet. Ask your admin to trigger it, or switch back to manual search."
            action={<Button variant="secondary" size="sm" onClick={() => setAiMode(false)}>Back to search</Button>}
          />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {aiResults.map((match, idx) => {
              const creator = match.creator || match;
              const creatorId = match.creatorId || creator.id;
              const fb = aiFeedback[creatorId];
              return (
                <div key={creatorId} className="relative">
                  {/* Score badge */}
                  <div
                    className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'linear-gradient(135deg,#6d5cff,#4c2dd1)', color: '#fff', boxShadow: '0 2px 8px rgba(109,92,255,0.4)' }}
                  >
                    ✦ {match.matchScore ?? match.score ?? '—'}<span className="font-normal opacity-80">/100</span>
                  </div>

                  {/* Rank badge */}
                  <div
                    className="absolute top-3 left-3 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'var(--surface-3)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }}
                  >
                    {idx + 1}
                  </div>

                  <CreatorCard
                    creator={{ ...creator, id: creatorId, userId: creator.userId || creatorId }}
                    onSave={() => handleSave(creator)}
                    onView={() => navigate(`${ROUTES.BRAND_COLLAB_REQUEST}?creatorId=${creator.userId || creatorId}`)}
                    onSendOffer={() => navigate(ROUTES.BRAND_COLLAB_REQUEST)}
                  />

                  {/* Feedback row */}
                  <div
                    className="flex items-center justify-between px-3 py-2 -mt-1 rounded-b-2xl text-xs"
                    style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}
                  >
                    <span className="text-fg-muted">Was this a good match?</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleAiFeedback(match, true)}
                        className="px-2 py-0.5 rounded-full text-xs transition-colors"
                        style={fb === 'accepted'
                          ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.4)' }
                          : { background: 'var(--surface-3)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                        }
                      >
                        👍 Yes
                      </button>
                      <button
                        onClick={() => handleAiFeedback(match, false)}
                        className="px-2 py-0.5 rounded-full text-xs transition-colors"
                        style={fb === 'rejected'
                          ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }
                          : { background: 'var(--surface-3)', color: 'var(--fg-muted)', border: '1px solid var(--border)' }
                        }
                      >
                        👎 No
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Normal search results */
        isLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={showSaved ? '★' : '🔍'}
            title={showSaved ? 'No saved creators yet' : 'No creators match your search'}
            message={showSaved
              ? 'Save creators you\'re interested in and they\'ll appear here.'
              : 'Try adjusting your filters or search query to discover more creators.'
            }
            action={
              <Button variant="secondary" size="sm" onClick={clearAll}>
                {showSaved ? 'Browse creators' : 'Clear all filters'}
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayed.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onSave={() => handleSave(creator)}
                onView={() => navigate(`${ROUTES.BRAND_COLLAB_REQUEST}?creatorId=${creator.userId || creator.id}`)}
                onSendOffer={() => navigate(ROUTES.BRAND_COLLAB_REQUEST)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
