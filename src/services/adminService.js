import api from './api';

// Admin portal API. The Firebase ID token is attached automatically by the
// axios interceptor in services/api.js; the backend enforces the admin role.

export const fetchRequests = (status = 'pending') =>
  api.get('/admin/requests', { params: { status } }).then((r) => r.data);

export const approveRequest = (id) =>
  api.patch(`/admin/requests/${id}/approve`).then((r) => r.data);

export const rejectRequest = (id, reason) =>
  api.patch(`/admin/requests/${id}/reject`, { reason }).then((r) => r.data);
