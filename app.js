// ----- LISTA PADRÃO DE PRODUTOS (autocomplete) -----
const produtosSugeridos = [
  { nome: 'Arroz', categoria: 'Mercearia' },
  { nome: 'Feijão', categoria: 'Mercearia' },
  { nome: 'Macarrão', categoria: 'Mercearia' },
  { nome: 'Açúcar', categoria: 'Mercearia' },
  { nome: 'Sal', categoria: 'Mercearia' },
  { nome: 'Óleo de soja', categoria: 'Mercearia' },
  { nome: 'Café', categoria: 'Mercearia' },
  { nome: 'Farinha de trigo', categoria: 'Mercearia' },
  { nome: 'Molho de tomate', categoria: 'Mercearia' },

  { nome: 'Leite', categoria: 'Bebidas' },
  { nome: 'Refrigerante', categoria: 'Bebidas' },
  { nome: 'Água mineral', categoria: 'Bebidas' },
  { nome: 'Suco de caixinha', categoria: 'Bebidas' },

  { nome: 'Pão francês', categoria: 'Padaria' },
  { nome: 'Pão de forma', categoria: 'Padaria' },
  { nome: 'Bolo', categoria: 'Padaria' },

  { nome: 'Queijo mussarela', categoria: 'Frios' },
  { nome: 'Presunto', categoria: 'Frios' },
  { nome: 'Mortadela', categoria: 'Frios' },

  { nome: 'Frango inteiro', categoria: 'Carnes' },
  { nome: 'Coxa de frango', categoria: 'Carnes' },
  { nome: 'Peito de frango', categoria: 'Carnes' },
  { nome: 'Carne bovina (patinho)', categoria: 'Carnes' },
  { nome: 'Carne bovina (músculo)', categoria: 'Carnes' },
  { nome: 'Linguiça', categoria: 'Carnes' },

  { nome: 'Tomate', categoria: 'Hortifruti' },
  { nome: 'Cebola', categoria: 'Hortifruti' },
  { nome: 'Alho', categoria: 'Hortifruti' },
  { nome: 'Batata', categoria: 'Hortifruti' },
  { nome: 'Cenoura', categoria: 'Hortifruti' },
  { nome: 'Banana', categoria: 'Hortifruti' },
  { nome: 'Maçã', categoria: 'Hortifruti' },
  { nome: 'Laranja', categoria: 'Hortifruti' },

  { nome: 'Sabão em pó', categoria: 'Limpeza' },
  { nome: 'Detergente', categoria: 'Limpeza' },
  { nome: 'Desinfetante', categoria: 'Limpeza' },
  { nome: 'Amaciante', categoria: 'Limpeza' },
  { nome: 'Água sanitária', categoria: 'Limpeza' },

  { nome: 'Sabonete', categoria: 'Higiene' },
  { nome: 'Shampoo', categoria: 'Higiene' },
  { nome: 'Condicionador', categoria: 'Higiene' },
  { nome: 'Papel higiênico', categoria: 'Higiene' },
  { nome: 'Creme dental', categoria: 'Higiene' },
  { nome: 'Desodorante', categoria: 'Higiene' }
];

// ----- ESTADO GLOBAL -----
const STORAGE_KEY = 'controleComprasMeses_v1';
let meses = [];
let mesAtivoId = null;
let listaAtivaId = null;
let itemEditando = null;
let carteiras = []; // {id, nome}

// ----- ELEMENTOS -----
const selectMes = document.getElementById('selectMes');
const selectLista = document.getElementById('selectLista');
const btnNovoMes = document.getElementById('btnNovoMes');
const btnNovaListaMes = document.getElementById('btnNovaListaMes');
const btnLimparLista = document.getElementById('btnLimparLista');

const usarOrcamento = document.getElementById('usarOrcamento');
const valorOrcamentoInput = document.getElementById('valorOrcamento');

const btnAdicionar = document.getElementById('btnAdicionar');
const tabelaItensBody = document.getElementById('tabelaItensBody');

const totalCompraSpan = document.getElementById('totalCompra');
const summaryItensSpan = document.getElementById('summaryItens');
const ticketMedioSpan = document.getElementById('ticketMedio');
const maiorItemSpan = document.getElementById('maiorItem');
const maiorItemNomeSpan = document.getElementById('maiorItemNome');
const qtdCategoriasSpan = document.getElementById('qtdCategorias');
const infoQuantidadeItensSpan = document.getElementById('infoQuantidadeItens');

