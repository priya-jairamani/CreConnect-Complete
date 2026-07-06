import { useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { isMockAdminEmail } from '@/utils/adminAccounts';

/** True for admin@creconnect.pk demo sessions — mock data only. */
export function useIsMockAdmin() {
  const { user } = useAuthContext();
  return useMemo(() => {
    if (localStorage.getItem('cc_demo_mode') === 'true') return true;
    return isMockAdminEmail(user?.email);
  }, [user?.email]);
}
