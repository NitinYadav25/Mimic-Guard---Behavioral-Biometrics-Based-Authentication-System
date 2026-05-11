/**
 * Session utility — centralised localStorage session management.
 * Stores an absolute expiry timestamp so the countdown survives page reloads.
 */

const KEYS = {
    token: 'ba_token',
    user: 'ba_user',
    trustLevel: 'ba_trustLevel',
    expiresAt: 'ba_expiresAt',   // absolute ms timestamp
};

/**
 * Persist session data after successful login.
 * @param {{ token: string, user: object, trustLevel: string, sessionTimeout: number }} session
 */
export function saveSession({ token, user, trustLevel, sessionTimeout }) {
    const expiresAt = Date.now() + sessionTimeout * 1000;
    localStorage.setItem(KEYS.token, token);
    localStorage.setItem(KEYS.user, JSON.stringify(user));
    localStorage.setItem(KEYS.trustLevel, trustLevel);
    localStorage.setItem(KEYS.expiresAt, String(expiresAt));
}

/**
 * Retrieve session data. Returns null if missing or expired.
 */
export function getSession() {
    const token = localStorage.getItem(KEYS.token);
    const userStr = localStorage.getItem(KEYS.user);
    const trustLevel = localStorage.getItem(KEYS.trustLevel);
    const expiresAt = parseInt(localStorage.getItem(KEYS.expiresAt) || '0', 10);

    if (!token || !userStr || !trustLevel || !expiresAt) return null;
    if (Date.now() >= expiresAt) {
        clearSession();
        return null;
    }

    return {
        token,
        user: JSON.parse(userStr),
        trustLevel,
        expiresAt,
        remainingSeconds: Math.floor((expiresAt - Date.now()) / 1000),
    };
}

/**
 * Remove all session data from localStorage.
 */
export function clearSession() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