const budgetContainer = document.getElementById('budgetContainer');
const budgetBar = document.getElementById('budgetBar');
const budgetStatus = document.getElementById('budgetStatus');

const totalGeralMesesSpan = document.getElementById('totalGeralMeses');
const qtdMesesSpan = document.getElementById('qtdMeses');
const mesTopLabelSpan = document.getElementById('mesTopLabel');
const mesTopValorSpan = document.getElementById('mesTopValor');
const qtdListasTotaisSpan = document.getElementById('qtdListasTotais');

const modalEdicao = document.getElementById('modalEdicao');
const editProduto = document.getElementById('editProduto');
const editCategoria = document.getElementById('editCategoria');
const editCarteira = document.getElementById('editCarteira');
const editQuantidade = document.getElementById('editQuantidade');
const editUnidade = document.getElementById('editUnidade');
const editPreco = document.getElementById('editPreco');
const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
const btnSalvarEdicao = document.getElementById('btnSalvarEdicao');

const inputProduto = document.getElementById('produto');
const inputCategoria = document.getElementById('categoria');
const datalistProdutos = document.getElementById('listaProdutos');
const selectCarteiraItem = document.getElementById('carteiraItem');

const inputNovaCarteiraNome = document.getElementById('novaCarteiraNome');
const btnAdicionarCarteira = document.getElementById('btnAdicionarCarteira');
const listaCarteirasResumo = document.getElementById('listaCarteirasResumo');

const btnExportarBackup = document.getElementById('btnExportarBackup');
const btnImportarBackup = document.getElementById('btnImportarBackup');
const inputImportarBackup = document.getElementById('inputImportarBackup');

// Gráficos
let chartCategorias = null;
let chartTopProdutos = null;
let chartTotaisMeses = null;
let chartCarteiras = null;

// ----- FUNÇÕES AUXILIARES -----
function getMesAtivo() {
  return meses.find(m => m.id === mesAtivoId) || null;
}

function getListaAtiva() {
  const mes = getMesAtivo();
  if (!mes) return null;
  return mes.listas.find(l => l.id === listaAtivaId) || null;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarQuantidade(quantidade, unidade) {
  if (unidade === 'g') {
    return quantidade.toFixed(0) + ' g';
  } else if (unidade === 'kg') {
    return quantidade.toFixed(3).replace('.', ',') + ' kg';
  } else if (unidade === 'L') {
    return quantidade.toFixed(3).replace('.', ',') + ' L';
  } else if (unidade === 'cx') {
    return quantidade.toFixed(2).replace('.', ',') + ' cx';
  } else {
    return quantidade.toFixed(2).replace('.', ',') + ' un';
  }
}

function idMesAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

function labelMes(idMes) {
  const [ano, mes] = idMes.split('-');
  return `${mes}/${ano}`;
}

function inicializarCarteirasPadrao() {
  return [
    { id: 'c1', nome: 'Dinheiro' },
    { id: 'c2', nome: 'Pix' },
    { id: 'c3', nome: 'Crédito' },
    { id: 'c4', nome: 'Débito' },
    { id: 'c5', nome: 'VR' },
    { id: 'c6', nome: 'VA' }
  ];
}

function salvarEstado() {
  const data = {
    meses,
    mesAtivoId,
    listaAtivaId,
    carteiras
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function carregarEstado() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const id = idMesAtual();
    const mesPadrao = {
      id,
      nome: labelMes(id),
      listas: [{
        id: 'lista-1',
        nome: 'Lista padrão',
        itens: [],
        proximoId: 1,
        usarOrcamento: false,
        valorOrcamento: ''
      }]
    };
    meses = [mesPadrao];
    mesAtivoId = id;
    listaAtivaId = mesPadrao.listas[0].id;
    carteiras = inicializarCarteirasPadrao();
    salvarEstado();
    return;
  }

  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data.meses) && data.meses.length > 0) {
      meses = data.meses;
      mesAtivoId = data.mesAtivoId || meses[0].id;
      const mes = getMesAtivo();
      if (mes) {
        listaAtivaId = data.listaAtivaId || (mes.listas[0] && mes.listas[0].id);
      } else {
        listaAtivaId = null;
      }
    } else {
      const id = idMesAtual();
      const mesPadrao = {
        id,
        nome: labelMes(id),
        listas: [{
          id: 'lista-1',
          nome: 'Lista padrão',
          itens: [],
          proximoId: 1,
          usarOrcamento: false,
          valorOrcamento: ''
        }]
      };
      meses = [mesPadrao];
      mesAtivoId = id;
      listaAtivaId = mesPadrao.listas[0].id;
    }

    if (Array.isArray(data.carteiras) && data.carteiras.length > 0) {
      carteiras = data.carteiras;
    } else {
      carteiras = inicializarCarteirasPadrao();
    }
  } catch (e) {
    console.error('Erro ao carregar estado:', e);
    const id = idMesAtual();
    const mesPadrao = {
      id,
      nome: labelMes(id),
      listas: [{
        id: 'lista-1',
        nome: 'Lista padrão',
        itens: [],
        proximoId: 1,
        usarOrcamento: false,
        valorOrcamento: ''
      }]
    };
    meses = [mesPadrao];
    mesAtivoId = id;
    listaAtivaId = mesPadrao.listas[0].id;
    carteiras = inicializarCarteirasPadrao();
    salvarEstado();
  }
}

