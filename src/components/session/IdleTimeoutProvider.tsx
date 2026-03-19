'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const IDLE_WARNING_MS = 30 * 60 * 1000; // 30 minutes
const IDLE_LOGOUT_MS = 35 * 60 * 1000;  // 35 minutes
const CHECK_INTERVAL_MS = 30 * 1000;    // check every 30 seconds
const THROTTLE_MS = 30 * 1000;          // throttle activity updates to 30 seconds

interface IdleTimeoutProviderProps {
  locale: string;
  loginPath: string;
  children: React.ReactNode;
}

export function IdleTimeoutProvider({
  locale,
  loginPath,
  children,
}: IdleTimeoutProviderProps) {
  const t = useTranslations('session');
  const lastActivityRef = useRef<number>(Date.now());
  const lastThrottleRef = useRef<number>(Date.now());
  const [showWarning, setShowWarning] = useState(false);

  const handleActivity = () => {
    const now = Date.now();
    if (now - lastThrottleRef.current >= THROTTLE_MS) {
      lastActivityRef.current = now;
      lastThrottleRef.current = now;
    }
  };

  const handleStayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    lastThrottleRef.current = Date.now();
    setShowWarning(false);
  };

  const handleLogout = async () => {
    await fetch(`/${locale}/auth/signout`, { method: 'POST' });
    window.location.href = `/${locale}${loginPath}`;
  };

  useEffect(() => {
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ] as const;

    events.forEach((event) =>
      document.addEventListener(event, handleActivity, { passive: true })
    );

    const interval = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;

      if (idleMs >= IDLE_LOGOUT_MS) {
        clearInterval(interval);
        handleLogout();
      } else if (idleMs >= IDLE_WARNING_MS) {
        setShowWarning(true);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      events.forEach((event) =>
        document.removeEventListener(event, handleActivity)
      );
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, loginPath]);

  return (
    <>
      {children}
      <Dialog open={showWarning} onOpenChange={(open) => !open && handleStayLoggedIn()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('expiringTitle')}</DialogTitle>
            <DialogDescription>{t('expiringMessage')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleLogout}>
              {t('logOut')}
            </Button>
            <Button onClick={handleStayLoggedIn}>{t('stayLoggedIn')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
