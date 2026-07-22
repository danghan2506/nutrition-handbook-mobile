import type { AppStateStatus } from 'react-native';

type AuthRefreshController = {
  startAutoRefresh: () => void;
  stopAutoRefresh: () => void;
};

export function syncAuthRefresh(
  controller: AuthRefreshController,
  state: AppStateStatus,
) {
  if (state === 'active') {
    controller.startAutoRefresh();
    return;
  }

  controller.stopAutoRefresh();
}
