const API_BASE = 'http://localhost:5000/api';

const headers = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const authAPI = {
    register: async (data) => {
        const res = await fetch(`${API_BASE}/register`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
        return res.json();
    },

    loginStep1: async (data) => {
        const res = await fetch(`${API_BASE}/login/step1`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
        return res.json();
    },

    verifyTOTP: async (data) => {
        const res = await fetch(`${API_BASE}/login/verify-otp`, { method: 'POST', headers: headers(), body: JSON.stringify(data) });
        return res.json();
    },

    totpSetup: async (username) => {
        const res = await fetch(`${API_BASE}/totp/setup`, { method: 'POST', headers: headers(), body: JSON.stringify({ username }) });
        return res.json();
    },

    totpVerifySetup: async (username, token) => {
        const res = await fetch(`${API_BASE}/totp/verify-setup`, { method: 'POST', headers: headers(), body: JSON.stringify({ username, token }) });
        return res.json();
    },

    /**
     * Verify session token server-side.
     * @param {string} token - JWT token from localStorage
     */
    verifySession: async (token) => {
        const res = await fetch(`${API_BASE}/session/verify`, { method: 'GET', headers: headers(token) });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            return { valid: false, expired: data.expired || false };
        }
        return res.json();
    },
};
