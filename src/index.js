import React from 'react';
import ReactDOM from 'react-dom/client'; // Import do createRoot
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme/theme'; // Certifique-se de que o caminho está correto
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root')); // Uso do createRoot

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
