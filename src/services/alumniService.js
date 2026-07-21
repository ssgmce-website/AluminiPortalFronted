import api from './api';

// Public endpoint — powers the homepage "Newly Registered Alumni" cards.
export const fetchNewlyRegisteredAlumni = (limit = 8) =>
  api.get('/public/newly-registered', { params: { limit } }).then((r) => r.data.data.alumni);

// Event registration
export const registerForEvent = (payload) =>
  api.post('/event/register', payload).then((r) => r.data.data.registration);

export const getMyEventRegistration = (year) =>
  api.get(`/event/my-registration/${year}`).then((r) => r.data.data);

export const updateEventRegistration = (year, payload) =>
  api.patch(`/event/my-registration/${year}`, payload).then((r) => r.data.data.registration);
