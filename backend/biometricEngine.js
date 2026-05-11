// Biometric Comparison Engine
// Compares typing patterns, mouse behavior, and device fingerprints

/**
 * Calculate similarity between two typing profiles
 * @param {Array} profile1 - Stored typing profile from registration
 * @param {Array} profile2 - Current typing profile from login
 * @returns {Number} - Similarity percentage (0-100)
 */
function compareTypingProfiles(profile1, profile2) {
    if (!profile1 || !profile2 || profile1.length === 0 || profile2.length === 0) {
        return 0;
    }

    // Calculate average key interval for both profiles
    const avgInterval1 = profile1.reduce((sum, event) => sum + (event.interval || 0), 0) / profile1.length;
    const avgInterval2 = profile2.reduce((sum, event) => sum + (event.interval || 0), 0) / profile2.length;

    // Calculate typing speed (keys per second) for both profiles
    const duration1 = profile1[profile1.length - 1].timestamp - profile1[0].timestamp || 1;
    const duration2 = profile2[profile2.length - 1].timestamp - profile2[0].timestamp || 1;
    const speed1 = (profile1.length / duration1) * 1000;
    const speed2 = (profile2.length / duration2) * 1000;

    // Calculate similarity based on interval difference
    const intervalDiff = Math.abs(avgInterval1 - avgInterval2);
    const maxInterval = Math.max(avgInterval1, avgInterval2);
    const intervalSimilarity = maxInterval > 0 ? (1 - (intervalDiff / maxInterval)) * 100 : 0;

    // Calculate similarity based on speed difference
    const speedDiff = Math.abs(speed1 - speed2);
    const maxSpeed = Math.max(speed1, speed2);
    const speedSimilarity = maxSpeed > 0 ? (1 - (speedDiff / maxSpeed)) * 100 : 0;

    // Average the two similarity metrics
    const typingSimilarity = (intervalSimilarity + speedSimilarity) / 2;

    return Math.max(0, Math.min(100, typingSimilarity));
}

/**
 * Calculate similarity between two mouse movement profiles
 * @param {Array} profile1 - Stored mouse profile from registration
 * @param {Array} profile2 - Current mouse profile from login
 * @returns {Number} - Similarity percentage (0-100)
 */
function compareMouseProfiles(profile1, profile2) {
    if (!profile1 || !profile2 || profile1.length === 0 || profile2.length === 0) {
        return 0;
    }

    // Calculate average mouse speed for both profiles
    const avgSpeed1 = profile1.reduce((sum, event) => sum + (event.speed || 0), 0) / profile1.length;
    const avgSpeed2 = profile2.reduce((sum, event) => sum + (event.speed || 0), 0) / profile2.length;

    // Calculate average distance traveled
    const totalDist1 = profile1.reduce((sum, event) => sum + (event.distance || 0), 0);
    const totalDist2 = profile2.reduce((sum, event) => sum + (event.distance || 0), 0);

    // Calculate similarity based on speed difference
    const speedDiff = Math.abs(avgSpeed1 - avgSpeed2);
    const maxSpeed = Math.max(avgSpeed1, avgSpeed2);
    const speedSimilarity = maxSpeed > 0 ? (1 - (speedDiff / maxSpeed)) * 100 : 0;

    // Calculate similarity based on movement patterns
    const distDiff = Math.abs(totalDist1 - totalDist2);
    const maxDist = Math.max(totalDist1, totalDist2);
    const distSimilarity = maxDist > 0 ? (1 - (distDiff / maxDist)) * 100 : 0;

    // Average the two similarity metrics
    const mouseSimilarity = (speedSimilarity + distSimilarity) / 2;

    return Math.max(0, Math.min(100, mouseSimilarity));
}

/**
 * Compare device fingerprints
 * @param {String} fingerprint1 - Stored fingerprint from registration
 * @param {String} fingerprint2 - Current fingerprint from login
 * @returns {Number} - 100 if match, 0 if no match
 */
function compareFingerprints(fingerprint1, fingerprint2) {
    return fingerprint1 === fingerprint2 ? 100 : 0;
}

/**
 * Calculate overall biometric similarity score
 * @param {Object} storedData - User's stored biometric data
 * @param {Object} loginData - Current login biometric data
 * @returns {Object} - Detailed similarity breakdown and overall score
 */
function calculateSimilarity(storedData, loginData) {
    // Compare each biometric component
    const typingSimilarity = compareTypingProfiles(storedData.typingProfile, loginData.typingProfile);
    const mouseSimilarity = compareMouseProfiles(storedData.mouseProfile, loginData.mouseProfile);
    const fingerprintMatch = compareFingerprints(storedData.fingerprint, loginData.fingerprint);

    // Calculate biometric score as simple average of typing and mouse patterns
    // Device fingerprint is compared and displayed but does not affect biometric authentication
    const overallScore = (typingSimilarity + mouseSimilarity) / 2;

    return {
        typing: Math.round(typingSimilarity),
        mouse: Math.round(mouseSimilarity),
        fingerprint: fingerprintMatch,
        overall: Math.round(overallScore)
    };
}

module.exports = {
    calculateSimilarity,
    compareTypingProfiles,
    compareMouseProfiles,
    compareFingerprints
};
