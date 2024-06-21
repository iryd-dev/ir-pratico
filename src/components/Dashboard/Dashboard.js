import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Card, CardContent, Typography, IconButton, Checkbox, FormControlLabel, Box, Grid, Paper, Modal, Button } from '@mui/material';
import { Settings as SettingsIcon, Group as GroupIcon, Business as BusinessIcon, Person as PersonIcon } from '@mui/icons-material';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [data, setData] = useState({
    total_registros_escritorio: 0,
    total_registros_empresas: 0,
    total_registros_usuarios: 0,
    socio_empresa: {},
  });

  const [showConfig, setShowConfig] = useState(false);
  const [displaySettings, setDisplaySettings] = useState({
    showEscritorio: true,
    showEmpresas: true,
    showUsuarios: true,
    showSocioEmpresa: true,
  });
  const [localTime, setLocalTime] = useState(new Date());

  useEffect(() => {
    fetch('https://www.irpratico.com.br/api/dashboard_data.php')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Erro ao buscar dados do dashboard:', error));
  }, []);

  useEffect(() => {
    const savedSettings = JSON.parse(sessionStorage.getItem('displaySettings'));
    if (savedSettings) {
      setDisplaySettings(savedSettings);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLocalTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const socioEmpresaData = {
    labels: ['Sim', 'Não'],
    datasets: [
      {
        label: 'Socio Empresa',
        data: [
          data.socio_empresa['Sim'] || 0,
          data.socio_empresa['Não'] || 0
        ],
        backgroundColor: ['#3f51b5', '#ff8c00'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const handleSaveSettings = () => {
    sessionStorage.setItem('displaySettings', JSON.stringify(displaySettings));
    setShowConfig(false);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setDisplaySettings((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">Dashboard</Typography>
          <IconButton color="primary" onClick={() => setShowConfig(true)}>
            <SettingsIcon />
          </IconButton>
        </Grid>
        {displaySettings.showEscritorio && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <GroupIcon fontSize="large" />
                <Typography variant="h5">{data.total_registros_escritorio}</Typography>
                <Typography color="textSecondary">Escritórios</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {displaySettings.showEmpresas && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <BusinessIcon fontSize="large" />
                <Typography variant="h5">{data.total_registros_empresas}</Typography>
                <Typography color="textSecondary">Empresas</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {displaySettings.showUsuarios && (
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <PersonIcon fontSize="large" />
                <Typography variant="h5">{data.total_registros_usuarios}</Typography>
                <Typography color="textSecondary">Usuários</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {displaySettings.showSocioEmpresa && (
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Socio Empresa</Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={socioEmpresaData} options={options} />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Modal
        open={showConfig}
        onClose={() => setShowConfig(false)}
        aria-labelledby="config-modal-title"
        aria-describedby="config-modal-description"
      >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography id="config-modal-title" variant="h6" component="h2">
            Configurações do Dashboard
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={displaySettings.showEscritorio}
                onChange={handleCheckboxChange}
                name="showEscritorio"
              />
            }
            label="Mostrar Escritórios"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={displaySettings.showEmpresas}
                onChange={handleCheckboxChange}
                name="showEmpresas"
              />
            }
            label="Mostrar Empresas"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={displaySettings.showUsuarios}
                onChange={handleCheckboxChange}
                name="showUsuarios"
              />
            }
            label="Mostrar Usuários"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={displaySettings.showSocioEmpresa}
                onChange={handleCheckboxChange}
                name="showSocioEmpresa"
              />
            }
            label="Mostrar Socio Empresa"
          />
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={handleSaveSettings}>
              Salvar
            </Button>
          </Box>
          <Typography variant="body2" color="textSecondary" mt={2}>
            Hora Local: {localTime.toLocaleTimeString()}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default Dashboard;
