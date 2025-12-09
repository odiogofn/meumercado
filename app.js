document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'controleCompras_v3';

  // SUGESTÕES DE PRODUTOS (preenche categoria automaticamente)
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

  // ESTADO
  let state = {
    meses: [],
    mesAtivoId: null,
    listaAtivaId: null,
    carteiras: []
  };

  // GRÁFICOS
  let chartQtdCategoria = null;
  let chartValorCategoria = null;

  // ---- DOM ELEMENTS ----
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Cadastro
  const cadMesSelect = document.getElementById('cadMesSelect');
  const cadNovoMesBtn = document.getElementById('cadNovoMesBtn');
  const cadMesResumo = document.getElementById('cadMesResumo');

  const cadListaSelect = document.getElementById('cadListaSelect');
  const cadNovaListaBtn = document.getElementById('cadNovaListaBtn');
  const cadListasResumo = document.getElementById('cadListasResumo');

  const cadCarteiraNome = document.getElementById('cadCarteiraNome');
  const cadAdicionarCarteiraBtn = document.getElementById('cadAdicionarCarteiraBtn');
  const cadCarteirasResumo = document.getElementById('cadCarteirasResumo');

  // Comprando
  const compMesSelect = document.getElementById('compMesSelect');
  const compListaSelect = document.getElementById('compListaSelect');
  const compUsarOrcamento = document.getElementById('compUsarOrcamento');
  const compValorOrcamento = document.getElementById('compValorOrcamento');
  const compOrcamentoStatus = document.getElementById('compOrcamentoStatus');

  const inputProduto = document.getElementById('produto');
  const inputCategoria = document.getElementById('categoria');
  const datalistProdutos = document.getElementById('listaProdutos');
  const carteiraItemSelect = document.getElementById('carteiraItem');
  const inputQuantidade = document.getElementById('quantidade');
  const selectUnidade = document.getElementById('unidade');
  const inputPreco = document.getElementById('preco');
  const btnAdicionarItem = document.getElementById('btnAdicionarItem');
  const btnLimparLista = document.getElementById('btnLimparLista');

  // Resumo
  const resumoNomeMes = document.getElementById('resumoNomeMes');
  const resumoNomeLista = document.getElementById('resumoNomeLista');
  const resumoTotalLista = document.getElementById('resumoTotalLista');
  const resumoQtdItens = document.getElementById('resumoQtdItens');
  const resumoTicketMedio = document.getElementById('resumoTicketMedio');
  const resumoMaiorItemValor = document.getElementById('resumoMaiorItemValor');
  const resumoMaiorItemNome = document.getElementById('resumoMaiorItemNome');
  const resumoQtdCategorias = document.getElementById('resumoQtdCategorias');
  const resumoBudgetBox = document.getElementById('resumoBudgetBox');
  const resumoBudgetTexto = document.getElementById('resumoBudgetTexto');
  const resumoTabelaBody = document.getElementById('resumoTabelaBody');

  const btnExportarBackup = document.getElementById('btnExportarBackup');
  const btnImportarBackup = document.getElementById('btnImportarBackup');
  const inputImportarBackup = document.getElementById('inputImportarBackup');

  // Modal edição
  const modalEdicao = document.getElementById('modalEdicao');
  const editProduto = document.getElementById('editProduto');
  const editCategoria = document.getElementById('editCategoria');
  const editCarteira = document.getElementById('editCarteira');
  const editQuantidade = document.getElementById('editQuantidade');
  const editUnidade = document.getElementById('editUnidade');
  const editPreco = document.getElementById('editPreco');
  const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');
  const btnSalvarEdicao = document.getElementById('btnSalvarEdicao');

  let itemEditando = null;

  // ---- FUNÇÕES AUXILIARES ----
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

  function criarEstadoPadrao() {
    const idMes = idMesAtual();
    const mes = {
      id: idMes,
      nome: labelMes(idMes),
      listas: [
        {
          id: 'lista-1',
          nome: 'Lista padrão',
          itens: [],
          proximoId: 1,
          usarOrcamento: false,
          valorOrcamento: ''
        }
      ]
    };
    state.meses = [mes];
    state.mesAtivoId = idMes;
    state.listaAtivaId = 'lista-1';
    state.carteiras = [
      { id: 'c1', nome: 'Dinheiro' },
      { id: 'c2', nome: 'Pix' },
      { id: 'c3', nome: 'Crédito' },
      { id: 'c4', nome: 'Débito' },
      { id: 'c5', nome: 'VR' },
      { id: 'c6', nome: 'VA' }
    ];
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      criarEstadoPadrao();
      saveState();
      return;
    }
    try {
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.meses) || data.meses.length === 0) {
        criarEstadoPadrao();
      } else {
        state.meses = data.meses;
        state.mesAtivoId = data.mesAtivoId || data.meses[0].id;
        const mes = getMesAtivo();
        if (mes && mes.listas.length > 0) {
          state.listaAtivaId = data.listaAtivaId || mes.listas[0].id;
        } else {
          state.listaAtivaId = null;
        }
        state.carteiras = Array.isArray(data.carteiras) && data.carteiras.length > 0
          ? data.carteiras
          : [
              { id: 'c1', nome: 'Dinheiro' },
              { id: 'c2', nome: 'Pix' },
              { id: 'c3', nome: 'Crédito' },
              { id: 'c4', nome: 'Débito' },
              { id: 'c5', nome: 'VR' },
              { id: 'c6', nome: 'VA' }
            ];
      }
    } catch {
      criarEstadoPadrao();
    }
    saveState();
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    if (!id) return 'Sem carteira';
    const c = state.carteiras.find(x => x.id === id);
    return c ? c.nome : 'Sem carteira';
  }

  // ---- TABS ----
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab-target');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector(target);
      if (panel) panel.classList.add('active');
    });
  });

  // ---- AUTOCOMPLETE PRODUTO -> CATEGORIA ----
  function preencherDatalistProdutos() {
    datalistProdutos.innerHTML = '';
    produtosSugeridos.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.nome;
      datalistProdutos.appendChild(opt);
    });
  }

  function sugerirCategoria(produtoNome) {
    const nome = (produtoNome || '').trim().toLowerCase();
    if (!nome) return;
    const encontrado = produtosSugeridos.find(p => p.nome.toLowerCase() === nome);
    if (encontrado && !inputCategoria.value.trim()) {
      inputCategoria.value = encontrado.categoria;
    }
  }

  inputProduto.addEventListener('input', () => {
    sugerirCategoria(inputProduto.value);
  });

  inputProduto.addEventListener('change', () => {
    sugerirCategoria(inputProduto.value);
  });

  inputProduto.addEventListener('blur', () => {
    sugerirCategoria(inputProduto.value);
  });

  // ---- RENDER MESES / LISTAS / CARTEIRAS ----
  function garantirListaAtivaValida() {
    const mes = getMesAtivo();
    if (!mes) {
      state.listaAtivaId = null;
      return;
    }
    const existe = mes.listas.some(l => l.id === state.listaAtivaId);
    if (!existe && mes.listas.length > 0) {
      state.listaAtivaId = mes.listas[0].id;
    }
  }

  function renderMesSelects() {
    const selects = [cadMesSelect, compMesSelect];
    selects.forEach(sel => {
      sel.innerHTML = '';
      state.meses.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = m.nome || labelMes(m.id);
        if (m.id === state.mesAtivoId) opt.selected = true;
        sel.appendChild(opt);
      });
    });

    const mes = getMesAtivo();
    if (mes) {
      cadMesResumo.textContent = `${mes.listas.length} lista(s) cadastrada(s) neste mês.`;
    } else {
      cadMesResumo.textContent = 'Nenhum mês cadastrado.';
    }
  }

  function renderListaSelects() {
    const mes = getMesAtivo();
    const selects = [cadListaSelect, compListaSelect];

    selects.forEach(sel => {
      sel.innerHTML = '';
      if (!mes) return;
      mes.listas.forEach(l => {
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = l.nome;
        if (l.id === state.listaAtivaId) opt.selected = true;
        sel.appendChild(opt);
      });
    });

    // resumo listas
    cadListasResumo.innerHTML = '';
    if (mes && mes.listas.length > 0) {
      mes.listas.forEach(l => {
        const li = document.createElement('li');
        li.className = 'tag-badge';
        li.textContent = l.nome;
        cadListasResumo.appendChild(li);
      });
    }
  }

  function renderCarteirasUI() {
    // selects de carteira (comprando + edição)
    carteiraItemSelect.innerHTML = '';
    editCarteira.innerHTML = '';

    const optSem = document.createElement('option');
    optSem.value = '';
    optSem.textContent = 'Sem carteira';
    carteiraItemSelect.appendChild(optSem);

    const optSem2 = optSem.cloneNode(true);
    editCarteira.appendChild(optSem2);

    state.carteiras.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nome;
      carteiraItemSelect.appendChild(opt);

      const opt2 = document.createElement('option');
      opt2.value = c.id;
      opt2.textContent = c.nome;
      editCarteira.appendChild(opt2);
    });

    // resumo carteiras
    cadCarteirasResumo.innerHTML = '';
    if (state.carteiras.length === 0) {
      const span = document.createElement('span');
      span.className = 'text-muted';
      span.textContent = 'Nenhuma carteira cadastrada.';
      cadCarteirasResumo.appendChild(span);
    } else {
      state.carteiras.forEach(c => {
        const div = document.createElement('div');
        div.className = 'tag-badge';
        div.textContent = c.nome;
        cadCarteirasResumo.appendChild(div);
      });
    }
  }

  // ---- ORÇAMENTO ----
  function atualizarOrcamentoUI() {
    const lista = getListaAtiva();
    if (!lista) {
      compUsarOrcamento.checked = false;
      compValorOrcamento.value = '';
      compOrcamentoStatus.textContent = '';
      resumoBudgetBox.style.display = 'none';
      return;
    }

    compUsarOrcamento.checked = !!lista.usarOrcamento;
    compValorOrcamento.value = lista.valorOrcamento || '';
    compValorOrcamento.disabled = !compUsarOrcamento.checked;

    const itens = lista.itens || [];
    const total = itens.reduce((s, i) => s + i.totalItem, 0);

    if (lista.usarOrcamento && lista.valorOrcamento) {
      const orc = parseFloat(String(lista.valorOrcamento).replace(',', '.')) || 0;
      if (orc > 0) {
        const perc = (total / orc) * 100;
        const dif = orc - total;
        let msg;
        let classe;

        if (dif > 0) {
          msg = `Usado ${formatarMoeda(total)} de ${formatarMoeda(orc)} (${perc.toFixed(1)}%). Pode gastar mais ${formatarMoeda(dif)}.`;
          classe = 'budget-ok';
        } else if (dif === 0) {
          msg = `Você atingiu exatamente o orçamento (${formatarMoeda(total)}).`;
          classe = 'budget-alerta';
        } else {
          msg = `Ultrapassou o orçamento em ${formatarMoeda(Math.abs(dif))} (total ${formatarMoeda(total)}).`;
          classe = 'budget-estourado';
        }

        compOrcamentoStatus.textContent = msg;
        resumoBudgetBox.style.display = 'block';
        resumoBudgetTexto.textContent = msg;
        resumoBudgetTexto.className = `budget-info ${classe}`;
      } else {
        compOrcamentoStatus.textContent = '';
        resumoBudgetBox.style.display = 'none';
      }
    } else {
      compOrcamentoStatus.textContent = '';
      resumoBudgetBox.style.display = 'none';
    }
  }

  // ---- RESUMO E TABELA ----
  function atualizarResumo() {
    const mes = getMesAtivo();
    const lista = getListaAtiva();

    if (!mes || !lista) {
      resumoNomeMes.textContent = '–';
      resumoNomeLista.textContent = '–';
      resumoTotalLista.textContent = 'R$ 0,00';
      resumoQtdItens.textContent = '0 itens';
      resumoTicketMedio.textContent = 'R$ 0,00';
      resumoMaiorItemValor.textContent = 'R$ 0,00';
      resumoMaiorItemNome.textContent = '–';
      resumoQtdCategorias.textContent = '0';
      resumoTabelaBody.innerHTML = '';
      atualizarGraficos();
      atualizarOrcamentoUI();
      return;
    }

    resumoNomeMes.textContent = mes.nome || labelMes(mes.id);
    resumoNomeLista.textContent = lista.nome;

    const itens = lista.itens || [];
    const total = itens.reduce((s, i) => s + i.totalItem, 0);
    const qtdItens = itens.length;
    const ticket = qtdItens > 0 ? total / qtdItens : 0;

    resumoTotalLista.textContent = formatarMoeda(total);
    resumoQtdItens.textContent = `${qtdItens} item${qtdItens === 1 ? '' : 's'}`;
    resumoTicketMedio.textContent = formatarMoeda(ticket);

    if (qtdItens > 0) {
      const maior = itens.reduce((acc, item) => item.totalItem > acc.totalItem ? item : acc, itens[0]);
      resumoMaiorItemValor.textContent = formatarMoeda(maior.totalItem);
      resumoMaiorItemNome.textContent = maior.produto;
    } else {
      resumoMaiorItemValor.textContent = 'R$ 0,00';
      resumoMaiorItemNome.textContent = '–';
    }

    const categoriasSet = new Set(
      itens.map(i => (i.categoria && i.categoria.trim()) ? i.categoria.trim() : 'Sem categoria')
    );
    resumoQtdCategorias.textContent = qtdItens === 0 ? '0' : String(categoriasSet.size);

    // tabela
    resumoTabelaBody.innerHTML = '';
    itens.forEach((item, idx) => {
      const tr = document.createElement('tr');

      const tdIdx = document.createElement('td');
      tdIdx.textContent = idx + 1;

      const tdProd = document.createElement('td');
      tdProd.textContent = item.produto;

      const tdCat = document.createElement('td');
      tdCat.textContent = (item.categoria || 'Sem categoria');

      const tdCart = document.createElement('td');
      tdCart.textContent = nomeCarteiraPorId(item.carteiraId);

      const tdQtd = document.createElement('td');
      tdQtd.textContent = formatarQuantidade(item.quantidade, item.unidade);

      const tdVlrUn = document.createElement('td');
      tdVlrUn.textContent = formatarMoeda(item.preco);

      const tdVlrTot = document.createElement('td');
      tdVlrTot.textContent = formatarMoeda(item.totalItem);

      const tdAcoes = document.createElement('td');
      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.className = 'btn-secondary btn-small';
      btnEditar.addEventListener('click', () => abrirModalEdicao(item.id));

      const btnExcluir = document.createElement('button');
      btnExcluir.textContent = 'Excluir';
      btnExcluir.className = 'btn-danger btn-small';
      btnExcluir.style.marginLeft = '4px';
      btnExcluir.addEventListener('click', () => excluirItem(item.id));

      tdAcoes.appendChild(btnEditar);
      tdAcoes.appendChild(btnExcluir);

      tr.appendChild(tdIdx);
      tr.appendChild(tdProd);
      tr.appendChild(tdCat);
      tr.appendChild(tdCart);
      tr.appendChild(tdQtd);
      tr.appendChild(tdVlrUn);
      tr.appendChild(tdVlrTot);
      tr.appendChild(tdAcoes);

      resumoTabelaBody.appendChild(tr);
    });

    atualizarOrcamentoUI();
    atualizarGraficos();
  }

  // ---- GRÁFICOS ----
  function atualizarGraficos() {
    const lista = getListaAtiva();
    const itens = lista ? (lista.itens || []) : [];

    const qtdPorCategoria = {};
    const valorPorCategoria = {};

    itens.forEach(item => {
      const cat = (item.categoria && item.categoria.trim()) ? item.categoria.trim() : 'Sem categoria';
      qtdPorCategoria[cat] = (qtdPorCategoria[cat] || 0) + 1;
      valorPorCategoria[cat] = (valorPorCategoria[cat] || 0) + item.totalItem;
    });

    const labels = Object.keys(qtdPorCategoria);
    const valoresQtd = labels.map(l => qtdPorCategoria[l]);
    const valoresValor = labels.map(l => valorPorCategoria[l]);

    const ctxQtd = document.getElementById('chartQtdCategoria').getContext('2d');
    const ctxVal = document.getElementById('chartValorCategoria').getContext('2d');

    if (chartQtdCategoria) chartQtdCategoria.destroy();
    if (chartValorCategoria) chartValorCategoria.destroy();

    chartQtdCategoria = new Chart(ctxQtd, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: valoresQtd }]
      },
      options: {
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { ticks: { color: '#111827', font: { size: 11 } } },
          y: { ticks: { color: '#111827', font: { size: 11 } } }
        }
      }
    });

    chartValorCategoria = new Chart(ctxVal, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ data: valoresValor }]
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
          x: { ticks: { color: '#111827', font: { size: 11 } } },
          y: {
            ticks: {
              color: '#111827',
              font: { size: 11 },
              callback: value => formatarMoeda(value)
            }
          }
        }
      }
    });
  }

  // ---- AÇÕES: ADICIONAR / EXCLUIR / LIMPAR ITENS ----
  function adicionarItem() {
    const lista = getListaAtiva();
    if (!lista) {
      alert('Selecione um mês e uma lista antes de adicionar itens.');
      return;
    }

    const produto = inputProduto.value.trim();
    const categoria = inputCategoria.value.trim();
    const carteiraId = carteiraItemSelect.value || null;
    const quantidadeStr = inputQuantidade.value;
    const precoStr = inputPreco.value;
    const unidade = selectUnidade.value;

    const quantidade = parseFloat(String(quantidadeStr).replace(',', '.'));
    const preco = parseFloat(String(precoStr).replace(',', '.'));

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

    // Limpar campos
    inputProduto.value = '';
    inputCategoria.value = '';
    inputQuantidade.value = '';
    inputPreco.value = '';
    inputProduto.focus();

    saveState();
    atualizarResumo();
  }

  function excluirItem(id) {
    const lista = getListaAtiva();
    if (!lista) return;
    lista.itens = lista.itens.filter(i => i.id !== id);
    saveState();
    atualizarResumo();
  }

  function limparLista() {
    const lista = getListaAtiva();
    if (!lista) {
      alert('Nenhuma lista selecionada.');
      return;
    }
    if (!confirm(`Limpar todos os itens da lista "${lista.nome}"?`)) return;
    lista.itens = [];
    lista.proximoId = 1;
    saveState();
    atualizarResumo();
  }

  // ---- EDIÇÃO (MODAL) ----
  function abrirModalEdicao(itemId) {
    const lista = getListaAtiva();
    if (!lista) return;
    const item = lista.itens.find(i => i.id === itemId);
    if (!item) return;

    itemEditando = item;

    editProduto.value = item.produto;
    editCategoria.value = item.categoria || '';
    editQuantidade.value = item.quantidade;
    editUnidade.value = item.unidade;
    editPreco.value = item.preco;
    editCarteira.value = item.carteiraId || '';

    modalEdicao.style.display = 'flex';
  }

  function fecharModalEdicao() {
    modalEdicao.style.display = 'none';
    itemEditando = null;
  }

  btnCancelarEdicao.addEventListener('click', fecharModalEdicao);

  modalEdicao.addEventListener('click', (e) => {
    if (e.target === modalEdicao) fecharModalEdicao();
  });

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

    let totalItem = und === 'g' ? (qtd / 1000) * preco : qtd * preco;

    itemEditando.produto = prod;
    itemEditando.categoria = cat;
    itemEditando.quantidade = qtd;
    itemEditando.unidade = und;
    itemEditando.preco = preco;
    itemEditando.totalItem = totalItem;
    itemEditando.carteiraId = carteiraId;

    saveState();
    atualizarResumo();
    fecharModalEdicao();
  });

  // ---- EVENTOS: CADASTRO (MESES / LISTAS / CARTEIRAS) ----
  cadNovoMesBtn.addEventListener('click', () => {
    const hoje = new Date();
    const anoDefault = hoje.getFullYear();
    const mesDefault = String(hoje.getMonth() + 1).padStart(2, '0');
    const input = prompt('Informe o mês/ano (MM/AAAA):', `${mesDefault}/${anoDefault}`);
    if (!input) return;

    const match = input.match(/^(\d{2})\/(\d{4})$/);
    if (!match) {
      alert('Formato inválido. Use MM/AAAA, ex: 11/2025.');
      return;
    }

    const mes = match[1];
    const ano = match[2];
    const id = `${ano}-${mes}`;

    if (state.meses.some(m => m.id === id)) {
      alert('Esse mês já existe. Selecione-o na lista.');
      return;
    }

    const novoMes = {
      id,
      nome: `${mes}/${ano}`,
      listas: [
        {
          id: 'lista-1',
          nome: 'Lista padrão',
          itens: [],
          proximoId: 1,
          usarOrcamento: false,
          valorOrcamento: ''
        }
      ]
    };

    state.meses.push(novoMes);
    state.mesAtivoId = id;
    state.listaAtivaId = 'lista-1';
    saveState();
    renderMesSelects();
    renderListaSelects();
    atualizarResumo();
  });

  cadMesSelect.addEventListener('change', () => {
    state.mesAtivoId = cadMesSelect.value;
    garantirListaAtivaValida();
    saveState();
    renderMesSelects();
    renderListaSelects();
    atualizarResumo();
  });

  compMesSelect.addEventListener('change', () => {
    state.mesAtivoId = compMesSelect.value;
    garantirListaAtivaValida();
    saveState();
    renderMesSelects();
    renderListaSelects();
    atualizarResumo();
  });

  cadNovaListaBtn.addEventListener('click', () => {
    const mes = getMesAtivo();
    if (!mes) {
      alert('Cadastre um mês primeiro.');
      return;
    }
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
    state.listaAtivaId = id;
    saveState();
    renderListaSelects();
    atualizarResumo();
  });

  cadListaSelect.addEventListener('change', () => {
    state.listaAtivaId = cadListaSelect.value;
    saveState();
    renderListaSelects();
    atualizarResumo();
  });

  compListaSelect.addEventListener('change', () => {
    state.listaAtivaId = compListaSelect.value;
    saveState();
    renderListaSelects();
    atualizarResumo();
  });

  cadAdicionarCarteiraBtn.addEventListener('click', () => {
    const nome = cadCarteiraNome.value.trim();
    if (!nome) {
      alert('Informe o nome da carteira.');
      return;
    }
    const id = 'c' + Date.now();
    state.carteiras.push({ id, nome });
    cadCarteiraNome.value = '';
    saveState();
    renderCarteirasUI();
  });

  // ---- EVENTOS: ORÇAMENTO E ITENS ----
  compUsarOrcamento.addEventListener('change', () => {
    const lista = getListaAtiva();
    if (!lista) return;
    lista.usarOrcamento = compUsarOrcamento.checked;
    if (!lista.usarOrcamento) {
      lista.valorOrcamento = '';
      compValorOrcamento.value = '';
    }
    saveState();
    atualizarResumo();
  });

  compValorOrcamento.addEventListener('input', () => {
    const lista = getListaAtiva();
    if (!lista) return;
    lista.valorOrcamento = compValorOrcamento.value;
    saveState();
    atualizarResumo();
  });

  btnAdicionarItem.addEventListener('click', (e) => {
    e.preventDefault();
    adicionarItem();
  });

  inputPreco.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarItem();
    }
  });

  btnLimparLista.addEventListener('click', (e) => {
    e.preventDefault();
    limparLista();
  });

  // ---- BACKUP ----
  function exportarBackup() {
    saveState();
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const hoje = new Date().toISOString().slice(0, 10);
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
          alert('Backup inválido.');
          return;
        }
        state = {
          meses: data.meses,
          mesAtivoId: data.mesAtivoId || (data.meses[0] && data.meses[0].id),
          listaAtivaId: data.listaAtivaId || (data.meses[0] && data.meses[0].listas[0] && data.meses[0].listas[0].id),
          carteiras: Array.isArray(data.carteiras) && data.carteiras.length > 0
            ? data.carteiras
            : state.carteiras
        };
        saveState();
        garantirListaAtivaValida();
        renderMesSelects();
        renderListaSelects();
        renderCarteirasUI();
        atualizarResumo();
        alert('Backup importado com sucesso!');
      } catch {
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

  // ---- INICIALIZAÇÃO ----
  loadState();
  preencherDatalistProdutos();
  renderMesSelects();
  garantirListaAtivaValida();
  renderListaSelects();
  renderCarteirasUI();
  atualizarResumo();
});
