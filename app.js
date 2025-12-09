// ---------- DADOS BASE ----------

const STORAGE_KEY = 'controleCompras_tabs_v1';

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

function carteirasPadrao() {
  return [
    { id: 'c1', nome: 'Dinheiro' },
    { id: 'c2', nome: 'Pix' },
    { id: 'c3', nome: 'Crédito' },
    { id: 'c4', nome: 'Débito' },
    { id: 'c5', nome: 'VR' },
    { id: 'c6', nome: 'VA' }
  ];
}

// Estado global
let state = {
  meses: [],       // [{id, nome, listas:[{id, nome, itens, proximoId, usarOrcamento, valorOrcamento}]}]
  carteiras: [],   // [{id, nome}]
  mesAtivoId: null,
  listaAtivaId: null
};

// ---------- FUNÇÕES UTIL ----------

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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

function salvarEstado() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    state.meses = [mesPadrao];
    state.carteiras = carteirasPadrao();
    state.mesAtivoId = id;
    state.listaAtivaId = 'lista-1';
    salvarEstado();
    return;
  }

  try {
    const data = JSON.parse(raw);
    state.meses = Array.isArray(data.meses) ? data.meses : [];
    state.carteiras = Array.isArray(data.carteiras) && data.carteiras.length > 0
      ? data.carteiras
      : carteirasPadrao();
    state.mesAtivoId = data.mesAtivoId || (state.meses[0] && state.meses[0].id);
    if (state.meses.length > 0) {
      const mes = getMesAtivo();
      state.listaAtivaId = data.listaAtivaId || (mes && mes.listas[0] && mes.listas[0].id);
    }
  } catch (e) {
    console.error('Erro ao carregar estado', e);
    localStorage.removeItem(STORAGE_KEY);
    carregarEstado();
  }
}

function getMesAtivo() {
  return state.meses.find(m => m.id === state.mesAtivoId) || null;
}

function getListaAtiva() {
  const mes = getMesAtivo();
  if (!mes) return null;
  return mes.listas.find(l => l.id === state.listaAtivaId) || null;
}

function nomeCarteiraPorId(id) {
  const c = state.carteiras.find(x => x.id === id);
  return c ? c.nome : 'Sem carteira';
}

// ---------- DOM ELEMENTS ----------

// Abas
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

// Cadastro - Meses
const inputMesNovo = document.getElementById('mesNovo');
const btnAdicionarMes = document.getElementById('btnAdicionarMes');
const tbodyMesesCadastro = document.getElementById('tabelaMesesCadastro');

// Cadastro - Listas
const selectMesParaLista = document.getElementById('mesParaLista');
const inputNomeListaNova = document.getElementById('nomeListaNova');
const btnAdicionarLista = document.getElementById('btnAdicionarLista');
const tbodyListasCadastro = document.getElementById('tabelaListasCadastro');

// Cadastro - Carteiras
const inputNovaCarteiraNome = document.getElementById('novaCarteiraNome');
const btnAdicionarCarteira = document.getElementById('btnAdicionarCarteira');
const divListaCarteiras = document.getElementById('listaCarteiras');

// Comprando - Config
const selectMesCompra = document.getElementById('mesCompra');
const selectListaCompra = document.getElementById('listaCompra');
const checkboxUsarOrcamento = document.getElementById('usarOrcamento');
const inputValorOrcamento = document.getElementById('valorOrcamento');
const divOrcamentoStatus = document.getElementById('orcamentoStatus');

// Comprando - Itens
const inputProduto = document.getElementById('produto');
const inputCategoria = document.getElementById('categoria');
const inputQuantidade = document.getElementById('quantidade');
const selectUnidade = document.getElementById('unidade');
const inputPreco = document.getElementById('preco');
const selectCarteiraItem = document.getElementById('carteiraItem');
const btnAdicionarItem = document.getElementById('btnAdicionarItem');
const btnLimparLista = document.getElementById('btnLimparLista');
const datalistProdutos = document.getElementById('listaProdutos');

// Resumo
const selectMesResumo = document.getElementById('mesResumo');
const selectListaResumo = document.getElementById('listaResumo');
const spanResumoTotalLista = document.getElementById('resumoTotalLista');
const spanResumoQtdItens = document.getElementById('resumoQtdItens');
const spanResumoTicketMedio = document.getElementById('resumoTicketMedio');
const spanResumoCategorias = document.getElementById('resumoCategorias');
const tbodyItensResumo = document.getElementById('tabelaItensResumo');

// Gráficos
let chartQtdCategoria = null;
let chartValorCategoria = null;
const canvasQtdCategoria = document.getElementById('chartQtdCategoria');
const canvasValorCategoria = document.getElementById('chartValorCategoria');

