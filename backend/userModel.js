// MongoDB User Model for Behavioral Biometric Authentication
const mongoose = require('mongoose');

// Define the User Schema
const userSchema = new mongoose.Schema({
  // Basic user information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },

  // Password hash (bcrypt)
  password: {
    type: String,
    required: true
  },

  // Device fingerprint from FingerprintJS
  fingerprint: {
    type: String,
    required: true
  },

  // Typing biometrics profile
  // Stores key press/release timestamps and intervals
  typingProfile: {
    type: Array,
    required: true,
    default: []
  },

  // Mouse movement biometrics profile
  // Stores mouse coordinates, speed, and path patterns
  mouseProfile: {
    type: Array,
    required: true,
    default: []
  },

  // TOTP (Google Authenticator) secret — base32 encoded
  // Set during registration TOTP setup, null until confirmed
  totpSecret: {
    type: String,
    default: null
  },

  // Whether the user has completed TOTP setup
  // Only true after the user scans the QR code and verifies their first code
  totpEnabled: {
    type: Boolean,
    default: false
  },

  // Timestamp when user was created
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
