import api from './client';

export const campaignsApi = {
  create:               (data)                  => api.post('/campaigns', data),
  list:                 (params)                => api.get('/campaigns', { params }),
  get:                  (id)                    => api.get(`/campaigns/${id}`),
  update:               (id, data)              => api.patch(`/campaigns/${id}`, data),
  delete:               (id)                    => api.delete(`/campaigns/${id}`),
  apply:                (id, data)              => api.post(`/campaigns/${id}/apply`, data),
  getApplications:      (id)                    => api.get(`/campaigns/${id}/applications`),
  respondApplication:   (applicationId, action) => api.patch(`/campaigns/applications/${applicationId}/${action}`),
  withdrawApplication:  (applicationId)         => api.delete(`/campaigns/applications/${applicationId}/withdraw`),
  invite:               (campaignId, creatorId) => api.post(`/campaigns/${campaignId}/invite`, { creatorId }),
  respondToInvitation:  (appId, action)         => api.patch(`/campaigns/applications/${appId}/respond/${action}`),

  getDeliverables:      (collabId)                        => api.get(`/campaigns/collaborations/${collabId}/deliverables`),
  submitDeliverable:    (collabId, data)                   => api.post(`/campaigns/collaborations/${collabId}/deliverables`, data),
  respondToDeliverable: (deliverableId, action, feedback)  => api.patch(`/campaigns/deliverables/${deliverableId}/${action}`, { feedback }),
};
