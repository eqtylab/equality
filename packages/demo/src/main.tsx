import React from 'react';
import { createRoot } from 'react-dom/client';

// Import the library CSS once
import '@eqtylab/equality/styles/style.css';
// Tailwind for the demo app
import './styles.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="equality">
      {/** scope for library utilities */}
      <App />
    </div>
  </React.StrictMode>
);
