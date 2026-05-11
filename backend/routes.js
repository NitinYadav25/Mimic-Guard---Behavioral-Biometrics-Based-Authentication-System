// API Routes for BehaviorAuth
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./userModel');
const { calculateSimilarity } = require('./biometricEngine');
const { generateTOTPSecret, verifyTOTPToken, isLocationAllowed } = require('./totpService');

const JWT_SECRET = process.env.JWT_SECRET || 'behaviorauth_dev_secret_change_in_production';

/**
 * Middleware: verify JWT from Authorization header
 * Attaches req.session = { username, trustLevel, iat, exp }
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ success: false, message: 'No session token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.session = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: err.name === 'TokenExpiredError' ? 'Session expired. Please login again.' : 'Invalid session token.',
            expired: err.name === 'TokenExpiredError'
        });
    }
}

/**
 * Validate password requirements
 */
function validatePassword(password) {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
    if (!/\d/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return { valid: false, message: 'Password must contain at least one special character' };
    return { valid: true };
}

/**
 * POST /register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fingerprint, typingProfile, mouseProfile } = req.body;

        if (!username || !email || !password || !fingerprint || !typingProfile || !mouseProfile) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ success: false, message: passwordValidation.message });
        }

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username, email,
            password: hashedPassword,
            fingerprint, typingProfile, mouseProfile
        });

        await newUser.save();
        console.log(`✅ User registered: ${username}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please set up Google Authenticator.',
            user: { username: newUser.username, email: newUser.email, createdAt: newUser.createdAt }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
});

// ============================
// TOTP Setup Routes
// ============================

/**
 * POST /totp/setup
 */
router.post('/totp/setup', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const { secret, qrCodeUrl } = await generateTOTPSecret(username);
        user.totpSecret = secret;
        user.totpEnabled = false;
        await user.save();

        console.log(`🔐 TOTP secret generated for user: ${username}`);
        res.status(200).json({ success: true, qrCodeUrl, secret });

    } catch (error) {
        console.error('TOTP setup error:', error);
        res.status(500).json({ success: false, message: 'Server error during TOTP setup' });
    }
});

/**
 * POST /totp/verify-setup
 */
router.post('/totp/verify-setup', async (req, res) => {
    try {
        const { username, token } = req.body;
        if (!username || !token) return res.status(400).json({ success: false, message: 'Username and token are required' });

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.totpSecret) return res.status(400).json({ success: false, message: 'TOTP not set up. Please call /totp/setup first.' });

        const isValid = verifyTOTPToken(token, user.totpSecret);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid authenticator code. Please check your app and try again.' });
        }

        user.totpEnabled = true;
        await user.save();

        console.log(`✅ TOTP setup complete for user: ${username}`);
        res.status(200).json({ success: true, message: 'Google Authenticator set up successfully! You can now log in.' });

    } catch (error) {
        console.error('TOTP verify-setup error:', error);
        res.status(500).json({ success: false, message: 'Server error during TOTP verification' });
    }
});

// ============================
// Session Routes
// ============================

/**
 * GET /session/verify
 * Validates the JWT token from Authorization header.
 * Returns session metadata including trust level and expiry.
 */
router.get('/session/verify', requireAuth, (req, res) => {
    const { username, trustLevel, exp } = req.session;
    res.status(200).json({
        success: true,
        valid: true,
        username,
        trustLevel,
        expiresAt: exp * 1000, // convert to ms
        remainingSeconds: Math.max(0, exp - Math.floor(Date.now() / 1000))
    });
});

// ============================
// Login Routes
// ============================

/**
 * POST /login/step1
 * Validate password and location, prompt for TOTP.
 */
router.post('/login/step1', async (req, res) => {
    try {
        const { username, password, fingerprint, typingProfile, mouseProfile } = req.body;

        if (!username || !password || !fingerprint || !typingProfile || !mouseProfile) {
            return res.status(400).json({ success: false, message: 'All fields are required for authentication' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Authentication failed - incorrect password' });
        }

        if (!user.totpEnabled || !user.totpSecret) {
            return res.status(403).json({ success: false, message: 'Two-factor authentication not set up. Please register again.' });
        }

        const clientIP = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
        const allowedIPs = process.env.ALLOWED_IPS;

        if (!isLocationAllowed(clientIP, allowedIPs)) {
            console.log(`❌ Login blocked from IP: ${clientIP}`);
            return res.status(403).json({ success: false, message: 'Login not allowed from this location.', clientIP });
        }

        console.log(`✅ Password and location verified for: ${username}`);
        res.status(200).json({
            success: true,
            requiresTOTP: true,
            message: 'Password verified. Enter the 6-digit code from your Google Authenticator app.',
            username: user.username
        });

    } catch (error) {
        console.error('Login Step 1 error:', error);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

/**
 * POST /login/verify-otp
 * Verify TOTP, run biometrics, issue JWT with trust-level expiry.
 */
router.post('/login/verify-otp', async (req, res) => {
    try {
        const { username, otp, fingerprint, typingProfile, mouseProfile } = req.body;

        if (!username || !otp) {
            return res.status(400).json({ success: false, message: 'Username and authenticator code are required' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Verify TOTP
        const isValid = verifyTOTPToken(otp, user.totpSecret);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid authenticator code. Please check your app and try again.' });
        }

        console.log(`✅ TOTP verified for user: ${username}`);

        if (!fingerprint || !typingProfile || !mouseProfile) {
            return res.status(400).json({ success: false, message: 'Biometric data required for final verification' });
        }

        // Biometric comparison
        const storedData = { fingerprint: user.fingerprint, typingProfile: user.typingProfile, mouseProfile: user.mouseProfile };
        const loginData = { fingerprint, typingProfile, mouseProfile };
        const similarity = calculateSimilarity(storedData, loginData);

        const THRESHOLD = 70;
        const biometricPassed = similarity.overall >= THRESHOLD;

        // Trust level + session duration
        let trustLevel = 'MEDIUM';
        let sessionTimeout = 600; // 10 min

        if (biometricPassed) {
            trustLevel = 'HIGH';
            sessionTimeout = 1800; // 30 min
        }

        // 🔐 Issue JWT — expiry matches trust level
        const token = jwt.sign(
            { username: user.username, trustLevel },
            JWT_SECRET,
            { expiresIn: sessionTimeout }
        );

        console.log(`✅ Login complete for ${username} — trust: ${trustLevel}, session: ${sessionTimeout}s`);

        res.status(200).json({
            success: true,
            message: biometricPassed
                ? 'Authentication successful - Full access granted'
                : 'Limited access granted - Biometric verification failed',
            token,
            trustLevel,
            sessionTimeout,
            biometricPassed,
            similarity,
            user: { username: user.username, email: user.email }
        });

    } catch (error) {
        console.error('TOTP Verification error:', error);
        res.status(500).json({ success: false, message: 'Server error during TOTP verification' });
    }
});

/**
 * POST /login (Deprecated)
 */
router.post('/login', (req, res) => {
    res.status(400).json({
        success: false,
        message: 'This endpoint is deprecated. Please use /login/step1 for multi-factor authentication.',
        newEndpoint: '/api/login/step1'
    });
});

module.exports = router;
