(() => {
  "use strict";

  // 1. Configurações
  const DEFAULT_THRESHOLDS = {
    critical: 25,
    low: 50,
    partial: 80,
    near: 100,
  };

  const STATUS_DEFS = {
    "Sem baixa": { color: "#e43845", icon: "circle-slash-2" },
    "Baixa crítica": { color: "#f03a47", icon: "siren" },
    "Baixa realização": { color: "#f97316", icon: "trending-down" },
    "Realização parcial": { color: "#f5a30b", icon: "circle-dot-dashed" },
    "Próximo da conclusão": { color: "#0878f9", icon: "timer" },
    "Concluído": { color: "#0aaf72", icon: "circle-check-big" },
    "Excesso de baixa": { color: "#805ad5", icon: "badge-plus" },
    "Inconsistente": { color: "#64748b", icon: "triangle-alert" },
  };

  const CANONICAL_FIELDS = [
    ["projeto", "Projeto", true],
    ["descricaoProjeto", "Descrição do projeto", false],
    ["contrato", "Contrato", false],
    ["codigoMaterial", "Código do material", true],
    ["descricaoMaterial", "Descrição do material", false],
    ["unidadeMedida", "Unidade de medida", false],
    ["quantidadeOrcada", "Quantidade orçada", true],
    ["quantidadeBaixada", "Quantidade baixada", true],
    ["reserva", "Reserva", false],
    ["codigoMovimento", "Código do movimento", false],
    ["tipoMovimento", "Tipo de movimento", false],
    ["dataMovimento", "Data do movimento", false],
    ["centro", "Centro", false],
    ["deposito", "Depósito", false],
    ["documentoSap", "Documento SAP", false],
    ["itemSap", "Item SAP", false],
    ["categoria", "Categoria", false],
    ["materialOrigem", "Material de origem", false],
    ["classificacaoMcpse", "Classificação MCPSE", false],
    ["criterioOrdenacao", "Critério de ordenação", false],
    ["pontoDescarga", "Ponto de descarga", false],
    ["recebedor", "Recebedor", false],
    ["relevancia", "Relevância", false],
  ];

  const COLUMN_ALIASES = {
    projeto: ["projeto", "cod_projeto", "codigo_projeto", "definicao_do_projeto", "elemento_pep", "pep", "project"],
    descricaoProjeto: ["descricao_do_projeto", "descricao_projeto", "nome_do_projeto", "nome_projeto", "project_description"],
    contrato: ["contrato", "contrato_sap", "numero_contrato", "n_contrato", "contract"],
    codigoMaterial: ["material", "codigo_do_material", "codigo_material", "cod_material", "item_material", "sku"],
    descricaoMaterial: ["descricao", "descricao_do_material", "descricao_material", "texto_breve_material", "material_descricao"],
    unidadeMedida: ["unidade", "unidade_de_medida", "um", "uom", "un"],
    quantidadeOrcada: ["qtd_planej", "qtd_planejada", "quantidade_planejada", "quantidade_orcada", "qtd_orcada", "planejado", "orcado", "qtd_necessidade"],
    quantidadeBaixada: ["qtd_real", "qtd_realizada", "quantidade_realizada", "quantidade_baixada", "qtd_baixada", "realizado", "baixado", "qtd_retirada"],
    reserva: ["reserva", "numero_reserva", "n_reserva"],
    codigoMovimento: ["mov", "movimento", "codigo_do_movimento", "codigo_movimento", "cod_mov", "tipo_movimento_sap"],
    tipoMovimento: ["oper", "operacao", "tipo_de_movimento", "tipo_movimento"],
    dataMovimento: ["data_da_necessidade", "data_movimento", "data_do_movimento", "data_lancamento", "data_reserva", "data"],
    centro: ["centro", "centro_sap", "plant"],
    deposito: ["dep", "deposito", "deposito_sap", "storage_location"],
    documentoSap: ["diagrama", "documento_sap", "documento", "doc_sap"],
    itemSap: ["item", "item_sap", "numero_item"],
    categoria: ["categ", "categoria", "categoria_item"],
    materialOrigem: ["mtl_origem", "material_origem", "material_de_origem"],
    classificacaoMcpse: ["classif_mcpse", "classificacao_mcpse", "classificacao"],
    criterioOrdenacao: ["crit_orden", "criterio_ordenacao", "criterio_de_ordenacao"],
    pontoDescarga: ["ponto_desc", "ponto_descarga", "ponto_de_descarga"],
    recebedor: ["recebedor", "destinatario"],
    relevancia: ["relev", "relevancia"],
  };

  const ISSUE_DEFS = [
    ["missing_contract", "Contratos não informados", "file-question", "#f97316", "sem_contrato"],
    ["missing_project", "Projeto ausente", "folder-x", "#e43845", "inconsistente"],
    ["missing_material", "Material ausente", "package-x", "#e43845", "inconsistente"],
    ["missing_description", "Material sem descrição", "text-search", "#f59e0b", "inconsistente"],
    ["negative_planned", "Quantidade orçada negativa", "circle-minus", "#e43845", "negativo"],
    ["negative_downloaded", "Quantidade baixada negativa", "circle-minus", "#e43845", "negativo"],
    ["excess", "Baixa superior ao orçamento", "badge-plus", "#805ad5", "acima_100"],
    ["planned_zero_with_downloaded", "Baixa com orçamento zero", "badge-alert", "#e43845", "inconsistente"],
    ["project_no_download", "Projetos sem baixa", "circle-slash-2", "#f97316", "abaixo_25"],
    ["missing_movement", "Movimento ausente", "git-compare", "#f59e0b", "inconsistente"],
    ["missing_reservation", "Reserva ausente", "clipboard-x", "#f59e0b", "inconsistente"],
    ["invalid_date", "Data inválida", "calendar-x-2", "#e43845", "inconsistente"],
    ["duplicate", "Registros duplicados", "copy-x", "#805ad5", "inconsistente"],
    ["unit_divergence", "Unidade divergente", "scale", "#f59e0b", "inconsistente"],
    ["incomplete", "Dados incompletos", "list-x", "#64748b", "inconsistente"],
  ];

  const CSV_EXPORT_FIELDS = [
    ["projeto", "Projeto"],
    ["descricaoProjeto", "Descrição do Projeto"],
    ["contrato", "Contrato"],
    ["codigoMaterial", "Código do Material"],
    ["descricaoMaterial", "Descrição do Material"],
    ["unidadeMedida", "Unidade de Medida"],
    ["quantidadeOrcada", "Quantidade Orçada"],
    ["quantidadeBaixada", "Quantidade Baixada"],
    ["reserva", "Reserva"],
    ["codigoMovimento", "Código do Movimento"],
    ["tipoMovimento", "Tipo de Movimento"],
    ["dataMovimento", "Data do Movimento"],
    ["centro", "Centro"],
    ["deposito", "Depósito"],
    ["documentoSap", "Documento SAP"],
    ["itemSap", "Item SAP"],
  ];

  // 2. Estado da aplicação
  const state = {
    allRecords: [],
    filteredRecords: [],
    projectSummaries: [],
    materialSummaries: [],
    metadata: {},
    charts: new Map(),
    expandedChart: null,
    page: 1,
    pageSize: Number(localStorage.getItem("mcpsePageSize")) || 25,
    sort: { key: "planned", direction: "desc" },
    thresholds: loadThresholds(),
    pendingImport: null,
    filters: {},
    sourceType: "base",
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  // 3. Normalização
  function normalizeText(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function normalizeHeader(value) {
    return normalizeText(value)
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function cleanString(value) {
    if (value === null || value === undefined) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
    return String(value).trim();
  }

  function toNumber(value) {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (value === null || value === undefined || value === "") return 0;
    const cleaned = String(value).trim().replace(/\s/g, "");
    if (!cleaned) return 0;
    const normalized = cleaned.includes(",")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  function isNumericLike(value) {
    if (value === "" || value === null || value === undefined) return true;
    if (typeof value === "number") return Number.isFinite(value);
    const cleaned = String(value).trim().replace(/\s/g, "");
    const normalized = cleaned.includes(",")
      ? cleaned.replace(/\./g, "").replace(",", ".")
      : cleaned;
    return Number.isFinite(Number(normalized));
  }

  function toISODate(value) {
    if (!value) return "";
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
    if (typeof value === "number" && window.XLSX?.SSF?.parse_date_code) {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d)).toISOString();
    }
    const text = String(value).trim();
    const br = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (br) {
      const date = new Date(Date.UTC(Number(br[3]), Number(br[2]) - 1, Number(br[1])));
      return Number.isNaN(date.getTime()) ? "" : date.toISOString();
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
  }

  function prepareRecords(records) {
    const prepared = records.map((raw, index) => {
      const plannedRaw = raw.quantidadeOrcada;
      const downloadedRaw = raw.quantidadeBaixada;
      const dateRaw = raw.dataMovimento;
      const record = {
        projeto: cleanString(raw.projeto),
        descricaoProjeto: cleanString(raw.descricaoProjeto),
        contrato: cleanString(raw.contrato),
        codigoMaterial: cleanString(raw.codigoMaterial),
        descricaoMaterial: cleanString(raw.descricaoMaterial),
        unidadeMedida: cleanString(raw.unidadeMedida),
        quantidadeOrcada: toNumber(plannedRaw),
        quantidadeBaixada: toNumber(downloadedRaw),
        reserva: cleanString(raw.reserva),
        codigoMovimento: cleanString(raw.codigoMovimento),
        tipoMovimento: cleanString(raw.tipoMovimento),
        dataMovimento: toISODate(dateRaw),
        centro: cleanString(raw.centro),
        deposito: cleanString(raw.deposito),
        documentoSap: cleanString(raw.documentoSap),
        itemSap: cleanString(raw.itemSap),
        categoria: cleanString(raw.categoria),
        materialOrigem: cleanString(raw.materialOrigem),
        classificacaoMcpse: cleanString(raw.classificacaoMcpse),
        criterioOrdenacao: cleanString(raw.criterioOrdenacao),
        pontoDescarga: cleanString(raw.pontoDescarga),
        recebedor: cleanString(raw.recebedor),
        relevancia: cleanString(raw.relevancia),
        _sourceRow: raw._linhaOrigem || raw._sourceRow || index + 2,
        _invalidPlanned: !isNumericLike(plannedRaw),
        _invalidDownloaded: !isNumericLike(downloadedRaw),
        _invalidDate: Boolean(dateRaw) && !toISODate(dateRaw),
        _issues: [],
      };
      record._search = normalizeText([
        record.projeto,
        record.descricaoProjeto,
        record.contrato,
        record.codigoMaterial,
        record.descricaoMaterial,
        record.codigoMovimento,
        record.reserva,
        record.centro,
        record.deposito,
        record.classificacaoMcpse,
      ].join(" "));
      return record;
    });
    validateRecords(prepared);
    return prepared;
  }

  function validateRecords(records) {
    const duplicateCounts = new Map();
    const unitsByProjectMaterial = new Map();

    records.forEach((record) => {
      const duplicateKey = [record.projeto, record.codigoMaterial, record.documentoSap, record.itemSap].join("|");
      if (record.projeto && record.codigoMaterial && record.documentoSap && record.itemSap) {
        duplicateCounts.set(duplicateKey, (duplicateCounts.get(duplicateKey) || 0) + 1);
      }
      if (record.projeto && record.codigoMaterial && record.unidadeMedida) {
        const unitKey = `${record.projeto}|${record.codigoMaterial}`;
        if (!unitsByProjectMaterial.has(unitKey)) unitsByProjectMaterial.set(unitKey, new Set());
        unitsByProjectMaterial.get(unitKey).add(record.unidadeMedida);
      }
    });

    records.forEach((record) => {
      const issues = [];
      if (!record.contrato) issues.push("missing_contract");
      if (!record.projeto) issues.push("missing_project");
      if (!record.codigoMaterial) issues.push("missing_material");
      if (!record.descricaoMaterial) issues.push("missing_description");
      if (record._invalidPlanned) issues.push("invalid_planned");
      if (record._invalidDownloaded) issues.push("invalid_downloaded");
      if (record.quantidadeOrcada < 0) issues.push("negative_planned");
      if (record.quantidadeBaixada < 0) issues.push("negative_downloaded");
      if (record.quantidadeOrcada === 0 && record.quantidadeBaixada > 0) issues.push("planned_zero_with_downloaded");
      if (record.quantidadeOrcada > 0 && record.quantidadeBaixada > record.quantidadeOrcada) issues.push("excess");
      if (!record.codigoMovimento) issues.push("missing_movement");
      if (!record.reserva) issues.push("missing_reservation");
      if (record._invalidDate) issues.push("invalid_date");

      const duplicateKey = [record.projeto, record.codigoMaterial, record.documentoSap, record.itemSap].join("|");
      if (duplicateCounts.get(duplicateKey) > 1) issues.push("duplicate");

      const unitKey = `${record.projeto}|${record.codigoMaterial}`;
      if (unitsByProjectMaterial.get(unitKey)?.size > 1) issues.push("unit_divergence");

      if (!record.projeto || !record.codigoMaterial || record._invalidPlanned || record._invalidDownloaded) {
        issues.push("incomplete");
      }
      record._issues = [...new Set(issues)];
    });
  }

  function classifyProject(planned, downloaded) {
    if (!Number.isFinite(planned) || !Number.isFinite(downloaded)) return "Inconsistente";
    if (planned === 0 && downloaded > 0) return "Inconsistente";
    if (planned <= 0) return downloaded === 0 ? "Sem baixa" : "Inconsistente";
    const percent = (downloaded / planned) * 100;
    if (percent === 0) return "Sem baixa";
    if (percent < state.thresholds.critical) return "Baixa crítica";
    if (percent < state.thresholds.low) return "Baixa realização";
    if (percent < state.thresholds.partial) return "Realização parcial";
    if (percent < state.thresholds.near) return "Próximo da conclusão";
    if (Math.abs(percent - 100) < 0.000001) return "Concluído";
    if (percent > 100) return "Excesso de baixa";
    return "Próximo da conclusão";
  }

  function aggregateProjects(records) {
    const map = new Map();
    records.forEach((record) => {
      const key = record.projeto || "Projeto não informado";
      if (!map.has(key)) {
        map.set(key, {
          project: key,
          description: record.descricaoProjeto,
          contracts: new Set(),
          materials: new Set(),
          reservations: new Set(),
          movements: new Map(),
          planned: 0,
          downloaded: 0,
          records: 0,
          lastDate: "",
          issueCount: 0,
          issueTypes: new Set(),
          hasMissingContract: false,
          hasNegative: false,
        });
      }
      const item = map.get(key);
      if (record.contrato) item.contracts.add(record.contrato);
      if (record.codigoMaterial) item.materials.add(record.codigoMaterial);
      if (record.reserva) item.reservations.add(record.reserva);
      if (record.codigoMovimento) {
        item.movements.set(record.codigoMovimento, (item.movements.get(record.codigoMovimento) || 0) + 1);
      }
      item.planned += record.quantidadeOrcada;
      item.downloaded += record.quantidadeBaixada;
      item.records += 1;
      item.issueCount += record._issues.length;
      record._issues.forEach((issue) => item.issueTypes.add(issue));
      item.hasMissingContract ||= !record.contrato;
      item.hasNegative ||= record.quantidadeOrcada < 0 || record.quantidadeBaixada < 0;
      if (record.dataMovimento && (!item.lastDate || record.dataMovimento > item.lastDate)) {
        item.lastDate = record.dataMovimento;
      }
    });

    return [...map.values()].map((item) => {
      const percent = item.planned ? (item.downloaded / item.planned) * 100 : 0;
      const movement = [...item.movements.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
      return {
        ...item,
        contract: item.contracts.size ? [...item.contracts].join(", ") : "Sem contrato",
        materials: item.materials.size,
        reservations: item.reservations.size,
        movement,
        pending: item.planned - item.downloaded,
        difference: item.downloaded - item.planned,
        percent,
        percentPending: item.planned > 0 && item.downloaded >= 0 && item.downloaded <= item.planned ? 100 - percent : 0,
        status: classifyProject(item.planned, item.downloaded),
      };
    });
  }

  function aggregateMaterials(records) {
    const map = new Map();
    records.forEach((record) => {
      const key = record.codigoMaterial || "Material não informado";
      if (!map.has(key)) {
        map.set(key, {
          code: key,
          description: record.descricaoMaterial || "Sem descrição",
          units: new Set(),
          planned: 0,
          downloaded: 0,
          records: 0,
        });
      }
      const item = map.get(key);
      if (record.unidadeMedida) item.units.add(record.unidadeMedida);
      item.planned += record.quantidadeOrcada;
      item.downloaded += record.quantidadeBaixada;
      item.records += 1;
    });
    return [...map.values()].map((item) => ({
      ...item,
      unit: [...item.units].join(", ") || "—",
      pending: item.planned - item.downloaded,
      percent: item.planned ? (item.downloaded / item.planned) * 100 : 0,
    }));
  }

  // 4. Importação
  async function handleFile(file) {
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast("Arquivo muito grande", "O processamento dependerá da memória disponível neste equipamento.", "warning");
    }
    showProgress("Lendo arquivo", 8);
    try {
      const extension = file.name.split(".").pop().toLowerCase();
      if (extension === "json") {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const records = Array.isArray(parsed) ? parsed : parsed.records;
        if (!Array.isArray(records)) throw new Error("O JSON deve conter um array ou a propriedade records.");
        const headers = [...new Set(records.flatMap((row) => Object.keys(row)))];
        state.pendingImport = {
          file,
          sheets: [{ name: "JSON", headers, dataRows: records.map((row) => headers.map((header) => row[header])) }],
        };
      } else {
        if (!window.XLSX) throw new Error("A biblioteca de leitura do Excel não foi carregada.");
        const bytes = await file.arrayBuffer();
        setProgress("Identificando abas", 22);
        await nextFrame();
        const workbook = XLSX.read(bytes, { type: "array", cellDates: true, dense: true });
        const sheets = workbook.SheetNames.map((name) => {
          const matrix = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "", raw: true });
          const headerIndex = detectHeaderRow(matrix);
          const headers = (matrix[headerIndex] || []).map((value, index) => cleanString(value) || `Coluna_${index + 1}`);
          return { name, headers, dataRows: matrix.slice(headerIndex + 1), totalRows: Math.max(matrix.length - headerIndex - 1, 0) };
        }).filter((sheet) => sheet.headers.length);
        if (!sheets.length) throw new Error("Nenhuma aba com dados foi identificada.");
        state.pendingImport = { file, sheets };
      }
      setProgress("Mapeando colunas", 38);
      renderImportModal();
      hideProgress();
      openModal("importModal");
    } catch (error) {
      hideProgress();
      toast("Não foi possível importar", error.message, "error");
      console.error(error);
    } finally {
      $("#fileInput").value = "";
    }
  }

  function detectHeaderRow(matrix) {
    let bestIndex = 0;
    let bestScore = -1;
    matrix.slice(0, 20).forEach((row, index) => {
      const normalized = row.map(normalizeHeader);
      const aliasMatches = normalized.filter((header) =>
        Object.values(COLUMN_ALIASES).some((aliases) => aliases.includes(header))
      ).length;
      const nonEmpty = normalized.filter(Boolean).length;
      const score = aliasMatches * 12 + Math.min(nonEmpty, 20);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  function autoHeader(headers, field) {
    const aliases = COLUMN_ALIASES[field] || [];
    return headers.find((header) => aliases.includes(normalizeHeader(header))) || "";
  }

  function selectedPendingSheets() {
    const names = new Set($$(".sheet-checkbox:checked").map((input) => input.value));
    return state.pendingImport?.sheets.filter((sheet) => names.has(sheet.name)) || [];
  }

  function renderImportModal() {
    const pending = state.pendingImport;
    if (!pending) return;
    $("#importFileSummary").textContent = `${pending.file.name} • ${formatBytes(pending.file.size)} • ${pending.sheets.length} aba(s) identificada(s)`;
    $("#sheetSelector").innerHTML = pending.sheets.map((sheet, index) => {
      const checked = sheet.name === "Materiais" || (!pending.sheets.some((candidate) => candidate.name === "Materiais") && index === 0);
      return `<label class="sheet-option"><span><strong>${escapeHtml(sheet.name)}</strong><br>${formatInteger(sheet.totalRows ?? sheet.dataRows.length)} linhas</span><input class="sheet-checkbox" type="checkbox" value="${escapeAttribute(sheet.name)}" ${checked ? "checked" : ""}></label>`;
    }).join("");
    $$(".sheet-checkbox").forEach((input) => input.addEventListener("change", renderMappingGrid));
    renderMappingGrid();
  }

  function renderMappingGrid() {
    const sheets = selectedPendingSheets();
    const headers = [...new Set(sheets.flatMap((sheet) => sheet.headers))];
    $("#mappingGrid").innerHTML = CANONICAL_FIELDS.map(([field, label, required]) => {
      const detected = autoHeader(headers, field);
      const options = [`<option value="">Não mapear</option>`]
        .concat(headers.map((header) => `<option value="${escapeAttribute(header)}" ${header === detected ? "selected" : ""}>${escapeHtml(header)}</option>`))
        .join("");
      return `<label>${escapeHtml(label)}${required ? " *" : ""}<select data-map-field="${field}">${options}</select></label>`;
    }).join("");
  }

  async function confirmImport() {
    const pending = state.pendingImport;
    const sheets = selectedPendingSheets();
    if (!pending || !sheets.length) {
      toast("Selecione uma aba", "Marque ao menos uma aba para continuar.", "warning");
      return;
    }
    const preferredMapping = Object.fromEntries(
      $$("[data-map-field]").map((select) => [select.dataset.mapField, select.value])
    );
    closeModal("importModal");
    showProgress("Validando registros", 48);
    await nextFrame();
    try {
      const rawRecords = [];
      const totalRows = sheets.reduce((sum, sheet) => sum + sheet.dataRows.length, 0);
      let processed = 0;

      for (const sheet of sheets) {
        const fieldIndexes = {};
        CANONICAL_FIELDS.forEach(([field]) => {
          const preferred = preferredMapping[field];
          const header = preferred && sheet.headers.includes(preferred)
            ? preferred
            : autoHeader(sheet.headers, field);
          fieldIndexes[field] = header ? sheet.headers.indexOf(header) : -1;
        });
        for (let index = 0; index < sheet.dataRows.length; index += 1) {
          const row = sheet.dataRows[index];
          if (!row || !row.some((value) => value !== "" && value !== null && value !== undefined)) continue;
          const record = {};
          CANONICAL_FIELDS.forEach(([field]) => {
            const position = fieldIndexes[field];
            record[field] = position >= 0 ? row[position] : "";
          });
          record._sourceRow = index + 2;
          rawRecords.push(record);
          processed += 1;
          if (processed % 500 === 0) {
            const progress = 48 + Math.round((processed / Math.max(totalRows, 1)) * 28);
            setProgress("Consolidando projetos", Math.min(progress, 76));
            await nextFrame();
          }
        }
      }
      setProgress("Calculando indicadores", 82);
      await nextFrame();
      const prepared = prepareRecords(rawRecords);
      if (!prepared.length) throw new Error("Nenhuma linha válida foi encontrada nas abas selecionadas.");
      state.allRecords = prepared;
      state.metadata = {
        origem: "SAP — importação local",
        arquivo: pending.file.name,
        aba: sheets.map((sheet) => sheet.name).join(", "),
        dataAtualizacao: "",
        dataImportacao: new Date().toISOString(),
        tamanhoArquivo: pending.file.size,
        totalColunas: Math.max(...sheets.map((sheet) => sheet.headers.length)),
      };
      state.sourceType = "imported";
      localStorage.setItem("mcpseLastImport", JSON.stringify({
        arquivo: pending.file.name,
        aba: state.metadata.aba,
        dataImportacao: state.metadata.dataImportacao,
        tamanhoArquivo: pending.file.size,
        registros: prepared.length,
      }));
      state.pendingImport = null;
      setProgress("Atualizando gráficos", 93);
      await nextFrame();
      populateFilters();
      clearFilters(false);
      updateDashboard();
      setProgress("Concluído", 100);
      setTimeout(hideProgress, 350);
      toast("Importação concluída", `${formatInteger(prepared.length)} registros foram processados localmente.`, "success");
    } catch (error) {
      hideProgress();
      toast("Erro durante o processamento", error.message, "error");
      console.error(error);
    }
  }

  // 5. Filtros
  function readFilters() {
    state.filters = {
      search: normalizeText($("#globalSearch").value),
      project: $("#filterProject").value,
      contract: $("#filterContract").value,
      status: $("#filterStatus").value,
      material: $("#filterMaterial").value,
      movement: $("#filterMovement").value,
      reservation: $("#filterReservation").value,
      center: $("#filterCenter").value,
      deposit: $("#filterDeposit").value,
      unit: $("#filterUnit").value,
      condition: $("#filterCondition").value,
      dateStart: $("#filterDateStart").value,
      dateEnd: $("#filterDateEnd").value,
    };
    return state.filters;
  }

  function filterData() {
    const filters = readFilters();
    let baseRecords = state.allRecords.filter((record) => {
      if (filters.search && !record._search.includes(filters.search)) return false;
      if (filters.project && record.projeto !== filters.project) return false;
      if (filters.contract && record.contrato !== filters.contract) return false;
      if (filters.material && record.codigoMaterial !== filters.material) return false;
      if (filters.movement && record.codigoMovimento !== filters.movement) return false;
      if (filters.reservation && record.reserva !== filters.reservation) return false;
      if (filters.center && record.centro !== filters.center) return false;
      if (filters.deposit && record.deposito !== filters.deposit) return false;
      if (filters.unit && record.unidadeMedida !== filters.unit) return false;
      if (filters.dateStart && (!record.dataMovimento || record.dataMovimento.slice(0, 10) < filters.dateStart)) return false;
      if (filters.dateEnd && (!record.dataMovimento || record.dataMovimento.slice(0, 10) > filters.dateEnd)) return false;
      return true;
    });

    let projects = aggregateProjects(baseRecords);
    projects = projects.filter((project) => {
      if (filters.status && project.status !== filters.status) return false;
      switch (filters.condition) {
        case "sem_contrato": return project.hasMissingContract;
        case "com_contrato": return project.contracts.size > 0;
        case "negativo": return project.hasNegative;
        case "inconsistente": return project.issueCount > 0;
        case "abaixo_25": return project.percent < 25;
        case "abaixo_50": return project.percent < 50;
        case "entre_50_80": return project.percent >= 50 && project.percent < 80;
        case "acima_80": return project.percent >= 80;
        case "igual_100": return Math.abs(project.percent - 100) < 0.000001;
        case "acima_100": return project.percent > 100;
        default: return true;
      }
    });
    const includedProjects = new Set(projects.map((project) => project.project));
    baseRecords = baseRecords.filter((record) => includedProjects.has(record.projeto || "Projeto não informado"));
    state.filteredRecords = baseRecords;
    state.projectSummaries = aggregateProjects(baseRecords);
    state.materialSummaries = aggregateMaterials(baseRecords);
  }

  function populateFilters() {
    const options = {
      filterProject: uniqueSorted(state.allRecords.map((row) => row.projeto).filter(Boolean)),
      filterContract: uniqueSorted(state.allRecords.map((row) => row.contrato).filter(Boolean)),
      filterMovement: uniqueSorted(state.allRecords.map((row) => row.codigoMovimento).filter(Boolean)),
      filterReservation: uniqueSorted(state.allRecords.map((row) => row.reserva).filter(Boolean)),
      filterCenter: uniqueSorted(state.allRecords.map((row) => row.centro).filter(Boolean)),
      filterDeposit: uniqueSorted(state.allRecords.map((row) => row.deposito).filter(Boolean)),
      filterUnit: uniqueSorted(state.allRecords.map((row) => row.unidadeMedida).filter(Boolean)),
    };
    Object.entries(options).forEach(([id, values]) => setSelectOptions(id, values));

    const materialMap = new Map();
    state.allRecords.forEach((row) => {
      if (row.codigoMaterial && !materialMap.has(row.codigoMaterial)) {
        materialMap.set(row.codigoMaterial, row.descricaoMaterial);
      }
    });
    const currentMaterial = $("#filterMaterial").value;
    $("#filterMaterial").innerHTML = `<option value="">Todos</option>${[...materialMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], "pt-BR", { numeric: true }))
      .map(([code, description]) => `<option value="${escapeAttribute(code)}">${escapeHtml(code)}${description ? ` — ${escapeHtml(shorten(description, 42))}` : ""}</option>`)
      .join("")}`;
    $("#filterMaterial").value = currentMaterial;
    renderStatusOptions();
  }

  function setSelectOptions(id, values) {
    const select = $(`#${id}`);
    const current = select.value;
    select.innerHTML = `<option value="">Todos</option>${values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(value)}</option>`).join("")}`;
    select.value = current;
  }

  function renderStatusOptions() {
    const select = $("#filterStatus");
    const current = select.value;
    select.innerHTML = `<option value="">Todos</option>${Object.keys(STATUS_DEFS).map((status) => `<option value="${escapeAttribute(status)}">${escapeHtml(status)}</option>`).join("")}`;
    select.value = current;
  }

  function renderFilterChips() {
    const filters = state.filters;
    const labels = {
      search: "Busca",
      project: "Projeto",
      contract: "Contrato",
      status: "Status",
      material: "Material",
      movement: "Movimento",
      reservation: "Reserva",
      center: "Centro",
      deposit: "Depósito",
      unit: "Unidade",
      condition: "Condição",
      dateStart: "Desde",
      dateEnd: "Até",
    };
    const active = Object.entries(filters).filter(([, value]) => value);
    $("#activeFilterCount").textContent = `${active.length} ${active.length === 1 ? "filtro ativo" : "filtros ativos"}`;
    $("#filterChips").innerHTML = active.map(([key, value]) => {
      const visible = key === "search" ? $("#globalSearch").value : displayFilterValue(key, value);
      return `<span class="filter-chip">${labels[key]}: ${escapeHtml(shorten(visible, 38))}<button data-clear-filter="${key}" aria-label="Remover filtro ${labels[key]}">×</button></span>`;
    }).join("");
    $$("[data-clear-filter]").forEach((button) => button.addEventListener("click", () => {
      clearSingleFilter(button.dataset.clearFilter);
      applyFilters();
    }));
  }

  function displayFilterValue(key, value) {
    if (key === "condition") {
      return $("#filterCondition").querySelector(`option[value="${CSS.escape(value)}"]`)?.textContent || value;
    }
    return value;
  }

  function clearSingleFilter(key) {
    const map = {
      search: "globalSearch",
      project: "filterProject",
      contract: "filterContract",
      status: "filterStatus",
      material: "filterMaterial",
      movement: "filterMovement",
      reservation: "filterReservation",
      center: "filterCenter",
      deposit: "filterDeposit",
      unit: "filterUnit",
      condition: "filterCondition",
      dateStart: "filterDateStart",
      dateEnd: "filterDateEnd",
    };
    $(`#${map[key]}`).value = "";
  }

  function clearFilters(update = true) {
    [
      "globalSearch", "filterProject", "filterContract", "filterStatus", "filterMaterial",
      "filterMovement", "filterReservation", "filterCenter", "filterDeposit", "filterUnit",
      "filterCondition", "filterDateStart", "filterDateEnd",
    ].forEach((id) => { $(`#${id}`).value = ""; });
    if (update) {
      state.page = 1;
      updateDashboard();
      toast("Filtros limpos", "A visualização voltou a exibir toda a base.", "info");
    }
  }

  function applyFilters() {
    state.page = 1;
    updateDashboard();
  }

  // 6. KPIs
  function calculateKpis() {
    const records = state.filteredRecords;
    const projects = state.projectSummaries;
    const planned = sum(records, "quantidadeOrcada");
    const downloaded = sum(records, "quantidadeBaixada");
    const pending = planned - downloaded;
    const percent = planned ? (downloaded / planned) * 100 : 0;
    const incomplete = records.filter((row) => row._issues.includes("incomplete")).length;
    const duplicates = records.filter((row) => row._issues.includes("duplicate")).length;
    return [
      ["Total de registros", records.length, "list-tree", "#0878f9", "Linhas consideradas após os filtros", "integer"],
      ["Total de projetos", projects.length, "folder-kanban", "#4f5ee8", "Projetos distintos na seleção", "integer"],
      ["Total de contratos", new Set(records.map((row) => row.contrato).filter(Boolean)).size, "file-signature", "#805ad5", "Contratos distintos informados", "integer"],
      ["Materiais distintos", new Set(records.map((row) => row.codigoMaterial).filter(Boolean)).size, "package-search", "#0878f9", "Códigos de materiais únicos", "integer"],
      ["Quantidade orçada", planned, "clipboard-list", "#0878f9", "Soma da quantidade planejada", "number"],
      ["Quantidade baixada", downloaded, "badge-check", "#0aaf72", "Soma da quantidade realizada", "number"],
      ["Ainda não baixada", pending, "clock-arrow-up", "#64748b", "Orçado menos baixado", "number"],
      ["Percentual de baixa", percent, "gauge", percent >= 80 ? "#0aaf72" : percent >= 50 ? "#f59e0b" : "#e43845", "Baixado dividido pelo orçado", "percent"],
      ["Percentual não baixado", planned > 0 ? 100 - Math.min(Math.max(percent, 0), 100) : 0, "circle-dashed", "#64748b", "Complemento até 100% nos casos elegíveis", "percent"],
      ["Diferença total", downloaded - planned, "diff", downloaded - planned > 0 ? "#805ad5" : "#f97316", "Baixado menos orçado", "number"],
      ["Projetos concluídos", projects.filter((item) => item.status === "Concluído").length, "circle-check-big", "#0aaf72", "Projetos com exatamente 100%", "integer"],
      ["Projetos críticos", projects.filter((item) => ["Sem baixa", "Baixa crítica"].includes(item.status)).length, "siren", "#e43845", "Projetos sem baixa ou abaixo da faixa crítica", "integer"],
      ["Projetos com excesso", projects.filter((item) => item.status === "Excesso de baixa").length, "badge-plus", "#805ad5", "Projetos acima de 100%", "integer"],
      ["Registros sem contrato", records.filter((row) => !row.contrato).length, "file-question", "#f97316", "Linhas sem contrato associado", "integer"],
      ["Orçadas negativas", records.filter((row) => row.quantidadeOrcada < 0).length, "circle-minus", "#e43845", "Linhas com quantidade orçada negativa", "integer"],
      ["Baixadas negativas", records.filter((row) => row.quantidadeBaixada < 0).length, "circle-minus", "#e43845", "Linhas com quantidade baixada negativa", "integer"],
      ["Dados incompletos", incomplete, "list-x", "#64748b", "Registros sem campos essenciais", "integer"],
      ["Registros duplicados", duplicates, "copy-x", "#805ad5", "Mesma chave projeto/material/documento/item", "integer"],
    ];
  }

  function renderKpis() {
    $("#kpiGrid").innerHTML = calculateKpis().map(([title, value, icon, color, description, type]) => `
      <article class="kpi-card" style="--accent:${color}" title="${escapeAttribute(description)}">
        <div class="kpi-top"><span class="kpi-icon"><i data-lucide="${icon}"></i></span></div>
        <h3>${escapeHtml(title)}</h3>
        <strong class="kpi-value">${type === "percent" ? formatPercent(value) : type === "number" ? formatNumber(value) : formatInteger(value)}</strong>
        <span class="kpi-description">${escapeHtml(description)}</span>
      </article>
    `).join("");
    refreshIcons();
  }

  // 7. Gráficos
  function chartColors() {
    const styles = getComputedStyle(document.documentElement);
    return {
      text: styles.getPropertyValue("--text").trim(),
      muted: styles.getPropertyValue("--muted").trim(),
      border: styles.getPropertyValue("--border").trim(),
      surface: styles.getPropertyValue("--surface").trim(),
    };
  }

  function defaultChartOptions({ indexAxis = "x", stacked = false, percentAxis = false } = {}) {
    const colors = chartColors();
    return {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis,
      animation: { duration: 520, easing: "easeOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: colors.muted, boxWidth: 10, boxHeight: 10, usePointStyle: true, pointStyle: "circle", padding: 14, font: { size: 10 } },
        },
        tooltip: {
          backgroundColor: "#0f1b2f",
          titleColor: "#ffffff",
          bodyColor: "#e7eef9",
          padding: 11,
          cornerRadius: 10,
          callbacks: {
            label: (context) => {
              const suffix = context.dataset?.isPercent || percentAxis ? "%" : "";
              return `${context.dataset.label || ""}: ${suffix ? formatNumber(context.raw) : formatNumber(context.raw)}${suffix}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked,
          grid: { color: colors.border, drawBorder: false },
          ticks: { color: colors.muted, font: { size: 9 }, maxRotation: 45, minRotation: 0 },
        },
        y: {
          stacked,
          beginAtZero: true,
          grid: { color: colors.border, drawBorder: false },
          ticks: { color: colors.muted, font: { size: 9 } },
        },
      },
    };
  }

  function createChart(id, config) {
    const canvas = document.getElementById(id);
    if (!canvas || !window.Chart) return;
    state.charts.get(id)?.destroy();
    const chart = new Chart(canvas.getContext("2d"), config);
    state.charts.set(id, chart);
  }

  function renderCharts() {
    if (!window.Chart) {
      toast("Gráficos indisponíveis", "A biblioteca Chart.js não foi carregada. Verifique a conexão e recarregue a página.", "error");
      return;
    }
    renderProjectCharts();
    renderStatusChart();
    renderMovementChart();
    renderMaterialCharts();
    renderContractChart();
    renderTemporalChart();
  }

  function sortedProjectsForChart() {
    const sortKey = $("#projectChartSort").value;
    const projects = [...state.projectSummaries];
    const comparators = {
      planned: (a, b) => b.planned - a.planned,
      downloaded: (a, b) => b.downloaded - a.downloaded,
      pending: (a, b) => b.pending - a.pending,
      percent_desc: (a, b) => b.percent - a.percent,
      percent_asc: (a, b) => a.percent - b.percent,
    };
    projects.sort(comparators[sortKey] || comparators.planned);
    const limit = $("#projectChartLimit").value;
    return limit === "all" ? projects : projects.slice(0, Number(limit));
  }

  function renderProjectCharts() {
    const projects = sortedProjectsForChart();
    const labels = projects.map((item) => item.project);
    const comparisonOptions = defaultChartOptions();
    comparisonOptions.plugins.tooltip.callbacks.afterBody = (items) => {
      const project = projects[items[0].dataIndex];
      return [`Realização: ${formatPercent(project.percent)}`, `Status: ${project.status}`];
    };
    createChart("projectsComparison", {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Orçado", data: projects.map((item) => item.planned), backgroundColor: "#0878f9", borderRadius: 6, maxBarThickness: 34 },
          { label: "Baixado", data: projects.map((item) => item.downloaded), backgroundColor: "#0aaf72", borderRadius: 6, maxBarThickness: 34 },
          { label: "Saldo pendente", data: projects.map((item) => Math.max(item.pending, 0)), backgroundColor: "#9aa9bd", borderRadius: 6, maxBarThickness: 34 },
        ],
      },
      options: comparisonOptions,
    });

    const eligible = projects.filter((item) => item.planned > 0 && item.downloaded >= 0 && item.downloaded <= item.planned);
    const stackedOptions = defaultChartOptions({ indexAxis: "y", stacked: true, percentAxis: true });
    stackedOptions.scales.x.max = 100;
    stackedOptions.scales.x.ticks.callback = (value) => `${value}%`;
    createChart("percentStacked", {
      type: "bar",
      data: {
        labels: eligible.map((item) => item.project),
        datasets: [
          { label: "% baixado", data: eligible.map((item) => item.percent), backgroundColor: "#0aaf72", borderRadius: 5, isPercent: true },
          { label: "% não baixado", data: eligible.map((item) => item.percentPending), backgroundColor: "#a9b9cc", borderRadius: 5, isPercent: true },
        ],
      },
      options: stackedOptions,
    });

    const lowest = [...state.projectSummaries]
      .filter((item) => Number.isFinite(item.percent))
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 15);
    const lowOptions = defaultChartOptions({ indexAxis: "y", percentAxis: true });
    lowOptions.scales.x.ticks.callback = (value) => `${value}%`;
    createChart("lowestProjects", {
      type: "bar",
      data: {
        labels: lowest.map((item) => item.project),
        datasets: [{
          label: "% de baixa",
          data: lowest.map((item) => item.percent),
          backgroundColor: lowest.map((item) => STATUS_DEFS[item.status]?.color || "#64748b"),
          borderRadius: 6,
          isPercent: true,
        }],
      },
      options: lowOptions,
    });

    $("#projectsComparisonSummary").textContent = projects.length
      ? `${projects.length} projeto(s) exibido(s). O maior volume orçado é ${projects.slice().sort((a, b) => b.planned - a.planned)[0].project}, com ${formatNumber(projects.slice().sort((a, b) => b.planned - a.planned)[0].planned)}.`
      : "Nenhum projeto atende aos filtros.";
    $("#percentStackedSummary").textContent = `${eligible.length} projeto(s) elegível(is); em cada barra, o percentual baixado somado ao não baixado totaliza 100%. Excedentes são tratados separadamente.`;
    $("#lowestProjectsSummary").textContent = lowest.length
      ? `${lowest.filter((item) => item.percent < 25).length} dos projetos exibidos estão abaixo de 25% de baixa.`
      : "Não há projetos para classificar.";
  }

  function renderStatusChart() {
    const counts = new Map(Object.keys(STATUS_DEFS).map((status) => [status, 0]));
    state.projectSummaries.forEach((project) => counts.set(project.status, (counts.get(project.status) || 0) + 1));
    const entries = [...counts.entries()].filter(([, count]) => count > 0);
    const options = defaultChartOptions();
    delete options.scales;
    options.cutout = "66%";
    options.plugins.legend.position = "right";
    options.onClick = (_event, elements) => {
      if (!elements.length) return;
      const status = entries[elements[0].index][0];
      $("#filterStatus").value = status;
      applyFilters();
      toast("Filtro aplicado", `Status: ${status}`, "info");
    };
    createChart("statusDistribution", {
      type: "doughnut",
      data: {
        labels: entries.map(([status]) => status),
        datasets: [{
          data: entries.map(([, count]) => count),
          backgroundColor: entries.map(([status]) => STATUS_DEFS[status].color),
          borderColor: chartColors().surface,
          borderWidth: 4,
          hoverOffset: 8,
        }],
      },
      options,
    });
    const critical = state.projectSummaries.filter((item) => ["Sem baixa", "Baixa crítica"].includes(item.status)).length;
    $("#statusDistributionSummary").textContent = `${critical} projeto(s) em situação crítica ou sem baixa; ${state.projectSummaries.filter((item) => item.status === "Concluído").length} concluído(s).`;
  }

  function renderMovementChart() {
    const map = new Map();
    state.filteredRecords.forEach((record) => {
      const key = record.codigoMovimento || "Sem movimento";
      if (!map.has(key)) map.set(key, { code: key, planned: 0, downloaded: 0, records: 0 });
      const item = map.get(key);
      item.planned += record.quantidadeOrcada;
      item.downloaded += record.quantidadeBaixada;
      item.records += 1;
    });
    const items = [...map.values()].sort((a, b) => b.planned - a.planned);
    const options = defaultChartOptions({ indexAxis: "y" });
    options.plugins.tooltip.callbacks.afterBody = (contexts) => {
      const item = items[contexts[0].dataIndex];
      return [`Realização: ${formatPercent(item.planned ? item.downloaded / item.planned * 100 : 0)}`, `Registros: ${formatInteger(item.records)}`];
    };
    createChart("movementsPerformance", {
      type: "bar",
      data: {
        labels: items.map((item) => item.code),
        datasets: [
          { label: "Orçado", data: items.map((item) => item.planned), backgroundColor: "#0878f9", borderRadius: 6 },
          { label: "Baixado", data: items.map((item) => item.downloaded), backgroundColor: "#0aaf72", borderRadius: 6 },
        ],
      },
      options,
    });
    const worst = items.filter((item) => item.planned > 0).sort((a, b) => a.downloaded / a.planned - b.downloaded / b.planned)[0];
    $("#movementsPerformanceSummary").textContent = worst
      ? `O movimento ${worst.code} apresenta o menor percentual elegível: ${formatPercent(worst.downloaded / worst.planned * 100)}, em ${formatInteger(worst.records)} registros.`
      : "Nenhum código de movimento elegível foi encontrado.";
  }

  function materialLabel(item) {
    return `${item.code} — ${shorten(item.description, 25)}`;
  }

  function renderMaterialCharts() {
    const configs = [
      ["materialsPlanned", "planned", "#0878f9", "materialsPlannedSummary", "orçado"],
      ["materialsDownloaded", "downloaded", "#0aaf72", "materialsDownloadedSummary", "baixado"],
      ["materialsPending", "pending", "#f97316", "materialsPendingSummary", "saldo pendente"],
    ];
    configs.forEach(([id, key, color, summaryId, label]) => {
      const items = [...state.materialSummaries].sort((a, b) => b[key] - a[key]).slice(0, 15);
      const options = defaultChartOptions({ indexAxis: "y" });
      options.plugins.tooltip.callbacks.afterBody = (contexts) => {
        const item = items[contexts[0].dataIndex];
        return [
          `Descrição: ${item.description}`,
          `Orçado: ${formatNumber(item.planned)}`,
          `Baixado: ${formatNumber(item.downloaded)}`,
          `Saldo: ${formatNumber(item.pending)}`,
          `Realização: ${formatPercent(item.percent)}`,
        ];
      };
      createChart(id, {
        type: "bar",
        data: {
          labels: items.map(materialLabel),
          datasets: [{ label: key === "planned" ? "Orçado" : key === "downloaded" ? "Baixado" : "Saldo", data: items.map((item) => item[key]), backgroundColor: color, borderRadius: 6 }],
        },
        options,
      });
      const first = items[0];
      $(`#${summaryId}`).textContent = first
        ? `${first.code} concentra o maior ${label}, com ${formatNumber(first[key])}; realização do item: ${formatPercent(first.percent)}.`
        : "Nenhum material atende aos filtros.";
    });
  }

  function renderContractChart() {
    const map = new Map();
    state.filteredRecords.forEach((record) => {
      const key = record.contrato || "Sem contrato";
      if (!map.has(key)) map.set(key, { contract: key, planned: 0, downloaded: 0, projects: new Set() });
      const item = map.get(key);
      item.planned += record.quantidadeOrcada;
      item.downloaded += record.quantidadeBaixada;
      if (record.projeto) item.projects.add(record.projeto);
    });
    const items = [...map.values()].sort((a, b) => b.planned - a.planned);
    const options = defaultChartOptions({ indexAxis: "y" });
    options.plugins.tooltip.callbacks.afterBody = (contexts) => {
      const item = items[contexts[0].dataIndex];
      return [`Realização: ${formatPercent(item.planned ? item.downloaded / item.planned * 100 : 0)}`, `Projetos: ${formatInteger(item.projects.size)}`];
    };
    createChart("contractsPerformance", {
      type: "bar",
      data: {
        labels: items.map((item) => item.contract),
        datasets: [
          { label: "Orçado", data: items.map((item) => item.planned), backgroundColor: "#4f5ee8", borderRadius: 6 },
          { label: "Baixado", data: items.map((item) => item.downloaded), backgroundColor: "#0aaf72", borderRadius: 6 },
        ],
      },
      options,
    });
    const missing = state.filteredRecords.filter((row) => !row.contrato).length;
    $("#contractsPerformanceSummary").textContent = `${formatInteger(missing)} registro(s) sem contrato, equivalentes a ${formatPercent(state.filteredRecords.length ? missing / state.filteredRecords.length * 100 : 0)} da seleção.`;
  }

  function renderTemporalChart() {
    const map = new Map();
    state.filteredRecords.forEach((record) => {
      if (!record.dataMovimento) return;
      const month = record.dataMovimento.slice(0, 7);
      if (!map.has(month)) map.set(month, { month, planned: 0, downloaded: 0 });
      const item = map.get(month);
      item.planned += record.quantidadeOrcada;
      item.downloaded += record.quantidadeBaixada;
    });
    const months = [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
    let accumulatedPlanned = 0;
    let accumulatedDownloaded = 0;
    const accumulatedPending = [];
    const accumulatedPercent = [];
    months.forEach((item) => {
      accumulatedPlanned += item.planned;
      accumulatedDownloaded += item.downloaded;
      accumulatedPending.push(accumulatedPlanned - accumulatedDownloaded);
      accumulatedPercent.push(accumulatedPlanned ? accumulatedDownloaded / accumulatedPlanned * 100 : 0);
    });
    const options = defaultChartOptions();
    options.scales.y1 = {
      position: "right",
      beginAtZero: true,
      suggestedMax: 100,
      grid: { drawOnChartArea: false },
      ticks: { color: chartColors().muted, callback: (value) => `${value}%`, font: { size: 9 } },
    };
    createChart("temporalEvolution", {
      type: "line",
      data: {
        labels: months.map((item) => formatMonth(item.month)),
        datasets: [
          { label: "Orçado no período", data: months.map((item) => item.planned), borderColor: "#0878f9", backgroundColor: "rgba(8,120,249,.1)", fill: true, tension: 0.25, pointRadius: 3 },
          { label: "Baixado no período", data: months.map((item) => item.downloaded), borderColor: "#0aaf72", backgroundColor: "rgba(10,175,114,.08)", fill: true, tension: 0.25, pointRadius: 3 },
          { label: "Saldo acumulado", data: accumulatedPending, borderColor: "#f97316", backgroundColor: "transparent", tension: 0.25, pointRadius: 2 },
          { label: "% acumulado", data: accumulatedPercent, borderColor: "#805ad5", backgroundColor: "transparent", yAxisID: "y1", tension: 0.25, pointRadius: 2, borderDash: [5, 4], isPercent: true },
        ],
      },
      options,
    });
    $("#temporalEvolutionSummary").textContent = months.length
      ? `Período analisado: ${formatMonth(months[0].month)} a ${formatMonth(months.at(-1).month)}; realização acumulada final de ${formatPercent(accumulatedPercent.at(-1))}.`
      : "A seleção atual não contém datas válidas para análise temporal.";
  }

  function exportChart(id) {
    const chart = state.charts.get(id);
    if (!chart) return;
    const link = document.createElement("a");
    link.download = `${id}_${fileTimestamp()}.png`;
    link.href = chart.toBase64Image("image/png", 1);
    link.click();
    toast("Gráfico exportado", "A imagem PNG foi gerada com os filtros atuais.", "success");
  }

  function expandChart(id) {
    const source = state.charts.get(id);
    if (!source) return;
    openModal("chartModal");
    $("#chartModalTitle").textContent = source.data.datasets.map((dataset) => dataset.label).filter(Boolean).join(" × ") || "Gráfico ampliado";
    state.expandedChart?.destroy();
    const options = defaultChartOptions({
      indexAxis: source.options.indexAxis || "x",
      stacked: Boolean(source.options.scales?.x?.stacked),
    });
    if (source.config.type === "doughnut") {
      delete options.scales;
      options.cutout = "66%";
    }
    state.expandedChart = new Chart($("#expandedChartCanvas").getContext("2d"), {
      type: source.config.type,
      data: JSON.parse(JSON.stringify(source.data)),
      options,
    });
  }

  // 8. Inconsistências
  function issueCounts() {
    const counts = Object.fromEntries(ISSUE_DEFS.map(([key]) => [key, 0]));
    state.filteredRecords.forEach((record) => record._issues.forEach((issue) => {
      if (issue in counts) counts[issue] += 1;
    }));
    counts.project_no_download = state.projectSummaries.filter((project) => project.downloaded === 0).length;
    counts.incomplete = state.filteredRecords.filter((record) => record._issues.includes("incomplete")).length;
    return counts;
  }

  function renderIssues() {
    const counts = issueCounts();
    $("#issuesGrid").innerHTML = ISSUE_DEFS.map(([key, label, icon, color, condition]) => `
      <button class="issue-card" data-issue-filter="${condition}" style="--accent:${color}" title="Aplicar filtro: ${escapeAttribute(label)}">
        <i data-lucide="${icon}"></i>
        <span>${escapeHtml(label)}</span>
        <strong>${formatInteger(counts[key] || 0)}</strong>
      </button>
    `).join("");
    $$("[data-issue-filter]").forEach((card) => card.addEventListener("click", () => {
      $("#filterCondition").value = card.dataset.issueFilter;
      applyFilters();
      document.querySelector(".filter-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    refreshIcons();
  }

  // 9. Insights
  function generateInsights() {
    const records = state.filteredRecords;
    const projects = state.projectSummaries;
    const materials = state.materialSummaries;
    const planned = sum(records, "quantidadeOrcada");
    const criticalProjects = projects.filter((item) => item.percent < 25);
    const excessProjects = projects.filter((item) => item.percent > 100).sort((a, b) => b.percent - a.percent);
    const pendingMaterial = [...materials].sort((a, b) => b.pending - a.pending)[0];
    const missingContract = records.filter((row) => !row.contrato).length;
    const topFiveShare = planned
      ? [...projects].sort((a, b) => b.planned - a.planned).slice(0, 5).reduce((total, item) => total + item.planned, 0) / planned * 100
      : 0;
    const negative = records.filter((row) => row.quantidadeOrcada < 0 || row.quantidadeBaixada < 0).length;
    const insights = [];

    insights.push({
      type: criticalProjects.length ? "Crítico" : "Positivo",
      color: criticalProjects.length ? "#e43845" : "#0aaf72",
      icon: criticalProjects.length ? "siren" : "circle-check-big",
      text: criticalProjects.length
        ? `Existem ${formatInteger(criticalProjects.length)} projetos com baixa inferior a 25%, exigindo priorização operacional.`
        : "Nenhum projeto está abaixo de 25% na seleção atual.",
    });
    if (excessProjects[0]) {
      insights.push({ type: "Atenção", color: "#805ad5", icon: "badge-plus", text: `${excessProjects[0].project} apresenta ${formatPercent(excessProjects[0].percent)} de baixa em relação ao orçamento.` });
    }
    if (pendingMaterial) {
      insights.push({ type: "Oportunidade", color: "#f97316", icon: "package-search", text: `O material ${pendingMaterial.code} concentra o maior saldo pendente: ${formatNumber(pendingMaterial.pending)}.` });
    }
    insights.push({
      type: missingContract ? "Atenção" : "Positivo",
      color: missingContract ? "#f59e0b" : "#0aaf72",
      icon: missingContract ? "file-question" : "file-check-2",
      text: `${formatPercent(records.length ? missingContract / records.length * 100 : 0)} dos registros estão sem contrato informado (${formatInteger(missingContract)} linhas).`,
    });
    insights.push({ type: "Informativo", color: "#0878f9", icon: "pie-chart", text: `Os cinco principais projetos representam ${formatPercent(topFiveShare)} da quantidade total orçada.` });
    insights.push({
      type: negative ? "Atenção" : "Positivo",
      color: negative ? "#e43845" : "#0aaf72",
      icon: negative ? "circle-minus" : "shield-check",
      text: negative
        ? `Foram encontrados ${formatInteger(negative)} registros com quantidade orçada ou baixada negativa; valide estornos e reversões.`
        : "Não foram encontradas quantidades negativas na seleção.",
    });
    return insights;
  }

  function renderInsights() {
    $("#insightsGrid").innerHTML = generateInsights().map((insight) => `
      <article class="insight-card" style="--accent:${insight.color}">
        <span class="insight-icon"><i data-lucide="${insight.icon}"></i></span>
        <div><strong>${escapeHtml(insight.type)}</strong><p>${escapeHtml(insight.text)}</p></div>
      </article>
    `).join("");
    refreshIcons();
  }

  // 10. Tabelas
  function renderProjectsTable() {
    const sorted = sortProjects(state.projectSummaries);
    const totalPages = Math.max(Math.ceil(sorted.length / state.pageSize), 1);
    state.page = Math.min(Math.max(state.page, 1), totalPages);
    const start = (state.page - 1) * state.pageSize;
    const rows = sorted.slice(start, start + state.pageSize);
    $("#projectsTableBody").innerHTML = rows.length ? rows.map((project) => `
      <tr>
        <td><strong>${escapeHtml(project.project)}</strong></td>
        <td>${escapeHtml(shorten(project.contract, 28))}</td>
        <td class="number-cell">${formatInteger(project.materials)}</td>
        <td class="number-cell">${formatInteger(project.records)}</td>
        <td class="number-cell">${formatNumber(project.planned)}</td>
        <td class="number-cell">${formatNumber(project.downloaded)}</td>
        <td class="number-cell ${project.pending < 0 ? "negative" : ""}">${formatNumber(project.pending)}</td>
        <td class="number-cell ${project.difference > 0 ? "positive" : "negative"}">${formatNumber(project.difference)}</td>
        <td class="number-cell">${formatPercent(project.percent)}</td>
        <td class="number-cell">${formatInteger(project.reservations)}</td>
        <td>${escapeHtml(project.movement || "—")}</td>
        <td>${formatDate(project.lastDate)}</td>
        <td>${statusBadge(project.status)}</td>
        <td>${project.issueCount ? `<span class="status-badge" style="--status-color:#f97316">${formatInteger(project.issueCount)} alerta(s)</span>` : `<span class="status-badge" style="--status-color:#0aaf72">Regular</span>`}</td>
        <td><button class="row-action" data-project-details="${escapeAttribute(project.project)}"><i data-lucide="eye"></i>Detalhes</button></td>
      </tr>
    `).join("") : `<tr><td colspan="15" class="empty-state">Nenhum projeto atende aos filtros selecionados.</td></tr>`;
    $("#tableRecordSummary").textContent = `${formatInteger(sorted.length)} projeto(s) • ${formatInteger(state.filteredRecords.length)} registro(s)`;
    renderPagination(totalPages);
    $$("[data-project-details]").forEach((button) => button.addEventListener("click", () => openProjectDetails(button.dataset.projectDetails)));
    refreshIcons();
  }

  function sortProjects(projects) {
    const { key, direction } = state.sort;
    const factor = direction === "asc" ? 1 : -1;
    const accessors = {
      project: (item) => item.project,
      contract: (item) => item.contract,
      materials: (item) => item.materials,
      records: (item) => item.records,
      planned: (item) => item.planned,
      downloaded: (item) => item.downloaded,
      pending: (item) => item.pending,
      difference: (item) => item.difference,
      percent: (item) => item.percent,
    };
    const accessor = accessors[key] || accessors.planned;
    return [...projects].sort((a, b) => {
      const left = accessor(a);
      const right = accessor(b);
      if (typeof left === "string") return left.localeCompare(right, "pt-BR", { numeric: true }) * factor;
      return (left - right) * factor;
    });
  }

  function renderPagination(totalPages) {
    $("#prevPage").disabled = state.page <= 1;
    $("#nextPage").disabled = state.page >= totalPages;
    const pages = paginationRange(state.page, totalPages);
    $("#pageButtons").innerHTML = pages.map((page) => page === "…"
      ? `<span class="page-button" aria-hidden="true">…</span>`
      : `<button class="page-button ${page === state.page ? "active" : ""}" data-page="${page}">${page}</button>`
    ).join("");
    $$("[data-page]").forEach((button) => button.addEventListener("click", () => {
      state.page = Number(button.dataset.page);
      renderProjectsTable();
    }));
  }

  function paginationRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    const pages = new Set([1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total));
    const sorted = [...pages].sort((a, b) => a - b);
    const result = [];
    sorted.forEach((page, index) => {
      if (index && page - sorted[index - 1] > 1) result.push("…");
      result.push(page);
    });
    return result;
  }

  function openProjectDetails(projectName) {
    const project = state.projectSummaries.find((item) => item.project === projectName);
    const rows = state.filteredRecords.filter((record) => (record.projeto || "Projeto não informado") === projectName);
    if (!project) return;
    $("#detailsModalTitle").textContent = project.project;
    $("#detailsSummary").innerHTML = [
      ["Contrato", project.contract],
      ["Quantidade orçada", formatNumber(project.planned)],
      ["Quantidade baixada", formatNumber(project.downloaded)],
      ["Percentual de baixa", formatPercent(project.percent)],
      ["Status", project.status],
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
    $("#detailsTableBody").innerHTML = rows.map((record) => {
      const balance = record.quantidadeOrcada - record.quantidadeBaixada;
      const percent = record.quantidadeOrcada ? record.quantidadeBaixada / record.quantidadeOrcada * 100 : 0;
      return `<tr>
        <td>${escapeHtml(record.codigoMaterial || "—")}</td>
        <td>${escapeHtml(shorten(record.descricaoMaterial || "Sem descrição", 52))}</td>
        <td>${escapeHtml(record.unidadeMedida || "—")}</td>
        <td class="number-cell">${formatNumber(record.quantidadeOrcada)}</td>
        <td class="number-cell">${formatNumber(record.quantidadeBaixada)}</td>
        <td class="number-cell">${formatNumber(balance)}</td>
        <td class="number-cell">${formatPercent(percent)}</td>
        <td>${escapeHtml(record.reserva || "—")}</td>
        <td>${escapeHtml(record.codigoMovimento || "—")}</td>
        <td>${formatDate(record.dataMovimento)}</td>
        <td>${escapeHtml(record.centro || "—")}</td>
        <td>${escapeHtml(record.deposito || "—")}</td>
        <td>${escapeHtml(record.documentoSap || "—")}</td>
        <td>${escapeHtml(record.itemSap || "—")}</td>
        <td>${record._issues.length ? `<span class="status-badge" style="--status-color:#f97316">${record._issues.length} alerta(s)</span>` : `<span class="status-badge" style="--status-color:#0aaf72">Regular</span>`}</td>
      </tr>`;
    }).join("");
    openModal("detailsModal");
  }

  // 11. Exportação
  function csvFromRows(rows, fields) {
    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
    const header = fields.map(([, label]) => escapeCsv(label)).join(";");
    const lines = rows.map((row) => fields.map(([field]) => {
      const value = row[field];
      if (typeof value === "number") return String(value).replace(".", ",");
      return escapeCsv(value);
    }).join(";"));
    return `\uFEFF${[header, ...lines].join("\r\n")}`;
  }

  function exportData(type) {
    const stamp = fileTimestamp();
    if (type === "csv") {
      downloadBlob(csvFromRows(state.filteredRecords, CSV_EXPORT_FIELDS), `relatorio_controle_materiais_sap_${stamp}.csv`, "text/csv;charset=utf-8");
    } else if (type === "json") {
      const records = state.filteredRecords.map(stripInternalFields);
      downloadBlob(JSON.stringify({ metadata: state.metadata, filters: state.filters, records }, null, 2), `controle_materiais_sap_${stamp}.json`, "application/json;charset=utf-8");
    } else if (type === "projects") {
      const fields = [
        ["project", "Projeto"], ["contract", "Contrato"], ["materials", "Materiais Distintos"], ["records", "Registros"],
        ["planned", "Quantidade Orçada"], ["downloaded", "Quantidade Baixada"], ["pending", "Não Baixado"],
        ["difference", "Diferença"], ["percent", "Percentual de Baixa"], ["reservations", "Reservas"],
        ["movement", "Movimento Predominante"], ["lastDate", "Última Data"], ["status", "Status"], ["issueCount", "Alertas"],
      ];
      downloadBlob(csvFromRows(state.projectSummaries, fields), `resumo_projetos_${stamp}.csv`, "text/csv;charset=utf-8");
    } else if (type === "materials") {
      const fields = [["code", "Código"], ["description", "Descrição"], ["unit", "Unidade"], ["planned", "Orçado"], ["downloaded", "Baixado"], ["pending", "Saldo"], ["percent", "Percentual"], ["records", "Registros"]];
      downloadBlob(csvFromRows(state.materialSummaries, fields), `detalhamento_materiais_${stamp}.csv`, "text/csv;charset=utf-8");
    } else if (type === "issues") {
      const rows = state.filteredRecords
        .filter((row) => row._issues.length)
        .map((row) => ({ ...row, issues: row._issues.join(", ") }));
      downloadBlob(csvFromRows(rows, [...CSV_EXPORT_FIELDS, ["issues", "Inconsistências"]]), `inconsistencias_sap_${stamp}.csv`, "text/csv;charset=utf-8");
    } else if (type === "print") {
      exportPrintReport();
    }
    if (type !== "print") toast("Exportação concluída", "O arquivo respeita os filtros atualmente aplicados.", "success");
  }

  function downloadTemplateWorkbook() {
    const headers = CANONICAL_FIELDS.map(([, label]) => label);
    const example = {
      "Projeto": "DMPALES2600000",
      "Descrição do projeto": "Projeto de exemplo",
      "Contrato": "4500000000",
      "Código do material": "10000000",
      "Descrição do material": "Material de exemplo",
      "Unidade de medida": "UN",
      "Quantidade orçada": 100,
      "Quantidade baixada": 50,
      "Reserva": "123456789",
      "Código do movimento": "261",
      "Tipo de movimento": "Baixa",
      "Data do movimento": "2026-07-24",
      "Centro": "SP01",
      "Depósito": "0001",
      "Documento SAP": "5000000000",
      "Item SAP": "1",
      "Categoria": "",
      "Material de origem": "",
      "Classificação MCPSE": "",
      "Critério de ordenação": "",
      "Ponto de descarga": "",
      "Recebedor": "",
      "Relevância": "",
    };

    if (window.XLSX?.utils) {
      const sheet = XLSX.utils.json_to_sheet([example], { header: headers });
      sheet["!cols"] = headers.map((header) => ({ wch: Math.max(14, Math.min(32, header.length + 3)) }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Materiais");
      XLSX.writeFile(workbook, "modelo_importacao_materiais_sap.xlsx");
      toast("Modelo gerado", "A planilha foi criada no navegador e está pronta para preenchimento.", "success");
      return;
    }

    downloadBlob(csvFromRows([example], headers.map((header) => [header, header])), "modelo_importacao_materiais_sap.csv", "text/csv;charset=utf-8");
    toast("Modelo gerado em CSV", "A biblioteca de Excel não estava disponível; foi criado um modelo compatível em CSV.", "warning");
  }

  function exportPrintReport() {
    const kpis = calculateKpis().slice(0, 13);
    const rows = sortProjects(state.projectSummaries).map((project) => `<tr><td>${escapeHtml(project.project)}</td><td>${escapeHtml(project.contract)}</td><td>${formatNumber(project.planned)}</td><td>${formatNumber(project.downloaded)}</td><td>${formatPercent(project.percent)}</td><td>${escapeHtml(project.status)}</td></tr>`).join("");
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório Executivo — Materiais SAP</title><style>body{font:14px Arial;color:#172033;margin:34px}h1{font-size:25px;margin:0}p{color:#667085}.meta{padding:12px;background:#eef4ff;border-radius:8px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:18px 0}.card{border:1px solid #dfe6ef;border-radius:8px;padding:10px}.card span{display:block;color:#667085;font-size:10px}.card strong{font-size:18px}table{width:100%;border-collapse:collapse;font-size:11px}th,td{border-bottom:1px solid #dfe6ef;padding:7px;text-align:left}th{background:#14233c;color:white}@media print{body{margin:16mm}.grid{grid-template-columns:repeat(3,1fr)}}</style></head><body><h1>Controle de Materiais Orçados × Materiais Baixados — SAP</h1><p>Relatório executivo gerado em ${formatDateTime(new Date().toISOString())}</p><div class="meta"><strong>Base:</strong> ${escapeHtml(state.metadata.arquivo || "base-inicial.json")} • <strong>Registros filtrados:</strong> ${formatInteger(state.filteredRecords.length)}</div><div class="grid">${kpis.map(([title, value, , , , type]) => `<div class="card"><span>${escapeHtml(title)}</span><strong>${type === "percent" ? formatPercent(value) : type === "number" ? formatNumber(value) : formatInteger(value)}</strong></div>`).join("")}</div><h2>Projetos</h2><table><thead><tr><th>Projeto</th><th>Contrato</th><th>Orçado</th><th>Baixado</th><th>%</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>window.print()<\/script></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function stripInternalFields(record) {
    return Object.fromEntries(Object.entries(record).filter(([key]) => !key.startsWith("_")));
  }

  function downloadBlob(content, filename, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }

  // 12. Metadados, interface e inicialização
  function renderMetadata() {
    const meta = state.metadata;
    const lastImport = safeJsonParse(localStorage.getItem("mcpseLastImport"));
    $("#metaSource").textContent = meta.origem || "SAP";
    $("#metaFile").textContent = meta.arquivo || "base-inicial.json";
    $("#metaExtraction").textContent = meta.dataAtualizacao ? formatDateTime(meta.dataAtualizacao) : "Não informada";
    $("#metaImport").textContent = meta.dataImportacao
      ? formatDateTime(meta.dataImportacao)
      : lastImport?.dataImportacao
        ? formatDateTime(lastImport.dataImportacao)
        : "Nenhuma nesta sessão";
    $("#metaRows").textContent = `${meta.aba || "Materiais"} • ${formatInteger(state.allRecords.length)}`;
    $("#sourceBadgeText").textContent = state.sourceType === "imported" ? "Base importada nesta sessão" : "Base inicial SAP validada";
    $("#footerDataStatus").textContent = `${state.sourceType === "imported" ? "Base importada" : "Base inicial"} • ${formatInteger(state.allRecords.length)} registros`;
  }

  function updateHero() {
    const planned = sum(state.filteredRecords, "quantidadeOrcada");
    const downloaded = sum(state.filteredRecords, "quantidadeBaixada");
    const percent = planned ? downloaded / planned * 100 : 0;
    $("#heroPercent").textContent = formatPercent(percent);
    $("#heroBalance").textContent = `Saldo: ${formatNumber(planned - downloaded)}`;
  }

  function updateDashboard() {
    filterData();
    renderFilterChips();
    renderMetadata();
    updateHero();
    renderKpis();
    renderCharts();
    renderIssues();
    renderInsights();
    renderProjectsTable();
  }

  async function loadInitialData() {
    $("#kpiGrid").innerHTML = Array.from({ length: 12 }, () => `<div class="skeleton"></div>`).join("");
    let payload = null;
    let usedFallback = false;
    try {
      const response = await fetch("data/base-inicial.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      payload = await response.json();
    } catch (_error) {
      payload = window.BASE_INICIAL_EMBUTIDA;
      usedFallback = true;
    }
    if (!payload?.records?.length) {
      throw new Error("A base inicial e a contingência incorporada não contêm registros.");
    }
    state.metadata = payload.metadata || {};
    state.allRecords = prepareRecords(payload.records);
    state.sourceType = "base";
    populateFilters();
    $("#pageSize").value = String(state.pageSize);
    updateDashboard();
    toast(
      "Base inicial carregada",
      `${formatInteger(state.allRecords.length)} registros disponíveis ${usedFallback ? "pela contingência local" : "a partir do JSON publicado"}.`,
      "success"
    );
  }

  function showProgress(step, percent) {
    $("#progressOverlay").hidden = false;
    setProgress(step, percent);
  }

  function setProgress(step, percent) {
    $("#progressStep").textContent = step;
    $("#progressBar").style.width = `${Math.max(0, Math.min(percent, 100))}%`;
    $("#progressPercent").textContent = `${Math.round(percent)}%`;
  }

  function hideProgress() {
    $("#progressOverlay").hidden = true;
  }

  function toast(title, message, type = "info") {
    const config = {
      success: ["#0aaf72", "circle-check-big"],
      error: ["#e43845", "circle-x"],
      warning: ["#f59e0b", "triangle-alert"],
      info: ["#0878f9", "info"],
    }[type] || ["#0878f9", "info"];
    const item = document.createElement("div");
    item.className = "toast";
    item.style.setProperty("--toast-color", config[0]);
    item.innerHTML = `<i data-lucide="${config[1]}"></i><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span></div><button aria-label="Fechar notificação">×</button>`;
    $("#toastRegion").appendChild(item);
    item.querySelector("button").addEventListener("click", () => item.remove());
    refreshIcons();
    setTimeout(() => item.remove(), 5_500);
  }

  function openModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    const focusable = modal.querySelector("button, input, select, a");
    focusable?.focus();
  }

  function closeModal(id) {
    const modal = $(`#${id}`);
    if (!modal) return;
    modal.hidden = true;
    if (!$$(".modal:not([hidden])").length) document.body.classList.remove("modal-open");
    if (id === "chartModal") {
      state.expandedChart?.destroy();
      state.expandedChart = null;
    }
  }

  function loadThresholds() {
    const stored = safeJsonParse(localStorage.getItem("mcpseThresholds"));
    return { ...DEFAULT_THRESHOLDS, ...(stored || {}) };
  }

  function saveSettings() {
    const values = {
      critical: Number($("#thresholdCritical").value),
      low: Number($("#thresholdLow").value),
      partial: Number($("#thresholdPartial").value),
      near: Number($("#thresholdNear").value),
    };
    if (!(values.critical > 0 && values.critical < values.low && values.low < values.partial && values.partial < values.near && values.near <= 100)) {
      toast("Faixas inválidas", "Mantenha os limites em ordem crescente e o último valor em até 100%.", "warning");
      return;
    }
    state.thresholds = values;
    localStorage.setItem("mcpseThresholds", JSON.stringify(values));
    closeModal("settingsModal");
    updateDashboard();
    toast("Configurações salvas", "As classificações foram recalculadas.", "success");
  }

  function fillSettings() {
    $("#thresholdCritical").value = state.thresholds.critical;
    $("#thresholdLow").value = state.thresholds.low;
    $("#thresholdPartial").value = state.thresholds.partial;
    $("#thresholdNear").value = state.thresholds.near;
  }

  function updateClock() {
    const now = new Date();
    $("#clockTime").textContent = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(now);
    $("#clockDate").textContent = `${new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now)} — horário local`;
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("mcpseTheme", theme);
    $("#themeToggle").innerHTML = `<i data-lucide="${theme === "dark" ? "sun" : "moon"}"></i>`;
    refreshIcons();
    if (state.allRecords.length) renderCharts();
  }

  function setupEvents() {
    $("#importButton").addEventListener("click", () => $("#fileInput").click());
    $("#importButtonBottom").addEventListener("click", () => $("#fileInput").click());
    $("#fileInput").addEventListener("change", (event) => handleFile(event.target.files[0]));
    $("#confirmImportButton").addEventListener("click", confirmImport);
    $("#applyFiltersButton").addEventListener("click", applyFilters);
    $("#clearFiltersButton").addEventListener("click", () => clearFilters(true));
    $("#refreshButton").addEventListener("click", () => {
      updateDashboard();
      toast("Visualização atualizada", "Indicadores, gráficos e tabelas foram recalculados.", "success");
    });
    $("#globalSearch").addEventListener("input", debounce(applyFilters, 280));
    ["filterProject", "filterContract", "filterStatus", "filterMaterial", "filterMovement", "filterReservation", "filterCenter", "filterDeposit", "filterUnit", "filterCondition", "filterDateStart", "filterDateEnd"]
      .forEach((id) => $(`#${id}`).addEventListener("change", applyFilters));
    $("#projectChartLimit").addEventListener("change", renderProjectCharts);
    $("#projectChartSort").addEventListener("change", renderProjectCharts);
    $("#pageSize").addEventListener("change", (event) => {
      state.pageSize = Number(event.target.value);
      state.page = 1;
      localStorage.setItem("mcpsePageSize", String(state.pageSize));
      renderProjectsTable();
    });
    $("#prevPage").addEventListener("click", () => { state.page -= 1; renderProjectsTable(); });
    $("#nextPage").addEventListener("click", () => { state.page += 1; renderProjectsTable(); });
    $$("[data-sort]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.sort;
      state.sort = state.sort.key === key
        ? { key, direction: state.sort.direction === "asc" ? "desc" : "asc" }
        : { key, direction: ["project", "contract"].includes(key) ? "asc" : "desc" };
      renderProjectsTable();
    }));
    $$("[data-chart-download]").forEach((button) => button.addEventListener("click", () => exportChart(button.dataset.chartDownload)));
    $$("[data-chart-expand]").forEach((button) => button.addEventListener("click", () => expandChart(button.dataset.chartExpand)));
    $("#exportMainButton").addEventListener("click", () => exportData("csv"));
    $("#exportIssuesButton").addEventListener("click", () => exportData("issues"));
    $("#downloadTemplateButton").addEventListener("click", downloadTemplateWorkbook);
    $("#exportMenuButton").addEventListener("click", () => { $("#exportMenu").hidden = !$("#exportMenu").hidden; });
    $$("[data-export]").forEach((button) => button.addEventListener("click", () => {
      $("#exportMenu").hidden = true;
      exportData(button.dataset.export);
    }));
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".export-menu-wrap")) $("#exportMenu").hidden = true;
    });
    $$("[data-open-modal]").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.openModal === "settingsModal") fillSettings();
      openModal(button.dataset.openModal);
    }));
    $$("[data-close-modal]").forEach((button) => button.addEventListener("click", () => closeModal(button.dataset.closeModal)));
    $$(".modal").forEach((modal) => modal.addEventListener("click", (event) => {
      if (event.target === modal) closeModal(modal.id);
    }));
    $("#saveSettingsButton").addEventListener("click", saveSettings);
    $("#resetSettingsButton").addEventListener("click", () => {
      state.thresholds = { ...DEFAULT_THRESHOLDS };
      fillSettings();
    });
    $("#themeToggle").addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
    $("#openSidebar").addEventListener("click", openSidebar);
    $("#closeSidebar").addEventListener("click", closeSidebar);
    $("#sidebarBackdrop").addEventListener("click", closeSidebar);
    $$(".sidebar-nav a").forEach((link) => link.addEventListener("click", closeSidebar));
    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        $("#globalSearch").focus();
      }
      if (event.key === "Escape") {
        const open = $$(".modal:not([hidden])").at(-1);
        if (open) closeModal(open.id);
        closeSidebar();
      }
    });
    setupNavObserver();
  }

  function openSidebar() {
    $("#sidebar").classList.add("open");
    $("#sidebarBackdrop").classList.add("open");
  }

  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#sidebarBackdrop").classList.remove("open");
  }

  function setupNavObserver() {
    const links = new Map($$(".sidebar-nav a[href^='#']").map((link) => [link.getAttribute("href").slice(1), link]));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      links.forEach((link) => link.classList.remove("active"));
      links.get(visible.target.id)?.classList.add("active");
    }, { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.15, 0.4] });
    links.forEach((_link, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  // 13. Utilidades
  function sum(rows, field) {
    return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
  }

  function uniqueSorted(values) {
    return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true }));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  function formatInteger(value) {
    return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Number(value) || 0);
  }

  function formatPercent(value) {
    return `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0)}%`;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Inválida" : new Intl.DateTimeFormat("pt-BR").format(date);
  }

  function formatDateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Inválida"
      : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(date);
  }

  function formatMonth(value) {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(bytes / 1024 ** index)} ${units[index]}`;
  }

  function statusBadge(status) {
    const color = STATUS_DEFS[status]?.color || "#64748b";
    return `<span class="status-badge" style="--status-color:${color}">${escapeHtml(status)}</span>`;
  }

  function shorten(value, max) {
    const text = String(value ?? "");
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function safeJsonParse(value) {
    try { return JSON.parse(value); } catch { return null; }
  }

  function fileTimestamp() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  }

  function refreshIcons() {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  }

  async function init() {
    setupEvents();
    const preferredTheme = localStorage.getItem("mcpseTheme")
      || (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(preferredTheme);
    fillSettings();
    updateClock();
    setInterval(updateClock, 1_000);
    refreshIcons();
    try {
      await loadInitialData();
    } catch (error) {
      $("#kpiGrid").innerHTML = `<div class="empty-state">Não foi possível carregar a base inicial.</div>`;
      toast("Falha na base inicial", error.message, "error");
      console.error(error);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
