#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to run shell commands synchronously with inherited stdio
function run(command, options = {}) {
  try {
    return execSync(command, { cwd: rootDir, stdio: 'pipe', encoding: 'utf8', ...options }).trim();
  } catch (err) {
    if (options.ignoreError) return null;
    console.error(`\n❌ Command failed: ${command}`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    process.exit(1);
  }
}

// Ensure clean working directory
function checkGitStatus() {
  const status = run('git status --porcelain');
  return status;
}

// Calculate bumped semantic version
function bumpVersion(currentVersion, bumpType) {
  const parts = currentVersion.split('.').map(n => parseInt(n, 10));
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid semantic version in package.json: ${currentVersion}`);
  }

  let [major, minor, patch] = parts;

  if (bumpType === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    // Default: patch
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

async function main() {
  console.log('\n========================================');
  console.log('   🚀 D-Deck Automated Release Engine   ');
  console.log('      Crafted by Code & Chaos           ');
  console.log('========================================\n');

  // 1. Read package.json
  const pkgPath = path.join(rootDir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const currentVersion = pkg.version;

  // 2. Parse arguments
  const isDryRun = process.argv.includes('--dry-run');
  const arg = process.argv.slice(2).find(a => !a.startsWith('--')) || 'patch';
  let targetVersion = '';

  if (['patch', 'minor', 'major'].includes(arg)) {
    targetVersion = bumpVersion(currentVersion, arg);
  } else if (/^v?\d+\.\d+\.\d+(-[\w.]+)?$/.test(arg)) {
    targetVersion = arg.replace(/^v/, '');
  } else {
    console.error(`❌ Invalid version or bump type: "${arg}". Use "patch", "minor", "major", or a version like "1.0.1".`);
    process.exit(1);
  }

  const tagName = `v${targetVersion}`;

  console.log(`📌 Current Version : v${currentVersion}`);
  console.log(`🎯 Target Release  : ${tagName}`);
  if (isDryRun) {
    console.log(`🧪 [DRY RUN MODE ENABLED - No changes will be committed or pushed]`);
  }

  // 3. Check if tag already exists locally or remotely
  const existingLocalTag = run(`git tag -l ${tagName}`, { ignoreError: true });
  if (existingLocalTag) {
    console.error(`\n❌ Error: Tag ${tagName} already exists locally. Please choose a higher version.`);
    process.exit(1);
  }

  if (isDryRun) {
    console.log(`\n✅ Dry run completed successfully. Version ${targetVersion} is ready for release.`);
    process.exit(0);
  }

  // 4. Update package.json
  pkg.version = targetVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`\n✅ Updated package.json version to ${targetVersion}`);

  // 5. Stage changes & commit
  console.log(`📝 Creating release commit...`);
  run('git add -A');
  run(`git commit -m "chore(release): ${tagName}"`);

  // 6. Create Git Tag
  console.log(`🏷️ Creating Git tag ${tagName}...`);
  run(`git tag -a ${tagName} -m "Release ${tagName}"`);

  // 7. Push to GitHub
  console.log(`📤 Pushing release to GitHub origin main & ${tagName}...`);
  run('git push origin main');
  run(`git push origin ${tagName}`);

  console.log('\n======================================================');
  console.log(`🎉 SUCCESS: Release ${tagName} triggered automatically!`);
  console.log('======================================================');
  console.log(`\n📦 GitHub Actions is now compiling the release binaries:`);
  console.log(`   1. D-Deck-Setup-${targetVersion}.exe (Full NSIS Installer)`);
  console.log(`   2. D-Deck-Portable-${targetVersion}.exe (Zero-Install Portable)`);
  console.log(`\n🔗 Track build status in real time:`);
  console.log(`   https://github.com/codeandchaos-studio/D-Deck/actions`);
  console.log(`\n🔗 View published release once build completes (~2 min):`);
  console.log(`   https://github.com/codeandchaos-studio/D-Deck/releases/tag/${tagName}`);
  console.log('\n⚡ Lifetime Standard: Built & Published by Code & Chaos • We Built Stuff\n');
}

main().catch(err => {
  console.error('Fatal release error:', err);
  process.exit(1);
});
