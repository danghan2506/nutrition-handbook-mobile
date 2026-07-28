import { Redirect, type Href } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { getInitialRoute } from '@/lib/onboarding-storage';

type InitialDestination = Awaited<ReturnType<typeof getInitialRoute>>;

export default function Index() {
  const [destination, setDestination] = useState<InitialDestination | null>(null);

  useEffect(() => {
    let isMounted = true;

    const resolveDestination = async () => {
      try {
        const sessionResponse = await supabase?.auth.getSession();
        const session = sessionResponse?.data.session ?? null;
        return await getInitialRoute(Boolean(session));
      } catch (error: unknown) {
        console.warn('Không thể đọc trạng thái onboarding.', error);
        return '/onboarding' as const;
      }
    };

    void resolveDestination().then((route) => {
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

  return <Redirect href={destination as Href} />;
}