// ----- AUTOCOMPLETE PRODUTO → CATEGORIA (AJUSTADO) -----
function inicializarListaProdutos() {
  datalistProdutos.innerHTML = '';
  produtosSugeridos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nome;
    datalistProdutos.appendChild(opt);
  });
}

// >>> AQUI o ajuste: atualiza SEMPRE a categoria quando o produto bate com a lista
function atualizarCategoriaPeloProduto() {
  const nomeProduto = (inputProduto.value || '').trim().toLowerCase();
  if (!nomeProduto) return;

  // tenta match exato (ignorando caixa)
  let encontrado = produtosSugeridos.find(
    p => p.nome.toLowerCase() === nomeProduto
  );

  // se não achar exato, tenta incluir (para ajudar na digitação)
  if (!encontrado) {
    encontrado = produtosSugeridos.find(
      p => p.nome.toLowerCase().includes(nomeProduto)
    );
  }

  if (encontrado) {
    // agora SEM condição: sempre atualiza categoria
    inputCategoria.value = encontrado.categoria;
  }
}

// usamos "input" (pega digitação e seleção do datalist)
inputProduto.addEventListener('input', atualizarCategoriaPeloProduto);
// opcional: reforço em blur
inputProduto.addEventListener('blur', atualizarCategoriaPeloProduto);

// ----- CARTEIRAS -----
function atualizarSelectCarteiras() {
  selectCarteiraItem.innerHTML = '';
  editCarteira.innerHTML = '';

  const optNenhumaEdit = document.createElement('option');
  optNenhumaEdit.value = '';
  optNenhumaEdit.textContent = 'Sem carteira';
  editCarteira.appendChild(optNenhumaEdit);

  if (carteiras.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Sem carteiras';
    selectCarteiraItem.appendChild(opt);
    return;
  }

  carteiras.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    selectCarteiraItem.appendChild(opt);

    const opt2 = document.createElement('option');
    opt2.value = c.id;
    opt2.textContent = c.nome;
    editCarteira.appendChild(opt2);
  });
}

function atualizarResumoCarteirasChips() {
  listaCarteirasResumo.innerHTML = '';
  if (carteiras.length === 0) {
    const span = document.createElement('span');
    span.textContent = 'Nenhuma carteira cadastrada.';
    span.classList.add('muted');
    listaCarteirasResumo.appendChild(span);
    return;
  }

  carteiras.forEach(c => {
    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.textContent = c.nome;
    listaCarteirasResumo.appendChild(chip);
  });
}

function adicionarCarteira() {
  const nome = inputNovaCarteiraNome.value.trim();
  if (!nome) {
    alert('Informe o nome da carteira (ex: Pix, Crédito Nubank, VR).');
    return;
  }
  const id = 'c' + Date.now();
  carteiras.push({ id, nome });
  inputNovaCarteiraNome.value = '';
  atualizarSelectCarteiras();
  atualizarResumoCarteirasChips();
  salvarEstado();
}

btnAdicionarCarteira.addEventListener('click', (e) => {
  e.preventDefault();
  adicionarCarteira();
});

inputNovaCarteiraNome.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    adicionarCarteira();
  }
});

function nomeCarteiraPorId(id) {
  const c = carteiras.find(x => x.id === id);
  return c ? c.nome : 'Sem carteira';
}

// ----- UI: MESES E LISTAS -----
function atualizarSelectMeses() {
  selectMes.innerHTML = '';
  meses.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nome || labelMes(m.id);
    if (m.id === mesAtivoId) opt.selected = true;
    selectMes.appendChild(opt);
  });
}

