import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { getInitialRoute } from '@/lib/onboarding-storage';
import { supabase } from '@/lib/supabase';

type InitialDestination = Awaited<ReturnType<typeof getInitialRoute>>;

async function resolveInitialRoute(): Promise<InitialDestination> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return getInitialRoute(Boolean(session));
  } catch {
    return getInitialRoute(false);
  }
}

export default function Index() {
  const [destination, setDestination] = useState<InitialDestination | null>(null);

  useEffect(() => {
    let isMounted = true;

    resolveInitialRoute()
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

  if (!destination) {
    return null;
  }

  return <Redirect href={destination} />;
}