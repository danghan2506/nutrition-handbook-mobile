import React from 'react';
import { Alert } from 'react-native';

import ProfileScreen, { calculateBMI } from '@/app/(tabs)/profile';
import MealRemindersScreen from '@/app/(protected)/meal-reminders';
import ProfileEditScreen from '@/app/(protected)/profile-edit';
import SettingsScreen from '@/app/(protected)/settings';
import { usePersonalStore } from '@/store/use-personal-store';

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockSignOutCurrentUser = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

jest.mock('@/lib/auth', () => ({
  signOutCurrentUser: () => mockSignOutCurrentUser(),
}));

jest.mock('lucide-react-native', () => {
  const ReactModule = require('react') as typeof React;
  const Icon = () => ReactModule.createElement('icon');
  return {
    Activity: Icon,
    Bell: Icon,
    ChevronRight: Icon,
    Copy: Icon,
    Dumbbell: Icon,
    Leaf: Icon,
    LogOut: Icon,
    Ruler: Icon,
    Scale: Icon,
    Settings: Icon,
    Sparkles: Icon,
    Trash2: Icon,
    TrendingDown: Icon,
    TrendingUp: Icon,
    UserPen: Icon,
  };
});

jest.mock('@expo/vector-icons', () => {
  const ReactModule = require('react') as typeof React;
  return { Ionicons: () => ReactModule.createElement('icon') };
});

type AlertButton = {
  text?: string;
  style?: string;
  onPress?: () => void | Promise<void>;
};

type TestNodeProps = {
  accessibilityLabel?: string;
  onChangeText?: (value: string) => void;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
};

const TestRenderer = require('react-test-renderer') as {
  act(callback: () => void | Promise<void>): Promise<void>;
  create(element: React.ReactElement): {
    root: {
      findAll(predicate: (node: { props: TestNodeProps }) => boolean): Array<{
        props: TestNodeProps;
      }>;
    };
    toJSON(): unknown;
    unmount(): void;
  };
};

function renderedText(node: unknown): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(renderedText).join('');
  if (!node || typeof node !== 'object') return '';
  if ('children' in node) {
    return renderedText((node as { children?: unknown }).children);
  }
  return '';
}

function byAccessibilityLabel(
  renderer: ReturnType<typeof TestRenderer.create>,
  label: string,
) {
  const matches = renderer.root.findAll(
    ({ props }) => props.accessibilityLabel === label,
  );
  const actionable = matches.filter(
    ({ props }) => props.onChangeText || props.onPress || props.onValueChange,
  );
  expect(actionable.length).toBeGreaterThan(0);
  return actionable[actionable.length - 1];
}

