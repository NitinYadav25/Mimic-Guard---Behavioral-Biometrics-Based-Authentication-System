import { useState, useEffect } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export function useFingerprint() {
    const [fingerprint, setFingerprint] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const initFingerprint = async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();

                if (mounted) {
                    setFingerprint(result.visitorId);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Fingerprint error:', err);
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            }
        };

        initFingerprint();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        fingerprint,
        loading,
        error,
        displayId: fingerprint ? fingerprint.substring(0, 12) + '...' : 'Loading...'
    };
}
