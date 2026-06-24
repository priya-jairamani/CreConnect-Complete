import { createContext, useContext, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import { campaignsApi } from '@/api/campaigns.api';
import { creatorsApi } from '@/api/creators.api';

const initialState = {
  campaigns:  [],
  offers:     [],
  total:      0,
  isLoading:  false,
  error:      null,
};

const CAMPAIGN_ACTIONS = {
  FETCH_START:   'FETCH_START',
  SET_CAMPAIGNS: 'SET_CAMPAIGNS',
  SET_OFFERS:    'SET_OFFERS',
  ADD_CAMPAIGN:  'ADD_CAMPAIGN',
  UPDATE:        'UPDATE',
  FETCH_FAILURE: 'FETCH_FAILURE',
};

function campaignReducer(state, { type, payload }) {
  switch (type) {
    case CAMPAIGN_ACTIONS.FETCH_START:
      return { ...state, isLoading: true, error: null };
    case CAMPAIGN_ACTIONS.SET_CAMPAIGNS:
      return { ...state, isLoading: false, campaigns: payload.data || payload, total: payload.meta?.total || payload.length || 0 };
    case CAMPAIGN_ACTIONS.SET_OFFERS:
      return { ...state, isLoading: false, offers: payload };
    case CAMPAIGN_ACTIONS.ADD_CAMPAIGN:
      return { ...state, campaigns: [payload, ...state.campaigns] };
    case CAMPAIGN_ACTIONS.UPDATE:
      return {
        ...state,
        campaigns: state.campaigns.map((c) => c.id === payload.id ? { ...c, ...payload } : c),
        offers:    state.offers.map((o) => o.id === payload.id ? { ...o, ...payload } : o),
      };
    case CAMPAIGN_ACTIONS.FETCH_FAILURE:
      return { ...state, isLoading: false, error: payload };
    default:
      return state;
  }
}

const CampaignContext = createContext(null);

export function CampaignProvider({ children }) {
  const [state, dispatch] = useReducer(campaignReducer, initialState);

  const fetchCampaigns = useCallback(async (params) => {
    dispatch({ type: CAMPAIGN_ACTIONS.FETCH_START });
    try {
      const { data } = await campaignsApi.list(params);
      dispatch({ type: CAMPAIGN_ACTIONS.SET_CAMPAIGNS, payload: data });
    } catch (err) {
      dispatch({ type: CAMPAIGN_ACTIONS.FETCH_FAILURE, payload: err?.message || 'Failed to load campaigns' });
    }
  }, []);

  const fetchMyCampaigns = useCallback(async (params) => {
    dispatch({ type: CAMPAIGN_ACTIONS.FETCH_START });
    try {
      const { data } = await creatorsApi.getCollaborations(params);  // for creators
      dispatch({ type: CAMPAIGN_ACTIONS.SET_CAMPAIGNS, payload: data });
    } catch (err) {
      dispatch({ type: CAMPAIGN_ACTIONS.FETCH_FAILURE, payload: err?.message || 'Failed to load campaigns' });
    }
  }, []);

  const fetchOffers = useCallback(async () => {
    dispatch({ type: CAMPAIGN_ACTIONS.FETCH_START });
    try {
      const { data } = await creatorsApi.getOffers();
      dispatch({ type: CAMPAIGN_ACTIONS.SET_OFFERS, payload: data || [] });
    } catch (err) {
      dispatch({ type: CAMPAIGN_ACTIONS.FETCH_FAILURE, payload: err?.message || 'Failed to load offers' });
    }
  }, []);

  const createCampaign = useCallback(async (campaignData) => {
    const { data } = await campaignsApi.create(campaignData);
    dispatch({ type: CAMPAIGN_ACTIONS.ADD_CAMPAIGN, payload: data });
    return data;
  }, []);

  const withdrawApplication = useCallback(async (applicationId) => {
    await campaignsApi.withdrawApplication(applicationId);
    dispatch({ type: CAMPAIGN_ACTIONS.SET_OFFERS, payload: [] });
    // Reload offers after withdrawal
    try {
      const { data } = await creatorsApi.getOffers();
      dispatch({ type: CAMPAIGN_ACTIONS.SET_OFFERS, payload: data || [] });
    } catch { /* ignore */ }
  }, []);

  const updateCampaign = useCallback(async (id, updates) => {
    const { data } = await campaignsApi.update(id, updates);
    dispatch({ type: CAMPAIGN_ACTIONS.UPDATE, payload: data });
    return data;
  }, []);

  return (
    <CampaignContext.Provider value={{ ...state, fetchCampaigns, fetchMyCampaigns, fetchOffers, createCampaign, withdrawApplication, updateCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

CampaignProvider.propTypes = { children: PropTypes.node.isRequired };

export const useCampaignContext = () => {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error('useCampaignContext must be inside CampaignProvider');
  return ctx;
};
