// One-time project setup: run with `npm run setup` from the project root.
// - Copies .env.example -> .env (or .env.local) in each app, if not already present
// - Runs `npm install` in backend, admin, frontend
// - Seeds the database (creates first admin user + sample content)
//
// You still need MySQL running and correct DB credentials in backend/.env
// before this will fully succeed - see LOCAL_SETUP.md.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname + '/..';

function copyEnvIfMissing(dir, exampleFile, targetFile) {
  const examplePath = path.join(root, dir, exampleFile);
  const targetPath = path.join(root, dir, targetFile);
  if (fs.existsSync(examplePath) && !fs.existsSync(targetPath)) {
    fs.copyFileSync(examplePath, targetPath);
    console.log(`Created ${dir}/${targetFile} from ${exampleFile} — edit it with your DB/API credentials.`);
  }
}

function run(cmd, cwd) {
  console.log(`\n> [${cwd}] ${cmd}`);
  execSync(cmd, { cwd: path.join(root, cwd), stdio: 'inherit' });
}

console.log('=== Core Bit Media: one-time setup ===\n');

copyEnvIfMissing('backend', '.env.example', '.env');
copyEnvIfMissing('admin', '.env.example', '.env');
copyEnvIfMissing('frontend', '.env.local.example', '.env.local');

run('npm install', '.');       // installs concurrently at root
run('npm install', 'backend');
run('npm install', 'admin');
run('npm install', 'frontend');

console.log('\n=== Seeding database (creates first admin login) ===');
try {
  run('npm run seed', 'backend');
} catch (err) {
  console.warn('\nSeed failed — this usually means MySQL isn\'t running yet or backend/.env credentials are wrong.');
  console.warn('Fix backend/.env, then run: npm run seed --prefix backend');
}

console.log('\nSetup done. Edit backend/.env (DB + JWT_SECRET + ANTHROPIC_API_KEY) if you haven\'t already, then run:\n\n  npm run dev\n');
