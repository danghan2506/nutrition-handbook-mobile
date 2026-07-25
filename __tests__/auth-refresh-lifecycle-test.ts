import { syncAuthRefresh } from '../lib/auth-refresh-lifecycle';

describe('Supabase auth refresh lifecycle', () => {
  it('refreshes only while the app is active', () => {
    const controller = {
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    };

    syncAuthRefresh(controller, 'active');
    expect(controller.startAutoRefresh).toHaveBeenCalledTimes(1);
    expect(controller.stopAutoRefresh).not.toHaveBeenCalled();

    syncAuthRefresh(controller, 'background');
    expect(controller.stopAutoRefresh).toHaveBeenCalledTimes(1);
  });
});
