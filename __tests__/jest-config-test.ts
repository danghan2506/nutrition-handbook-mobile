import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Jest workspace isolation', () => {
  it('does not collect tests from local git worktrees', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
    );

    expect(packageJson.jest.testPathIgnorePatterns).toContain(
      '<rootDir>/.worktrees/',
    );
  });
});
