// ====== ESTADO GLOBAL ======
const STORAGE_KEY = 'controleComprasMeses_v2';

let meses = [];       // [{id, nome, listas:[{id, nome, itens, proximoId, usarOrcamento, valorOrcamento}]}]
let mesAtivoId = null;
let listaAtivaId = null;
let carteiras = [];   // [{id, nome}]
let itemEditando = null;

// Sugestões de produtos (produto -> categoria)
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

// Chart.js instances
let chartQtdCategoria = null;
let chartValorCategoria = null;
let chartTotaisMeses = null;
let chartCarteiras = null;

// ====== HELPERS ======
function idMesAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

function labelMes(id) {
  const [ano, mes] = id.split('-');
  return `${mes}/${ano}`;
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

function formatarQuantidade(qtd, unidade) {
  if (unidade === 'g') return `${qtd.toFixed(0)} g`;
  if (unidade === 'kg') return `${qtd.toFixed(3).replace('.', ',')} kg`;
  if (unidade === 'L') return `${qtd.toFixed(3).replace('.', ',')} L`;
  if (unidade === 'cx') return `${qtd.toFixed(2).replace('.', ',')} cx`;
  return `${qtd.toFixed(2).replace('.', ',')} un`;
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
      if (mes && mes.listas.length > 0) {
        listaAtivaId = data.listaAtivaId || mes.listas[0].id;
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

function getMesAtivo() {
  return meses.find(m => m.id === mesAtivoId) || null;
}

function getListaAtiva() {
  const mes = getMesAtivo();
  if (!mes) return null;
  return mes.listas.find(l => l.id === listaAtivaId) || null;
}

function nomeCarteiraPorId(id) {
  const c = carteiras.find(x => x.id === id);
  return c ? c.nome : 'Sem carteira';
}

// ====== DOM READY ======
document.addEventListener('DOMContentLoaded', () => {
  // Tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`).classList.add('active');

      // Ao trocar de aba, atualiza resumos/gráficos
      if (tabId === 'resumo') {
        atualizarTelaResumo();
      }
    });
  });

  // Inicializar dados
  carregarEstado();
  inicializarAutocompleteProdutos();
  inicializarUI();
});

// ====== UI: AUTOCOMPLETE (PRODUTO -> CATEGORIA) ======
function inicializarAutocompleteProdutos() {
  const datalistProdutos = document.getElementById('listaProdutos');
  datalistProdutos.innerHTML = '';
  produtosSugeridos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nome;
    datalistProdutos.appendChild(opt);
  });

  const inputProduto = document.getElementById('produto');
  const inputCategoria = document.getElementById('categoria');

  function sugerirCategoria() {
    const texto = inputProduto.value.trim().toLowerCase();
    if (!texto) return;
    // Tenta match exato primeiro
    let encontrado = produtosSugeridos.find(
      p => p.nome.toLowerCase() === texto
    );
    // Se não achar, tenta começa com
    if (!encontrado) {
      const candidatos = produtosSugeridos.filter(
        p => p.nome.toLowerCase().startsWith(texto)
      );
      if (candidatos.length === 1) {
        encontrado = candidatos[0];
      }
    }
    if (encontrado && !inputCategoria.value.trim()) {
      inputCategoria.value = encontrado.categoria;
    }
  }

  // BUG AJUSTADO: usamos 'input' e 'change' para garantir que a categoria atualize
  inputProduto.addEventListener('input', sugerirCategoria);
  inputProduto.addEventListener('change', sugerirCategoria);
  inputProduto.addEventListener('blur', sugerirCategoria);
}

// ====== UI INICIAL ======
function inicializarUI() {
  // Seletores de mês
  atualizarSelectMeses();

  // Seletores de listas (dependem do mês ativo)
  atualizarSelectListas();

  // Carteiras
  atualizarSelectCarteiras();
  atualizarChipsCarteiras();

  // Eventos de cadastro de meses/listas/carteiras
  configurarEventosCadastro();

  // Eventos da aba Comprando
  configurarEventosComprando();

  // Eventos resumo, backup e edição
  configurarEventosResumo();
  configurarEventosModal();

  // Carregar visão inicial (comprando/resumo)
  atualizarTelaComprando();
  atualizarTelaResumo();
}

