import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = ReactDOM.createRoot(rootElement)

// Error handler for debugging issues in production/extension environment
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global Error Handling:', { message, source, lineno, colno, error });
  
  // Show a user-friendly error overlay if the app fails completely
  if (document.body.innerHTML === '' || document.body.innerHTML === '<div id="root"></div>') {
    const errDiv = document.createElement('div');
    errDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#1a1c23;color:#f43f5e;padding:40px;z-index:9999;font-family:sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;';
    errDiv.innerHTML = `
      <h1 style="font-size: 24px; margin-bottom: 16px;">Oops! Something went wrong</h1>
      <p style="color: #94a3b8; max-width: 500px; line-height: 1.6;">TabStack encountered an error while loading. This usually happens if there is a problem with the Chrome extension permissions or a data mismatch.</p>
      <pre style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 8px; font-size: 12px; margin-top: 24px; text-align: left; overflow: auto; max-width: 90%;">${message}</pre>
      <button onclick="window.location.reload()" style="margin-top: 32px; padding: 12px 24px; background: #38bdf8; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Reload Page</button>
    `;
    document.body.appendChild(errDiv);
  }
};

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
