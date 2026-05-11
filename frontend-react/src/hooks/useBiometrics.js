import { useState, useEffect, useRef, useCallback } from 'react';

export function useBiometrics() {
    const [typingProfile, setTypingProfile] = useState([]);
    const [mouseProfile, setMouseProfile] = useState([]);
    const [isInsideFormInput, setIsInsideFormInput] = useState(false);

    const keyPressMapRef = useRef({});
    const lastMousePositionRef = useRef({ x: 0, y: 0, timestamp: Date.now() });

    // Typing event handlers
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') {
                const key = e.key;
                const timestamp = Date.now();

                if (!keyPressMapRef.current[key]) {
                    keyPressMapRef.current[key] = { pressTime: timestamp };
                }
            }
        };

        const handleKeyUp = (e) => {
            if (e.target.tagName === 'INPUT') {
                const key = e.key;
                const timestamp = Date.now();

                if (keyPressMapRef.current[key]) {
                    const pressTime = keyPressMapRef.current[key].pressTime;
                    const holdDuration = timestamp - pressTime;

                    setTypingProfile(prev => {
                        const lastEvent = prev[prev.length - 1];
                        const interval = lastEvent ? (timestamp - lastEvent.timestamp) : 0;

                        return [
                            ...prev,
                            {
                                key,
                                pressTime,
                                releaseTime: timestamp,
                                holdDuration,
                                interval,
                                timestamp
                            }
                        ];
                    });

                    delete keyPressMapRef.current[key];
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Mouse event handler - only when inside form inputs
    useEffect(() => {
        const handleMouseMove = (e) => {
            // Only capture if inside form input
            if (!isInsideFormInput) return;

            const timestamp = Date.now();
            const x = e.clientX;
            const y = e.clientY;

            const lastPos = lastMousePositionRef.current;
            const deltaX = x - lastPos.x;
            const deltaY = y - lastPos.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const timeDiff = timestamp - lastPos.timestamp;
            const speed = timeDiff > 0 ? distance / timeDiff : 0;

            setMouseProfile(prev => [
                ...prev,
                {
                    x,
                    y,
                    timestamp,
                    distance,
                    speed
                }
            ]);

            lastMousePositionRef.current = { x, y, timestamp };
        };

        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isInsideFormInput]);

    const reset = useCallback(() => {
        setTypingProfile([]);
        setMouseProfile([]);
        keyPressMapRef.current = {};
        lastMousePositionRef.current = { x: 0, y: 0, timestamp: Date.now() };
    }, []);

    const inputHandlers = {
        onMouseEnter: () => setIsInsideFormInput(true),
        onMouseLeave: () => setIsInsideFormInput(false),
    };

    return {
        typingProfile,
        mouseProfile,
        typingCount: typingProfile.length,
        mouseCount: mouseProfile.length,
        reset,
        inputHandlers,
    };
}
