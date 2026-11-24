import React from 'react';
import { createRoot } from 'react-dom/client';
import MainApp from './MainApp';

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<MainApp />);
}
