import React from 'react';
import { Text } from 'react-native';

import { usePersonalSessionBoundary } from '@/hooks/use-personal-session-boundary';
import { usePersonalStore } from '@/store/use-personal-store';

const TestRenderer = require('react-test-renderer') as {
  act(callback: () => void | Promise<void>): Promise<void>;
  create(element: React.ReactElement): {
    toJSON(): unknown;
    unmount(): void;
  };
};

function UserScopedContent({ userId }: { userId: string }) {
  const isReady = usePersonalSessionBoundary(userId, false);
  const displayName = usePersonalStore((state) => state.profile.displayName);
  return <Text>{isReady ? displayName : 'Đang chuyển tài khoản'}</Text>;
}

describe('personal session boundary', () => {
  beforeEach(() => {
    usePersonalStore.getState().reset();
  });

  it('resets stale health state before rendering a different user', async () => {
    usePersonalStore.getState().syncSessionUser('user-a');
    usePersonalStore.getState().updateProfile({
      ...usePersonalStore.getState().profile,
      displayName: 'Dữ liệu riêng của A',
    });
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<UserScopedContent userId="user-b" />);
    });

    const output = JSON.stringify(renderer!.toJSON());
    expect(output).toContain('Nguyễn Văn An');
    expect(output).not.toContain('Dữ liệu riêng của A');
    expect(usePersonalStore.getState().sessionUserId).toBe('user-b');

    await TestRenderer.act(async () => renderer!.unmount());
  });
});
