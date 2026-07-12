import adminApi from './adminApi';

// Admin portal API. The standalone admin session token is attached automatically
// by the interceptor in services/adminApi.js; the backend enforces admin access.

export const fetchRequests = (status = 'pending') =>
  adminApi.get('/admin/requests', { params: { status } }).then((r) => r.data.data);

export const approveRequest = (id) =>
  adminApi.patch(`/admin/requests/${id}/approve`).then((r) => r.data.data);

export const rejectRequest = (id, reason) =>
  adminApi.patch(`/admin/requests/${id}/reject`, { reason }).then((r) => r.data.data);

export const fetchEventRegistrations = (year) =>
  adminApi.get('/event/admin/registrations', { params: { year } }).then((r) => r.data.data);

export const updateEventAttendance = (id, attendanceStatus) =>
  adminApi.patch(`/event/admin/registrations/${id}/attendance`, { attendanceStatus }).then((r) => r.data.data);
