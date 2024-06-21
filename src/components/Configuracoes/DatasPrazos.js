import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'; // Certifique-se de importar os ícones corretamente

const DatasPrazos = () => {
  const [dataPrazos, setDataPrazos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentDataPrazo, setCurrentDataPrazo] = useState(null);
  const [dataExercicio, setDataExercicio] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [diaEntrega, setDiaEntrega] = useState('');

  useEffect(() => {
    fetchDataPrazos();
  }, []);

  const fetchDataPrazos = () => {
    fetch('https://www.irpratico.com.br/api/conf_get_datas_prazos.php')
      .then(response => response.json())
      .then(data => setDataPrazos(data))
      .catch(error => {
        setMessage('Erro ao buscar datas e prazos: ' + error.message);
        setShowMessageModal(true);
      });
  };

  const handleShowModal = (dataPrazo) => {
    setCurrentDataPrazo(dataPrazo);
    setDataExercicio(dataPrazo ? dataPrazo.data_exercicio : '');
    setDataSelecionada(dataPrazo ? dataPrazo.data_selecionada : '');
    setDiaEntrega(dataPrazo ? dataPrazo.dia_entrega : '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDataPrazo(null);
    setDataExercicio('');
    setDataSelecionada('');
    setDiaEntrega('');
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    fetchDataPrazos(); // Fetch updated data after closing message modal
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('data_exercicio', dataExercicio);
    formData.append('data_selecionada', dataSelecionada);
    formData.append('dia_entrega', diaEntrega);
    try {
      let url = 'https://www.irpratico.com.br/api/conf_add_datas_prazos.php';
      if (currentDataPrazo) {
        formData.append('id', currentDataPrazo.id);
        url = 'https://www.irpratico.com.br/api/conf_edit_datas_prazos.php';
      }

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        if (currentDataPrazo) {
          setDataPrazos(dataPrazos.map(dp => (dp.id === data.id ? data : dp)));
          setMessage('Data e prazo editados com sucesso');
        } else {
          setDataPrazos([...dataPrazos, data]);
          setMessage('Data e prazo adicionados com sucesso');
        }
        setShowMessageModal(true);
        handleCloseModal();
      } else {
        throw new Error(data.message || 'Erro ao salvar data e prazo');
      }
    } catch (error) {
      setMessage('Erro ao salvar data e prazo: ' + error.message);
      setShowMessageModal(true);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover esta data e prazo?')) {
      try {
        const response = await fetch(`https://www.irpratico.com.br/api/conf_delete_datas_prazos.php?id=${id}`, {
          method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
          setDataPrazos(dataPrazos.filter(dp => dp.id !== id));
          setMessage('Data e prazo removidos com sucesso');
          setShowMessageModal(true);
        } else {
          throw new Error(data.message || 'Erro ao remover data e prazo');
        }
      } catch (error) {
        setMessage('Erro ao remover data e prazo: ' + error.message);
        setShowMessageModal(true);
      }
    }
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true },
    { name: 'Ano base', selector: row => row.data_exercicio, sortable: true },
    { name: 'Data de antecipação', selector: row => row.data_selecionada, sortable: true },
    { name: 'Dia de entrega', selector: row => row.dia_entrega, sortable: true },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="warning" onClick={() => handleShowModal(row)}><FaEdit /></Button>{' '}
          <Button variant="danger" onClick={() => handleDelete(row.id)}><FaTrash /></Button>
        </>
      )
    }
  ];

  return (
    <div>
      <h2>Configurações de Datas e Prazos</h2>
      <Button variant="primary" onClick={() => handleShowModal(null)}><FaPlus /> Adicionar Data e Prazo</Button>
      <DataTable
        columns={columns}
        data={dataPrazos}
        pagination
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentDataPrazo ? 'Editar Data e Prazo' : 'Adicionar Data e Prazo'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col>
                <Form.Group controlId="formDataExercicio">
                  <Form.Label>Ano base</Form.Label>
                  <Form.Control
                    type="text"
                    value={dataExercicio}
                    onChange={(e) => setDataExercicio(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formDataSelecionada">
                  <Form.Label>Data de antecipação</Form.Label>
                  <Form.Control
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="formDiaEntrega">
                  <Form.Label>Dia de entrega</Form.Label>
                  <Form.Control
                    type="date"
                    value={diaEntrega}
                    onChange={(e) => setDiaEntrega(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
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

export default DatasPrazos;
