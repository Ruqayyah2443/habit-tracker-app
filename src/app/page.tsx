'use client';

import { useEffect } from 'react';
import SplashScreen from '@/components/shared/SplashScreen';

export default function HomePage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const session = localStorage.getItem('habit-tracker-session');
        if (session) {
          window.location.href = '/dashboard';
        } else {
          window.location.href = '/login';
        }
      } catch {
        window.location.href = '/login';
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return <SplashScreen />;
}