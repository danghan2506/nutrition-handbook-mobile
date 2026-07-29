import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('profile setup content', () => {
  it('implements accessible, focusable activity radio cards with selected details', () => {
    const sourcePath = join(
      process.cwd(),
      'components',
      'profile',
      'activity-level-select.tsx',
    );

    expect(existsSync(sourcePath)).toBe(true);
    if (!existsSync(sourcePath)) {
      return;
    }

    const source = readFileSync(sourcePath, 'utf8');
    const imageSource = readFileSync(
      join(process.cwd(), 'constants', 'images.ts'),
      'utf8',
    );

    expect(source).toContain('accessibilityRole="radio"');
    expect(source).toContain('checked: isSelected');
    expect(source).toContain('disabled,');
    expect(imageSource).toContain('airline_seat_recline_normal.svg');
    expect(imageSource).toContain('directions_walk.svg');
    expect(imageSource).toContain('sports_gymnastics.svg');
    expect(imageSource).toContain('directions_run.svg');
    expect(source).toContain('@/constants/images');
    expect(source).not.toContain('../../assets/icons');
    expect(source).toContain('isSelected ? (');
    expect(source).toContain('option.details.map');
    expect(source).toContain('export type ActivityLevelSelectHandle');
    expect(source).toMatch(/forwardRef<\s*ActivityLevelSelectHandle/);
    expect(source).toContain('useImperativeHandle');
    expect(source).toContain('findNodeHandle');
    expect(source).toContain('AccessibilityInfo.setAccessibilityFocus');
    expect(source).toContain('optionRefs.current[value]');
    expect(source).toContain('optionRefs.current.sedentary');
    expect(source).toContain('[value]');
    expect(source).toContain('expanded: isSelected');
    expect(source).toContain('accessibilityLabel={option.details.join');
    expect(source).toContain('text-[15px] font-extrabold text-ink-navy');
  });

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
    expect(source).toContain('const didInitializeRef = useRef(false)');
    expect(source).toContain('const initialValueRef = useRef(value)');
    expect(source).toContain('const lastEmittedValueRef = useRef(value)');
    expect(source).toMatch(
      /if\s*\(!viewportWidth\s*\|\|\s*didInitializeRef\.current\)/,
    );
    expect(source).toContain(
      'x: heightToOffset(initialValueRef.current)',
    );
    expect(source).toContain('}, [viewportWidth])');
    expect(source).not.toContain('[value, viewportWidth]');
    expect(source).toMatch(
      /if\s*\(nextValue === lastEmittedValueRef\.current\)\s*\{\s*return;/,
    );
    expect(source).toContain('lastEmittedValueRef.current = nextValue');
    expect(source).toContain('onChange(nextValue)');
    expect(source).not.toContain('Có thể điều chỉnh');
  });

  it('composes exactly four local-state steps without nickname or persistence', () => {
    const source = readFileSync(
      join(process.cwd(), 'app', 'profile-setup.tsx'),
      'utf8',
    );

    expect(source).toContain('useState<ProfileDraft>(PROFILE_DEFAULTS)');
    expect(source).toContain('w-[92px]');
    expect(source).toContain('validateWeight(draft.weightKg)');
    expect(source).toContain('accessibilityLabel={profileCopy.weightLabel}');
    expect(source).toContain('value={draft.weightKg}');
    expect(source).toContain('nextErrors.weight');
    expect(source).toMatch(/>\s*kg\s*<\/Text>/);
    expect(source).toContain('<GenderSelect');
    expect(source).toContain('<HeightRuler');
    expect(source).toContain("router.replace('/(tabs)')");
    expect(source).toContain('PROFILE_STEP_COUNT');
    expect(source).not.toContain('trên 3');
    expect(source).toContain('step === 3');
    expect(source).toContain('<ActivityLevelSelect');
    expect(source).toContain('value={draft.activityLevel}');
    expect(source).toContain("changeStep(3, 'forward')");
    expect(source).toContain('profileCopy.activityNote');
    expect(source).toContain('profileCopy.activityRequired');
    expect(source).toContain(
      'disabled={transitionPending || !draft.activityLevel}',
    );
    expect(source).toContain('useReducedMotion');
    expect(source).not.toContain('nickname');
    expect(source).not.toContain('AsyncStorage');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('Có thể điều chỉnh');
  });

  it('locks every wizard action for the visible entry duration', () => {
    const root = process.cwd();
    const profile = readFileSync(join(root, 'app', 'profile-setup.tsx'), 'utf8');
    const progress = readFileSync(
      join(root, 'components', 'profile', 'profile-progress.tsx'),
      'utf8',
    );
    const guardedActions = profile.match(/runGuardedAction\(\(\) =>/g) ?? [];

    expect(profile).toContain(
      'const [transitionPending, setTransitionPending] = useState(false)',
    );
    expect(profile).toContain(
      'createInteractionLock(setTransitionPending)',
    );
    expect(guardedActions).toHaveLength(5);
    expect(profile).toContain(
      'const transitionDuration = reduceMotion ? 160 : 220',
    );
    expect(profile).toContain('}, transitionDuration)');
    expect(profile).toContain('disabled={transitionPending}');
    expect(profile).toContain('accessibilityState={{ disabled }}');
    expect(profile).not.toContain('transitionPendingRef');
    expect(progress).toContain('disabled: boolean');
    expect(progress).toContain('disabled={disabled}');
    expect(progress).toContain('accessibilityState={{ disabled }}');
  });

  it('announces validation and moves screen-reader focus to the ruler', () => {
    const root = process.cwd();
    const profile = readFileSync(join(root, 'app', 'profile-setup.tsx'), 'utf8');
    const gender = readFileSync(
      join(root, 'components', 'profile', 'gender-select.tsx'),
      'utf8',
    );
    const ruler = readFileSync(
      join(root, 'components', 'profile', 'height-ruler.tsx'),
      'utf8',
    );

    expect(gender).toContain('accessibilityValue={{');
    expect(gender).toContain(
      'text: selected?.label ?? profileCopy.genderPlaceholder',
    );
    expect(profile).toContain(
      'AccessibilityInfo.announceForAccessibility(message)',
    );
    expect(profile).toContain('announceValidationErrors(result.error)');
    expect(profile).toContain('nextErrors.weight,');
    expect(profile).toContain('heightRulerRef.current?.focus()');
    expect(profile).toContain('ref={heightRulerRef}');
    expect(profile).toContain('activityLevelSelectRef.current?.focus()');
    expect(profile).toContain('ref={activityLevelSelectRef}');
    expect(profile).toContain(
      'setDraft((current) => ({ ...current, activityLevel }))',
    );
    expect(profile).toContain('errors.activity');
    expect(profile).toContain('accessibilityLiveRegion="polite"');
    expect(gender).toContain('accessibilityLiveRegion="polite"');
    expect(ruler).toContain('export type HeightRulerHandle');
    expect(ruler).toContain('forwardRef<HeightRulerHandle');
    expect(ruler).toContain('useImperativeHandle');
    expect(ruler).toContain('findNodeHandle');
    expect(ruler).toContain('AccessibilityInfo.setAccessibilityFocus');
  });
});
