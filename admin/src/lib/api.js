// Central fetch wrapper for the admin panel.
// Reads the API base URL from an env var set at build time, and attaches
// the JWT stored in localStorage to every request.

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('cbm_token');
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined
  });

  // A 401 on the login call itself just means wrong credentials, not an
  // expired session — let it fall through to the generic error handling
  // below so the real "Invalid credentials" message reaches the user.
  if (res.status === 401 && path !== '/api/auth/login') {
    localStorage.removeItem('cbm_token');
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/api/upload', { method: 'POST', body: form, isForm: true });
  },
  setToken: (token) => localStorage.setItem('cbm_token', token),
  clearToken: () => localStorage.removeItem('cbm_token'),
  isLoggedIn: () => !!getToken()
};

// Maps a content type key to its API resource path, used across list/editor pages.
export const CONTENT_TYPES = {
  pages: { label: 'Pages', path: '/api/pages', hasOwner: false },
  services: { label: 'Services', path: '/api/services', hasOwner: false },
  blog: { label: 'Blog Posts', path: '/api/blog', hasOwner: true },
  'case-studies': { label: 'Case Studies', path: '/api/case-studies', hasOwner: false }
};
