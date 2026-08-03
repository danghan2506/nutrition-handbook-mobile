import { useEffect } from 'react';

import { usePersonalStore } from '@/store/use-personal-store';

export function usePersonalSessionBoundary(
  sessionUserId: string | null,
  isLoading: boolean,
) {
  const storeUserId = usePersonalStore((state) => state.sessionUserId);
  const syncSessionUser = usePersonalStore((state) => state.syncSessionUser);

  useEffect(() => {
    if (!isLoading) {
      syncSessionUser(sessionUserId);
    }
  }, [isLoading, sessionUserId, syncSessionUser]);

  return (
    !isLoading && sessionUserId !== null && storeUserId === sessionUserId
  );
}
