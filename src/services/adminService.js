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

// Gallery Management
export const fetchGalleryAdmin = () =>
  adminApi.get('/admin/gallery').then((r) => r.data.data);

export const createGalleryImage = (data) =>
  adminApi.post('/admin/gallery', data).then((r) => r.data.data);

export const updateGalleryImage = (id, data) =>
  adminApi.put(`/admin/gallery/${id}`, data).then((r) => r.data.data);

export const deleteGalleryImage = (id) =>
  adminApi.delete(`/admin/gallery/${id}`).then((r) => r.data.data);

export const uploadGalleryImage = async (file, year) => {
  const formData = new FormData();
  formData.append('gallery-file', file);

  const { data } = await adminApi.post(`/upload/gallery-file/${year || ''}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// News Management
export const fetchNewsAdmin = () =>
  adminApi.get('/admin/news').then((r) => r.data.data);

export const createNewsAdmin = (data) =>
  adminApi.post('/admin/news', data).then((r) => r.data.data);

export const updateNewsAdmin = (id, data) =>
  adminApi.put(`/admin/news/${id}`, data).then((r) => r.data.data);

export const deleteNewsAdmin = (id) =>
  adminApi.delete(`/admin/news/${id}`).then((r) => r.data.data);

export const toggleNewsActiveAdmin = (id) =>
  adminApi.patch(`/admin/news/${id}/toggle-active`).then((r) => r.data.data);

export const uploadNewsImage = async (file) => {
  const formData = new FormData();
  formData.append('image-file', file);

  const { data } = await adminApi.post('/upload/image-file/news', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

// Contributions Management
export const fetchContributionsAdmin = () =>
  adminApi.get('/admin/contributions').then((r) => r.data.data);

export const updateContributionStatusAdmin = (id, status) =>
  adminApi.patch(`/admin/contributions/${id}/status`, { status }).then((r) => r.data.data);

export const updateContributionBeneficiariesAdmin = (id, beneficiaries) =>
  adminApi.patch(`/admin/contributions/${id}/beneficiaries`, { beneficiaries }).then((r) => r.data.data);

export const toggleContributionPublicAdmin = (id, isPublic) =>
  adminApi.patch(`/admin/contributions/${id}/public`, { isPublic }).then((r) => r.data.data);

// Distinguished Alumni Management
export const addDistinguishedAlumni = (userId) =>
  adminApi.post(`/admin/distinguished/${userId}`).then((r) => r.data.data);

export const removeDistinguishedAlumni = (userId) =>
  adminApi.delete(`/admin/distinguished/${userId}`).then((r) => r.data.data);




