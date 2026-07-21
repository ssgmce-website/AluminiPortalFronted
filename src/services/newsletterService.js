import api from './api';

export const fetchPublicNewsletters = () =>
  api.get('/public/newsletters').then((r) => r.data.data);