// ---------- ABAS ----------

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabContents.forEach(c => {
      if (c.id === `tab-${tabName}`) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    if (tabName === 'cadastro') {
      renderCadastro();
    } else if (tabName === 'comprando') {
      syncSeletoresCompraComEstado();
      atualizarOrcamentoStatus();
    } else if (tabName === 'resumo') {
      syncSeletoresResumoComEstado();
      atualizarResumoEDesenharGraficos();
    }
  });
});

// ---------- INICIALIZAÇÃO AUTOCOMPLETE PRODUTO ----------

function inicializarDatalistProdutos() {
  datalistProdutos.innerHTML = '';
  produtosSugeridos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.nome;
    datalistProdutos.appendChild(opt);
  });
}

// Categoria deve atualizar ao selecionar produto
function atualizarCategoriaPeloProduto(nomeProduto) {
  if (!nomeProduto) return;
  const nome = nomeProduto.trim().toLowerCase();
  if (!nome) return;

  const encontrado = produtosSugeridos.find(
    p => p.nome.toLowerCase() === nome
  );
  if (encontrado) {
    // se já tiver algo em categoria, vamos sobrescrever
    inputCategoria.value = encontrado.categoria;
  }
}

inputProduto.addEventListener('input', () => {
  atualizarCategoriaPeloProduto(inputProduto.value);
});

inputProduto.addEventListener('change', () => {
  atualizarCategoriaPeloProduto(inputProduto.value);
});

inputProduto.addEventListener('blur', () => {
  atualizarCategoriaPeloProduto(inputProduto.value);
});

// ---------- RENDER CADASTRO ----------

function renderCadastro() {
  renderTabelaMesesCadastro();
  renderSelecaoMesParaLista();
  renderTabelaListasCadastro();
  renderCarteirasCadastro();
}

function renderTabelaMesesCadastro() {
  tbodyMesesCadastro.innerHTML = '';

  state.meses.forEach(m => {
    let totalMes = 0;
    (m.listas || []).forEach(l => {
      (l.itens || []).forEach(item => {
        totalMes += item.totalItem;
      });
    });

    const tr = document.createElement('tr');
    const tdMes = document.createElement('td');
    tdMes.textContent = m.nome || labelMes(m.id);

    const tdListas = document.createElement('td');
    tdListas.textContent = m.listas ? m.listas.length : 0;

    const tdTotal = document.createElement('td');
    tdTotal.textContent = formatarMoeda(totalMes);

    const tdAcoes = document.createElement('td');
    const btnUsar = document.createElement('button');
    btnUsar.className = 'btn ghost';
    btnUsar.textContent = 'Definir como mês ativo';
    btnUsar.addEventListener('click', () => {
      state.mesAtivoId = m.id;
      const listaPadrao = m.listas && m.listas[0] ? m.listas[0].id : null;
      state.listaAtivaId = listaPadrao;
      salvarEstado();
      renderCadastro();
    });
    tdAcoes.appendChild(btnUsar);

    tr.appendChild(tdMes);
    tr.appendChild(tdListas);
    tr.appendChild(tdTotal);
    tr.appendChild(tdAcoes);
    tbodyMesesCadastro.appendChild(tr);
  });
}

function renderSelecaoMesParaLista() {
  selectMesParaLista.innerHTML = '';
  state.meses.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nome || labelMes(m.id);
    if (m.id === state.mesAtivoId) opt.selected = true;
    selectMesParaLista.appendChild(opt);
  });
}

function renderTabelaListasCadastro() {
  tbodyListasCadastro.innerHTML = '';

  state.meses.forEach(m => {
    (m.listas || []).forEach(l => {
      const tr = document.createElement('tr');

      const tdLista = document.createElement('td');
      tdLista.textContent = l.nome;

      const tdMes = document.createElement('td');
      tdMes.textContent = m.nome || labelMes(m.id);

      const tdItens = document.createElement('td');
      tdItens.textContent = l.itens ? l.itens.length : 0;

      const tdAtiva = document.createElement('td');
      const btnAtivar = document.createElement('button');
      btnAtivar.className = 'btn ghost';
      btnAtivar.textContent = 'Usar nesta compra';
      btnAtivar.addEventListener('click', () => {
        state.mesAtivoId = m.id;
        state.listaAtivaId = l.id;
        salvarEstado();
        renderCadastro();
      });
      if (state.mesAtivoId === m.id && state.listaAtivaId === l.id) {
        btnAtivar.textContent = 'Lista ativa';
        btnAtivar.disabled = true;
      }
      tdAtiva.appendChild(btnAtivar);

      tr.appendChild(tdLista);
      tr.appendChild(tdMes);
      tr.appendChild(tdItens);
      tr.appendChild(tdAtiva);
      tbodyListasCadastro.appendChild(tr);
    });
  });
}

