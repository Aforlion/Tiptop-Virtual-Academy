'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Timeout duration: 15 minutes
const TIMEOUT_DURATION = 15 * 60 * 1000; 

export default function SessionTimeout() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to determine if we are on a protected dashboard route
  const isProtectedRoute = 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/parent') ||
    pathname.startsWith('/student') ||
    pathname.startsWith('/teacher');

  const logoutUser = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear session storage just in case
      if (typeof window !== 'undefined') {
        window.sessionStorage.clear();
      }

      // Redirect to login page with a reason parameter
      router.push('/login?reason=expired');
      router.refresh();
    } catch (err) {
      console.error('Failed to log out after inactivity:', err);
    }
  };

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (isProtectedRoute) {
      timeoutRef.current = setTimeout(logoutUser, TIMEOUT_DURATION);
    }
  };

  useEffect(() => {
    // If not on a protected route, do not track inactivity
    if (!isProtectedRoute) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    // Initialize timer
    resetTimer();

    // Define user interaction events to listen to
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup listeners and timer on unmount or route change
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname, isProtectedRoute]);

  return null;
}
