import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('onboarding NativeWind compatibility', () => {
  it('does not call cssInterop, which is unavailable in NativeWind v5 preview.4', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'onboarding.tsx'), 'utf8');

    expect(source).not.toContain('cssInterop');
    expect(source).toContain("<SafeAreaView style={{ flex: 1, backgroundColor: '#FFF9F0' }}>");
  });
});