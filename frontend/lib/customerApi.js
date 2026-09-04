// Central fetch wrapper for the customer dashboard — mirrors the admin
// panel's admin/src/lib/api.js pattern (JWT in localStorage, attached as
// a Bearer header), but with its own token key so a customer session can
// never be confused with an admin-panel session even in the same browser.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN_KEY = 'cbm_customer_token';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
export function isLoggedIn() {
  return !!getToken();
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/dashboard/login/';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const customerApi = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body })
};
