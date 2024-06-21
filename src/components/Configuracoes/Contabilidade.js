import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';

const Contabilidade = () => {
  const [escritorios, setEscritorios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentEscritorio, setCurrentEscritorio] = useState(null);
  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [cidade, setCidade] = useState('');

  useEffect(() => {
    fetchEscritorios();
  }, []);

  const fetchEscritorios = () => {
    fetch('https://www.irpratico.com.br/api/conf_get_escritorios.php')
      .then(response => response.json())
      .then(data => setEscritorios(data))
      .catch(error => {
        setMessage('Erro ao buscar escritórios: ' + error.message);
        setShowMessageModal(true);
      });
  };

  const handleShowModal = (escritorio) => {
    setCurrentEscritorio(escritorio);
    setNome(escritorio ? escritorio.nome : '');
    setEmpresa(escritorio ? escritorio.empresa : '');
    setResponsavel(escritorio ? escritorio.responsavel : '');
    setCidade(escritorio ? escritorio.cidade : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEscritorio(null);
    setNome('');
    setEmpresa('');
    setResponsavel('');
    setCidade('');
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    fetchEscritorios(); // Fetch updated data after closing message modal
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('empresa', empresa);
    formData.append('responsavel', responsavel);
    formData.append('cidade', cidade);
    try {
      let url = 'https://www.irpratico.com.br/api/conf_add_escritorio.php';
      if (currentEscritorio) {
        formData.append('id', currentEscritorio.id);
        url = 'https://www.irpratico.com.br/api/conf_edit_escritorio.php';
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (currentEscritorio) {
          setEscritorios(escritorios.map(e => (e.id === data.id ? data : e)));
          setMessage('Escritório editado com sucesso');
        } else {
          setEscritorios([...escritorios, data]);
          setMessage('Escritório adicionado com sucesso');
        }
        setShowMessageModal(true);
        handleCloseModal();
      } else {
        throw new Error(data.message || 'Erro ao salvar escritório');
      }
    } catch (error) {
      setMessage('Erro ao salvar escritório: ' + error.message);
      setShowMessageModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este escritório?')) {
      try {
        const response = await fetch(`https://www.irpratico.com.br/api/conf_delete_escritorio.php?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          setEscritorios(escritorios.filter(e => e.id !== id));
          setMessage('Escritório removido com sucesso');
          setShowMessageModal(true);
        } else {
          throw new Error(data.message || 'Erro ao remover escritório');
        }
      } catch (error) {
        setMessage('Erro ao remover escritório: ' + error.message);
        setShowMessageModal(true);
      }
    }
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Nome', selector: row => row.nome, sortable: true },
    { name: 'Empresa', selector: row => row.empresa, sortable: true },
    { name: 'Responsável', selector: row => row.responsavel, sortable: true },
    { name: 'Cidade', selector: row => row.cidade, sortable: true },
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

  return (
    <div>
      <h2>Contabilidade</h2>
      <Button variant="primary" onClick={() => handleShowModal(null)}><i className="material-icons">add</i> Adicionar Escritório</Button>
      <DataTable
        columns={columns}
        data={escritorios}
        pagination
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentEscritorio ? 'Editar Escritório' : 'Adicionar Escritório'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group controlId="formNome">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmpresa">
              <Form.Label>Empresa</Form.Label>
              <Form.Control
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formResponsavel">
              <Form.Label>Responsável</Form.Label>
              <Form.Control
                type="text"
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formCidade">
              <Form.Label>Cidade</Form.Label>
              <Form.Control
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                required
              />
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

export default Contabilidade;
