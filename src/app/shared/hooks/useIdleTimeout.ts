import { useEffect, useCallback, useRef } from "react";

/**
 * ⏳ [HOOK] useIdleTimeout
 * ตรวจจับการไม่มีการใช้งานของผู้ใช้ (Idle timeout) ตามเวลาที่กำหนด แล้วเรียก onIdle callback
 */
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
    // เริ่มนับเวลาเมื่อเปิดหน้าเว็บ
    resetTimer();

    // เหตุการณ์ที่ใช้ตรวจจับการใช้งานของผู้ใช้
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

