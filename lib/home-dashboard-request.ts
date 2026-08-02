import type { DashboardData } from '@/types/dashboard';

export type HomeDashboardState =
  | { status: 'loading'; date: string }
  | { status: 'ready'; date: string; data: DashboardData }
  | { status: 'empty'; date: string }
  | { status: 'error'; date: string };

type LoadDashboard = () => Promise<DashboardData | null>;

export function createHomeDashboardRequestController(
  onStateChange: (state: HomeDashboardState) => void,
) {
  let latestRequestId = 0;

  function invalidate() {
    latestRequestId += 1;
  }

  function request(date: string, loadDashboard: LoadDashboard) {
    const requestId = latestRequestId + 1;
    latestRequestId = requestId;
    onStateChange({ status: 'loading', date });

    void loadDashboard()
      .then((data) => {
        if (requestId !== latestRequestId) return;

        onStateChange(
          data ? { status: 'ready', date, data } : { status: 'empty', date },
        );
      })
      .catch(() => {
        if (requestId === latestRequestId) {
          onStateChange({ status: 'error', date });
        }
      });

    return () => {
      if (requestId === latestRequestId) {
        invalidate();
      }
    };
  }

  return { invalidate, request };
}
