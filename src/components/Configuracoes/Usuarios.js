import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col, InputGroup } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentUsuario, setCurrentUsuario] = useState(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [permissao, setPermissao] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = () => {
    fetch('https://www.irpratico.com.br/api/conf_get_usuarios.php')
      .then(response => response.json())
      .then(data => setUsuarios(data))
      .catch(error => {
        setMessage('Erro ao buscar usuários: ' + error.message);
        setShowMessageModal(true);
      });
  };

  const handleShowModal = (usuario) => {
    setCurrentUsuario(usuario);
    setNome(usuario ? usuario.nome : '');
    setTelefone(usuario ? usuario.telefone : '');
    setEmpresa(usuario ? usuario.empresa : '');
    setEmail(usuario ? usuario.email : '');
    setSenha(usuario ? usuario.senha : '');
    setPermissao(usuario ? usuario.permissao : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentUsuario(null);
    setNome('');
    setTelefone('');
    setEmpresa('');
    setEmail('');
    setSenha('');
    setPermissao('');
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    fetchUsuarios(); // Fetch updated data after closing message modal
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('telefone', telefone);
    formData.append('empresa', empresa);
    formData.append('email', email);
    formData.append('senha', senha);
    formData.append('permissao', permissao);
    try {
      let url = 'https://www.irpratico.com.br/api/conf_add_usuario.php';
      if (currentUsuario) {
        formData.append('id', currentUsuario.id);
        url = 'https://www.irpratico.com.br/api/conf_edit_usuario.php';
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (currentUsuario) {
          setUsuarios(usuarios.map(u => (u.id === data.id ? data : u)));
          setMessage('Usuário editado com sucesso');
        } else {
          setUsuarios([...usuarios, data]);
          setMessage('Usuário adicionado com sucesso');
        }
        setShowMessageModal(true);
        handleCloseModal();
      } else {
        throw new Error(data.message || 'Erro ao salvar usuário');
      }
    } catch (error) {
      setMessage('Erro ao salvar usuário: ' + error.message);
      setShowMessageModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        const response = await fetch(`https://www.irpratico.com.br/api/conf_delete_usuario.php?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          setUsuarios(usuarios.filter(u => u.id !== id));
          setMessage('Usuário removido com sucesso');
          setShowMessageModal(true);
        } else {
          throw new Error(data.message || 'Erro ao remover usuário');
        }
      } catch (error) {
        setMessage('Erro ao remover usuário: ' + error.message);
        setShowMessageModal(true);
      }
    }
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Nome', selector: row => row.nome, sortable: true },
    { name: 'Email', selector: row => row.email, sortable: true },
    { name: 'Senha', selector: row => row.senha, sortable: true },
    { name: 'Permissão', selector: row => row.permissao, sortable: true },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="warning" onClick={() => handleShowModal(row)}><i className="material-icons">edit</i></Button>{' '}
          <Button variant="danger" onClick={() => handleDelete(row.id)}><i className="material-icons">delete</i></Button>
        </>
      )
    }
  ];

  const toggleMostrarSenha = () => {
    setMostrarSenha(!mostrarSenha);
  };

  return (
    <div>
      <h2>Usuários</h2>
      <Button variant="primary" onClick={() => handleShowModal(null)}><i className="material-icons">add</i> Adicionar Usuário</Button>
      <DataTable
        columns={columns}
        data={usuarios}
        pagination
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentUsuario ? 'Editar Usuário' : 'Adicionar Usuário'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col>
                <Form.Group controlId="formNome">
                  <Form.Label>Nome</Form.Label>
                  <Form.Control
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formTelefone">
                  <Form.Label>Telefone</Form.Label>
                  <Form.Control
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="formEmpresa">
                  <Form.Label>Empresa</Form.Label>
                  <Form.Control
                    type="text"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="formSenha">
                  <Form.Label>Senha</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={mostrarSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                    <Button variant="outline-secondary" onClick={toggleMostrarSenha}>
                      <i className="material-icons">{mostrarSenha ? 'visibility_off' : 'visibility'}</i>
                    </Button>
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="formPermissao">
              <Form.Label>Permissão</Form.Label>
              <Form.Control
                as="select"
                value={permissao}
                onChange={(e) => setPermissao(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Usuario">Usuario</option>
              </Form.Control>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Fechar</Button>
            <Button variant="primary" type="submit">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showMessageModal} onHide={handleCloseMessageModal}>
        <Modal.Header closeButton>
          <Modal.Title>Mensagem</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseMessageModal}>Fechar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Usuarios;
