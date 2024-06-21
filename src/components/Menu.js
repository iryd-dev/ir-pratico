import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  HelpOutline as HelpOutlineIcon,
  ExitToApp as ExitToAppIcon,
  ArrowRight as ArrowRightIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { styled, useTheme } from '@mui/system';
import logo from './images/logo_irpratico_sistema.png'; // Substitua pelo caminho correto do seu logo
import './Menu.css'; // Certifique-se de mover seus estilos personalizados para este arquivo

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Menu = ({ onLogout }) => {
  const [userName, setUserName] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState('');
  const [openDeclarações, setOpenDeclarações] = useState(false);
  const [openCadastros, setOpenCadastros] = useState(false);
  const [openConfigurações, setOpenConfigurações] = useState(false);
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchUserName = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        setUserName(user.name);
      }
    };

    fetchUserName();
  }, []);

  const handleSubMenuToggle = (setOpenSubMenu) => {
    setOpenSubMenu(prevOpen => !prevOpen);
  };

  const handleNavigation = (path, menuItem) => {
    setSelectedMenuItem(menuItem);
    navigate(path);
  };

  const confirmLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      try {
        await fetch('https://www.irpratico.com.br/api/logout.php', {
          method: 'POST',
          credentials: 'include',
        });
        localStorage.removeItem('user');
        navigate('/login');
      } catch (error) {
        console.error('Erro ao encerrar a sessão:', error);
      }
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : `calc(${theme.spacing(7)} + 1px)`,
          transition: theme.transitions.create(['width', 'background-color'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: '#074692',
          color: '#ffffff',
          overflowX: 'hidden',
        },
      }}
      variant="permanent"
      open={open}
    >
      <DrawerHeader>
        <IconButton onClick={open ? handleDrawerClose : handleDrawerOpen}>
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <Box className="menu-header" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 2 }}>
        <img src={logo} alt="Logo" className="menu-logo" style={{ display: open ? 'block' : 'none' }} />
        <Typography variant="h6" style={{ display: open ? 'block' : 'none' }}>{userName}</Typography>
      </Box>
      <List className="menu-list">
        <ListItem button selected={selectedMenuItem === 'dashboard'} onClick={() => handleNavigation('/dashboard', 'dashboard')}>
          <ListItemIcon sx={{ color: 'white' }}>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>

        <ListItem button onClick={() => handleSubMenuToggle(setOpenDeclarações)}>
          <ListItemIcon sx={{ color: 'white' }}>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Declarações" sx={{ display: open ? 'block' : 'none' }} />
          {openDeclarações ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
        </ListItem>
        <Collapse in={openDeclarações} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button selected={selectedMenuItem === 'kanban'} onClick={() => handleNavigation('/kanban', 'kanban')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Kanban" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'listaentregas'} onClick={() => handleNavigation('/listaentregas', 'listaentregas')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Lista de Entregas" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'gerartarefas'} onClick={() => handleNavigation('/gerartarefas', 'gerartarefas')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Gerar Tarefas" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={() => handleSubMenuToggle(setOpenCadastros)}>
          <ListItemIcon sx={{ color: 'white' }}>
            <PersonAddIcon />
          </ListItemIcon>
          <ListItemText primary="Cadastros" sx={{ display: open ? 'block' : 'none' }} />
          {openCadastros ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
        </ListItem>
        <Collapse in={openCadastros} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button selected={selectedMenuItem === 'declarante'} onClick={() => handleNavigation('/declarante', 'declarante')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Declarante" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'empresa'} onClick={() => handleNavigation('/empresa', 'empresa')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Empresa" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
          </List>
        </Collapse>

        <ListItem button onClick={() => handleSubMenuToggle(setOpenConfigurações)}>
          <ListItemIcon sx={{ color: 'white' }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Configurações" sx={{ display: open ? 'block' : 'none' }} />
          {openConfigurações ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />}
        </ListItem>
        <Collapse in={openConfigurações} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <ListItem button selected={selectedMenuItem === 'statusdeclarante'} onClick={() => handleNavigation('/statusdeclarante', 'statusdeclarante')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Status Declarante" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'honorarios'} onClick={() => handleNavigation('/honorarios', 'honorarios')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Honorários" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'statustarefa'} onClick={() => handleNavigation('/statustarefa', 'statustarefa')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Status da Tarefa" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'dataprazos'} onClick={() => handleNavigation('/dataprazos', 'dataprazos')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Datas e Prazos" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'contabilidade'} onClick={() => handleNavigation('/contabilidade', 'contabilidade')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Contabilidade" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
            <ListItem button selected={selectedMenuItem === 'usuarios'} onClick={() => handleNavigation('/usuarios', 'usuarios')} sx={{ pl: 4 }}>
              <ListItemIcon sx={{ color: 'white' }}>
                <ArrowRightIcon />
              </ListItemIcon>
              <ListItemText primary="Usuários" sx={{ display: open ? 'block' : 'none' }} />
            </ListItem>
          </List>
        </Collapse>
      </List>

      <List className="menu-footer">
        <ListItem button selected={selectedMenuItem === 'perfil'} onClick={() => handleNavigation('/perfil', 'perfil')}>
          <ListItemIcon sx={{ color: 'orange' }}>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Perfil" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
        <ListItem button selected={selectedMenuItem === 'suporte'} onClick={() => handleNavigation('/suporte', 'suporte')}>
          <ListItemIcon sx={{ color: 'orange' }}>
            <HelpOutlineIcon />
          </ListItemIcon>
          <ListItemText primary="Suporte" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
        <ListItem button onClick={confirmLogout}>
          <ListItemIcon sx={{ color: 'orange' }}>
            <ExitToAppIcon />
          </ListItemIcon>
          <ListItemText primary="Sair" sx={{ display: open ? 'block' : 'none' }} />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Menu;
