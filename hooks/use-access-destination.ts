import { useEffect, useState } from 'react';

import { useAuthSession } from '@/hooks/use-auth-session';
import type { AccessDestination } from '@/lib/access-routing';
import { getInitialRoute } from '@/lib/onboarding-storage';

export function useAccessDestination() {
  const { isLoading: isAuthLoading, session } = useAuthSession();
  const [destination, setDestination] = useState<AccessDestination | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let isMounted = true;

    void getInitialRoute(Boolean(session))
      .then((route) => {
        if (isMounted) {
          setDestination(route);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDestination('/onboarding');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, session]);

  return {
    destination,
    isLoading: isAuthLoading || destination === null,
  };
}
