const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const isWindows = process.platform === 'win32';

console.log('🌾 Starting AgriInsights Backend (port 5000) and Frontend (port 3000)...\n');

function runService(dir) {
  const cwd = path.join(rootDir, dir);
  if (isWindows) {
    return spawn('cmd.exe', ['/c', 'npm', 'run', 'dev'], {
      cwd,
      stdio: 'inherit',
    });
  }
  return spawn('npm', ['run', 'dev'], {
    cwd,
    stdio: 'inherit',
  });
}

const backend = runService('backend');
const frontend = runService('frontend');

function cleanup() {
  try {
    if (backend && !backend.killed) backend.kill();
    if (frontend && !frontend.killed) frontend.kill();
  } catch (e) {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
