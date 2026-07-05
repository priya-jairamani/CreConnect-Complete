import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authApi } from '@/api/auth.api';
import { findDemoAccount, buildDemoSession } from '@/utils/demoAccounts';

const DEMO_MODE_KEY = 'cc_demo_mode';

const initialState = {
  user:            null,
  accessToken:     null,
  refreshToken:    null,
  isAuthenticated: false,
  isLoading:       true,   // true on boot while rehydrating
  error:           null,
};

export const AUTH_ACTIONS = {
  LOGIN_START:   'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT:        'LOGOUT',
  TOKEN_REFRESH: 'TOKEN_REFRESH',
  CLEAR_ERROR:   'CLEAR_ERROR',
  BOOT_DONE:     'BOOT_DONE',
};

function authReducer(state, { type, payload }) {
  switch (type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, isLoading: false, isAuthenticated: true, user: payload.user, accessToken: payload.accessToken, refreshToken: payload.refreshToken, error: null };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, isLoading: false, error: payload.message };
    case AUTH_ACTIONS.TOKEN_REFRESH:
      return { ...state, accessToken: payload.accessToken };
    case AUTH_ACTIONS.LOGOUT:
      return { ...initialState, isLoading: false };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.BOOT_DONE:
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Boot: rehydrate from localStorage + verify token ────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user  = localStorage.getItem('cc_user');

    if (token && user) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user:         JSON.parse(user),
          accessToken:  token,
          refreshToken: localStorage.getItem('refreshToken'),
        },
      });

      // Demo sessions aren't backed by a real server — skip verification
      if (localStorage.getItem(DEMO_MODE_KEY) === 'true') return;

      // Silently verify token is still valid
      authApi.me().then(({ data }) => {
        if (data) {
          localStorage.setItem('cc_user', JSON.stringify(data));
          dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: data, accessToken: token, refreshToken: localStorage.getItem('refreshToken') } });
        }
      }).catch((err) => {
        // Only an actual auth failure means the session is invalid — network
        // errors, timeouts, or the backend restarting shouldn't log the user out.
        if (err?.status === 401 || err?.status === 403) {
          _clearStorage();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        } else {
          dispatch({ type: AUTH_ACTIONS.BOOT_DONE });
        }
      });
    } else {
      dispatch({ type: AUTH_ACTIONS.BOOT_DONE });
    }
  }, []);

  const login = useCallback(async ({ email, password, role }) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    // ── Demo accounts: bypass the backend entirely ─────────────────────
    const demoAccount = findDemoAccount(email, password);
    if (demoAccount) {
      // Enforce tab restriction for demo accounts too
      if (role && demoAccount.user.role.toUpperCase() !== 'ADMIN' && demoAccount.user.role.toLowerCase() !== role.toLowerCase()) {
        const expected = demoAccount.user.role.toLowerCase();
        const msg = `This is a ${expected} account. Please switch to the ${expected.charAt(0).toUpperCase() + expected.slice(1)} tab to sign in.`;
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: { message: msg } });
        throw new Error(msg);
      }
      const { user, accessToken, refreshToken } = buildDemoSession(demoAccount);
      localStorage.setItem(DEMO_MODE_KEY,  'true');
      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId',       user.id);
      localStorage.setItem('cc_user',      JSON.stringify(user));
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, accessToken, refreshToken } });
      return user;
    }

    // ── Real backend login ─────────────────────────────────────────────
    try {
      const { data } = await authApi.login({ email, password });
      const user         = data?.user ?? (data?.id ? { id: data.id, email: data.email, role: data.role, status: data.status, isVerified: data.isVerified } : null);
      const accessToken  = data?.accessToken;
      const refreshToken = data?.refreshToken;
      const profile      = data?.profile ?? data?.user?.profile ?? null;

      if (!user?.id) {
        throw Object.assign(new Error('Login failed — unexpected server response. Please try again.'), { offline: false });
      }

      // ── Role tab restriction ───────────────────────────────────────────
      // The selected tab must match the account's actual role.
      if (role && user.role && user.role.toUpperCase() !== 'ADMIN' && user.role.toLowerCase() !== role.toLowerCase()) {
        const actual   = user.role.toLowerCase();
        const expected = actual.charAt(0).toUpperCase() + actual.slice(1);
        const selected = role.charAt(0).toUpperCase() + role.slice(1);
        const msg = `This is a ${expected} account. Please switch to the "${expected}" tab to sign in.`;
        dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: { message: msg } });
        throw Object.assign(new Error(msg), { roleError: true, actual, selected });
      }

      localStorage.removeItem(DEMO_MODE_KEY);
      localStorage.setItem('accessToken',  accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId',       user.id);
      localStorage.setItem('cc_user',      JSON.stringify({ ...user, profile }));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: { ...user, profile }, accessToken, refreshToken } });
      return { ...user, profile };
    } catch (err) {
      const msg = err?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: { message: msg } });
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      await authApi.register(data);
      dispatch({ type: AUTH_ACTIONS.BOOT_DONE });
      return { success: true };
    } catch (err) {
      const msg = err?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: { message: msg } });
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    if (localStorage.getItem(DEMO_MODE_KEY) !== 'true') {
      try { await authApi.logout(); } catch {}
    }
    _clearStorage();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  const clearError = useCallback(() => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }), []);

  const loginWithTokens = useCallback(({ user, accessToken, refreshToken }) => {
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId',       user.id);
    localStorage.setItem('cc_user',      JSON.stringify(user));
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, accessToken, refreshToken } });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

function _clearStorage() {
  ['accessToken', 'refreshToken', 'userId', 'cc_user', DEMO_MODE_KEY].forEach((k) => localStorage.removeItem(k));
}

AuthProvider.propTypes = { children: PropTypes.node.isRequired };

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
};
