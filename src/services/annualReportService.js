import api from './api';

export const fetchPublicAnnualReports = () =>
  api.get('/public/annual-reports').then((r) => r.data.data);