function atualizarSelectListas() {
  const mes = getMesAtivo();
  selectLista.innerHTML = '';
  if (!mes || !Array.isArray(mes.listas) || mes.listas.length === 0) {
    listaAtivaId = null;
    return;
  }
  mes.listas.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.nome;
    if (l.id === listaAtivaId) opt.selected = true;
    selectLista.appendChild(opt);
  });
  if (!listaAtivaId) {
    listaAtivaId = mes.listas[0].id;
  }
}

function carregarListaNaUI() {
  const lista = getListaAtiva();
  if (!lista) {
    tabelaItensBody.innerHTML = '';
    infoQuantidadeItensSpan.textContent = 'Nenhuma lista selecionada.';
    totalCompraSpan.textContent = 'R$ 0,00';
    summaryItensSpan.textContent = '0 itens';
    ticketMedioSpan.textContent = 'R$ 0,00';
    maiorItemSpan.textContent = 'R$ 0,00';
    maiorItemNomeSpan.textContent = '–';
    qtdCategoriasSpan.textContent = '0';
    budgetContainer.style.display = 'none';
    atualizarGraficos();
    atualizarGraficosGerais();
    return;
  }

  usarOrcamento.checked = !!lista.usarOrcamento;
  valorOrcamentoInput.disabled = !lista.usarOrcamento;
  valorOrcamentoInput.value = lista.valorOrcamento || '';

  renderizarTabela();
  atualizarResumo();
}

// ----- RENDERIZAÇÃO LISTA -----
function renderizarTabela() {
  const lista = getListaAtiva();
  if (!lista) return;
  const itens = lista.itens || [];

  tabelaItensBody.innerHTML = '';

  itens.forEach((item, index) => {
    const tr = document.createElement('tr');

    const tdSeq = document.createElement('td');
    tdSeq.textContent = index + 1;

    const tdProduto = document.createElement('td');
    tdProduto.textContent = item.produto;

    const tdCategoria = document.createElement('td');
    const categoriaLabel = item.categoria && item.categoria.trim()
      ? item.categoria.trim()
      : 'Sem categoria';
    const spanTag = document.createElement('span');
    spanTag.classList.add('tag');
    if (!item.categoria) spanTag.classList.add('tag-default');
    spanTag.textContent = categoriaLabel;
    tdCategoria.appendChild(spanTag);

    const tdCarteira = document.createElement('td');
    const carteiraNome = item.carteiraId ? nomeCarteiraPorId(item.carteiraId) : 'Sem carteira';
    const spanCarteira = document.createElement('span');
    spanCarteira.classList.add('tag');
    spanCarteira.textContent = carteiraNome;
    tdCarteira.appendChild(spanCarteira);

    const tdQuantidade = document.createElement('td');
    tdQuantidade.textContent = formatarQuantidade(item.quantidade, item.unidade);

    const tdPreco = document.createElement('td');
    tdPreco.classList.add('right');
    tdPreco.textContent = formatarMoeda(item.preco);

    const tdTotalItem = document.createElement('td');
    tdTotalItem.classList.add('right');
    tdTotalItem.textContent = formatarMoeda(item.totalItem);

    const tdAcao = document.createElement('td');
    tdAcao.classList.add('right');

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.classList.add('btn', 'btn-secondary');
    btnEditar.style.padding = '4px 8px';
    btnEditar.style.fontSize = '0.8rem';
    btnEditar.style.marginRight = '4px';
    btnEditar.addEventListener('click', () => abrirEditor(item.id));
    tdAcao.appendChild(btnEditar);

    const btnRemover = document.createElement('button');
    btnRemover.textContent = 'Excluir';
    btnRemover.classList.add('btn', 'btn-outline');
    btnRemover.style.padding = '4px 8px';
    btnRemover.style.fontSize = '0.8rem';
    btnRemover.addEventListener('click', () => removerItem(item.id));
    tdAcao.appendChild(btnRemover);

    tr.appendChild(tdSeq);
    tr.appendChild(tdProduto);
    tr.appendChild(tdCategoria);
    tr.appendChild(tdCarteira);
    tr.appendChild(tdQuantidade);
    tr.appendChild(tdPreco);
    tr.appendChild(tdTotalItem);
    tr.appendChild(tdAcao);

    tabelaItensBody.appendChild(tr);
  });

  if (itens.length === 0) {
    infoQuantidadeItensSpan.textContent = 'Nenhum item adicionado ainda.';
  } else if (itens.length === 1) {
    infoQuantidadeItensSpan.textContent = '1 item na lista.';
  } else {
    infoQuantidadeItensSpan.textContent = `${itens.length} itens na lista.`;
  }
}

