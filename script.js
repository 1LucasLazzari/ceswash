const preco = 15;
    let estoqueTotal = 0;
    let integrantes = [];

    // Controle de elementos
    const precoFixo = document.getElementById("precoFixo");
    const inputEstoqueManual = document.getElementById("inputEstoqueManual");
    const valorEstoqueDisplay = document.getElementById("valorEstoqueDisplay");
    const faturamentoDisplay = document.getElementById("faturamentoDisplay");
    const lucroDisplay = document.getElementById("lucroDisplay");
    const totalVendasDisplay = document.getElementById("totalVendasDisplay");
    const topVendedoresDisplay = document.getElementById("topVendedoresDisplay");
    const btnControleEstoque = document.getElementById("btnControleEstoque");
    const btnIntegrantes = document.getElementById("btnIntegrantes");
    const secControleEstoque = document.getElementById("controle-estoque-section");
    const secIntegrantes = document.getElementById("integrantes-section");
    const inputNomeIntegrante = document.getElementById("inputNomeIntegrante");
    const inputPossuiIntegrante = document.getElementById("inputPossuiIntegrante");
    const btnAdicionarIntegrante = document.getElementById("btnAdicionarIntegrante");
    const listaIntegrantes = document.getElementById("lista-integrantes");
    const selectSemana = document.getElementById("selectSemana");
    const btnReiniciarDados = document.getElementById("btnReiniciarDados");
    const btnExportarDados = document.getElementById("btnExportarDados");
    const btnImportarDados = document.getElementById("btnImportarDados");
    const inputImportarArquivo = document.getElementById("inputImportarArquivo");

    // Exibe o preço fixo formatado
    precoFixo.textContent = `R$ ${preco.toFixed(2).replace(".", ",")}`;

    // Local Storage Keys
    const STORAGE_KEYS = {
      ESTOQUE: "swash_estoqueTotal",
      INTEGRANTES: "swash_integrantes"
    };

    // Salvar dados no Local Storage
    function salvarDados() {
      localStorage.setItem(STORAGE_KEYS.ESTOQUE, estoqueTotal.toString());
      localStorage.setItem(STORAGE_KEYS.INTEGRANTES, JSON.stringify(integrantes));
    }

    // Carregar dados do Local Storage
    function carregarDados() {
      const e = localStorage.getItem(STORAGE_KEYS.ESTOQUE);
      const i = localStorage.getItem(STORAGE_KEYS.INTEGRANTES);
      estoqueTotal = e !== null ? parseInt(e, 10) : 0;
      integrantes = i !== null ? JSON.parse(i) : [];
    }

    // Alterna entre abas
    btnControleEstoque.addEventListener("click", () => {
      btnControleEstoque.classList.add("active");
      btnIntegrantes.classList.remove("active");
      secControleEstoque.classList.remove("hidden");
      secIntegrantes.classList.add("hidden");
    });

    btnIntegrantes.addEventListener("click", () => {
      btnIntegrantes.classList.add("active");
      btnControleEstoque.classList.remove("active");
      secIntegrantes.classList.remove("hidden");
      secControleEstoque.classList.add("hidden");
    });

    // Atualiza o estoque total manualmente
    inputEstoqueManual.addEventListener("change", () => {
      let val = parseInt(inputEstoqueManual.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      estoqueTotal = val;
      salvarDados();
      atualizarEstoque();
      atualizarListaIntegrantes();
    });

    // Re-renderiza lista ao trocar de semana
    selectSemana.addEventListener("change", atualizarListaIntegrantes);

    // Adicionar integrante
    btnAdicionarIntegrante.addEventListener("click", () => {
      const nome = inputNomeIntegrante.value.trim();
      let possui = parseInt(inputPossuiIntegrante.value, 10);
      const semana = selectSemana.value;

      if (!nome) {
        alert("Por favor, insira o nome do integrante.");
        return;
      }
      if (isNaN(possui) || possui < 0) {
        alert("Quantidade inválida para o integrante.");
        return;
      }
      if (possui > estoqueTotal) {
        alert("Quantidade que o integrante possui não pode ser maior que o estoque total.");
        return;
      }
      if (integrantes.some(i => i.nome.toLowerCase() === nome.toLowerCase() && i.semana === semana)) {
        alert("Esse integrante já foi adicionado nesta semana.");
        return;
      }

      integrantes.push({ nome, possui, vendidos: 0, devolvidos: 0, semana });
      estoqueTotal -= possui;
      inputNomeIntegrante.value = "";
      inputPossuiIntegrante.value = "";
      inputEstoqueManual.value = estoqueTotal;

      salvarDados();
      atualizarListaIntegrantes();
      atualizarEstoque();
    });

    function atualizarListaIntegrantes() {
      const semanaSel = selectSemana.value;
      const container = listaIntegrantes;
      const filtrados = integrantes.filter(i => i.semana === semanaSel);

      if (filtrados.length === 0) {
        container.innerHTML = '<p class="empty-msg">Nenhum integrante nesta semana.</p>';
        return;
      }

      filtrados.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: 'base' })
      );

      let html = `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>Quantidade que o integrante possui</th>
              <th>Vendidos</th>
              <th>Registrar Venda</th>
              <th>Produtos Devolvidos</th>
              <th>Registrar Devolução</th>
            </tr>
          </thead>
          <tbody>
      `;

      filtrados.forEach((i, idx) => {
        html += `
          <tr data-semana="${i.semana}">
            <td>${idx + 1}</td>
            <td>${i.nome}</td>
            <td>
              <input
                type="number"
                min="${i.vendidos}"
                value="${i.possui}"
                data-index="${integrantes.indexOf(i)}"
                class="input-possui"
              />
            </td>
            <td>${i.vendidos}</td>
            <td>
              <button class="btn-acao btn-vender" data-index="${integrantes.indexOf(i)}" data-tipo="menos">-</button>
              <button class="btn-acao btn-vender" data-index="${integrantes.indexOf(i)}" data-tipo="mais">+</button>
            </td>
            <td>${i.devolvidos}</td>
            <td>
              <button class="btn-acao btn-devolver" data-index="${integrantes.indexOf(i)}" data-tipo="menos">-</button>
              <button class="btn-acao btn-devolver" data-index="${integrantes.indexOf(i)}" data-tipo="mais">+</button>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;

      // Inputs de quantidade
      container.querySelectorAll(".input-possui").forEach(input => {
        input.addEventListener("change", e => {
          const idx = parseInt(e.target.dataset.index, 10);
          let novoValor = parseInt(e.target.value, 10);
          if (isNaN(novoValor) || novoValor < integrantes[idx].vendidos) {
            alert("Quantidade inválida: deve ser maior ou igual a vendidos.");
            e.target.value = integrantes[idx].possui;
            return;
          }
          const diff = novoValor - integrantes[idx].possui;
          if (estoqueTotal - diff < 0) {
            alert("Estoque total insuficiente para essa alteração.");
            e.target.value = integrantes[idx].possui;
            return;
          }
          estoqueTotal -= diff;
          integrantes[idx].possui = novoValor;
          inputEstoqueManual.value = estoqueTotal;
          salvarDados();
          atualizarListaIntegrantes();
          atualizarEstoque();
        });
      });

      // Botões de venda
      container.querySelectorAll(".btn-vender").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index, 10);
          const tipo = btn.dataset.tipo;
          const integrante = integrantes[idx];
          if (tipo === "mais") {
            if (integrante.possui <= 0) {
              alert("Não há produtos disponíveis para vender.");
              return;
            }
            integrante.vendidos++;
            integrante.possui--;
          } else {
            if (integrante.vendidos <= 0) {
              alert("Não há vendas para diminuir.");
              return;
            }
            integrante.vendidos--;
            integrante.possui++;
          }
          inputEstoqueManual.value = estoqueTotal;
          salvarDados();
          atualizarListaIntegrantes();
          atualizarEstoque();
        });
      });

      // Botões de devolução
      container.querySelectorAll(".btn-devolver").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index, 10);
          const tipo = btn.dataset.tipo;
          const integrante = integrantes[idx];
          if (tipo === "mais") {
            if (integrante.possui <= 0) {
              alert("Não há produtos disponíveis para devolver.");
              return;
            }
            integrante.possui--;
            integrante.devolvidos++;
            estoqueTotal++;
          } else {
            if (integrante.devolvidos <= 0) {
              alert("Não há devoluções para diminuir.");
              return;
            }
            integrante.possui++;
            integrante.devolvidos--;
            estoqueTotal--;
          }
          inputEstoqueManual.value = estoqueTotal;
          salvarDados();
          atualizarListaIntegrantes();
          atualizarEstoque();
        });
      });
    }

    function atualizarEstoque() {
      const totalVendidos = integrantes.reduce((acc, i) => acc + i.vendidos, 0);
      const valorEstoque = estoqueTotal * preco;
      const faturamento = totalVendidos * preco;
      const lucro = (preco - 8.05) * totalVendidos;

      valorEstoqueDisplay.textContent = `Valor do estoque: R$ ${valorEstoque.toFixed(2).replace(".", ",")}`;
      faturamentoDisplay.textContent = `Faturamento: R$ ${faturamento.toFixed(2).replace(".", ",")}`;
      lucroDisplay.textContent = `Lucro estimado: R$ ${lucro.toFixed(2).replace(".", ",")}`;
      totalVendasDisplay.textContent = `Total de vendas realizadas: ${totalVendidos}`;

      atualizarTopVendedores();
    }

    function atualizarTopVendedores() {
      const ranking = integrantes.reduce((map, i) => {
        const key = i.nome;
        if (!map[key]) map[key] = 0;
        map[key] += i.vendidos;
        return map;
      }, {});

      const topVendedores = Object.entries(ranking)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topVendedores.length > 0) {
        let lista = topVendedores
          .map(([nome, vendas], idx) => `${idx + 1}. ${nome} - ${vendas} vendas`)
          .join(" | ");
        topVendedoresDisplay.textContent = `Top 3 vendedores: ${lista}`;
      } else {
        topVendedoresDisplay.textContent = "Top 3 vendedores: Nenhum registro ainda.";
      }
    }

    // Botão reiniciar com senha
    const SENHA_DESENVOLVEDOR = "12345";

    btnReiniciarDados.addEventListener("click", () => {
      const tentativa = prompt("Digite a senha do desenvolvedor para reiniciar os dados:");

      if (tentativa === SENHA_DESENVOLVEDOR) {
        if (confirm("Tem certeza que deseja apagar todos os dados? Essa ação não pode ser desfeita.")) {
          estoqueTotal = 0;
          inputEstoqueManual.value = estoqueTotal;
          integrantes = [];

          salvarDados();
          atualizarEstoque();
          atualizarListaIntegrantes();

          alert("Todos os dados foram reiniciados com sucesso.");
        }
      } else {
        alert("Senha incorreta. Ação cancelada.");
      }
    });

    // Exportar dados para JSON
    btnExportarDados.addEventListener("click", () => {
      const dadosParaExportar = {
        estoqueTotal,
        integrantes
      };
      const blob = new Blob([JSON.stringify(dadosParaExportar, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "controle_estoque_dados.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    // Importar dados JSON
    btnImportarDados.addEventListener("click", () => {
      inputImportarArquivo.value = null; // reset file input
      inputImportarArquivo.click();
    });

    inputImportarArquivo.addEventListener("change", event => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const dadoImportado = JSON.parse(e.target.result);
          if (typeof dadoImportado.estoqueTotal === "number" && Array.isArray(dadoImportado.integrantes)) {
            estoqueTotal = dadoImportado.estoqueTotal;
            integrantes = dadoImportado.integrantes;

            inputEstoqueManual.value = estoqueTotal;
            salvarDados();
            atualizarEstoque();
            atualizarListaIntegrantes();

            alert("Dados importados com sucesso!");
          } else {
            alert("Arquivo inválido ou formato incorreto.");
          }
        } catch {
          alert("Erro ao ler o arquivo. Certifique-se de que é um arquivo JSON válido.");
        }
      };
      reader.readAsText(file);
    });

    // Inicialização - carregar dados do localStorage
    carregarDados();

    // Atualizar UI após carregar dados
    inputEstoqueManual.value = estoqueTotal;
    atualizarEstoque();
    atualizarListaIntegrantes();