function renderCarteirasCadastro() {
  divListaCarteiras.innerHTML = '';
  if (!state.carteiras || state.carteiras.length === 0) {
    const span = document.createElement('span');
    span.textContent = 'Nenhuma carteira cadastrada.';
    span.style.fontSize = '0.85rem';
    span.style.color = '#6b7280';
    divListaCarteiras.appendChild(span);
    return;
  }
  state.carteiras.forEach(c => {
    const div = document.createElement('div');
    div.className = 'chip';
    div.textContent = c.nome;
    divListaCarteiras.appendChild(div);
  });
}

// Eventos cadastro

btnAdicionarMes.addEventListener('click', () => {
  const valor = inputMesNovo.value.trim();
  if (!valor) {
    alert('Informe o mês no formato MM/AAAA.');
    return;
  }
  const match = valor.match(/^(\d{2})\/(\d{4})$/);
  if (!match) {
    alert('Formato inválido. Use MM/AAAA, ex: 04/2026.');
    return;
  }
  const mes = match[1];
  const ano = match[2];
  const id = `${ano}-${mes}`;

  if (state.meses.some(m => m.id === id)) {
    alert('Esse mês já está cadastrado.');
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
  state.meses.push(novoMes);
  state.mesAtivoId = id;
  state.listaAtivaId = 'lista-1';
  inputMesNovo.value = '';
  salvarEstado();
  renderCadastro();
});

btnAdicionarLista.addEventListener('click', () => {
  const mesId = selectMesParaLista.value;
  const nomeLista = inputNomeListaNova.value.trim();
  if (!mesId || !nomeLista) {
    alert('Selecione o mês e informe o nome da lista.');
    return;
  }
  const mes = state.meses.find(m => m.id === mesId);
  if (!mes) return;

  const novaLista = {
    id: 'lista-' + Date.now(),
    nome: nomeLista,
    itens: [],
    proximoId: 1,
    usarOrcamento: false,
    valorOrcamento: ''
  };

  mes.listas.push(novaLista);
  state.mesAtivoId = mesId;
  state.listaAtivaId = novaLista.id;
  inputNomeListaNova.value = '';
  salvarEstado();
  renderCadastro();
});

btnAdicionarCarteira.addEventListener('click', () => {
  const nome = inputNovaCarteiraNome.value.trim();
  if (!nome) {
    alert('Informe o nome da carteira.');
    return;
  }
  const nova = { id: 'c' + Date.now(), nome };
  state.carteiras.push(nova);
  inputNovaCarteiraNome.value = '';
  salvarEstado();
  renderCarteirasCadastro();
  atualizarSeletoresCarteirasCompra();
});

// ---------- ABA COMPRANDO ----------

function atualizarSeletoresMesListaCompra() {
  // Mês
  selectMesCompra.innerHTML = '';
  state.meses.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nome || labelMes(m.id);
    if (m.id === state.mesAtivoId) opt.selected = true;
    selectMesCompra.appendChild(opt);
  });

  // Lista
  selectListaCompra.innerHTML = '';
  const mes = getMesAtivo();
  if (!mes) return;
  (mes.listas || []).forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.nome;
    if (l.id === state.listaAtivaId) opt.selected = true;
    selectListaCompra.appendChild(opt);
  });
}

function atualizarSeletoresCarteirasCompra() {
  selectCarteiraItem.innerHTML = '';

  const optVazio = document.createElement('option');
  optVazio.value = '';
  optVazio.textContent = 'Selecione';
  selectCarteiraItem.appendChild(optVazio);

  state.carteiras.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nome;
    selectCarteiraItem.appendChild(opt);
  });
}

function syncSeletoresCompraComEstado() {
  atualizarSeletoresMesListaCompra();
  atualizarSeletoresCarteirasCompra();

  // Orçamento
  const lista = getListaAtiva();
  if (lista) {
    checkboxUsarOrcamento.checked = !!lista.usarOrcamento;
    inputValorOrcamento.disabled = !lista.usarOrcamento;
    inputValorOrcamento.value = lista.valorOrcamento || '';
  } else {
    checkboxUsarOrcamento.checked = false;
    inputValorOrcamento.disabled = true;
    inputValorOrcamento.value = '';
  }
}

// eventos seletores compra

