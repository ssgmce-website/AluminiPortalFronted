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

export const fetchDeptWiseAlumni = () =>
  adminApi.get('/admin/dept-wise').then((r) => r.data.data);

export const fetchAlumniFeedbacks = () =>
  adminApi.get('/admin/alumni-feedbacks').then((r) => r.data.data);

export const fetchPublicFeedbacks = () =>
  adminApi.get('/admin/public-feedbacks').then((r) => r.data.data);

// Annual Reports Management
export const fetchAnnualReportsAdmin = () =>
  adminApi.get('/admin/annual-reports').then((r) => r.data.data);

export const createAnnualReport = (data) =>
  adminApi.post('/admin/annual-reports', data).then((r) => r.data.data);

export const updateAnnualReport = (id, data) =>
  adminApi.put(`/admin/annual-reports/${id}`, data).then((r) => r.data.data);

export const deleteAnnualReport = (id) =>
  adminApi.delete(`/admin/annual-reports/${id}`).then((r) => r.data.data);

export const uploadAnnualReportPdf = async (file) => {
  const formData = new FormData();
  formData.append('pdf-file', file);

  const { data } = await adminApi.post('/upload/pdf-file/anual report', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// Newsletters Management
export const fetchNewslettersAdmin = () =>
  adminApi.get('/admin/newsletters').then((r) => r.data.data);

export const createNewsletter = (data) =>
  adminApi.post('/admin/newsletters', data).then((r) => r.data.data);

export const updateNewsletter = (id, data) =>
  adminApi.put(`/admin/newsletters/${id}`, data).then((r) => r.data.data);

export const deleteNewsletter = (id) =>
  adminApi.delete(`/admin/newsletters/${id}`).then((r) => r.data.data);

export const uploadNewsletterPdf = async (file) => {
  const formData = new FormData();
  formData.append('pdf-file', file);

  const { data } = await adminApi.post('/upload/pdf-file/newsletters', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};
