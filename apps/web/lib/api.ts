// API client for MathResearchPilot

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API call failed: ${response.statusText}`);
  }

  // Handle empty responses
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Profile API
export const profileApi = {
  get: () => apiCall('/profile'),
  create: (data: any) => apiCall('/profile', { method: 'POST', body: JSON.stringify(data) }),
  update: (data: any) => apiCall('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  delete: () => apiCall('/profile', { method: 'DELETE' }),
};

// Papers API
export const papersApi = {
  search: (query: string, maxResults: number = 10, category?: string) =>
    apiCall('/papers/search', {
      method: 'POST',
      body: JSON.stringify({ query, max_results: maxResults, category }),
    }),
  list: (focusOnly: boolean = false) =>
    apiCall(`/papers${focusOnly ? '?focus_only=true' : ''}`),
  get: (id: number) => apiCall(`/papers/${id}`),
  add: (extId: string) => apiCall(`/papers?ext_id=${extId}`, { method: 'POST' }),
  update: (id: number, data: any) =>
    apiCall(`/papers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/papers/${id}`, { method: 'DELETE' }),
};

// Tasks API
export const tasksApi = {
  list: (dateFilter?: string, status?: string) => {
    const params = new URLSearchParams();
    if (dateFilter) params.append('date_filter', dateFilter);
    if (status) params.append('status', status);
    return apiCall(`/tasks?${params}`);
  },
  getToday: () => apiCall('/tasks/today'),
  generateToday: () => apiCall('/tasks/today', { method: 'POST' }),
  resetToday: () => apiCall('/tasks/today', { method: 'DELETE' }),
  get: (id: number) => apiCall(`/tasks/${id}`),
  create: (data: any) => apiCall('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    apiCall(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/tasks/${id}`, { method: 'DELETE' }),
};

// CheckIns API
export const checkinsApi = {
  list: (taskId?: number) =>
    apiCall(`/checkins${taskId ? `?task_id=${taskId}` : ''}`),
  get: (id: number) => apiCall(`/checkins/${id}`),
  create: (data: any) => apiCall('/checkins', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: number) => apiCall(`/checkins/${id}`, { method: 'DELETE' }),
};

// Topics API
export const topicsApi = {
  recommend: (data: any) => apiCall('/topics/recommend', { method: 'POST', body: JSON.stringify(data) }),
  trending: (category?: string) => apiCall(`/topics/trending${category ? `?category=${category}` : ''}`),
};

// Roadmap API
export const roadmapApi = {
  getCurrent: () => apiCall('/roadmap/current'),
  create: (data: any) => apiCall('/roadmap', { method: 'POST', body: JSON.stringify(data) }),
  updateWeek: (weekNum: number, status: string) =>
    apiCall(`/roadmap/week/${weekNum}?status=${status}`, { method: 'PATCH' }),
  getProgress: () => apiCall('/roadmap/progress'),
  delete: () => apiCall('/roadmap', { method: 'DELETE' }),
};
