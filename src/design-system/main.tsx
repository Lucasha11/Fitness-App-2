import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import { DesignSystem } from './DesignSystem';

const container = document.getElementById('root');
if (!container) throw new Error('Missing #root element');

createRoot(container).render(
  <StrictMode>
    <DesignSystem />
  </StrictMode>,
);
