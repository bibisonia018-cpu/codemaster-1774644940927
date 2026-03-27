import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="bottom-center"
      toastOptions={{
        style: {
          background: '#18181b',
          color: '#fafafa',
          border: '1px solid #27272a'
        }
      }} 
    />
  </React.StrictMode>,
);