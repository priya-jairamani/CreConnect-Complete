import { useState, useMemo, useCallback } from 'react';

/**
 * Client-side search + filter hook.
 *
 * @param {Array}    items     – full data set
 * @param {string[]} searchKeys – object keys to search against
 * @param {Object}   initialFilters
 */
export function useSearch(items = [], searchKeys = ['displayName'], initialFilters = {}) {
  const [query,   setQuery]   = useState('');
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setQuery('');
    setFilters(initialFilters);
  }, [initialFilters]);

  const results = useMemo(() => {
    let data = items;

    /* Text search */
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter((item) =>
        searchKeys.some((key) => String(item[key] ?? '').toLowerCase().includes(q))
      );
    }

    /* Niche filter */
    if (filters.niche) {
      data = data.filter((item) =>
        item.niche?.toLowerCase().includes(filters.niche.toLowerCase())
      );
    }

    /* Follower range */
    if (filters.minFollowers != null) {
      data = data.filter((item) => item.followerCount >= filters.minFollowers);
    }
    if (filters.maxFollowers != null) {
      data = data.filter((item) => item.followerCount <= filters.maxFollowers);
    }

    /* Engagement range */
    if (filters.minEngagement != null) {
      data = data.filter((item) => item.engagementRate * 100 >= filters.minEngagement);
    }

    /* Platform filter */
    if (filters.platforms?.length) {
      data = data.filter((item) =>
        filters.platforms.some((p) =>
          item.platforms?.some((pl) => pl.name === p && pl.isConnected)
        )
      );
    }

    return data;
  }, [items, query, filters, searchKeys]);

  return { query, setQuery, filters, updateFilter, clearFilters, results };
}
