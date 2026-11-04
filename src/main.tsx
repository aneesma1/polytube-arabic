import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initVideoStore } from './utils/videoStore';
import './index.css';

initVideoStore().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <ErrorBoundary fallbackTitle="Application Encountered an Issue">
      <App />
    </ErrorBoundary>
  );
});