// ====== SELECTS DE MÊS / LISTA (SINCRONIZADOS NAS 3 ABAS) ======
function atualizarSelectMeses() {
  const selectsMes = [
    document.getElementById('selectMesCadastro'),
    document.getElementById('selectMesListas'),
    document.getElementById('selectMesComprando'),
    document.getElementById('selectMesResumo')
  ];

  selectsMes.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '';
    meses.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.nome || labelMes(m.id);
      if (m.id === mesAtivoId) opt.selected = true;
      sel.appendChild(opt);
    });
  });
}

function atualizarSelectListas() {
  const mes = getMesAtivo();
  const selectsLista = [
    document.getElementById('selectListaCadastro'),
    document.getElementById('selectListaComprando'),
    document.getElementById('selectListaResumo')
  ];

  selectsLista.forEach(sel => {
    if (!sel) return;
    sel.innerHTML = '';
    if (!mes || !Array.isArray(mes.listas) || mes.listas.length === 0) {
      listaAtivaId = null;
      return;
    }
    mes.listas.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.textContent = l.nome;
      if (l.id === listaAtivaId) opt.selected = true;
      sel.appendChild(opt);
    });
    if (!listaAtivaId) {
      listaAtivaId = mes.listas[0].id;
    }
  });
}

// ====== CARTEIRAS (UI) ======
function atualizarSelectCarteiras() {
  const selItem = document.getElementById('carteiraItem');
  const selEdit = document.getElementById('editCarteira');

  const preencher = (select) => {
    select.innerHTML = '';
    const optNenhuma = document.createElement('option');
    optNenhuma.value = '';
    optNenhuma.textContent = 'Sem carteira';
    select.appendChild(optNenhuma);

    carteiras.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nome;
      select.appendChild(opt);
    });
  };

  preencher(selItem);
  preencher(selEdit);
}

function atualizarChipsCarteiras() {
  const cont = document.getElementById('listaCarteirasResumo');
  cont.innerHTML = '';
  if (!carteiras.length) {
    const span = document.createElement('span');
    span.textContent = 'Nenhuma carteira cadastrada.';
    span.classList.add('helper-text');
    cont.appendChild(span);
    return;
  }
  carteiras.forEach(c => {
    const chip = document.createElement('div');
    chip.classList.add('chip');
    chip.textContent = c.nome;
    cont.appendChild(chip);
  });
}

