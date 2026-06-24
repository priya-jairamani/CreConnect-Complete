/**
 * Local demo accounts used when the backend API is unreachable. Lets the
 * frontend be explored standalone — login still requires one of these
 * email/password pairs, but no network call is made.
 */
export const DEMO_ACCOUNTS = [
  {
    email: 'techwave@creconnect.com',
    password: 'Brand@123',
    user: {
      id: 'demo-brand-1',
      email: 'techwave@creconnect.com',
      role: 'BRAND',
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
      name: 'Laiba Khan',
      isVerified: true,
    },
  },
  {
    email: 'admin@creconnect.com',
    password: 'Admin@123',
    user: {
      id: 'demo-admin-1',
      email: 'admin@creconnect.com',
      role: 'ADMIN',
      name: 'Admin',
    },
  },
];

export function findDemoAccount(email, password) {
  return DEMO_ACCOUNTS.find(
    (acc) => acc.email.toLowerCase() === String(email).trim().toLowerCase() && acc.password === password
  ) ?? null;
}

export function buildDemoSession(account) {
  return {
    user: account.user,
    accessToken: 'demo-token',
    refreshToken: 'demo-refresh-token',
  };
}
