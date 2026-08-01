import { dashboardDataSource } from '@/data/dashboard-mock';
import {
  createHomeDashboardRequestController,
  type HomeDashboardState,
} from '@/lib/home-dashboard-request';

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

test('selecting another date keeps only the newest request result', async () => {
  const states: HomeDashboardState[] = [];
  const controller = createHomeDashboardRequestController((state) => states.push(state));
  const first = createDeferred<Awaited<ReturnType<typeof dashboardDataSource.getDashboard>>>();
  const second = createDeferred<Awaited<ReturnType<typeof dashboardDataSource.getDashboard>>>();

  controller.request('2026-07-30', () => first.promise);
  controller.request('2026-07-31', () => second.promise);
  second.resolve(null);
  await flushPromises();
  first.resolve(await dashboardDataSource.getDashboard('2026-07-30'));
  await flushPromises();

  expect(states).toEqual([
    { status: 'loading', date: '2026-07-30' },
    { status: 'loading', date: '2026-07-31' },
    { status: 'empty', date: '2026-07-31' },
  ]);
});

test('retrying a date starts a fresh request after an error', async () => {
  const states: HomeDashboardState[] = [];
  const controller = createHomeDashboardRequestController((state) => states.push(state));
  const initialRequest = createDeferred<Awaited<ReturnType<typeof dashboardDataSource.getDashboard>>>();
  const retryRequest = createDeferred<Awaited<ReturnType<typeof dashboardDataSource.getDashboard>>>();

  controller.request('2026-07-30', () => initialRequest.promise);
  initialRequest.reject(new Error('offline'));
  await flushPromises();
  controller.request('2026-07-30', () => retryRequest.promise);
  retryRequest.resolve(await dashboardDataSource.getDashboard('2026-07-30'));
  await flushPromises();

  expect(states.map((state) => state.status)).toEqual([
    'loading',
    'error',
    'loading',
    'ready',
  ]);
  expect(states.at(-1)).toMatchObject({
    status: 'ready',
    date: '2026-07-30',
    data: { businessDate: '2026-07-30' },
  });
});
