import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRouter from './Router';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((reg) => {
      console.warn('Service Worker registration failed:', reg);
    });
  });
}
