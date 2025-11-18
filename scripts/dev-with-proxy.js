#!/usr/bin/env node

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Setup global proxy for all HTTP/HTTPS requests
if (process.env.USE_PROXY === 'true') {
  const proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:7897';
  
  // Set undici global dispatcher for fetch API
  const { setGlobalDispatcher, ProxyAgent } = require('undici');
  const proxyAgent = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(proxyAgent);
  
  // Also set for other HTTP clients
  process.env.HTTP_PROXY = proxyUrl;
  process.env.HTTPS_PROXY = proxyUrl;
  
  console.log('\n🌐 Global Proxy Configuration:');
  console.log('   ✅ HTTP/HTTPS Proxy:', proxyUrl);
  console.log('   ✅ Undici fetch via proxy');
  console.log('   ✅ Database connections via proxy');
  console.log('   ✅ Google OAuth via proxy');
  console.log('   ✅ All external APIs via proxy\n');
}

// Start Next.js dev server
const { spawn } = require('child_process');
const nextProcess = spawn('next', ['dev'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

// Handle process termination
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
  process.exit(0);
});

nextProcess.on('exit', (code) => {
  process.exit(code || 0);
});
