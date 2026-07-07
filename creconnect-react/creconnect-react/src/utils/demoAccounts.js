import { MOCK_ADMIN_EMAIL } from './adminAccounts';

/**
 * Local demo accounts — bypass the backend and use mock data.
 * The presentation admin (admin@creconnect.pk) always uses this path.
 * Brand/creator demos also work when the API is unreachable.
 */
export const DEMO_ACCOUNTS = [
  {
    email: 'techwave@creconnect.com',
    password: 'Brand@123',
    user: {
      id: 'demo-brand-1',
      email: 'techwave@creconnect.com',
      role: 'BRAND',
      status: 'APPROVED',
      companyName: 'TechWave',
      isVerified: true,
    },
  },
  {
    email: 'laiba@creconnect.com',
    password: 'Creator@123',
    user: {
      id: 'demo-creator-1',
      email: 'laiba@creconnect.com',
      role: 'CREATOR',
      status: 'APPROVED',
      name: 'Laiba Khan',
      isVerified: true,
    },
  },
  {
    email: MOCK_ADMIN_EMAIL,
    password: 'Admin@12345',
    user: {
      id: 'demo-admin-pk',
      email: MOCK_ADMIN_EMAIL,
      role: 'ADMIN',
      status: 'APPROVED',
      name: 'Demo Admin',
    },
  },
];

export function findDemoAccount(email, password) {
  return DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
  );
}

export function buildDemoSession(account) {
  return {
    user: account.user,
    accessToken: 'demo-token',
    refreshToken: 'demo-refresh-token',
  };
}
