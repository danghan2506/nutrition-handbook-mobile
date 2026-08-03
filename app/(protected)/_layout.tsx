import { Redirect, Stack, type Href } from 'expo-router';
import React from 'react';

import { useAuthSession } from '@/hooks/use-auth-session';
import { usePersonalSessionBoundary } from '@/hooks/use-personal-session-boundary';

export default function ProtectedLayout() {
  const { isLoading, session } = useAuthSession();
  const isPersonalStateReady = usePersonalSessionBoundary(
    session?.user.id ?? null,
    isLoading,
  );

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  if (!isPersonalStateReady) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}