describe('personal screens', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
    mockSignOutCurrentUser.mockReset();
    usePersonalStore.getState().reset();
  });

  it('calculates BMI correctly and categorizes gently', () => {
    expect(calculateBMI()).toBeNull();
    expect(calculateBMI(65, 0)).toBeNull();
    expect(calculateBMI(0, 170)).toBeNull();
    expect(calculateBMI(50, 170)).toEqual({ bmi: '17.3', label: 'Gầy nhẹ' });
    expect(calculateBMI(65, 170)).toEqual({ bmi: '22.5', label: 'Cân đối' });
    expect(calculateBMI(80, 170)).toEqual({ bmi: '27.7', label: 'Đầy đặn' });
  });

  it('saves decimal profile input and immediately updates the profile tab', async () => {
    let editRenderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      editRenderer = TestRenderer.create(<ProfileEditScreen />);
    });

    await TestRenderer.act(async () => {
      byAccessibilityLabel(editRenderer!, 'Tên').props.onChangeText?.(
        'Trần Minh Anh',
      );
      byAccessibilityLabel(editRenderer!, 'Cân nặng (kg)').props.onChangeText?.(
        '67,8',
      );
    });
    await TestRenderer.act(async () => {
      byAccessibilityLabel(editRenderer!, 'Lưu thay đổi').props.onPress?.();
    });

    expect(usePersonalStore.getState().profile).toMatchObject({
      displayName: 'Trần Minh Anh',
      currentWeightKg: 67.8,
    });
    expect(mockBack).toHaveBeenCalledTimes(1);

    let profileRenderer: ReturnType<typeof TestRenderer.create>;
    await TestRenderer.act(async () => {
      profileRenderer = TestRenderer.create(<ProfileScreen />);
    });
    const profileText = renderedText(profileRenderer!.toJSON());
    expect(profileText).toContain('Trần Minh Anh');
    expect(profileText).toContain('67.8 kg');
    await TestRenderer.act(async () => {
      editRenderer!.unmount();
      profileRenderer!.unmount();
    });
  });

  it('renders ProfileScreen safely when profile fields are empty or incomplete', async () => {
    usePersonalStore.setState({
      profile: {
        displayName: '',
        dateOfBirth: '',
        biologicalSex: 'MALE',
        heightCm: 170,
        currentWeightKg: 65,
        activityLevel: 'active',
        goalType: 'HEALTHY_EATING',
      },
    });

    let profileRenderer: ReturnType<typeof TestRenderer.create>;
    await TestRenderer.act(async () => {
      profileRenderer = TestRenderer.create(<ProfileScreen />);
    });
    expect(profileRenderer!).toBeDefined();
    await TestRenderer.act(async () => {
      profileRenderer!.unmount();
    });
  });

  it('shows accessible validation errors and blocks invalid saves', async () => {
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<ProfileEditScreen />);
    });
    await TestRenderer.act(async () => {
      byAccessibilityLabel(renderer!, 'Tên').props.onChangeText?.('   ');
      byAccessibilityLabel(renderer!, 'Chiều cao (cm)').props.onChangeText?.('0');
    });
    await TestRenderer.act(async () => {
      byAccessibilityLabel(renderer!, 'Lưu thay đổi').props.onPress?.();
    });

    const tree = renderedText(renderer!.toJSON());
    expect(tree).toContain('Vui lòng nhập tên của bạn.');
    expect(tree).toContain('Chiều cao phải lớn hơn 0 cm.');
    expect(mockBack).not.toHaveBeenCalled();
    expect(usePersonalStore.getState().profile.displayName).toBe('Nguyễn Văn An');
    await TestRenderer.act(async () => renderer!.unmount());
  });

  it('keeps reminder switches synchronized with the profile summary', async () => {
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<MealRemindersScreen />);
    });
    await TestRenderer.act(async () => {
      byAccessibilityLabel(renderer!, 'Nhắc Bữa phụ').props.onValueChange?.(true);
    });

    expect(usePersonalStore.getState().enabledReminderCount()).toBe(4);
    expect(renderedText(renderer!.toJSON())).toContain('15:30 · Đang bật');
    await TestRenderer.act(async () => renderer!.unmount());
  });

  it('asks for confirmation before signing out with Supabase', async () => {
    mockSignOutCurrentUser.mockResolvedValue({ ok: true });
    let buttons: AlertButton[] | undefined;
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, nextButtons) => {
        buttons = nextButtons as AlertButton[] | undefined;
      });
    let renderer: ReturnType<typeof TestRenderer.create>;

    await TestRenderer.act(async () => {
      renderer = TestRenderer.create(<SettingsScreen />);
    });
    await TestRenderer.act(async () => {
      byAccessibilityLabel(renderer!, 'Đăng xuất').props.onPress?.();
    });

    expect(alertSpy).toHaveBeenCalledWith(
      'Đăng xuất',
      'Bạn có muốn đăng xuất khỏi tài khoản hiện tại không?',
      expect.any(Array),
    );
    expect(mockSignOutCurrentUser).not.toHaveBeenCalled();

    await TestRenderer.act(async () => {
      buttons?.find((button) => button.text === 'Hủy')?.onPress?.();
    });
    expect(mockSignOutCurrentUser).not.toHaveBeenCalled();

    await TestRenderer.act(async () => {
      await buttons?.find((button) => button.text === 'Đăng xuất')?.onPress?.();
    });
    expect(mockSignOutCurrentUser).toHaveBeenCalledTimes(1);

    alertSpy.mockRestore();
    await TestRenderer.act(async () => renderer!.unmount());
  });
});
