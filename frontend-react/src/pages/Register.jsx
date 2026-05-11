import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { Message } from '../components/Message';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { useBiometrics } from '../hooks/useBiometrics';
import { useFingerprint } from '../hooks/useFingerprint';
import { authAPI } from '../services/api';

const validatePassword = (pwd) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters long';
    if (!/\d/.test(pwd)) return 'Password must contain at least one number';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return 'Password must contain at least one special character';
    return null;
};

export default function Register() {
    const navigate = useNavigate();

    // Step: 'form' | 'totp-setup' | 'totp-confirm'
    const [step, setStep] = useState('form');

    // Form fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // TOTP setup state
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [totpSecret, setTotpSecret] = useState('');
    const [totpToken, setTotpToken] = useState('');

    const [message, setMessage] = useState({ text: '', type: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const { typingProfile, mouseProfile, typingCount, mouseCount, inputHandlers } = useBiometrics();
    const { fingerprint } = useFingerprint();

    // Step 1: Register account
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (password !== confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }
        const pwdError = validatePassword(password);
        if (pwdError) { setMessage({ text: pwdError, type: 'error' }); return; }
        if (typingCount < 5) { setMessage({ text: 'Please type more to capture your typing pattern', type: 'error' }); return; }
        if (mouseCount < 10) { setMessage({ text: 'Please move your mouse more to capture movement pattern', type: 'error' }); return; }
        if (!fingerprint) { setMessage({ text: 'Device fingerprint not ready. Please wait...', type: 'error' }); return; }

        setIsSubmitting(true);
        try {
            const data = await authAPI.register({ username, email, password, fingerprint, typingProfile, mouseProfile });

            if (data.success) {
                // Step 2: generate TOTP secret
                const totpData = await authAPI.totpSetup(username);
                if (totpData.success) {
                    setQrCodeUrl(totpData.qrCodeUrl);
                    setTotpSecret(totpData.secret);
                    setStep('totp-setup');
                    setMessage({ text: '', type: '' });
                } else {
                    setMessage({ text: '❌ Account created but TOTP setup failed: ' + totpData.message, type: 'error' });
                }
            } else {
                setMessage({ text: '❌ ' + data.message, type: 'error' });
            }
        } catch {
            setMessage({ text: '❌ Server error. Make sure backend is running on port 5000', type: 'error' });
        }
        setIsSubmitting(false);
    };

    // Step 3: Confirm first TOTP token to enable 2FA
    const handleConfirmTOTP = async () => {
        if (!totpToken || totpToken.length !== 6) {
            setMessage({ text: 'Please enter the 6-digit code from your authenticator app', type: 'error' });
            return;
        }

        setIsConfirming(true);
        try {
            const data = await authAPI.totpVerifySetup(username, totpToken);

            if (data.success) {
                setMessage({ text: '✅ Two-factor authentication enabled! Redirecting to login...', type: 'success' });
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setMessage({ text: '❌ ' + data.message, type: 'error' });
            }
        } catch {
            setMessage({ text: '❌ Server error during TOTP confirmation', type: 'error' });
        }
        setIsConfirming(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-5 relative overflow-hidden">
            <AnimatedBackground />
            <div className="w-full max-w-[550px] relative" style={{ zIndex: 10 }}>
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/20 p-10 animate-slide-in transform transition-all">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-cyan-pulse">
                            <span className="text-4xl">{step === 'form' ? '🔐' : '📱'}</span>
                        </div>
                    </div>
                    <h1 className="text-center text-cyan-400 text-4xl font-bold mb-2">BehaviorAuth</h1>
                    <p className="text-center text-slate-300 text-base mb-8">
                        {step === 'form' ? 'Create Your Secure Account' : 'Set Up Two-Factor Authentication'}
                    </p>

                    {/* ── Step 1: Registration Form ── */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit}>
                            <Input label="Username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter your username" autoComplete="off" {...inputHandlers} />
                            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Enter your email" autoComplete="off" {...inputHandlers} />
                            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" autoComplete="new-password" {...inputHandlers} />
                            <small className="block -mt-4 mb-4 text-gray-500 text-xs italic">
                                Min 8 characters, 1 number, 1 special character
                            </small>
                            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm your password" autoComplete="new-password" {...inputHandlers} />

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
                                {isSubmitting && <span className="absolute inset-0 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spinner" /></span>}
                                <span className={isSubmitting ? 'opacity-0' : ''}>{isSubmitting ? 'Creating Account...' : '✨ Create Account'}</span>
                            </button>
                        </form>
                    )}

                    {/* ── Step 2: Scan QR Code ── */}
                    {step === 'totp-setup' && (
                        <div className="text-center">
                            <p className="text-slate-300 text-sm mb-4">
                                Scan this QR code with <span className="text-cyan-400 font-semibold">Google Authenticator</span> (or any TOTP app):
                            </p>
                            <div className="flex justify-center mb-4">
                                <img src={qrCodeUrl} alt="TOTP QR Code" className="w-48 h-48 rounded-xl border-2 border-cyan-500/30 bg-white p-2" />
                            </div>
                            <details className="mb-6 text-left">
                                <summary className="text-slate-400 text-xs cursor-pointer hover:text-cyan-400 transition-colors">
                                    Can't scan? Enter key manually
                                </summary>
                                <p className="mt-2 px-3 py-2 bg-slate-800 rounded-lg font-mono text-cyan-300 text-xs break-all select-all">
                                    {totpSecret}
                                </p>
                            </details>
                            <button
                                onClick={() => setStep('totp-confirm')}
                                className="
                                    w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                                    border-none rounded-xl text-lg font-semibold cursor-pointer
                                    transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
                                    hover:from-cyan-600 hover:to-blue-700 active:translate-y-0
                                "
                            >
                                ✅ I've Scanned the QR Code
                            </button>
                        </div>
                    )}

                    {/* ── Step 3: Confirm First Token ── */}
                    {step === 'totp-confirm' && (
                        <div className="text-center">
                            <p className="text-slate-300 text-sm mb-6">
                                Enter the <span className="text-cyan-400 font-semibold">6-digit code</span> from your authenticator app to confirm setup:
                            </p>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                value={totpToken}
                                onChange={(e) => setTotpToken(e.target.value.replace(/[^0-9]/g, ''))}
                                onKeyPress={(e) => e.key === 'Enter' && handleConfirmTOTP()}
                                placeholder="000000"
                                autoComplete="one-time-code"
                                autoFocus
                                className="
                                    w-full max-w-[250px] mx-auto block px-5 py-4 text-3xl text-center
                                    tracking-[12px] font-mono font-bold border-2 mb-6
                                    rounded-xl bg-slate-900/70 text-cyan-400 border-cyan-500
                                    transition-all duration-300 focus:outline-none focus:border-cyan-400
                                "
                            />
                            <button
                                onClick={handleConfirmTOTP}
                                disabled={totpToken.length !== 6 || isConfirming}
                                className="
                                    w-full px-4 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                                    border-none rounded-xl text-lg font-semibold cursor-pointer
                                    transition-all duration-200 relative overflow-hidden flex items-center justify-center gap-2
                                    hover:shadow-lg hover:-translate-y-0.5 hover:from-cyan-600 hover:to-blue-700
                                    active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                                "
                            >
                                {isConfirming
                                    ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spinner" /><span>Confirming...</span></>
                                    : '🔒 Confirm & Enable 2FA'
                                }
                            </button>
                        </div>
                    )}

                    <Message text={message.text} type={message.type} />

                    {step === 'form' && (
                        <div className="text-center mt-6 pt-5 border-t border-slate-700">
                            <p className="text-slate-400 mb-2">Already have an account?</p>
                            <Link to="/login" className="text-cyan-400 no-underline font-medium transition-colors hover:text-cyan-300 hover:underline">
                                Login here
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
