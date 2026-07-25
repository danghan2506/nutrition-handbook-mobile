import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('profile setup content', () => {
  it('defines the approved gender combo box and progress accessibility', () => {
    const root = process.cwd();
    const constants = readFileSync(join(root, 'constants', 'profile.ts'), 'utf8');
    const gender = readFileSync(
      join(root, 'components', 'profile', 'gender-select.tsx'),
      'utf8',
    );
    const progress = readFileSync(
      join(root, 'components', 'profile', 'profile-progress.tsx'),
      'utf8',
    );

    expect(constants).toContain("gender: null");
    expect(constants).toContain("genderPlaceholder: 'Chọn giới tính'");
    expect(constants).toContain("'Không muốn trả lời'");
    expect(gender).toContain('Modal');
    expect(gender).toContain('accessibilityRole="combobox"');
    expect(gender).toContain('accessibilityViewIsModal');
    expect(progress).toContain('Màn ${step + 1} trên ${PROFILE_STEP_COUNT}');
    expect(`${constants}\n${gender}\n${progress}`).not.toContain('nickname');
  });
  it('implements a whole-centimeter snapping adjustable ruler', () => {
    const source = readFileSync(
      join(process.cwd(), 'components', 'profile', 'height-ruler.tsx'),
      'utf8',
    );

    expect(source).toContain('snapToInterval={HEIGHT_TICK_SPACING}');
    expect(source).toContain('accessibilityRole="adjustable"');
    expect(source).toContain("name: 'increment'");
    expect(source).toContain("name: 'decrement'");
    expect(source).toContain('height % 5 === 0');
    expect(source).toContain('showsHorizontalScrollIndicator={false}');
    expect(source).not.toContain('Có thể điều chỉnh');
  });

  it('composes exactly three local-state steps without nickname or persistence', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'profile-setup.tsx'),
      'utf8',
    );

    expect(source).toContain('useState<ProfileDraft>(PROFILE_DEFAULTS)');
    expect(source).toContain('w-[92px]');
    expect(source).toContain('<GenderSelect');
    expect(source).toContain('<HeightRuler');
    expect(source).toContain("router.replace('/(tabs)')");
    expect(source).toContain('useReducedMotion');
    expect(source).not.toContain('nickname');
    expect(source).not.toContain('AsyncStorage');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('Có thể điều chỉnh');
  });
});
