import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';

import { getInitialRoute } from '@/lib/onboarding-storage';

type InitialDestination = Awaited<ReturnType<typeof getInitialRoute>>;

export default function Index() {
  const [destination, setDestination] = useState<InitialDestination | null>(null);

  useEffect(() => {
    let isMounted = true;

    getInitialRoute()
      .catch((error: unknown) => {
        console.warn('Không thể đọc trạng thái onboarding.', error);
        return '/onboarding' as const;
      })
      .then((route) => {
        if (isMounted) {
          setDestination(route);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (destination) {
      void SplashScreen.hideAsync();
    }
  }, [destination]);

  if (!destination) {
    return null;
  }

  return <Redirect href={destination} />;
}
