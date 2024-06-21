import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import DataTable, { createTheme } from 'react-data-table-component';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Declarante.css';
import * as XLSX from 'xlsx';

createTheme('custom', {
  text: {
    primary: '#000000',
    secondary: '#2aa198',
  },
  background: {
    default: '#ffffff',
  },
  context: {
    background: '#cb4b16',
    text: '#FFFFFF',
  },
  divider: {
    default: '#073642',
  },
  action: {
    button: 'rgba(0,0,0,.54)',
    hover: 'rgba(0,0,0,.08)',
    disabled: 'rgba(0,0,0,.12)',
  },
});

const Declarante = () => {
  const [declarantes, setDeclarantes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentDeclarante, setCurrentDeclarante] = useState(null);
  const [filter, setFilter] = useState('');
  const [selectedColumns, setSelectedColumns] = useState([
    'Id', 'Código Declarante', 'CPF', 'Nome', 'Status', 'Responsável', 'Sócio', 'Empresa', 'Entregar DIRPF', 'Ações'
  ]);
  const [isSocio, setIsSocio] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [selectedSocios, setSelectedSocios] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const tableRef = useRef(null);

  const [statusOptions, setStatusOptions] = useState([]);
  const [responsavelOptions, setResponsavelOptions] = useState([]);
  const [contabilidadeOptions, setContabilidadeOptions] = useState([]);

  useEffect(() => {
    fetch('https://www.irpratico.com.br/api/get_declarantes.php')
      .then(response => response.json())
      .then(data => setDeclarantes(data))
      .catch(error => console.error('Erro ao buscar declarantes:', error));

    fetch('https://www.irpratico.com.br/api/irpx_get_options.php?table=status_declarante&column=status')
      .then(response => response.json())
      .then(data => setStatusOptions(data))
      .catch(error => console.error('Erro ao buscar status do declarante:', error));
    
    fetch('https://www.irpratico.com.br/api/irpx_get_options.php?table=usuarios&column=nome')
      .then(response => response.json())
      .then(data => setResponsavelOptions(data))
      .catch(error => console.error('Erro ao buscar responsáveis:', error));
    
    fetch('https://www.irpratico.com.br/api/irpx_get_options.php?table=escritorio&column=nome')
      .then(response => response.json())
      .then(data => setContabilidadeOptions(data))
      .catch(error => console.error('Erro ao buscar contabilidade:', error));
  }, []);

  const handleShowModal = (declarante) => {
    setCurrentDeclarante(declarante);
    setIsSocio(declarante.SocioEmpresa !== null && declarante.SocioEmpresa.length > 0);
    setSelectedSocios(declarante.SocioEmpresa ? declarante.SocioEmpresa.split(',') : []);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDeclarante(null);
  };

  const handleShowAddModal = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleShowDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleDelete = () => {
    if (window.confirm('Tem certeza que deseja remover este declarante?')) {
      fetch(`https://www.irpratico.com.br/api/irpx_delete_declarante.php?id=${deleteId}`, {
        method: 'DELETE',
      })
        .then(response => response.json())
        .then(data => {
          setDeclarantes(declarantes.filter(declarante => declarante.Id !== deleteId));
          alert(data.message);
          handleCloseDeleteModal();
        })
        .catch(error => console.error('Erro ao remover declarante:', error));
    }
  };

  const handleEdit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    fetch(`https://www.irpratico.com.br/api/irpx_edit_declarante.php`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setDeclarantes(declarantes.map(declarante => {
          if (declarante.Id === data.Id) {
            return data;
          }
          return declarante;
        }));
        handleCloseModal();
        alert(data.message);
      })
      .catch(error => console.error('Erro ao editar declarante:', error));
  };

  const handleAdd = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    fetch(`https://www.irpratico.com.br/api/irpx_add_declarante.php`, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        setDeclarantes([...declarantes, data]);
        handleCloseAddModal();
        alert(data.message);
      })
      .catch(error => console.error('Erro ao adicionar declarante:', error));
  };

  const handleColumnChange = (column) => {
    setSelectedColumns(columns =>
      columns.includes(column)
        ? columns.filter(col => col !== column)
        : [...columns, column]
    );
  };

  const handleSocioChange = (event) => {
    const value = event.target.value;
    setIsSocio(value === 'Sim');
  };

  const handleSocioSearch = (event) => {
    const value = event.target.value;
    if (value.length > 2) {
      fetch(`https://www.irpratico.com.br/api/irpx_search_socio.php?query=${value}`)
        .then(response => response.json())
        .then(data => setAutocompleteOptions(data))
        .catch(error => console.error('Erro ao buscar sócios:', error));
    }
  };

  const handleSocioSelect = (option) => {
    setSelectedSocios([...selectedSocios, option]);
  };

  const handlePrint = () => {
    const printData = filteredDeclarantes.map(row => {
      const newRow = {};
      selectedColumns.forEach(colName => {
        const col = columns.find(c => c.name === colName);
        if (col && col.selector) {
          newRow[col.name] = col.selector(row);
        }
      });
      return newRow;
    });

    const tableHeaders = selectedColumns.filter(col => col !== 'Ações');

    const printWindow = window.open('', '', 'height=400,width=800');
    printWindow.document.write('<html><head><title>Imprimir</title>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid black; padding: 8px; text-align: left; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<table><thead><tr>');

    tableHeaders.forEach(header => {
      printWindow.document.write(`<th>${header}</th>`);
    });

    printWindow.document.write('</tr></thead><tbody>');

    printData.forEach(row => {
      printWindow.document.write('<tr>');
      tableHeaders.forEach(header => {
        printWindow.document.write(`<td>${row[header] !== undefined ? row[header] : ''}</td>`);
      });
      printWindow.document.write('</tr>');
    });

    printWindow.document.write('</tbody></table></body></html>');
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const filteredColumns = columns.filter(col => col.name !== 'Ações' && selectedColumns.includes(col.name));
    const tableHeaders = filteredColumns.map(col => col.name);
    const tableData = filteredDeclarantes.map(row => {
      const newRow = {};
      filteredColumns.forEach(col => {
        newRow[col.name] = col.selector(row);
      });
      return tableHeaders.map(header => newRow[header] !== undefined ? newRow[header] : '');
    });

    doc.autoTable({
      head: [tableHeaders],
      body: tableData,
    });
    doc.save('declarantes.pdf');
  };

  const handleExportExcel = () => {
    const filteredColumns = columns.filter(col => col.name !== 'Ações' && selectedColumns.includes(col.name));
    const tableHeaders = filteredColumns.map(col => col.name);
    const tableData = filteredDeclarantes.map(row => {
      const newRow = {};
      filteredColumns.forEach(col => {
        newRow[col.name] = col.selector(row);
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Declarantes");
    XLSX.writeFile(wb, "declarantes.xlsx");
  };

  const filteredDeclarantes = declarantes.filter(declarante =>
    (declarante.NomeDeclarante && declarante.NomeDeclarante.toLowerCase().includes(filter.toLowerCase())) ||
    (declarante.CPF && declarante.CPF.includes(filter))
  );

  const columns = [
    { name: 'Id', selector: row => row.Id, sortable: true, omit: !selectedColumns.includes('Id') },
    { name: 'Código Declarante', selector: row => row.CodigoDeclarante, sortable: true, omit: !selectedColumns.includes('Código Declarante') },
    { name: 'CPF', selector: row => row.CPF, sortable: true, omit: !selectedColumns.includes('CPF') },
    { name: 'Nome', selector: row => row.NomeDeclarante, sortable: true, omit: !selectedColumns.includes('Nome') },
    { name: 'Status', selector: row => row.StatusDeclarante, sortable: true, omit: !selectedColumns.includes('Status') },
    { name: 'Responsável', selector: row => row.usuarios, sortable: true, omit: !selectedColumns.includes('Responsável') },
    { name: 'Sócio', selector: row => row.SocioEmpresa, sortable: true, omit: !selectedColumns.includes('Sócio') },
    { name: 'Empresa', selector: row => row.NomeEmpresa, sortable: true, omit: !selectedColumns.includes('Empresa') },
    { name: 'Entregar DIRPF', selector: row => row.EntregarDIRPF, sortable: true, omit: !selectedColumns.includes('Entregar DIRPF') },
    {
      name: 'Ações',
      cell: row => (
        <>
          <Button variant="info" onClick={() => handleShowModal(row)} title="Visualizar"><i className="material-icons" style={{ fontSize: '16px' }}>visibility</i></Button>{' '}
          <Button variant="warning" onClick={() => handleShowModal(row)} title="Editar"><i className="material-icons" style={{ fontSize: '16px' }}>edit</i></Button>{' '}
          <Button variant="danger" onClick={() => handleShowDeleteModal(row.Id)} title="Remover"><i className="material-icons" style={{ fontSize: '16px' }}>delete</i></Button>
        </>
      ),
      omit: !selectedColumns.includes('Ações')
    },
  ];

  const tableData = {
    columns,
    data: filteredDeclarantes,
  };

  const exportableData = filteredDeclarantes.map(row => {
    const rowData = {};
    selectedColumns.forEach(colName => {
      if (colName !== 'Ações') {
        const col = columns.find(c => c.name === colName);
        if (col && col.selector) {
          rowData[col.name] = row[col.selector] !== undefined ? row[col.selector] : '';
        }
      }
    });
    return rowData;
  });

  return (
    <div className="declarante-container">
      <h2>Declarante</h2>
      <Form.Control
        type="text"
        placeholder="Pesquisar..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="mb-3"
      />
      <Button variant="primary" onClick={handleShowAddModal}>Adicionar Declarante</Button>
      <div className="column-selector">
        {columns.map(column => (
          <Form.Check
            type="checkbox"
            key={column.name}
            label={column.name}
            checked={selectedColumns.includes(column.name)}
            onChange={() => handleColumnChange(column.name)}
          />
        ))}
      </div>
      <div className="button-group">
        <Button variant="secondary" onClick={handlePrint}>Imprimir</Button>
        <Button variant="danger" onClick={handleExportPDF}>PDF</Button>
        <CSVLink data={exportableData} filename={"declarantes.csv"} className="btn btn-primary">CSV</CSVLink>
        <Button variant="success" onClick={handleExportExcel}>Excel</Button>
      </div>
      <div ref={tableRef}>
        <DataTable
          columns={columns}
          data={filteredDeclarantes}
          pagination
          responsive
          highlightOnHover
          striped
          noDataComponent="Não há registros para exibir"
          className="responsive-table"
        />
      </div>

      {currentDeclarante && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Visualizar/Editar Declarante</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleEdit}>
            <Modal.Body>
              <Form.Group controlId="formCodigo">
                <Form.Label>Código do Declarante</Form.Label>
                <Form.Control type="text" name="codigo" defaultValue={currentDeclarante.CodigoDeclarante} readOnly />
              </Form.Group>
              <Form.Group controlId="formCpf">
                <Form.Label>CPF</Form.Label>
                <Form.Control type="text" name="cpf" defaultValue={currentDeclarante.CPF} readOnly />
              </Form.Group>
              <Form.Group controlId="formNome">
                <Form.Label>Nome do Declarante</Form.Label>
                <Form.Control type="text" name="nome" defaultValue={currentDeclarante.NomeDeclarante} readOnly />
              </Form.Group>
              <Form.Group controlId="formCelular">
                <Form.Label>Celular</Form.Label>
                <Form.Control type="text" name="celular" defaultValue={currentDeclarante.Celular} readOnly />
              </Form.Group>
              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" name="email" defaultValue={currentDeclarante.Email} readOnly />
              </Form.Group>
              <Form.Group controlId="formStatus">
                <Form.Label>Status do Declarante</Form.Label>
                <Form.Control as="select" name="status" defaultValue={currentDeclarante.StatusDeclarante}>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formResponsavel">
                <Form.Label>Responsável</Form.Label>
                <Form.Control as="select" name="responsavel" defaultValue={currentDeclarante.Responsavel}>
                  {responsavelOptions.map(responsavel => (
                    <option key={responsavel} value={responsavel}>{responsavel}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formEntregarDirpf">
                <Form.Label>Entregar DIRPF</Form.Label>
                <Form.Control as="select" name="entregar_dirpf" defaultValue={currentDeclarante.EntregarDIRPF}>
                  <option value="Entregar">Entregar</option>
                  <option value="Não Entregar">Não Entregar</option>
                  <option value="A definir">A definir</option>
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formSocioEmpresa">
                <Form.Label>Declarante é sócio de empresa</Form.Label>
                <Form.Control as="select" name="socio" value={isSocio ? 'Sim' : 'Não'} onChange={handleSocioChange}>
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </Form.Control>
                {isSocio && (
                  <div>
                    <Form.Control
                      type="text"
                      placeholder="Buscar sócios..."
                      onChange={handleSocioSearch}
                      className="mt-2"
                    />
                    <div className="autocomplete-options">
                      {autocompleteOptions.map(option => (
                        <div
                          key={option.id}
                          onClick={() => handleSocioSelect(option)}
                          className="autocomplete-option"
                        >
                          {option.RazaoSocial} ({option.Apelido})
                        </div>
                      ))}
                    </div>
                    <div className="selected-socios">
                      {selectedSocios.map(socio => (
                        <div key={socio.id} className="selected-socio">
                          {socio}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Form.Group>
              <Form.Group controlId="formContabilidade">
                <Form.Label>Contabilidade</Form.Label>
                <Form.Control as="select" name="contabilidade" defaultValue={currentDeclarante.Contabilidade}>
                  {contabilidadeOptions.map(contabilidade => (
                    <option key={contabilidade} value={contabilidade}>{contabilidade}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formDataNascimento">
                <Form.Label>Data de Nascimento</Form.Label>
                <Form.Control type="date" name="dataNascimento" defaultValue={currentDeclarante.dataNascimento} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
              <Button variant="primary" type="submit">
                Salvar
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}

      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Adicionar Declarante</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAdd}>
          <Modal.Body>
            <Form.Group controlId="formAddCodigo">
              <Form.Label>Código do Declarante</Form.Label>
              <Form.Control type="text" name="codigo" required />
            </Form.Group>
            <Form.Group controlId="formAddCpf">
              <Form.Label>CPF</Form.Label>
              <Form.Control type="text" name="cpf" required />
            </Form.Group>
            <Form.Group controlId="formAddNome">
              <Form.Label>Nome do Declarante</Form.Label>
              <Form.Control type="text" name="nome" required />
            </Form.Group>
            <Form.Group controlId="formAddCelular">
              <Form.Label>Celular</Form.Label>
              <Form.Control type="text" name="celular" required />
            </Form.Group>
            <Form.Group controlId="formAddEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" required />
            </Form.Group>
            <Form.Group controlId="formAddStatus">
              <Form.Label>Status do Declarante</Form.Label>
              <Form.Control as="select" name="status" required>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formAddResponsavel">
              <Form.Label>Responsável</Form.Label>
              <Form.Control as="select" name="responsavel" required>
                {responsavelOptions.map(responsavel => (
                  <option key={responsavel} value={responsavel}>{responsavel}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formAddEntregarDirpf">
              <Form.Label>Entregar DIRPF</Form.Label>
              <Form.Control as="select" name="entregar_dirpf" required>
                <option value="Entregar">Entregar</option>
                <option value="Não Entregar">Não Entregar</option>
                <option value="A definir">A definir</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formAddSocio">
              <Form.Label>Declarante é sócio de empresa</Form.Label>
              <Form.Control as="select" name="socio" onChange={handleSocioChange} required>
                <option value="Não">Não</option>
                <option value="Sim">Sim</option>
              </Form.Control>
              {isSocio && (
                <div>
                  <Form.Control
                    type="text"
                    placeholder="Buscar sócios..."
                    onChange={handleSocioSearch}
                    className="mt-2"
                  />
                  <div className="autocomplete-options">
                    {autocompleteOptions.map(option => (
                      <div
                        key={option.id}
                        onClick={() => handleSocioSelect(option)}
                        className="autocomplete-option"
                      >
                        {option.RazaoSocial} ({option.Apelido})
                      </div>
                    ))}
                  </div>
                  <div className="selected-socios">
                    {selectedSocios.map(socio => (
                      <div key={socio.id} className="selected-socio">
                        {socio}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Form.Group>
            <Form.Group controlId="formAddContabilidade">
              <Form.Label>Contabilidade</Form.Label>
              <Form.Control as="select" name="contabilidade" required>
                {contabilidadeOptions.map(contabilidade => (
                  <option key={contabilidade} value={contabilidade}>{contabilidade}</option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formAddDataNascimento">
              <Form.Label>Data de Nascimento</Form.Label>
              <Form.Control type="date" name="dataNascimento" required />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseAddModal}>
              Fechar
            </Button>
            <Button variant="primary" type="submit">
              Adicionar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir este declarante?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Excluir
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Declarante;
