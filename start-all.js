import { spawn } from 'child_process';

console.log('🚀 Starting Filiallar System (Backend + Frontend)...');

// Start Express Backend
const backend = spawn('node', ['server/server.js'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Start Vite Frontend
const frontend = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

backend.on('error', (err) => {
  console.error('❌ Backend process error:', err);
});

frontend.on('error', (err) => {
  console.error('❌ Frontend process error:', err);
});

const cleanup = () => {
  console.log('\n🛑 Shutting down server processes...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
