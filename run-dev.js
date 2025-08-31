import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.env.NODE_ENV = 'development';

const serverPath = join(__dirname, 'server', 'index.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

child.on('error', (error) => {
  console.error('Failed to start server:', error);
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});