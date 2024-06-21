import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const StatusDeclarante = () => {
  const [statuses, setStatuses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStatus, setCurrentStatus] = useState(null);
  const [statusValue, setStatusValue] = useState('');
  const [deleteStatusId, setDeleteStatusId] = useState(null);

  useEffect(() => {
    fetch('https://www.irpratico.com.br/api/conf_get_status_declarante.php')
      .then(response => response.json())
      .then(data => setStatuses(data))
      .catch(error => console.error('Erro ao buscar status:', error));
  }, []);

  const handleShowModal = (status) => {
    setCurrentStatus(status);
    setStatusValue(status ? status.status : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentStatus(null);
    setStatusValue('');
  };

  const handleSave = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('status', statusValue);
    if (currentStatus) {
      formData.append('id', currentStatus.id);
      fetch('https://www.irpratico.com.br/api/conf_edit_status_declarante.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          setStatuses(statuses.map(status => (status.id === data.id ? data : status)));
          setMessage('Status editado com sucesso');
          setShowMessageModal(true);
          handleCloseModal();
        })
        .catch(error => {
          console.error('Erro ao editar status:', error);
          setMessage('Erro ao editar status');
          setShowMessageModal(true);
        });
    } else {
      fetch('https://www.irpratico.com.br/api/conf_add_status_declarante.php', {
        method: 'POST',
        body: formData,
      })
        .then(response => response.json())
        .then(data => {
          setStatuses([...statuses, data]);
          setMessage('Status adicionado com sucesso');
          setShowMessageModal(true);
          handleCloseModal();
        })
        .catch(error => {
          console.error('Erro ao adicionar status:', error);
          setMessage('Erro ao adicionar status');
          setShowMessageModal(true);
        });
    }
  };

  const handleShowDeleteModal = (id) => {
    setDeleteStatusId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    fetch(`https://www.irpratico.com.br/api/conf_delete_status_declarante.php?id=${deleteStatusId}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        setStatuses(statuses.filter(status => status.id !== deleteStatusId));
        setMessage('Status removido com sucesso');
        setShowMessageModal(true);
        setShowDeleteModal(false);
      })
      .catch(error => {
        console.error('Erro ao remover status:', error);
        setMessage('Erro ao remover status');
        setShowMessageModal(true);
      });
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Status', selector: row => row.status, sortable: true },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="warning" onClick={() => handleShowModal(row)}><FaEdit /></Button>{' '}
          <Button variant="danger" onClick={() => handleShowDeleteModal(row.id)}><FaTrash /></Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Status Declarante</h2>
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
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                type="text"
                value={statusValue}
                onChange={(e) => setStatusValue(e.target.value)}
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

      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mensagem</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowMessageModal(false)}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação de Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>Tem certeza que deseja remover este status?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Remover</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StatusDeclarante;
