import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

it('installs Expo Notifications without enabling native notification configuration', () => {
  const packageJson = readFileSync(join(root, 'package.json'), 'utf8');
  const appJson = readFileSync(join(root, 'app.json'), 'utf8');

  expect(packageJson).toContain('"expo-notifications"');
  expect(appJson).not.toContain('expo-notifications');
});
