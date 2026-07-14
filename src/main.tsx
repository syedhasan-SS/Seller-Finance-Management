import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@components/ErrorBoundary';
import App from './App.tsx';
import { bootstrapAuthFromHash } from './lib/auth-bootstrap';
import './index.css';

// Must run before React mounts so AuthProvider sees the seeded token on first read.
bootstrapAuthFromHash();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
