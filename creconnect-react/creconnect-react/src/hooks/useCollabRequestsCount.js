import { useState, useEffect, useCallback } from 'react';
import { brandsApi } from '@/api/brands.api';
import { creatorsApi } from '@/api/creators.api';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Returns the number of collaboration requests awaiting this user's action:
 * - BRAND: creator applications still PENDING
 * - CREATOR: brand invitations still INVITED
 * Same shared logic for both roles, so behavior is guaranteed consistent.
 * Only decreases when the request is actually accepted/rejected — never just
 * from viewing the list — since it's a direct count of the underlying status.
 * Re-polls every 30 seconds while the user is active.
 */
export function useCollabRequestsCount() {
  const { isAuthenticated, user } = useAuthContext();
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    if (!isAuthenticated || !user?.role) return;
    try {
      const role = user.role.toUpperCase();
      const { data } = role === 'BRAND'
        ? await brandsApi.getPendingRequestsCount()
        : role === 'CREATOR'
          ? await creatorsApi.getPendingInvitesCount()
          : { data: { count: 0 } };
      setCount(data?.count ?? 0);
    } catch {
      // fail silently
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 30_000);
    // Also refetch immediately when a request is accepted/rejected
    window.addEventListener('cc:collab-requests:changed', fetchCount);
    return () => {
      clearInterval(timer);
      window.removeEventListener('cc:collab-requests:changed', fetchCount);
    };
  }, [fetchCount]);

  return count;
}
