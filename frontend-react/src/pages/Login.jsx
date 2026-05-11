import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Message } from '../components/Message';
import { TOTPVerification } from '../components/TOTPVerification';
import { SimilarityScore } from '../components/SimilarityScore';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useBiometrics } from '../hooks/useBiometrics';
import { useFingerprint } from '../hooks/useFingerprint';
import { authAPI } from '../services/api';
import { saveSession } from '../utils/session';

export default function Login() {
    const navigate = useNavigate();
    const [step, setStep] = useState('password'); // 'password' | 'totp' | 'success'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [similarityScores, setSimilarityScores] = useState(null);
    const [currentUsername, setCurrentUsername] = useState('');

    const { typingProfile, mouseProfile, typingCount, mouseCount, inputHandlers, reset } = useBiometrics();
    const { fingerprint } = useFingerprint();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!password) {
            setMessage({ text: 'Please enter your password', type: 'error' });
            return;
        }

        if (typingCount < 5) {
            setMessage({ text: 'Please type more to capture your typing pattern', type: 'error' });
            return;
        }

        if (mouseCount < 10) {
            setMessage({ text: 'Please move your mouse more to capture your movement pattern', type: 'error' });
            return;
        }

        if (!fingerprint) {
            setMessage({ text: 'Device fingerprint not ready. Please wait...', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const data = await authAPI.loginStep1({
                username,
                password,
                fingerprint,
                typingProfile,
                mouseProfile,
            });

            if (data.success && data.requiresTOTP) {
                setCurrentUsername(username);
                setStep('totp');
                setTotp('');
                setMessage({ text: '', type: '' });
            } else {
                reset();
                setMessage({ text: '❌ ' + data.message, type: 'error' });
                setIsSubmitting(false);
            }
        } catch {
            reset();
            setMessage({ text: '❌ Server error. Make sure backend is running on port 5000', type: 'error' });
            setIsSubmitting(false);
        }
    };

    const handleVerifyTOTP = async () => {
        if (!totp || totp.length !== 6) {
            setMessage({ text: 'Please enter a valid 6-digit code', type: 'error' });
            return;
        }

        setIsVerifying(true);

        try {
            const data = await authAPI.verifyTOTP({
                username: currentUsername,
                otp: totp,
                fingerprint,
                typingProfile,
                mouseProfile,
            });

            if (data.similarity) setSimilarityScores(data.similarity);

            if (data.success) {
                saveSession({
                    token: data.token,
                    user: data.user,
                    trustLevel: data.trustLevel || 'MEDIUM',
                    sessionTimeout: data.sessionTimeout || 600,
                });

                setMessage({ text: `✅ ${data.message}`, type: 'success' });
                setStep('success');
                setTimeout(() => navigate('/dashboard'), 1500);
            } else {
                reset();
                setMessage({
                    text: `❌ ${data.message}${data.attemptsRemaining !== undefined ? ` (${data.attemptsRemaining} attempts remaining)` : ''}`,
                    type: 'error'
                });
            }
            setIsVerifying(false);
        } catch {
            reset();
            setMessage({ text: '❌ Verification failed. Please try again.', type: 'error' });
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-5 relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full max-w-[550px] relative" style={{ zIndex: 10 }}>
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/20 p-10 animate-slide-in transform transition-all">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-cyan-pulse">
                            <span className="text-4xl">🔐</span>
                        </div>
                    </div>
                    <h1 className="text-center text-cyan-400 text-4xl font-bold mb-2">BehaviorAuth</h1>
                    <p className="text-center text-slate-300 text-base mb-8">
                        Secure Login with Behavioral Biometrics
                    </p>

                    {step === 'password' && (
                        <form onSubmit={handleLogin}>
                            <Input
                                label="Username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Enter your username"
                                autoComplete="off"
                                {...inputHandlers}
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                {...inputHandlers}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="
                                    w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                                    border-none rounded-xl text-lg font-semibold cursor-pointer
                                    transition-all duration-200 mt-2 relative overflow-hidden
                                    hover:shadow-lg hover:-translate-y-0.5 hover:from-cyan-600 hover:to-blue-700
                                    active:translate-y-0
                                    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                                "
                            >
                                {isSubmitting && (
                                    <span className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spinner" />
                                    </span>
                                )}
                                <span className={isSubmitting ? 'opacity-0' : ''}>
                                    {isSubmitting ? 'Validating...' : '🔓 Login'}
                                </span>
                            </button>
                        </form>
                    )}

                    {step === 'totp' && (
                        <TOTPVerification
                            otp={totp}
                            setOtp={setTotp}
                            onVerify={handleVerifyTOTP}
                            isVerifying={isVerifying}
                        />
                    )}

                    {similarityScores && <SimilarityScore similarity={similarityScores} />}

                    <Message text={message.text} type={message.type} />

                    {step === 'password' && (
                        <div className="text-center mt-6 pt-5 border-t border-slate-700">
                            <p className="text-slate-400 mb-2">Don't have an account?</p>
                            <Link
                                to="/register"
                                className="text-cyan-400 no-underline font-medium transition-colors hover:text-cyan-300 hover:underline"
                            >
                                Register here
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
