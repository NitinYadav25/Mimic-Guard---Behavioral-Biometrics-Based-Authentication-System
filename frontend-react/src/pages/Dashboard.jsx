import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrustBanner } from '../components/TrustBanner';
import { RestrictedButton } from '../components/RestrictedButton';
import { Message } from '../components/Message';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { getSession, clearSession } from '../utils/session';
import { authAPI } from '../services/api';

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [trustLevel, setTrustLevel] = useState('LOW');
    const [verifyMessage, setVerifyMessage] = useState({ text: '', type: '' });
    const [isVerifying, setIsVerifying] = useState(false);

    // Persistent countdown — survives reload
    const { remainingTime, formattedTime, isExpiring } = useSessionTimeout();

    useEffect(() => {
        const session = getSession();
        if (!session) {
            navigate('/login', { replace: true });
            return;
        }
        setUser(session.user);
        setTrustLevel(session.trustLevel);
    }, [navigate]);

    /** Re-verify the current JWT server-side */
    const handleVerifySession = async () => {
        setVerifyMessage({ text: '', type: '' });
        setIsVerifying(true);

        const session = getSession();
        if (!session) {
            clearSession();
            navigate('/login', { replace: true });
            return;
        }

        try {
            const data = await authAPI.verifySession(session.token);
            if (data.valid) {
                const mins = Math.floor(data.remainingSeconds / 60);
                const secs = data.remainingSeconds % 60;
                setVerifyMessage({
                    text: `✅ Session valid — Trust: ${data.trustLevel} — Expires in ${mins}m ${secs}s`,
                    type: 'success'
                });
            } else {
                clearSession();
                setVerifyMessage({ text: '❌ Session expired. Redirecting to login...', type: 'error' });
                setTimeout(() => navigate('/login', { replace: true }), 1500);
            }
        } catch {
            setVerifyMessage({ text: '⚠️ Could not reach server. Local session still active.', type: 'error' });
        }
        setIsVerifying(false);
    };

    const handleLogout = () => {
        clearSession();
        navigate('/login', { replace: true });
    };

    const handleChangePassword = () => alert('Password change functionality');
    const handleUpdateProfile = () => alert('Profile update functionality');
    const handleMakePayment = () => alert('Payment functionality');
    const handleDeleteAccount = () => alert('Delete account functionality');

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-cyan-400 text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-4xl font-bold text-cyan-400 mb-2">🔐 BehaviorAuth Dashboard</h1>
                        <p className="text-slate-300">Welcome back, <span className="text-cyan-400 font-semibold">{user.username}</span>!</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleVerifySession}
                            disabled={isVerifying}
                            className="px-5 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors flex items-center gap-2"
                        >
                            {isVerifying
                                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Verifying...</span></>
                                : '🛡️ Verify BioAuth'
                            }
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Session verify result */}
                {verifyMessage.text && (
                    <div className="mb-4">
                        <Message text={verifyMessage.text} type={verifyMessage.type} />
                    </div>
                )}

                {/* Trust Level Banner */}
                <TrustBanner
                    trustLevel={trustLevel}
                    remainingTime={remainingTime}
                    formattedTime={formattedTime}
                    isExpiring={isExpiring}
                />

                {/* Session expiring warning */}
                {isExpiring && (
                    <div className="mb-4 px-4 py-3 bg-yellow-900/40 border border-yellow-500/50 rounded-xl text-yellow-300 text-sm flex items-center gap-2 animate-pulse">
                        ⚠️ Session expiring in {formattedTime} — save your work.
                    </div>
                )}

                {/* Dashboard Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Profile Section */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                            👤 Profile Information
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-slate-400 text-sm">Username</label>
                                <p className="text-slate-100 text-lg font-semibold">{user.username}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">Email</label>
                                <p className="text-slate-100 text-lg font-semibold">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">Trust Level</label>
                                <div className="flex items-center gap-2">
                                    <span className={`px-4 py-1 rounded-lg font-bold text-sm border-2 ${trustLevel === 'HIGH' ? 'bg-cyan-900/30 border-cyan-500 text-cyan-300' :
                                            trustLevel === 'MEDIUM' ? 'bg-yellow-900/30 border-yellow-500 text-yellow-300' :
                                                'bg-red-900/30 border-red-500 text-red-300'
                                        }`}>
                                        {trustLevel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security Actions */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">🔐 Security Actions</h2>
                        <div className="space-y-3">
                            <RestrictedButton requiredTrust="HIGH" currentTrust={trustLevel} onClick={handleChangePassword} className="w-full" tooltip="High trust required">
                                Change Password
                            </RestrictedButton>
                            <RestrictedButton requiredTrust="HIGH" currentTrust={trustLevel} onClick={handleUpdateProfile} className="w-full" tooltip="High trust required">
                                Update Profile
                            </RestrictedButton>
                            <RestrictedButton requiredTrust="HIGH" currentTrust={trustLevel} onClick={handleDeleteAccount} className="w-full" tooltip="High trust required">
                                Delete Account
                            </RestrictedButton>
                        </div>
                    </div>

                    {/* Financial Actions */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">💰 Financial Actions</h2>
                        <div className="space-y-3">
                            <RestrictedButton requiredTrust="HIGH" currentTrust={trustLevel} onClick={handleMakePayment} className="w-full" tooltip="High trust required">
                                Make Payment
                            </RestrictedButton>
                            <RestrictedButton requiredTrust="HIGH" currentTrust={trustLevel} onClick={() => alert('Transfer')} className="w-full" tooltip="High trust required">
                                Transfer Funds
                            </RestrictedButton>
                        </div>
                    </div>

                    {/* View-Only Data */}
                    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-4">📊 View-Only Data</h2>
                        <p className="text-slate-300 mb-4 text-sm">✅ Available to all trust levels</p>
                        <div className="space-y-3">
                            <button className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 border-2 border-cyan-500/30 rounded-xl font-semibold transition-colors">View Reports</button>
                            <button className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 border-2 border-cyan-500/30 rounded-xl font-semibold transition-colors">View History</button>
                            <button className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-cyan-400 border-2 border-cyan-500/30 rounded-xl font-semibold transition-colors">View Logs</button>
                        </div>
                    </div>
                </div>

                {/* Access Level Info */}
                <div className="mt-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/20 p-6">
                    <h2 className="text-xl font-bold text-cyan-400 mb-3">📋 Access Level Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                            <h3 className="font-bold text-cyan-300 mb-2">✅ HIGH TRUST – Full Access</h3>
                            <ul className="text-slate-300 space-y-1">
                                <li>• All features unlocked</li>
                                <li>• Security & financial actions</li>
                                <li>• 30-minute session</li>
                            </ul>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                            <h3 className="font-bold text-yellow-300 mb-2">⚠️ MEDIUM TRUST – Limited</h3>
                            <ul className="text-slate-300 space-y-1">
                                <li>• View-only access</li>
                                <li>• Security actions blocked</li>
                                <li>• 10-minute session</li>
                            </ul>
                        </div>
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                            <h3 className="font-bold text-red-300 mb-2">🔒 LOW TRUST – View Only</h3>
                            <ul className="text-slate-300 space-y-1">
                                <li>• Dashboard view only</li>
                                <li>• All actions blocked</li>
                                <li>• 3-minute session</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
