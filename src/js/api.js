// API Client for Astra Horizon backend

const TOKEN_KEY = 'astra_token';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY) || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken() {
    return this.token;
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(path, {
        ...options,
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP error ${res.status}`);
      }
      return data;
    } catch (err) {
      console.error(`API Error [${path}]:`, err);
      throw err;
    }
  }

  async register(username, password) {
    const res = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async login(username, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async guestLogin() {
    const res = await this.request('/api/auth/guest', {
      method: 'POST'
    });
    if (res.token) this.setToken(res.token);
    return res;
  }

  async getMe() {
    if (!this.token) return null;
    try {
      return await this.request('/api/auth/me');
    } catch (err) {
      this.setToken(null);
      return null;
    }
  }

  async updateProfile(payload) {
    return await this.request('/api/profile/update', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async resetSettings() {
    return await this.request('/api/profile/reset-settings', {
      method: 'POST'
    });
  }

  async saveRocket(rocket) {
    return await this.request('/api/rocket/save', {
      method: 'POST',
      body: JSON.stringify({ rocket })
    });
  }

  async craft(partKey, level) {
    return await this.request('/api/craft', {
      method: 'POST',
      body: JSON.stringify({ partKey, level })
    });
  }

  async selectMission(missionId) {
    return await this.request('/api/missions/select', {
      method: 'POST',
      body: JSON.stringify({ missionId })
    });
  }

  async completeLaunch(payload) {
    return await this.request('/api/launch/complete', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getLeaderboard() {
    return await this.request('/api/records/all');
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient();
