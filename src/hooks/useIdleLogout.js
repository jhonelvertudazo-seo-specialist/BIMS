import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const IDLE_LIMIT_MS = 3 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

export function useIdleLogout() {
    const { session, signOut } = useAuth();
    const navigate = useNavigate();
    const timerRef = useRef(null);

    useEffect(() => {
        if (!session) return undefined;

        function handleIdle() {
            signOut().finally(() => {
                navigate('/login', { replace: true, state: { idleTimeout: true } });
            });
        }

        function resetTimer() {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(handleIdle, IDLE_LIMIT_MS);
        }

        ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer, { passive: true }));
        resetTimer();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);
}