// ====== EVENTOS: CADASTRO (TAB 1) ======
function configurarEventosCadastro() {
  const novoMesInput = document.getElementById('novoMesInput');
  const btnAdicionarMes = document.getElementById('btnAdicionarMes');

  const novaListaInput = document.getElementById('novaListaInput');
  const btnAdicionarLista = document.getElementById('btnAdicionarLista');

  const selectMesCadastro = document.getElementById('selectMesCadastro');
  const selectMesListas = document.getElementById('selectMesListas');
  const selectListaCadastro = document.getElementById('selectListaCadastro');

  const inputNovaCarteiraNome = document.getElementById('novaCarteiraNome');
  const btnAdicionarCarteira = document.getElementById('btnAdicionarCarteira');

  // Escolher mês (Cadastro / Listas) sincroniza estado global
  selectMesCadastro.addEventListener('change', (e) => {
    mesAtivoId = e.target.value;
    const mes = getMesAtivo();
    if (mes && mes.listas.length > 0) {
      listaAtivaId = mes.listas[0].id;
    } else {
      listaAtivaId = null;
    }
    atualizarSelectMeses();
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  selectMesListas.addEventListener('change', (e) => {
    mesAtivoId = e.target.value;
    const mes = getMesAtivo();
    if (mes && mes.listas.length > 0) {
      listaAtivaId = mes.listas[0].id;
    } else {
      listaAtivaId = null;
    }
    atualizarSelectMeses();
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  selectListaCadastro.addEventListener('change', (e) => {
    listaAtivaId = e.target.value;
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  // Adicionar mês
  btnAdicionarMes.addEventListener('click', () => {
    const val = novoMesInput.value.trim();
    if (!val) return;
    const match = val.match(/^(\d{2})\/(\d{4})$/);
    if (!match) {
      alert('Informe o mês no formato MM/AAAA (ex: 03/2026).');
      return;
    }
    const mes = match[1];
    const ano = match[2];
    const id = `${ano}-${mes}`;
    if (meses.some(m => m.id === id)) {
      alert('Esse mês já existe.');
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
    novoMesInput.value = '';
    atualizarSelectMeses();
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  // Adicionar lista
  btnAdicionarLista.addEventListener('click', () => {
    const nome = novaListaInput.value.trim();
    if (!nome) return;
    const mes = getMesAtivo();
    if (!mes) return;
    const nova = {
      id: 'lista-' + Date.now(),
      nome,
      itens: [],
      proximoId: 1,
      usarOrcamento: false,
      valorOrcamento: ''
    };
    mes.listas.push(nova);
    listaAtivaId = nova.id;
    novaListaInput.value = '';
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  // Adicionar carteira
  function addCarteira() {
    const nome = inputNovaCarteiraNome.value.trim();
    if (!nome) return;
    const c = { id: 'c' + Date.now(), nome };
    carteiras.push(c);
    inputNovaCarteiraNome.value = '';
    atualizarSelectCarteiras();
    atualizarChipsCarteiras();
    salvarEstado();
  }

  btnAdicionarCarteira.addEventListener('click', addCarteira);
  inputNovaCarteiraNome.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCarteira();
    }
  });
}

// ====== EVENTOS: COMPRANDO (TAB 2) ======
function configurarEventosComprando() {
  const selectMesComprando = document.getElementById('selectMesComprando');
  const selectListaComprando = document.getElementById('selectListaComprando');
  const usarOrcamento = document.getElementById('usarOrcamento');
  const valorOrcamentoInput = document.getElementById('valorOrcamento');

  const btnAdicionarItem = document.getElementById('btnAdicionarItem');
  const btnLimparLista = document.getElementById('btnLimparLista');
  const precoInput = document.getElementById('preco');

  // mudar mês na aba comprando
  selectMesComprando.addEventListener('change', (e) => {
    mesAtivoId = e.target.value;
    const mes = getMesAtivo();
    if (mes && mes.listas.length > 0) {
      listaAtivaId = mes.listas[0].id;
    } else {
      listaAtivaId = null;
    }
    atualizarSelectMeses();
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  // mudar lista na aba comprando
  selectListaComprando.addEventListener('change', (e) => {
    listaAtivaId = e.target.value;
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  // Orçamento
  usarOrcamento.addEventListener('change', () => {
    const lista = getListaAtiva();
    if (!lista) return;
    lista.usarOrcamento = usarOrcamento.checked;
    if (!lista.usarOrcamento) {
      lista.valorOrcamento = '';
      valorOrcamentoInput.value = '';
      valorOrcamentoInput.disabled = true;
    } else {
      valorOrcamentoInput.disabled = false;
    }
    salvarEstado();
    atualizarTelaComprando();
    atualizarTelaResumo();
  });

  valorOrcamentoInput.addEventListener('input', () => {
    const lista = getListaAtiva();
    if (!lista) return;
    lista.valorOrcamento = valorOrcamentoInput.value;
    salvarEstado();
    atualizarTelaComprando();
    atualizarTelaResumo();
  });

  // Adicionar item
  btnAdicionarItem.addEventListener('click', (e) => {
    e.preventDefault();
    adicionarItemNaLista();
  });

  // Enter no campo preço
  precoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarItemNaLista();
    }
  });

  // Limpar lista
  btnLimparLista.addEventListener('click', () => {
    const lista = getListaAtiva();
    if (!lista) return;
    if (!confirm(`Limpar todos os itens da lista "${lista.nome}"?`)) return;
    lista.itens = [];
    lista.proximoId = 1;
    lista.usarOrcamento = false;
    lista.valorOrcamento = '';
    salvarEstado();
    atualizarTelaComprando();
    atualizarTelaResumo();
  });
}

function adicionarItemNaLista() {
  const lista = getListaAtiva();
  if (!lista) {
    alert('Selecione um mês e uma lista para lançar os itens.');
    return;
  }

  const produtoInput = document.getElementById('produto');
  const categoriaInput = document.getElementById('categoria');
  const carteiraSelect = document.getElementById('carteiraItem');
  const quantidadeInput = document.getElementById('quantidade');
  const unidadeSelect = document.getElementById('unidade');
  const precoInput = document.getElementById('preco');

  const produto = produtoInput.value.trim();
  const categoria = categoriaInput.value.trim();
  const carteiraId = carteiraSelect.value || null;
  const quantidade = parseFloat(String(quantidadeInput.value).replace(',', '.'));
  const preco = parseFloat(String(precoInput.value).replace(',', '.'));
  const unidade = unidadeSelect.value;

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

  let total;
  if (unidade === 'g') {
    total = (quantidade / 1000) * preco;
  } else {
    total = quantidade * preco;
  }

  const item = {
    id: lista.proximoId++,
    produto,
    categoria,
    quantidade,
    unidade,
    preco,
    totalItem: total,
    carteiraId
  };

  lista.itens.push(item);

  produtoInput.value = '';
  categoriaInput.value = '';
  quantidadeInput.value = '';
  precoInput.value = '';
  produtoInput.focus();

  salvarEstado();
  atualizarTelaComprando();
  atualizarTelaResumo();
}

// Atualiza textos e orcamento barra na aba Comprando
function atualizarTelaComprando() {
  const lista = getListaAtiva();
  const infoQuantidadeItens = document.getElementById('infoQuantidadeItens');
  const usarOrcamento = document.getElementById('usarOrcamento');
  const valorOrcamentoInput = document.getElementById('valorOrcamento');
  const boxOrcamentoResumo = document.getElementById('boxOrcamentoResumo');
  const orcamentoStatusLinha = document.getElementById('orcamentoStatusLinha');
  const budgetBar = document.getElementById('budgetBar');

  if (!lista) {
    infoQuantidadeItens.textContent = 'Nenhuma lista selecionada.';
    usarOrcamento.checked = false;
    valorOrcamentoInput.value = '';
    valorOrcamentoInput.disabled = true;
    boxOrcamentoResumo.classList.add('hidden');
    return;
  }

  const quantidadeItens = lista.itens.length;
  if (quantidadeItens === 0) {
    infoQuantidadeItens.textContent = 'Nenhum item lançado ainda.';
  } else if (quantidadeItens === 1) {
    infoQuantidadeItens.textContent = '1 item lançado.';
  } else {
    infoQuantidadeItens.textContent = `${quantidadeItens} itens lançados.`;
  }

  usarOrcamento.checked = !!lista.usarOrcamento;
  valorOrcamentoInput.disabled = !lista.usarOrcamento;
  valorOrcamentoInput.value = lista.valorOrcamento || '';

  const totalLista = lista.itens.reduce((soma, i) => soma + i.totalItem, 0);

  if (lista.usarOrcamento && lista.valorOrcamento) {
    const orc = parseFloat(String(lista.valorOrcamento).replace(',', '.')) || 0;
    if (orc > 0) {
      const perc = Math.min(100, (totalLista / orc) * 100);
      budgetBar.style.width = `${perc.toFixed(1)}%`;

      const diff = orc - totalLista;
      if (diff > 0) {
        orcamentoStatusLinha.textContent =
          `Total atual: ${formatarMoeda(totalLista)} | Limite: ${formatarMoeda(orc)} | Ainda pode gastar ${formatarMoeda(diff)}.`;
      } else if (diff === 0) {
        orcamentoStatusLinha.textContent =
          `Total atual: ${formatarMoeda(totalLista)} | Você atingiu exatamente o limite definido.`;
      } else {
        orcamentoStatusLinha.textContent =
          `Total atual: ${formatarMoeda(totalLista)} | Limite: ${formatarMoeda(orc)} | Ultrapassou em ${formatarMoeda(Math.abs(diff))}.`;
      }
      boxOrcamentoResumo.classList.remove('hidden');
    } else {
      boxOrcamentoResumo.classList.add('hidden');
      budgetBar.style.width = '0%';
    }
  } else {
    boxOrcamentoResumo.classList.add('hidden');
    budgetBar.style.width = '0%';
  }
}

// ====== EVENTOS: RESUMO / BACKUP / EDIÇÃO ======
function configurarEventosResumo() {
  const selectMesResumo = document.getElementById('selectMesResumo');
  const selectListaResumo = document.getElementById('selectListaResumo');
  const btnExportarBackup = document.getElementById('btnExportarBackup');
  const btnImportarBackup = document.getElementById('btnImportarBackup');
  const inputImportarBackup = document.getElementById('inputImportarBackup');

  selectMesResumo.addEventListener('change', (e) => {
    mesAtivoId = e.target.value;
    const mes = getMesAtivo();
    if (mes && mes.listas.length > 0) {
      listaAtivaId = mes.listas[0].id;
    } else {
      listaAtivaId = null;
    }
    atualizarSelectMeses();
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  selectListaResumo.addEventListener('change', (e) => {
    listaAtivaId = e.target.value;
    atualizarSelectListas();
    atualizarTelaComprando();
    atualizarTelaResumo();
    salvarEstado();
  });

  // Backup
  btnExportarBackup.addEventListener('click', () => {
    salvarEstado();
    const raw = localStorage.getItem(STORAGE_KEY);
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
  });

  btnImportarBackup.addEventListener('click', () => {
    inputImportarBackup.click();
  });

  inputImportarBackup.addEventListener('change', () => {
    const file = inputImportarBackup.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data.meses)) {
          alert('Backup inválido.');
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
        atualizarChipsCarteiras();
        atualizarTelaComprando();
        atualizarTelaResumo();
        alert('Backup importado com sucesso.');
      } catch (err) {
        console.error(err);
        alert('Erro ao importar backup.');
      }
    };
    reader.readAsText(file, 'utf-8');
    inputImportarBackup.value = '';
  });
}

// Modal edição
function configurarEventosModal() {
  const modal = document.getElementById('modalEdicao');
  const btnCancelar = document.getElementById('btnCancelarEdicao');
  const btnSalvar = document.getElementById('btnSalvarEdicao');

  btnCancelar.addEventListener('click', () => {
    modal.classList.add('hidden');
    itemEditando = null;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      itemEditando = null;
    }
  });

  btnSalvar.addEventListener('click', () => {
    if (!itemEditando) return;
    const prod = document.getElementById('editProduto').value.trim();
    const cat = document.getElementById('editCategoria').value.trim();
    const q = parseFloat(String(document.getElementById('editQuantidade').value).replace(',', '.'));
    const u = document.getElementById('editUnidade').value;
    const p = parseFloat(String(document.getElementById('editPreco').value).replace(',', '.'));
    const carteiraId = document.getElementById('editCarteira').value || null;

    if (!prod || isNaN(q) || q <= 0 || isNaN(p) || p <= 0) {
      alert('Preencha os campos corretamente.');
      return;
    }

    let total = u === 'g' ? (q / 1000) * p : q * p;

    itemEditando.produto = prod;
    itemEditando.categoria = cat;
    itemEditando.quantidade = q;
    itemEditando.unidade = u;
    itemEditando.preco = p;
    itemEditando.totalItem = total;
    itemEditando.carteiraId = carteiraId;

    salvarEstado();
    atualizarTelaComprando();
    atualizarTelaResumo();
    modal.classList.add('hidden');
    itemEditando = null;
  });
}

// Abrir modal edição a partir da tabela
function abrirEdicaoItem(idItem) {
  const lista = getListaAtiva();
  if (!lista) return;
  const item = lista.itens.find(i => i.id === idItem);
  if (!item) return;
  itemEditando = item;

  document.getElementById('editProduto').value = item.produto;
  document.getElementById('editCategoria').value = item.categoria || '';
  document.getElementById('editQuantidade').value = item.quantidade;
  document.getElementById('editUnidade').value = item.unidade;
  document.getElementById('editPreco').value = item.preco;
  document.getElementById('editCarteira').value = item.carteiraId || '';

  document.getElementById('modalEdicao').classList.remove('hidden');
}

// ====== TELA RESUMO (TAB 3) ======
function atualizarTelaResumo() {
  atualizarTabelaResumo();
  atualizarGraficosResumo();
}

function atualizarTabelaResumo() {
  const lista = getListaAtiva();
  const tbody = document.getElementById('tabelaItensResumoBody');
  const totalSpan = document.getElementById('totalListaResumo');
  const qtdSpan = document.getElementById('qtdItensResumo');
  const ticketSpan = document.getElementById('ticketMedioResumo');
  const maiorSpan = document.getElementById('maiorItemResumo');
  const maiorNomeSpan = document.getElementById('maiorItemNomeResumo');

  tbody.innerHTML = '';

  if (!lista) {
    totalSpan.textContent = 'R$ 0,00';
    qtdSpan.textContent = '0';
    ticketSpan.textContent = 'R$ 0,00';
    maiorSpan.textContent = 'R$ 0,00';
    maiorNomeSpan.textContent = '–';
    return;
  }

  const itens = lista.itens;
  itens.forEach((item, index) => {
    const tr = document.createElement('tr');

    const tdSeq = document.createElement('td');
    tdSeq.textContent = index + 1;

    const tdProd = document.createElement('td');
    tdProd.textContent = item.produto;

    const tdCat = document.createElement('td');
    tdCat.textContent = item.categoria || '';

    const tdCart = document.createElement('td');
    tdCart.textContent = item.carteiraId ? nomeCarteiraPorId(item.carteiraId) : 'Sem carteira';

    const tdQtd = document.createElement('td');
    tdQtd.textContent = formatarQuantidade(item.quantidade, item.unidade);

    const tdVlUn = document.createElement('td');
    tdVlUn.textContent = formatarMoeda(item.preco);

    const tdVlTot = document.createElement('td');
    tdVlTot.textContent = formatarMoeda(item.totalItem);

    const tdAcoes = document.createElement('td');
    tdAcoes.classList.add('actions');

    const btnEditar = document.createElement('button');
    btnEditar.textContent = 'Editar';
    btnEditar.className = 'btn secondary small';
    btnEditar.addEventListener('click', () => abrirEdicaoItem(item.id));

    const btnExcluir = document.createElement('button');
    btnExcluir.textContent = 'Excluir';
    btnExcluir.className = 'btn secondary small';
    btnExcluir.style.marginLeft = '4px';
    btnExcluir.addEventListener('click', () => {
      if (!confirm('Remover este item?')) return;
      lista.itens = lista.itens.filter(i => i.id !== item.id);
      salvarEstado();
      atualizarTelaComprando();
      atualizarTelaResumo();
    });

    tdAcoes.appendChild(btnEditar);
    tdAcoes.appendChild(btnExcluir);

    tr.appendChild(tdSeq);
    tr.appendChild(tdProd);
    tr.appendChild(tdCat);
    tr.appendChild(tdCart);
    tr.appendChild(tdQtd);
    tr.appendChild(tdVlUn);
    tr.appendChild(tdVlTot);
    tr.appendChild(tdAcoes);

    tbody.appendChild(tr);
  });

  const total = itens.reduce((s, i) => s + i.totalItem, 0);
  const qtd = itens.length;
  const ticket = qtd > 0 ? total / qtd : 0;

  totalSpan.textContent = formatarMoeda(total);
  qtdSpan.textContent = String(qtd);
  ticketSpan.textContent = formatarMoeda(ticket);

  if (qtd > 0) {
    const maior = itens.reduce((acc, i) => i.totalItem > acc.totalItem ? i : acc, itens[0]);
    maiorSpan.textContent = formatarMoeda(maior.totalItem);
    maiorNomeSpan.textContent = maior.produto;
  } else {
    maiorSpan.textContent = 'R$ 0,00';
    maiorNomeSpan.textContent = '–';
  }
}

function atualizarGraficosResumo() {
  const lista = getListaAtiva();
  const itens = lista ? lista.itens : [];

  // --- Gráficos por categoria (lista selecionada) ---
  const gastosPorCategoria = {};
  const qtdPorCategoria = {};

  itens.forEach(i => {
    const cat = i.categoria && i.categoria.trim() ? i.categoria.trim() : 'Sem categoria';
    gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + i.totalItem;
    qtdPorCategoria[cat] = (qtdPorCategoria[cat] || 0) + 1;
  });

  const cats = Object.keys(gastosPorCategoria);
  const valores = cats.map(c => gastosPorCategoria[c]);
  const quantidades = cats.map(c => qtdPorCategoria[c] || 0);

  const ctxQtd = document.getElementById('chartQtdCategoria').getContext('2d');
  const ctxVal = document.getElementById('chartValorCategoria').getContext('2d');

  if (chartQtdCategoria) chartQtdCategoria.destroy();
  if (chartValorCategoria) chartValorCategoria.destroy();

  chartQtdCategoria = new Chart(ctxQtd, {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{ data: quantidades }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: { ticks: { stepSize: 1 } }
      }
    }
  });

  chartValorCategoria = new Chart(ctxVal, {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{ data: valores }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatarMoeda(ctx.raw || 0)
          }
        }
      },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: {
          ticks: {
            callback: v => formatarMoeda(v)
          }
        }
      }
    }
  });

  // --- Gráfico totais por mês (todas as listas) ---
  const labelsMes = [];
  const valoresMes = [];

  const totaisCarteiras = {};

  meses.forEach(m => {
    let totalMes = 0;
    (m.listas || []).forEach(l => {
      (l.itens || []).forEach(i => {
        totalMes += i.totalItem;
        const cId = i.carteiraId || 'sem';
        totaisCarteiras[cId] = (totaisCarteiras[cId] || 0) + i.totalItem;
      });
    });
    labelsMes.push(m.nome || labelMes(m.id));
    valoresMes.push(totalMes);
  });

  const ctxMes = document.getElementById('chartTotaisMeses').getContext('2d');
  if (chartTotaisMeses) chartTotaisMeses.destroy();
  chartTotaisMeses = new Chart(ctxMes, {
    type: 'bar',
    data: {
      labels: labelsMes,
      datasets: [{ data: valoresMes }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatarMoeda(ctx.raw || 0)
          }
        }
      },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: {
          ticks: {
            callback: v => formatarMoeda(v)
          }
        }
      }
    }
  });

  // --- Gráfico por carteira (todos os meses) ---
  const labelsCarteira = [];
  const valoresCarteira = [];

  Object.keys(totaisCarteiras).forEach(id => {
    labelsCarteira.push(id === 'sem' ? 'Sem carteira' : nomeCarteiraPorId(id));
    valoresCarteira.push(totaisCarteiras[id]);
  });

  const ctxCart = document.getElementById('chartCarteiras').getContext('2d');
  if (chartCarteiras) chartCarteiras.destroy();
  chartCarteiras = new Chart(ctxCart, {
    type: 'bar',
    data: {
      labels: labelsCarteira,
      datasets: [{ data: valoresCarteira }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => formatarMoeda(ctx.raw || 0)
          }
        }
      },
      scales: {
        x: { ticks: { font: { size: 10 } } },
        y: {
          ticks: {
            callback: v => formatarMoeda(v)
          }
        }
      }
    }
  });
}
