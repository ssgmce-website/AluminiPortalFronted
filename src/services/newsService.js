import api from './api';

export const fetchPublicNews = () =>
  api.get('/public/news').then((r) => r.data.data);

export const fetchNewsDetail = (id) =>
  api.get(`/public/news/${id}`).then((r) => r.data.data);
