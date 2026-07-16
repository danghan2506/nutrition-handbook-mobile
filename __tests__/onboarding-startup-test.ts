import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('onboarding startup gate', () => {
  it('waits for persisted onboarding state before redirecting', () => {
    const source = readFileSync(join(process.cwd(), 'app', 'index.tsx'), 'utf8');
    const layoutSource = readFileSync(join(process.cwd(), 'app', '_layout.tsx'), 'utf8');

    expect(layoutSource).toContain('SplashScreen.preventAutoHideAsync');
    expect(layoutSource).toContain('useSegments');
    expect(layoutSource).toContain('segments.length > 0');
    expect(layoutSource).toContain('SplashScreen.hideAsync');
    expect(source).not.toContain('SplashScreen.preventAutoHideAsync');
    expect(source).toContain('getInitialRoute');
    expect(source).toContain('if (!destination)');
    expect(source).toContain('return null');
    expect(source).toContain('<Redirect href={destination} />');
    expect(source).not.toContain('SplashScreen.hideAsync');
  });
});