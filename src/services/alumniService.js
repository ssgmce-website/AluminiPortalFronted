import api from './api';

export const fetchNewlyRegisteredAlumni = (limit = 8) =>
  api.get('/public/newly-registered', { params: { limit } }).then((r) => r.data.data.alumni);

export const fetchDistinguishedAlumni = () =>
  api.get('/public/distinguished-alumni').then((r) => r.data.data.alumni);

export const fetchExecutiveMembers = () =>
  api.get('/public/executive-members').then((r) => r.data.data.members);


// Event registration
export const registerForEvent = (payload) =>
  api.post('/event/register', payload).then((r) => r.data.data.registration);

export const getMyEventRegistration = (year) =>
  api.get(`/event/my-registration/${year}`).then((r) => r.data.data);

export const updateEventRegistration = (year, payload) =>
  api.patch(`/event/my-registration/${year}`, payload).then((r) => r.data.data.registration);

export const fetchActiveEvent = () =>
  api.get('/event/active').then((r) => r.data.data.event);
