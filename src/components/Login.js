import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Modal } from '@mui/material';
import { styled } from '@mui/system';
import logo from './images/bg_logo_oficial.png'; // Substitua pelo caminho correto do seu logo

const LoginContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: '#f0f0f0',
});

const LoginContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  backgroundColor: '#fff',
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[5],
}));

const LoginLogo = styled('img')(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const LoginForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fff',
  padding: theme.spacing(2, 4, 3),
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[5],
}));

const CloseButton = styled(Button)({
  float: 'right',
  cursor: 'pointer',
});

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('showErrorModal state:', showErrorModal);
    console.log('errorMessage state:', errorMessage);
  }, [showErrorModal, errorMessage]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://www.irpratico.com.br/api/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json(); // Diretamente parsear os dados JSON

      console.log('Data:', data); // Logar os dados da resposta

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user); // Chamar a função onLogin para atualizar o estado de autenticação
        navigate('/dashboard'); // Redirecionar para o dashboard
      } else {
        console.log('Setting error message and showing modal'); // Log adicional
        setErrorMessage(data.message || 'Login incorreto. Contate o suporte.');
        setShowErrorModal(true); // Exibir o modal de erro
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Falha ao tentar realizar login: ' + error.message);
      setShowErrorModal(true); // Exibir o modal de erro
    }
  };

  const closeModal = () => {
    console.log('Closing modal'); // Log adicional
    setShowErrorModal(false);
  };

  return (
    <LoginContainer component="main" maxWidth="xs">
      <LoginContent>
        <LoginLogo src={logo} alt="Logo" />
        <Typography component="h1" variant="h5">Login</Typography>
        <LoginForm onSubmit={handleLogin}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="E-mail"
            name="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Entrar
          </Button>
        </LoginForm>
      </LoginContent>
      <Modal
        open={showErrorModal}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <ModalContent>
          {console.log('Rendering modal')} {/* Adiciona um log quando o modal é renderizado */}
          <Typography variant="h6" id="modal-title">Erro</Typography>
          <Typography id="modal-description">{errorMessage}</Typography>
          <CloseButton onClick={closeModal}>Fechar</CloseButton>
        </ModalContent>
      </Modal>
    </LoginContainer>
  );
};

export default Login;