selectMesCompra.addEventListener('change', () => {
  state.mesAtivoId = selectMesCompra.value;
  const mes = getMesAtivo();
  if (mes && mes.listas.length > 0) {
    state.listaAtivaId = mes.listas[0].id;
  } else {
    state.listaAtivaId = null;
  }
  salvarEstado();
  atualizarSeletoresMesListaCompra();
  atualizarOrcamentoStatus();
});

selectListaCompra.addEventListener('change', () => {
  state.listaAtivaId = selectListaCompra.value;
  salvarEstado();
  atualizarOrcamentoStatus();
});

checkboxUsarOrcamento.addEventListener('change', () => {
  const lista = getListaAtiva();
  if (!lista) return;
  lista.usarOrcamento = checkboxUsarOrcamento.checked;
  inputValorOrcamento.disabled = !checkboxUsarOrcamento.checked;
  if (!checkboxUsarOrcamento.checked) {
    lista.valorOrcamento = '';
    inputValorOrcamento.value = '';
  }
  salvarEstado();
  atualizarOrcamentoStatus();
});

inputValorOrcamento.addEventListener('input', () => {
  const lista = getListaAtiva();
  if (!lista) return;
  lista.valorOrcamento = inputValorOrcamento.value;
  salvarEstado();
  atualizarOrcamentoStatus();
});

function calcularTotalLista(lista) {
  if (!lista || !lista.itens) return 0;
  return lista.itens.reduce((acc, i) => acc + i.totalItem, 0);
}

function atualizarOrcamentoStatus() {
  const lista = getListaAtiva();
  if (!lista) {
    divOrcamentoStatus.textContent = 'Nenhuma lista selecionada.';
    return;
  }

  const total = calcularTotalLista(lista);
  const usar = !!lista.usarOrcamento;
  const valor = parseFloat(String(lista.valorOrcamento || '').replace(',', '.')) || 0;

  if (!usar || !valor) {
    divOrcamentoStatus.textContent = `Total atual da lista: ${formatarMoeda(total)}.`;
    return;
  }

  const diff = valor - total;
  const perc = total / valor * 100;

  if (diff > 0) {
    divOrcamentoStatus.textContent =
      `Total da lista: ${formatarMoeda(total)} (${perc.toFixed(1)}% do limite). Você ainda pode gastar ${formatarMoeda(diff)}.`;
  } else if (diff === 0) {
    divOrcamentoStatus.textContent =
      `Total da lista: ${formatarMoeda(total)}. Você atingiu exatamente o limite definido.`;
  } else {
    divOrcamentoStatus.textContent =
      `Total da lista: ${formatarMoeda(total)} (${perc.toFixed(1)}% do limite). Você ultrapassou o limite em ${formatarMoeda(Math.abs(diff))}.`;
  }
}

// adicionar item

btnAdicionarItem.addEventListener('click', () => {
  const lista = getListaAtiva();
  if (!lista) {
    alert('Selecione um mês e uma lista primeiro (na aba Cadastro ou Comprando).');
    return;
  }

  const produto = inputProduto.value.trim();
  const categoria = inputCategoria.value.trim();
  const quantidade = parseFloat(String(inputQuantidade.value).replace(',', '.'));
  const unidade = selectUnidade.value;
  const preco = parseFloat(String(inputPreco.value).replace(',', '.'));
  const carteiraId = selectCarteiraItem.value || null;

  if (!produto) {
    alert('Informe o produto.');
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
  salvarEstado();
  atualizarOrcamentoStatus();

  // limpa campos
  inputProduto.value = '';
  inputCategoria.value = '';
  inputQuantidade.value = '';
  inputPreco.value = '';
  selectUnidade.value = 'un';
  selectCarteiraItem.value = '';

  inputProduto.focus();
});

btnLimparLista.addEventListener('click', () => {
  const lista = getListaAtiva();
  if (!lista) return;
  if (!confirm(`Limpar todos os itens da lista "${lista.nome}"?`)) return;

  lista.itens = [];
  lista.proximoId = 1;
  salvarEstado();
  atualizarOrcamentoStatus();
});

// ---------- ABA RESUMO ----------

function atualizarSeletoresMesListaResumo() {
  // Mês
  selectMesResumo.innerHTML = '';
  state.meses.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nome || labelMes(m.id);
    if (m.id === state.mesAtivoId) opt.selected = true;
    selectMesResumo.appendChild(opt);
  });

  // Lista
  selectListaResumo.innerHTML = '';
  const mes = getMesAtivo();
  if (!mes) return;
  (mes.listas || []).forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = l.nome;
    if (l.id === state.listaAtivaId) opt.selected = true;
    selectListaResumo.appendChild(opt);
  });
}

