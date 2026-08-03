import { existsSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';

const mockUseAuthSession = jest.fn();

jest.mock('@/hooks/use-auth-session', () => ({
  useAuthSession: () => mockUseAuthSession(),
}));

jest.mock('expo-router', () => {
  const ReactModule = require('react') as typeof React;
  const Stack = () => ReactModule.createElement('protected-stack');

  return {
    Redirect: ({ href }: { href: string }) =>
      ReactModule.createElement('redirect', { href }),
    Stack,
  };
});

import ProtectedLayout from '@/app/(protected)/_layout';

const TestRenderer = require('react-test-renderer') as {
  act(callback: () => void | Promise<void>): Promise<void>;
  create(element: React.ReactElement): { toJSON(): unknown };
};

describe('protected personal route layout', () => {
  it('redirects unauthenticated deep links to login', async () => {
    mockUseAuthSession.mockReturnValue({ isLoading: false, session: null });
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<ProtectedLayout />);
    });

    expect(renderer!.toJSON()).toMatchObject({
      type: 'redirect',
      props: { href: '/(auth)/login' },
    });
  });

  it('renders the protected stack only for an authenticated session', async () => {
    mockUseAuthSession.mockReturnValue({
      isLoading: false,
      session: { user: { id: 'user-1' } },
    });
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<ProtectedLayout />);
    });

    expect(renderer!.toJSON()).toMatchObject({ type: 'protected-stack' });
  });

  it('keeps every sensitive public URL inside the protected route group', () => {
    for (const route of ['profile-edit', 'meal-reminders', 'settings']) {
      expect(
        existsSync(join(process.cwd(), 'app', '(protected)', `${route}.tsx`)),
      ).toBe(true);
      expect(existsSync(join(process.cwd(), 'app', `${route}.tsx`))).toBe(false);
    }
  });});
