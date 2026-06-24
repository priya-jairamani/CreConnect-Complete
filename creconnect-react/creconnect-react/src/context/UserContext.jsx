import { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { creatorsApi } from '@/api/creators.api';
import { brandsApi } from '@/api/brands.api';

const initialState = {
  profile:   null,
  isLoading: false,
  error:     null,
};

const USER_ACTIONS = {
  FETCH_START:    'FETCH_START',
  FETCH_SUCCESS:  'FETCH_SUCCESS',
  FETCH_FAILURE:  'FETCH_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
};

function userReducer(state, { type, payload }) {
  switch (type) {
    case USER_ACTIONS.FETCH_START:    return { ...state, isLoading: true, error: null };
    case USER_ACTIONS.FETCH_SUCCESS:  return { ...state, isLoading: false, profile: payload };
    case USER_ACTIONS.FETCH_FAILURE:  return { ...state, isLoading: false, error: payload };
    case USER_ACTIONS.UPDATE_PROFILE: return { ...state, profile: { ...state.profile, ...payload } };
    default: return state;
  }
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const fetchProfile = useCallback(async (userId, role) => {
    dispatch({ type: USER_ACTIONS.FETCH_START });
    try {
      const fetcher = role === 'CREATOR' ? creatorsApi.getProfile : brandsApi.getProfile;
      const { data } = await fetcher();
      dispatch({ type: USER_ACTIONS.FETCH_SUCCESS, payload: data });
    } catch (err) {
      dispatch({ type: USER_ACTIONS.FETCH_FAILURE, payload: err?.message || 'Failed to load profile' });
    }
  }, []);

  const updateProfile = useCallback(async (fields, role) => {
    try {
      const updater = role === 'CREATOR' ? creatorsApi.updateProfile : brandsApi.updateProfile;
      const { data } = await updater(fields);
      dispatch({ type: USER_ACTIONS.UPDATE_PROFILE, payload: data });
      return data;
    } catch (err) {
      throw new Error(err?.message || 'Failed to update profile');
    }
  }, []);

  return (
    <UserContext.Provider value={{ ...state, fetchProfile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = { children: PropTypes.node.isRequired };

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be inside UserProvider');
  return ctx;
};