function atualizarResumo() {
  const lista = getListaAtiva();
  if (!lista) return;

  const itens = lista.itens || [];
  const total = itens.reduce((soma, item) => soma + item.totalItem, 0);

  totalCompraSpan.textContent = formatarMoeda(total);
  summaryItensSpan.textContent = `${itens.length} item${itens.length === 1 ? '' : 's'}`;

  const ticketMedio = itens.length > 0 ? total / itens.length : 0;
  ticketMedioSpan.textContent = formatarMoeda(ticketMedio);

  if (itens.length > 0) {
    const maior = itens.reduce((acc, item) =>
      item.totalItem > acc.totalItem ? item : acc, itens[0]);
    maiorItemSpan.textContent = formatarMoeda(maior.totalItem);
    maiorItemNomeSpan.textContent = maior.produto;
  } else {
    maiorItemSpan.textContent = 'R$ 0,00';
    maiorItemNomeSpan.textContent = '–';
  }

  const categoriasSet = new Set(
    itens.map(i => (i.categoria && i.categoria.trim()) ? i.categoria.trim() : 'Sem categoria')
  );
  qtdCategoriasSpan.textContent = itens.length === 0 ? 0 : categoriasSet.size;

  // orçamento
  if (lista.usarOrcamento && lista.valorOrcamento !== '') {
    const orcamento = parseFloat(String(lista.valorOrcamento).replace(',', '.')) || 0;
    if (orcamento > 0) {
      budgetContainer.style.display = 'block';
      const perc = Math.min(100, (total / orcamento) * 100);
      budgetBar.style.width = perc.toFixed(1) + '%';

      const diferenca = orcamento - total;
      if (diferenca > 0) {
        budgetStatus.textContent =
          `Você ainda pode gastar ${formatarMoeda(diferenca)} (${perc.toFixed(1)}% do orçamento utilizado).`;
        budgetStatus.className = 'budget-status budget-ok';
      } else if (diferenca === 0) {
        budgetStatus.textContent =
          `Você atingiu exatamente o orçamento (${perc.toFixed(1)}% utilizado).`;
        budgetStatus.className = 'budget-status budget-alerta';
      } else {
        budgetStatus.textContent =
          `Você ultrapassou o orçamento em ${formatarMoeda(Math.abs(diferenca))} (${perc.toFixed(1)}% do orçamento).`;
        budgetStatus.className = 'budget-status budget-estourado';
      }
    } else {
      budgetContainer.style.display = 'none';
    }
  } else {
    budgetContainer.style.display = 'none';
  }

  atualizarGraficos();
  atualizarGraficosGerais();
  salvarEstado();
}

// ----- GRÁFICOS DA LISTA -----
function atualizarGraficos() {
  const lista = getListaAtiva();
  const itens = lista ? (lista.itens || []) : [];

  // Gastos por categoria
  const gastosPorCategoria = {};
  itens.forEach(item => {
    const cat = (item.categoria && item.categoria.trim()) ? item.categoria.trim() : 'Sem categoria';
    gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + item.totalItem;
  });

  const categorias = Object.keys(gastosPorCategoria);
  const valoresCategorias = Object.values(gastosPorCategoria);

  const ctxCat = document.getElementById('chartCategorias').getContext('2d');
  if (chartCategorias) chartCategorias.destroy();
  chartCategorias = new Chart(ctxCat, {
    type: 'doughnut',
    data: {
      labels: categorias,
      datasets: [{ data: valoresCategorias }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#111827', font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${formatarMoeda(value)}`;
            }
          }
        }
      }
    }
  });

  // Top produtos
  const itensOrdenados = [...itens]
    .sort((a, b) => b.totalItem - a.totalItem)
    .slice(0, 5);
  const labelsTop = itensOrdenados.map(i => i.produto);
  const valoresTop = itensOrdenados.map(i => i.totalItem);

  const ctxTop = document.getElementById('chartTopProdutos').getContext('2d');
  if (chartTopProdutos) chartTopProdutos.destroy();
  chartTopProdutos = new Chart(ctxTop, {
    type: 'bar',
    data: {
      labels: labelsTop,
      datasets: [{ data: valoresTop }]
    },
    options: {
      scales: {
        x: { ticks: { color: '#111827', font: { size: 11 } } },
        y: {
          ticks: {
            color: '#111827',
            font: { size: 11 },
            callback: (value) => formatarMoeda(value)
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatarMoeda(context.raw || 0)
          }
        }
      }
    }
  });
}

