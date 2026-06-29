// Decide where a signed-in user should land based on their account status/role.
// Admins → admin portal; approved alumni → dashboard; everyone else (pending /
// rejected / unknown) → the "awaiting approval" screen.
export const routeForProfile = (profile) => {
  if (profile?.role === 'admin') return '/admin';
  if (profile?.status === 'approved') return '/dashboard';
  return '/pending';
};



