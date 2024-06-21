import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme'; // Corrigido o caminho
import Login from './components/Login';
import Dashboard from './components/Dashboard/Dashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import Declarante from './components/Cadastros/Declarante';
import StatusDeclarante from './components/Cadastros/Declarante'; // Corrigido o caminho
import Honorarios from './components/Configuracoes/Honorarios'; // Corrigido o caminho
import StatusTarefa from './components/Configuracoes/StatusTarefa'; // Corrigido o caminho
import DatasPrazos from './components/Configuracoes/DatasPrazos';
import Contabilidade from './components/Configuracoes/Contabilidade';
import Usuarios from './components/Configuracoes/Usuarios';
import Kanban from './components/Declaracoes/Kanban'; // Corrigido o caminho
import Menu from './components/Menu'; // Importando o Menu
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {isAuthenticated && <Menu onLogout={handleLogout} />}
        <div className="app-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
            {isAuthenticated && (
              <>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/manager" element={<ManagerDashboard />} />
                <Route path="/declarante" element={<Declarante />} />
                <Route path="/statusdeclarante" element={<StatusDeclarante />} />
                <Route path="/honorarios" element={<Honorarios />} />
                <Route path="/statustarefa" element={<StatusTarefa />} />
                <Route path="/DatasPrazos" element={<DatasPrazos />} />
                <Route path="/contabilidade" element={<Contabilidade />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/kanban" element={<Kanban />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