// ----- GRÁFICOS GERAIS (MÊS + CARTEIRA) -----
function atualizarGraficosGerais() {
  const labelsMes = [];
  const valoresMes = [];
  let totalGeral = 0;
  let qtdListasTotais = 0;
  const totaisCarteiras = {}; // idCarteira -> valor

  meses.forEach(m => {
    let totalMes = 0;
    (m.listas || []).forEach(l => {
      qtdListasTotais++;
      (l.itens || []).forEach(item => {
        totalMes += item.totalItem;

        const idCarteira = item.carteiraId || 'sem';
        totaisCarteiras[idCarteira] = (totaisCarteiras[idCarteira] || 0) + item.totalItem;
      });
    });
    labelsMes.push(m.nome || labelMes(m.id));
    valoresMes.push(totalMes);
    totalGeral += totalMes;
  });

  totalGeralMesesSpan.textContent = formatarMoeda(totalGeral);
  qtdMesesSpan.textContent = meses.length;
  qtdListasTotaisSpan.textContent = qtdListasTotais;

  if (meses.length > 0) {
    let idxTop = 0;
    let maxVal = valoresMes[0] || 0;
    for (let i = 1; i < valoresMes.length; i++) {
      if (valoresMes[i] > maxVal) {
        maxVal = valoresMes[i];
        idxTop = i;
      }
    }
    mesTopLabelSpan.textContent = labelsMes[idxTop];
    mesTopValorSpan.textContent = formatarMoeda(maxVal);
  } else {
    mesTopLabelSpan.textContent = '–';
    mesTopValorSpan.textContent = 'R$ 0,00';
  }

  // gráfico por mês
  const ctxMes = document.getElementById('chartTotaisMeses').getContext('2d');
  if (chartTotaisMeses) chartTotaisMeses.destroy();
  chartTotaisMeses = new Chart(ctxMes, {
    type: 'bar',
    data: {
      labels: labelsMes,
      datasets: [{ data: valoresMes }]
    },
    options: {
      scales: {
        x: { ticks: { color: '#111827', font: { size: 11 } } },
        y: {
          ticks: {
            color: '#111827',
            font: { size: 11 },
            callback: (value) => formatarMoeda(value)
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatarMoeda(context.raw || 0)
          }
        }
      }
    }
  });

  // gráfico por carteira
  const labelsCarteiras = [];
  const valoresCarteiras = [];

  Object.keys(totaisCarteiras).forEach(id => {
    if (id === 'sem') {
      labelsCarteiras.push('Sem carteira');
    } else {
      labelsCarteiras.push(nomeCarteiraPorId(id));
    }
    valoresCarteiras.push(totaisCarteiras[id]);
  });

  const ctxCarteiras = document.getElementById('chartCarteiras').getContext('2d');
  if (chartCarteiras) chartCarteiras.destroy();
  chartCarteiras = new Chart(ctxCarteiras, {
    type: 'bar',
    data: {
      labels: labelsCarteiras,
      datasets: [{ data: valoresCarteiras }]
    },
    options: {
      scales: {
        x: { ticks: { color: '#111827', font: { size: 11 } } },
        y: {
          ticks: {
            color: '#111827',
            font: { size: 11 },
            callback: (value) => formatarMoeda(value)
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatarMoeda(context.raw || 0)
          }
        }
      }
    }
  });
}

