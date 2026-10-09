export const API_BASE_URL = '/api/v1';
export const AUTH_ENDPOINT = `${API_BASE_URL}/auth`;
export const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login`;
export const USERS_ENDPOINT = `${API_BASE_URL}/users`;
export const NOTES_ENDPOINT = `${API_BASE_URL}/notes`;

export const protectedRoutes = [
  { method: 'GET', url: '/api/v1' },
  { method: 'PATCH', url: USERS_ENDPOINT }
] as const;
