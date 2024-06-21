import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const StatusAtividade = () => {
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [descricao, setDescricao] = useState('');

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = () => {
    fetch('https://www.irpratico.com.br/api/conf_get_status_atividade.php')
      .then(response => response.json())
      .then(data => setStatuses(data))
      .catch(error => {
        setMessage('Erro ao buscar status: ' + error.message);
        setShowMessageModal(true);
      });
  };

  const handleShowModal = (status) => {
    setCurrentStatus(status);
    setDescricao(status ? status.descricao : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStatus(null);
    setDescricao('');
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    fetchStatuses(); // Fetch statuses after closing message modal to ensure updated data is shown
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('descricao', descricao);
    try {
      let url = 'https://www.irpratico.com.br/api/conf_add_status_atividade.php';
      if (currentStatus) {
        formData.append('id', currentStatus.id_status);
        url = 'https://www.irpratico.com.br/api/conf_edit_status_atividade.php';
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (currentStatus) {
          setStatuses(statuses.map(status => (status.id_status === data.id_status ? data : status)));
          setMessage('Status editado com sucesso');
        } else {
          setStatuses([...statuses, data]);
          setMessage('Status adicionado com sucesso');
        }
        setShowMessageModal(true);
        handleCloseModal();
      } else {
        throw new Error(data.message || 'Erro ao salvar status');
      }
    } catch (error) {
      setMessage('Erro ao salvar status: ' + error.message);
      setShowMessageModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este status?')) {
      try {
        const response = await fetch(`https://www.irpratico.com.br/api/conf_delete_status_atividade.php?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          setStatuses(statuses.filter(status => status.id_status !== id));
          setMessage('Status removido com sucesso');
          setShowMessageModal(true);
        } else {
          throw new Error(data.message || 'Erro ao remover status');
        }
      } catch (error) {
        setMessage('Erro ao remover status: ' + error.message);
        setShowMessageModal(true);
      }
    }
  };

  const columns = [
    { name: 'ID', selector: row => row.id_status, sortable: true },
    { name: 'Descrição', selector: row => row.descricao, sortable: true },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="warning" onClick={() => handleShowModal(row)}><FaEdit /></Button>{' '}
          <Button variant="danger" onClick={() => handleDelete(row.id_status)}><FaTrash /></Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Status Atividade</h2>
      <Button variant="primary" onClick={() => handleShowModal(null)}><FaPlus /> Adicionar Status</Button>
      <DataTable
        columns={columns}
        data={statuses}
        pagination
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentStatus ? 'Editar Status' : 'Adicionar Status'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group controlId="formDescricao">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
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

export default StatusAtividade;
