import api from './api';

// Public endpoint — powers the homepage "Newly Registered Alumni" cards.
export const fetchNewlyRegisteredAlumni = (limit = 8) =>
  api.get('/user/newly-registered', { params: { limit } }).then((r) => r.data.alumni);
