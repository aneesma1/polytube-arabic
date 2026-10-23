import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setupOfflineApiInterceptor } from './utils/offlineApiMock';
import './index.css';

// Initialize resilient offline interceptor for standalone operation
setupOfflineApiInterceptor();

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallbackTitle="Application Encountered an Issue">
    <App />
  </ErrorBoundary>
);
