import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler to make blank page issues visible
window.addEventListener('error', (e) => {
  const root = document.getElementById('root');
  if (root?.children.length === 0) {
    root.innerHTML = `<div style="padding:40px;color:#ef4444;font-family:monospace;background:#0a0a0c;min-height:100vh"><h1>App Error</h1><pre style="white-space:pre-wrap;color:#f8fafc">${e.message}\n${e.filename}:${e.lineno}</pre></div>`;
  }
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
  const root = document.getElementById('root');
  if (root?.children.length === 0) {
    root.innerHTML = `<div style="padding:40px;color:#ef4444;font-family:monospace;background:#0a0a0c;min-height:100vh"><h1>App Error</h1><pre style="white-space:pre-wrap;color:#f8fafc">${String(e.reason)}</pre></div>`;
  }
});

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} catch (err) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding:40px;color:#ef4444;font-family:monospace;background:#0a0a0c;min-height:100vh"><h1>App Error</h1><pre style="white-space:pre-wrap;color:#f8fafc">${String(err)}</pre></div>`;
  }
}

// Register Service Worker
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('SW registration failed:', err);
    });
  });
}
