// Run by `make deploy-prod` just before shipping: every sidebar entry still marked `newSince: 'pending'` gets
// today's date, so its New badge lasts 7 days from the day it really reached production (docs-sidebar.tsx).
// The change is committed on the spot, since deploy-prod only ships a clean tree; push it with the rest.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/components/docs/docs-sidebar.tsx';
const src = readFileSync(file, 'utf8');
const pending = src.match(/newSince: 'pending'/g)?.length ?? 0;

if (!pending) {
  console.log('[stamp-new] no pending New badge');
} else {
  const now = new Date();
  const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  writeFileSync(file, src.replaceAll("newSince: 'pending'", `newSince: '${day}'`));
  execFileSync('git', ['commit', '-q', '-m', `Stamp the New badges shipped on ${day}`, '--', file], { stdio: 'inherit' });
  console.log(`[stamp-new] ${pending} New badge(s) dated ${day} and committed`);
}
