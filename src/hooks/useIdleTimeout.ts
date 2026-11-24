import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_KEY = 'admin_last_activity';

export function useIdleTimeout() {
  const navigate = useNavigate();
  const [remainingMs, setRemainingMs] = useState<number>(() => {
    const stored = localStorage.getItem(ACTIVITY_KEY);
    if (!stored) {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
      return IDLE_TIMEOUT_MS;
    }
    const elapsed = Date.now() - parseInt(stored, 10);
    return Math.max(0, IDLE_TIMEOUT_MS - elapsed);
  });

  useEffect(() => {
    if (!localStorage.getItem(ACTIVITY_KEY)) {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }

    const interval = setInterval(async () => {
      const lastStr = localStorage.getItem(ACTIVITY_KEY);
      const lastTime = lastStr ? parseInt(lastStr, 10) : Date.now();
      const elapsed = Date.now() - lastTime;
      const left = Math.max(0, IDLE_TIMEOUT_MS - elapsed);
      setRemainingMs(left);

      if (left <= 0) {
        clearInterval(interval);
        localStorage.removeItem(ACTIVITY_KEY);
        try {
          await signOut(auth);
        } catch (err) {
          console.error('Auto sign-out failed:', err);
        }
        navigate('/admin/login', { replace: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpiringSoon = remainingMs < 5 * 60 * 1000;

  return { minutes, seconds, isExpiringSoon };
}
