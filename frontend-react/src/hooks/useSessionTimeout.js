import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, clearSession } from '../utils/session';

/**
 * useSessionTimeout — reads the absolute expiry timestamp from localStorage,
 * so the countdown SURVIVES page reloads (unlike a simple countdown from sessionTimeout).
 *
 * Checks every second. When expired: clears session and redirects to /login.
 */
export function useSessionTimeout() {
    const navigate = useNavigate();
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        const tick = () => {
            const session = getSession();

            if (!session) {
                clearInterval(intervalRef.current);
                clearSession();
                navigate('/login', { replace: true });
                return;
            }

            const remaining = Math.max(0, Math.floor((session.expiresAt - Date.now()) / 1000));
            setRemainingSeconds(remaining);

            if (remaining <= 0) {
                clearInterval(intervalRef.current);
                clearSession();
                navigate('/login', { replace: true });
            }
        };

        // Run immediately, then every second
        tick();
        intervalRef.current = setInterval(tick, 1000);

        return () => clearInterval(intervalRef.current);
    }, [navigate]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return {
        remainingTime: remainingSeconds,
        formattedTime: formatTime(remainingSeconds),
        isExpiring: remainingSeconds > 0 && remainingSeconds < 60,
    };
}
