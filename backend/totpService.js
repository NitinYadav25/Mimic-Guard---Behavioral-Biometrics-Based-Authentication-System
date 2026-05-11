// TOTP Service for Google Authenticator-based Two-Factor Authentication
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const APP_NAME = 'BehaviorAuth';

/**
 * Generate a new TOTP secret for a user.
 * Returns the base32 secret and a QR code data URL for scanning with
 * Google Authenticator, Authy, or any TOTP-compatible app.
 *
 * @param {string} username - The user's username (used as the account label)
 * @returns {Promise<{secret: string, qrCodeUrl: string}>}
 */
async function generateTOTPSecret(username) {
    const secret = speakeasy.generateSecret({
        name: `${APP_NAME} (${username})`,
        length: 20
    });

    // Generate a QR code data URL — display this as <img src="..."> in the UI
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,   // Store this in the database
        qrCodeUrl                // Send this to the frontend for display
    };
}

/**
 * Verify a TOTP token against the user's stored secret.
 * Allows a 1-step window (±30 seconds) to account for clock drift.
 *
 * @param {string} token - 6-digit code from the authenticator app
 * @param {string} secret - base32 secret stored in the database
 * @returns {boolean} true if valid, false otherwise
 */
function verifyTOTPToken(token, secret) {
    if (!token || !secret) return false;

    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: token.toString().trim(),
        window: 1   // Allow 1 step (30s) clock drift tolerance
    });
}

/**
 * Check if an IP address is in the allowed list.
 * (Retained from previous otpService — unrelated to OTP mechanism)
 *
 * @param {string} ipAddress - Client IP address
 * @param {string} allowedIPs - Comma-separated list of allowed IPs
 * @returns {boolean} Whether the IP is allowed
 */
function isLocationAllowed(ipAddress, allowedIPs) {
    if (!allowedIPs) {
        // No IP restrictions configured — allow all
        return true;
    }

    const allowedIPList = allowedIPs.split(',').map(ip => ip.trim());

    // Normalize IPv6 localhost variations
    const normalizedIP = ipAddress === '::1' ? '127.0.0.1' : ipAddress;

    return allowedIPList.some(allowedIP => {
        const normalizedAllowedIP = allowedIP === '::1' ? '127.0.0.1' : allowedIP;
        return normalizedIP === normalizedAllowedIP || normalizedIP.includes(normalizedAllowedIP);
    });
}

module.exports = {
    generateTOTPSecret,
    verifyTOTPToken,
    isLocationAllowed
};
