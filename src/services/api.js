const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const getHeaders = () => {
  const token = localStorage.getItem('filial_token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
};

const parseResponse = async (res) => {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { error: text };
    }
  }
  if (!res.ok) {
    throw new Error(data.error || `Server xatosi (${res.status})`);
  }
  return data;
};

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return parseResponse(res);
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return parseResponse(res);
  },

  // Branches
  async getBranches() {
    const res = await fetch(`${API_BASE}/api/branches`, { headers: getHeaders() });
    return parseResponse(res);
  },

  async getBranchById(id) {
    const res = await fetch(`${API_BASE}/api/branches/${id}`, { headers: getHeaders() });
    return parseResponse(res);
  },

  async createBranch(branchData) {
    const res = await fetch(`${API_BASE}/api/branches`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(branchData),
    });
    return parseResponse(res);
  },

  async updateBranch(id, branchData) {
    const res = await fetch(`${API_BASE}/api/branches/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(branchData),
    });
    return parseResponse(res);
  },

  async deleteBranch(id) {
    const res = await fetch(`${API_BASE}/api/branches/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  // Employees
  async getEmployees(params) {
    const urlStr = API_BASE ? `${API_BASE}/api/employees` : '/api/employees';
    const url = new URL(urlStr, window.location.origin);
    if (params?.branchId) url.searchParams.append('branchId', params.branchId);
    if (params?.search) url.searchParams.append('search', params.search);
    if (params?.status) url.searchParams.append('status', params.status);

    const res = await fetch(url.toString(), { headers: getHeaders() });
    return parseResponse(res);
  },

  async getEmployeeById(id) {
    const res = await fetch(`${API_BASE}/api/employees/${id}`, { headers: getHeaders() });
    return parseResponse(res);
  },

  async createEmployee(empData) {
    const res = await fetch(`${API_BASE}/api/employees`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(empData),
    });
    return parseResponse(res);
  },

  async updateEmployee(id, empData) {
    const res = await fetch(`${API_BASE}/api/employees/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(empData),
    });
    return parseResponse(res);
  },

  async deleteEmployee(id) {
    const res = await fetch(`${API_BASE}/api/employees/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  // Ratings
  async getRatings(params) {
    const urlStr = API_BASE ? `${API_BASE}/api/ratings` : '/api/ratings';
    const url = new URL(urlStr, window.location.origin);
    if (params?.employeeId) url.searchParams.append('employeeId', params.employeeId);
    if (params?.branchId) url.searchParams.append('branchId', params.branchId);
    if (params?.date) url.searchParams.append('date', params.date);

    const res = await fetch(url.toString(), { headers: getHeaders() });
    return parseResponse(res);
  },

  async createRating(ratingData) {
    const res = await fetch(`${API_BASE}/api/ratings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(ratingData),
    });
    return parseResponse(res);
  },

  // Roles & Permissions
  async getPermissions() {
    const res = await fetch(`${API_BASE}/api/permissions`, { headers: getHeaders() });
    return parseResponse(res);
  },

  async getRoles() {
    const res = await fetch(`${API_BASE}/api/roles`, { headers: getHeaders() });
    return parseResponse(res);
  },

  async createRole(roleData) {
    const res = await fetch(`${API_BASE}/api/roles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(roleData),
    });
    return parseResponse(res);
  },

  async updateRole(id, roleData) {
    const res = await fetch(`${API_BASE}/api/roles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(roleData),
    });
    return parseResponse(res);
  },

  async deleteRole(id) {
    const res = await fetch(`${API_BASE}/api/roles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  // Stats
  async getStats(params) {
    const urlStr = API_BASE ? `${API_BASE}/api/stats` : '/api/stats';
    const url = new URL(urlStr, window.location.origin);
    if (params?.period) url.searchParams.append('period', params.period);
    if (params?.startDate) url.searchParams.append('startDate', params.startDate);
    if (params?.endDate) url.searchParams.append('endDate', params.endDate);
    if (params?.branchId) url.searchParams.append('branchId', params.branchId);

    const res = await fetch(url.toString(), { headers: getHeaders() });
    return parseResponse(res);
  },

  // Activity Logs
  async getActivityLogs() {
    const res = await fetch(`${API_BASE}/api/activity-logs`, { headers: getHeaders() });
    return parseResponse(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/api/notifications`, { headers: getHeaders() });
    return parseResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return parseResponse(res);
  },
};
