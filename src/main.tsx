import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupApiSimulator } from './lib/apiSimulator.ts';

// Mengaktifkan API interceptor untuk fallback otomatis ke sandbox lokal secara aman jika server/backend offline
setupApiSimulator();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
