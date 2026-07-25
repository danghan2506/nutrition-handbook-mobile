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
});
