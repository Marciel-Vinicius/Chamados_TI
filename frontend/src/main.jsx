// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App.jsx';
import './index.css';
import { NotificationProvider } from './contexts/NotificationContext.jsx';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
axios.interceptors.request.use((cfg) => {
  const raw = localStorage.getItem('token');
  if (raw) {
    const token = raw.replace(/^"|"$/g, '');
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider apiBase={axios.defaults.baseURL}>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
