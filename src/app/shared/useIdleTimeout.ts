import { useEffect, useCallback, useRef } from "react";

export function useIdleTimeout(onIdle: () => void, timeoutMinutes: number = 30) {
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdle();
    }, timeoutMs);
  }, [onIdle, timeoutMs]);

  useEffect(() => {
    // Initial start
    resetTimer();

    // Events to track user activity
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer]);
}
