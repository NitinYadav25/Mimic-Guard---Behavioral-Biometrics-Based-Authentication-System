import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/session';
import { authAPI } from '../services/api';

/**
 * ProtectedRoute — wraps any route that requires a valid session.
 * 1. Checks localStorage for a non-expired session token.
 * 2. Validates the token server-side via GET /session/verify.
 * 3. Redirects to /login if invalid or expired.
 */
export function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'denied'

    useEffect(() => {
        const validate = async () => {
            // Step 1: local check
            const session = getSession();
            if (!session) {
                navigate('/login', { replace: true });
                return;
            }

            // Step 2: server-side verify
            try {
                const data = await authAPI.verifySession(session.token);
                if (data.valid) {
                    setStatus('ok');
                } else {
                    clearSession();
                    navigate('/login', { replace: true });
                }
            } catch {
                // If server is unreachable, fall back to local expiry check
                setStatus('ok');
            }
        };

        validate();
    }, [navigate]);

    if (status === 'checking') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-cyan-400 text-sm">Verifying session...</p>
                </div>
            </div>
        );
    }

    return children;
}
