import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa';

const ListaDeEntregas = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [filters, setFilters] = useState({
    kanban: '',
    tarefa: '',
    data: '',
    palavraChave: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = () => {
    fetch('https://www.irpratico.com.br/api/taf_get_tarefas.php')
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error('Erro ao buscar tarefas:', error));
  };

  const handleShowModal = (task) => {
    setCurrentTask(task);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentTask(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta tarefa?')) {
      fetch(`https://www.irpratico.com.br/api/taf_delete_tarefa.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_tarefa: id })
      })
        .then(response => response.json())
        .then(() => fetchTasks())
        .catch(error => console.error('Erro ao remover tarefa:', error));
    }
  };

  const columns = [
    { name: 'Código', selector: row => row.id_tarefa, sortable: true },
    { name: 'Responsável', selector: row => row.responsavel, sortable: true },
    { name: 'Declarante', selector: row => row.declarante, sortable: true },
    { name: 'Gerado em', selector: row => row.data_criacao, sortable: true },
    { name: 'Kanban', selector: row => row.status_trabalho, sortable: true, cell: row => <span className={`badge bg-${row.status_trabalho === 'Fazer' ? 'success' : 'secondary'}`}>{row.status_trabalho}</span> },
    { name: 'Tarefa', selector: row => row.titulo, sortable: true },
    { name: 'Ano base', selector: row => row.data_exercicio, sortable: true },
    { name: 'Data de antecipação', selector: row => row.data_selecionada, sortable: true },
    { name: 'Entrega', selector: row => row.dia_entrega, sortable: true },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="info" onClick={() => handleShowModal(row)}><FaEye /></Button>{' '}
          <Button variant="warning" onClick={() => handleShowModal(row)}><FaEdit /></Button>{' '}
          <Button variant="danger" onClick={() => handleDelete(row.id_tarefa)}><FaTrash /></Button>
        </>
      )
    }
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const filteredTasks = tasks.filter(task => 
    (filters.kanban === '' || task.status_trabalho.includes(filters.kanban)) &&
    (filters.tarefa === '' || task.titulo.includes(filters.tarefa)) &&
    (filters.data === '' || task.data_criacao.includes(filters.data)) &&
    (filters.palavraChave === '' || task.titulo.includes(filters.palavraChave))
  );

  return (
    <div>
      <h2>Lista de Entregas</h2>
      <div className="mb-3">
        <Row>
          <Col>
            <Form.Control as="select" name="kanban" value={filters.kanban} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="Fazer">Fazer</option>
              <option value="Fazendo">Fazendo</option>
              <option value="Feito">Feito</option>
            </Form.Control>
          </Col>
          <Col>
            <Form.Control as="select" name="tarefa" value={filters.tarefa} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluída">Concluída</option>
            </Form.Control>
          </Col>
          <Col>
            <Form.Control type="date" name="data" value={filters.data} onChange={handleFilterChange} />
          </Col>
          <Col>
            <Form.Control type="text" placeholder="Palavra-chave" name="palavraChave" value={filters.palavraChave} onChange={handleFilterChange} />
          </Col>
          <Col>
            <Button variant="primary" onClick={() => setFilters({ kanban: '', tarefa: '', data: '', palavraChave: '' })}>Limpar Filtros</Button>
          </Col>
        </Row>
      </div>
      <Button variant="primary" onClick={() => handleShowModal(null)}><FaPlus /> Adicionar Nova Entrega</Button>
      <DataTable
        columns={columns}
        data={filteredTasks}
        pagination
      />

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{currentTask ? 'Editar Entrega' : 'Adicionar Entrega'}</Modal.Title>
        </Modal.Header>
        <Form>
          <Modal.Body>
            <Row>
              <Col>
                <Form.Group controlId="formTitulo">
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentTask ? currentTask.titulo : ''}
                    onChange={(e) => setCurrentTask({ ...currentTask, titulo: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Group controlId="formDescricao">
                  <Form.Label>Descrição</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={currentTask ? currentTask.descricao : ''}
                    onChange={(e) => setCurrentTask({ ...currentTask, descricao: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Outros campos necessários */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Fechar</Button>
            <Button variant="primary" type="submit">Salvar</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ListaDeEntregas;