// ----- AÇÕES: ITENS -----
function adicionarItem() {
  const lista = getListaAtiva();
  if (!lista) return;

  const produto = inputProduto.value.trim();
  const categoria = inputCategoria.value.trim();
  const carteiraId = selectCarteiraItem.value || null;
  const quantidadeInput = document.getElementById('quantidade').value;
  const precoInput = document.getElementById('preco').value;
  const unidade = document.getElementById('unidade').value;

  const quantidade = parseFloat(String(quantidadeInput).replace(',', '.'));
  const preco = parseFloat(String(precoInput).replace(',', '.'));

  if (!produto) {
    alert('Informe o nome do produto.');
    return;
  }
  if (isNaN(quantidade) || quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }
  if (isNaN(preco) || preco <= 0) {
    alert('Informe um preço válido.');
    return;
  }

  let totalItem;
  if (unidade === 'g') {
    totalItem = (quantidade / 1000) * preco;
  } else {
    totalItem = quantidade * preco;
  }

  const item = {
    id: lista.proximoId++,
    produto,
    categoria,
    quantidade,
    unidade,
    preco,
    totalItem,
    carteiraId
  };

  lista.itens.push(item);

  inputProduto.value = '';
  inputCategoria.value = '';
  document.getElementById('quantidade').value = '';
  document.getElementById('preco').value = '';
  inputProduto.focus();

  renderizarTabela();
  atualizarResumo();
}

function removerItem(id) {
  const lista = getListaAtiva();
  if (!lista) return;

  lista.itens = lista.itens.filter(i => i.id !== id);
  renderizarTabela();
  atualizarResumo();
}

function limparLista() {
  const lista = getListaAtiva();
  if (!lista) return;

  if (!confirm(`Limpar todos os itens e o orçamento da lista "${lista.nome}"?`)) return;

  lista.itens = [];
  lista.proximoId = 1;
  lista.usarOrcamento = false;
  lista.valorOrcamento = '';

  carregarListaNaUI();
  salvarEstado();
}

// ----- EDIÇÃO DE ITEM -----
function abrirEditor(id) {
  const lista = getListaAtiva();
  if (!lista) return;

  const item = lista.itens.find(i => i.id === id);
  if (!item) return;

  itemEditando = item;

  editProduto.value = item.produto;
  editCategoria.value = item.categoria || '';
  editQuantidade.value = item.quantidade;
  editUnidade.value = item.unidade;
  editPreco.value = item.preco;

  // preencher carteiras
  editCarteira.innerHTML = '';
  const optNenhuma = document.createElement('option');
  optNenhuma.value = '';
  optNenhuma.textContent = 'Sem carteira';
  editCarteira.appendChild(optNenhuma);

  carteiras.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    editCarteira.appendChild(opt);
  });

  editCarteira.value = item.carteiraId || '';

  modalEdicao.style.display = 'flex';
}

function fecharEditor() {
  modalEdicao.style.display = 'none';
  itemEditando = null;
}

btnCancelarEdicao.addEventListener('click', fecharEditor);

btnSalvarEdicao.addEventListener('click', () => {
  if (!itemEditando) return;

  const prod = editProduto.value.trim();
  const cat = editCategoria.value.trim();
  const qtd = parseFloat(String(editQuantidade.value).replace(',', '.'));
  const und = editUnidade.value;
  const preco = parseFloat(String(editPreco.value).replace(',', '.'));
  const carteiraId = editCarteira.value || null;

  if (!prod || isNaN(qtd) || qtd <= 0 || isNaN(preco) || preco <= 0) {
    alert('Preencha os campos corretamente.');
    return;
  }

  let totalItem = und === 'g'
    ? (qtd / 1000) * preco
    : qtd * preco;

  itemEditando.produto = prod;
  itemEditando.categoria = cat;
  itemEditando.quantidade = qtd;
  itemEditando.unidade = und;
  itemEditando.preco = preco;
  itemEditando.totalItem = totalItem;
  itemEditando.carteiraId = carteiraId;

  renderizarTabela();
  atualizarResumo();
  fecharEditor();
});

modalEdicao.addEventListener('click', (e) => {
  if (e.target === modalEdicao) fecharEditor();
});

// ----- EVENTOS GERAIS -----
usarOrcamento.addEventListener('change', () => {
  const lista = getListaAtiva();
  if (!lista) return;

  lista.usarOrcamento = usarOrcamento.checked;
  if (!lista.usarOrcamento) {
    lista.valorOrcamento = '';
    valorOrcamentoInput.value = '';
  }
  valorOrcamentoInput.disabled = !lista.usarOrcamento;
  atualizarResumo();
});

valorOrcamentoInput.addEventListener('input', () => {
  const lista = getListaAtiva();
  if (!lista) return;
  lista.valorOrcamento = valorOrcamentoInput.value;
  atualizarResumo();
});

btnAdicionar.addEventListener('click', (e) => {
  e.preventDefault();
  adicionarItem();
});

document.getElementById('preco').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    adicionarItem();
  }
});

btnLimparLista.addEventListener('click', (e) => {
  e.preventDefault();
  limparLista();
});

