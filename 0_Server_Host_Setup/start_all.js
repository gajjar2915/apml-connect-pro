const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');

// Helper to get direct Node script target for Next.js (no cmd.exe wrapper)
function getNextScript(frontendDir) {
  const nextJsBin = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next');
  if (fs.existsSync(nextJsBin)) {
    return nextJsBin;
  }
  return path.join(frontendDir, 'node_modules', 'next', 'bin', 'next');
}

const services = [
  { 
    name: 'Backend API (5005)', 
    cwd: path.join(__dirname, 'backend'), 
    cmd: process.execPath, 
    args: [path.join(__dirname, 'backend', 'dist', 'index.js')] 
  },
  { 
    name: 'Receptionist Desk (3001)', 
    cwd: path.join(rootDir, '1_Receptionist_Setup', 'frontend'), 
    cmd: process.execPath, 
    args: [getNextScript(path.join(rootDir, '1_Receptionist_Setup', 'frontend')), 'dev', '-H', '127.0.0.1', '-p', '3001'] 
  },
  { 
    name: 'Doctor Cabinet (3002)', 
    cwd: path.join(rootDir, '2_Doctor_Setup', 'frontend'), 
    cmd: process.execPath, 
    args: [getNextScript(path.join(rootDir, '2_Doctor_Setup', 'frontend')), 'dev', '-H', '127.0.0.1', '-p', '3002'] 
  },
  { 
    name: 'Pharmacy Counter (3003)', 
    cwd: path.join(rootDir, '3_Pharmacy_Setup', 'frontend'), 
    cmd: process.execPath, 
    args: [getNextScript(path.join(rootDir, '3_Pharmacy_Setup', 'frontend')), 'dev', '-H', '127.0.0.1', '-p', '3003'] 
  },
];

// Spawn ALL services directly with Node binary (shell: false, windowsHide: true) -> ZERO CMD.EXE POPUPS!
services.forEach(svc => {
  try {
    const proc = spawn(svc.cmd, svc.args, {
      cwd: svc.cwd,
      shell: false,
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    proc.unref();
  } catch (err) {
    // Fail-safe
  }
});

// Open browser silently using Windows Explorer GUI (ZERO CMD windows)
setTimeout(() => {
  const targetPortal = path.join(rootDir, 'APML_Connect_Pro_Unified_Login.html');
  try {
    const browserProc = spawn('explorer.exe', [targetPortal], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true
    });
    browserProc.unref();
  } catch (err) {
    // Fallback
  }
}, 2500);
