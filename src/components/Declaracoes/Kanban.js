import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Kanban.css';

const kanbanColumns = [
  { status: 'Em aberto', titulo: 'Em aberto' },
  { status: 'Leads', titulo: 'Leads' },
  { status: 'Não Fazer', titulo: 'Não Fazer' },
  { status: 'A Fazer', titulo: 'A Fazer' },
  { status: 'Executando', titulo: 'Executando' },
  { status: 'Transmitida', titulo: 'Transmitida' },
];

const ItemType = {
  CARD: 'card',
};

const KanbanCard = ({ tarefa, moveCard, updateCard }) => {
  const [, ref] = useDrag({
    type: ItemType.CARD,
    item: { id: tarefa.id_tarefa, status: tarefa.status_trabalho },
  });

  const [, drop] = useDrop({
    accept: ItemType.CARD,
    hover(item) {
      if (item.id !== tarefa.id_tarefa) {
        moveCard(item.id, tarefa.status_trabalho);
        item.status = tarefa.status_trabalho;
      }
    },
  });

  return (
    <div ref={node => ref(drop(node))}>
      <Card className="kanban-card">
        <Card.Body>
          <Card.Title>
            {tarefa.titulo} <span className="badge bg-primary">#{tarefa.id_tarefa}</span>
          </Card.Title>
          <Card.Text>{tarefa.descricao}</Card.Text>
          <Card.Text>Usuário: {tarefa.usuario_nome}</Card.Text>
          <Card.Text>Declarante: {tarefa.declarante_nome}</Card.Text>
          <Button variant="primary" onClick={() => updateCard(tarefa)}>Editar</Button>
        </Card.Body>
      </Card>
    </div>
  );
};

const KanbanColumn = ({ coluna, tarefas, moveCard, updateCard }) => {
  const [, drop] = useDrop({
    accept: ItemType.CARD,
    drop: item => moveCard(item.id, coluna.status),
  });

  return (
    <div className="kanban-column" ref={drop}>
      <h2 className="kanban-column-title">{coluna.titulo}</h2>
      <Button variant="light" className="add-task-button">+</Button>
      {Array.isArray(tarefas) && tarefas.filter(tarefa => tarefa.status_trabalho === coluna.status).map(tarefa => (
        <KanbanCard key={tarefa.id_tarefa} tarefa={tarefa} moveCard={moveCard} updateCard={updateCard} />
      ))}
    </div>
  );
};

const Kanban = () => {
  const [tarefas, setTarefas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentTarefa, setCurrentTarefa] = useState(null);

  useEffect(() => {
    fetch('https://www.irpratico.com.br/api/get_tarefas.php')
      .then(response => {
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Tarefas recebidas:', data);
        if (Array.isArray(data)) {
          setTarefas(data);
        } else {
          setTarefas([]);
          console.error('Dados recebidos não são um array:', data);
        }
      })
      .catch(error => {
        console.error('Erro ao buscar tarefas:', error);
        setTarefas([]); // Define tarefas como um array vazio em caso de erro
      });
  }, []);

  const moveCard = (id, newStatus) => {
    setTarefas(prevTarefas => prevTarefas.map(tarefa => {
      if (tarefa.id_tarefa === id) {
        return { ...tarefa, status_trabalho: newStatus };
      }
      return tarefa;
    }));

    fetch('https://www.irpratico.com.br/api/update_tarefa.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_tarefa: id, status_trabalho: newStatus }),
    })
      .then(response => response.json())
      .then(data => console.log(data))
      .catch(error => console.error('Erro ao atualizar status:', error));
  };

  const updateCard = (tarefa) => {
    setCurrentTarefa(tarefa);
    setShowModal(true);
  };

  const handleSave = () => {
    setShowModal(false);
    // Atualizar a tarefa no backend aqui
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="kanban-board">
        {kanbanColumns.map(coluna => (
          <KanbanColumn
            key={coluna.status}
            coluna={coluna}
            tarefas={tarefas}
            moveCard={moveCard}
            updateCard={updateCard}
          />
        ))}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Tarefa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTitulo">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" defaultValue={currentTarefa ? currentTarefa.titulo : ''} />
            </Form.Group>
            <Form.Group controlId="formDescricao">
              <Form.Label>Descrição</Form.Label>
              <Form.Control as="textarea" rows={3} defaultValue={currentTarefa ? currentTarefa.descricao : ''} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
          <Button variant="primary" onClick={handleSave}>Salvar</Button>
        </Modal.Footer>
      </Modal>
    </DndProvider>
  );
};

export default Kanban;
