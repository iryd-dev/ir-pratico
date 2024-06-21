import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const Honorarios = () => {
  const [honorarios, setHonorarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [currentHonorario, setCurrentHonorario] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  useEffect(() => {
    fetchHonorarios();
  }, []);

  const fetchHonorarios = () => {
    fetch('https://www.irpratico.com.br/api/conf_get_honorario.php')
      .then(response => response.json())
      .then(data => setHonorarios(data))
      .catch(error => console.error('Erro ao buscar honorários:', error));
  };

  const handleShowModal = (honorario) => {
    setCurrentHonorario(honorario);
    setDescricao(honorario ? honorario.descricao : '');
    setValor(honorario ? `R$ ${parseFloat(honorario.valor).toFixed(2).replace(".", ",")}` : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentHonorario(null);
    setDescricao('');
    setValor('');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    fetchHonorarios();
  };

  const handleSave = async (event) => {
    event.preventDefault();
    // Remove "R$" e converte para número
    const valorNumerico = parseFloat(valor.replace("R$", "").replace(",", ".").trim());
    const honorarioData = {
      descricao: descricao,
      valor: valorNumerico
    };

    try {
      let url = 'https://www.irpratico.com.br/api/conf_add_honorario.php';
      if (currentHonorario) {
        honorarioData.id = currentHonorario.id;
        url = 'https://www.irpratico.com.br/api/conf_edit_honorario.php';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(honorarioData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (currentHonorario) {
        setSuccessMessage('Honorário editado com sucesso');
      } else {
        setSuccessMessage('Honorário adicionado com sucesso');
      }
      setShowSuccessModal(true);
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar honorário:', error);
      alert(`Erro ao salvar honorário: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://www.irpratico.com.br/api/conf_delete_honorario.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `id=${id}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSuccessMessage('Honorário removido com sucesso');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao remover honorário:', error);
      alert(`Erro ao remover honorário: ${error.message}`);
    }
  };

  const handleConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmModalAction = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
  };

  const handleValorChange = (event) => {
    // Atualiza o valor, mantendo o formato com "R$"
    setValor(`R$ ${event.target.value.replace(/[^\d,]/g, '')}`);
  };

  const columns = [
    { name: 'Descrição', selector: row => row.descricao, sortable: true },
    { name: 'Valor', selector: row => `R$ ${parseFloat(row.valor).toFixed(2).replace(".", ",")}`, sortable: true },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="warning" onClick={() => handleShowModal(row)}><FaEdit /></Button>{' '}
          <Button variant="danger" onClick={() => handleConfirm('Tem certeza que deseja remover este honorário?', () => handleDelete(row.id))}><FaTrash /></Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Honorários</h2>
      <Button variant="primary" onClick={() => handleShowModal(null)}><FaPlus />Adicionar Honorário</Button>
      <DataTable
        columns={columns}
        data={honorarios}
        pagination
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentHonorario ? 'Editar Honorário' : 'Adicionar Honorário'}</Modal.Title>
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
            <Form.Group controlId="formValor">
              <Form.Label>Valor</Form.Label>
              <Form.Control
                type="text"
                value={valor}
                onChange={handleValorChange}
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

      <Modal show={showSuccessModal} onHide={handleSuccessModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessModalClose}>Fechar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirmModal} onHide={handleConfirmModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleConfirmModalClose}>Cancelar</Button>
          <Button variant="primary" onClick={handleConfirmModalAction}>Confirmar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Honorarios;