btnNovoMes.addEventListener('click', () => {
  const hoje = new Date();
  const anoDefault = hoje.getFullYear();
  const mesDefault = String(hoje.getMonth() + 1).padStart(2, '0');
  const input = prompt('Informe o mês/ano no formato MM/AAAA:', `${mesDefault}/${anoDefault}`);
  if (!input) return;

  const match = input.match(/^(\d{2})\/(\d{4})$/);
  if (!match) {
    alert('Formato inválido. Use MM/AAAA, por exemplo 11/2025.');
    return;
  }

  const mes = match[1];
  const ano = match[2];
  const id = `${ano}-${mes}`;
  if (meses.some(m => m.id === id)) {
    alert('Esse mês já existe. Selecione no campo de mês.');
    return;
  }

  const novoMes = {
    id,
    nome: `${mes}/${ano}`,
    listas: [{
      id: 'lista-1',
      nome: 'Lista padrão',
      itens: [],
      proximoId: 1,
      usarOrcamento: false,
      valorOrcamento: ''
    }]
  };
  meses.push(novoMes);
  mesAtivoId = id;
  listaAtivaId = novoMes.listas[0].id;
  atualizarSelectMeses();
  atualizarSelectListas();
  carregarListaNaUI();
  salvarEstado();
});

btnNovaListaMes.addEventListener('click', () => {
  const mes = getMesAtivo();
  if (!mes) return;
  const nome = prompt('Nome da nova lista para este mês:', 'Nova lista');
  if (!nome || !nome.trim()) return;

  const id = 'lista-' + Date.now();
  const novaLista = {
    id,
    nome: nome.trim(),
    itens: [],
    proximoId: 1,
    usarOrcamento: false,
    valorOrcamento: ''
  };
  mes.listas.push(novaLista);
  listaAtivaId = id;
  atualizarSelectListas();
  carregarListaNaUI();
  salvarEstado();
});

selectMes.addEventListener('change', () => {
  mesAtivoId = selectMes.value;
  const mes = getMesAtivo();
  if (mes && mes.listas.length > 0) {
    listaAtivaId = mes.listas[0].id;
  } else {
    listaAtivaId = null;
  }
  atualizarSelectListas();
  carregarListaNaUI();
  salvarEstado();
});

selectLista.addEventListener('change', () => {
  listaAtivaId = selectLista.value;
  carregarListaNaUI();
  salvarEstado();
});

// ----- BACKUP -----
function exportarBackup() {
  salvarEstado();
  const raw = localStorage.getItem(STORAGE_KEY) ||
    JSON.stringify({ meses, mesAtivoId, listaAtivaId, carteiras });
  const blob = new Blob([raw], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const hoje = new Date().toISOString().slice(0, 10);
  const a = document.createElement('a');
  a.href = url;
  a.download = `compras-backup-${hoje}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importarBackup(arquivo) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || !Array.isArray(data.meses)) {
        alert('Arquivo de backup inválido.');
        return;
      }
      meses = data.meses;
      mesAtivoId = data.mesAtivoId || (meses[0] && meses[0].id);
      const mes = getMesAtivo();
      if (mes && mes.listas.length > 0) {
        listaAtivaId = data.listaAtivaId || mes.listas[0].id;
      } else {
        listaAtivaId = null;
      }

      if (Array.isArray(data.carteiras) && data.carteiras.length > 0) {
        carteiras = data.carteiras;
      } else {
        carteiras = inicializarCarteirasPadrao();
      }

      salvarEstado();
      atualizarSelectMeses();
      atualizarSelectListas();
      atualizarSelectCarteiras();
      atualizarResumoCarteirasChips();
      carregarListaNaUI();
      alert('Backup importado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao ler o arquivo de backup.');
    }
  };
  reader.readAsText(arquivo, 'utf-8');
}

btnExportarBackup.addEventListener('click', () => {
  exportarBackup();
});

btnImportarBackup.addEventListener('click', () => {
  inputImportarBackup.click();
});

inputImportarBackup.addEventListener('change', () => {
  const arquivo = inputImportarBackup.files[0];
  if (!arquivo) return;
  importarBackup(arquivo);
  inputImportarBackup.value = '';
});

// ----- INICIALIZAÇÃO -----
inicializarListaProdutos();
carregarEstado();
atualizarSelectMeses();
atualizarSelectListas();
atualizarSelectCarteiras();
atualizarResumoCarteirasChips();
carregarListaNaUI();