function syncSeletoresResumoComEstado() {
  atualizarSeletoresMesListaResumo();
}

selectMesResumo.addEventListener('change', () => {
  state.mesAtivoId = selectMesResumo.value;
  const mes = getMesAtivo();
  if (mes && mes.listas.length > 0) {
    state.listaAtivaId = mes.listas[0].id;
  } else {
    state.listaAtivaId = null;
  }
  salvarEstado();
  atualizarSeletoresMesListaResumo();
  atualizarResumoEDesenharGraficos();
});

selectListaResumo.addEventListener('change', () => {
  state.listaAtivaId = selectListaResumo.value;
  salvarEstado();
  atualizarResumoEDesenharGraficos();
});

function atualizarResumoEDesenharGraficos() {
  const lista = getListaAtiva();
  const itens = lista && lista.itens ? lista.itens : [];

  // Resumo numérico
  const total = itens.reduce((acc, i) => acc + i.totalItem, 0);
  spanResumoTotalLista.textContent = formatarMoeda(total);
  spanResumoQtdItens.textContent = itens.length;

  const ticket = itens.length > 0 ? total / itens.length : 0;
  spanResumoTicketMedio.textContent = formatarMoeda(ticket);

  const categoriasSet = new Set(
    itens.map(i => (i.categoria && i.categoria.trim()) ? i.categoria.trim() : 'Sem categoria')
  );
  spanResumoCategorias.textContent = itens.length === 0 ? 0 : categoriasSet.size;

  // Tabela
  tbodyItensResumo.innerHTML = '';
  itens.forEach((item, idx) => {
    const tr = document.createElement('tr');

    const tdSeq = document.createElement('td');
    tdSeq.textContent = idx + 1;

    const tdProd = document.createElement('td');
    tdProd.textContent = item.produto;

    const tdCat = document.createElement('td');
    tdCat.textContent = item.categoria || 'Sem categoria';

    const tdCart = document.createElement('td');
    tdCart.textContent = item.carteiraId ? nomeCarteiraPorId(item.carteiraId) : 'Sem carteira';

    const tdQtd = document.createElement('td');
    tdQtd.textContent = `${item.quantidade} ${item.unidade}`;

    const tdPreco = document.createElement('td');
    tdPreco.textContent = formatarMoeda(item.preco);

    const tdTotal = document.createElement('td');
    tdTotal.textContent = formatarMoeda(item.totalItem);

    tr.appendChild(tdSeq);
    tr.appendChild(tdProd);
    tr.appendChild(tdCat);
    tr.appendChild(tdCart);
    tr.appendChild(tdQtd);
    tr.appendChild(tdPreco);
    tr.appendChild(tdTotal);
    tbodyItensResumo.appendChild(tr);
  });

  // Gráficos
  desenharGraficosCategoria(itens);
}

function desenharGraficosCategoria(itens) {
  const mapa = {}; // categoria -> {qtd, valor}

  itens.forEach(item => {
    const cat = (item.categoria && item.categoria.trim()) ? item.categoria.trim() : 'Sem categoria';
    if (!mapa[cat]) {
      mapa[cat] = { qtd: 0, valor: 0 };
    }
    mapa[cat].qtd += 1;
    mapa[cat].valor += item.totalItem;
  });

  const labels = Object.keys(mapa);
  const dadosQtd = labels.map(cat => mapa[cat].qtd);
  const dadosValor = labels.map(cat => mapa[cat].valor);

  // Quantidade por categoria
  if (chartQtdCategoria) chartQtdCategoria.destroy();
  chartQtdCategoria = new Chart(canvasQtdCategoria.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: dadosQtd }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.raw} item(ns)`
          }
        }
      },
      scales: {
        x: { ticks: { font: { size: 11 } } },
        y: { ticks: { font: { size: 11 } } }
      }
    }
  });

  // Valor por categoria
  if (chartValorCategoria) chartValorCategoria.destroy();
  chartValorCategoria = new Chart(canvasValorCategoria.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ data: dadosValor }]
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
        x: { ticks: { font: { size: 11 } } },
        y: {
          ticks: {
            font: { size: 11 },
            callback: v => formatarMoeda(v)
          }
        }
      }
    }
  });
}

// ---------- INICIALIZAÇÃO GERAL ----------

function init() {
  carregarEstado();
  inicializarDatalistProdutos();

  // Primeira render
  renderCadastro();
  syncSeletoresCompraComEstado();
  syncSeletoresResumoComEstado();
  atualizarOrcamentoStatus();
  atualizarResumoEDesenharGraficos();
}

document.addEventListener('DOMContentLoaded', init);
