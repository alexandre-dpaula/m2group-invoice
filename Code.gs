/**
 * Google Apps Script for M2Group Invoice System
 * Estrutura simplificada com 2 abas: Invoices e Itens
 */

// Configuração - Nomes das abas
const CONFIG = {
  INVOICE_SHEET: "Invoices",
  ITEMS_SHEET: "Itens",
};

/**
 * Handle GET requests from the web app
 */
function doGet(e) {
  try {
    // Validar se o parâmetro 'e' existe (quando chamado via HTTP)
    if (!e || !e.parameter) {
      Logger.log(
        "⚠️ Função doGet chamada sem parâmetros. Use testGetInvoice() para testes."
      );
      return ContentService.createTextOutput(
        JSON.stringify({
          error: "Parâmetros não fornecidos. Acesse via URL: ?id=INV-2025-001",
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const invoiceId = e.parameter.id;
    Logger.log("📥 Recebido request para invoice ID: " + invoiceId);

    if (!invoiceId) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Invoice ID é obrigatório" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const invoiceData = getInvoiceData(invoiceId);
    Logger.log("✅ Dados da invoice encontrados");

    return ContentService.createTextOutput(
      JSON.stringify(invoiceData)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("❌ Erro em doGet: " + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Buscar dados da invoice no Google Sheets
 */
function getInvoiceData(invoiceId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log("🔍 Buscando invoice: " + invoiceId);

  // Buscar dados básicos da invoice
  const invoiceSheet = ss.getSheetByName(CONFIG.INVOICE_SHEET);

  if (!invoiceSheet) {
    throw new Error(
      'Aba "' +
        CONFIG.INVOICE_SHEET +
        '" não encontrada. Execute setupSampleSheets() primeiro.'
    );
  }

  const invoiceData = findInvoiceById(invoiceSheet, invoiceId);

  if (!invoiceData) {
    throw new Error("Invoice não encontrada: " + invoiceId);
  }

  // Buscar itens da invoice
  const itemsSheet = ss.getSheetByName(CONFIG.ITEMS_SHEET);

  if (!itemsSheet) {
    throw new Error(
      'Aba "' +
        CONFIG.ITEMS_SHEET +
        '" não encontrada. Execute setupSampleSheets() primeiro.'
    );
  }

  const items = getInvoiceItems(itemsSheet, invoiceId);
  Logger.log("📦 Encontrados " + items.length + " itens");

  // Retornar todos os dados combinados
  return {
    ...invoiceData,
    items: items,
  };
}

/**
 * Encontrar invoice por ID na aba Invoices
 */
function findInvoiceById(sheet, invoiceId) {
  const data = sheet.getDataRange().getValues();
  Logger.log("📊 Total de linhas na aba Invoices: " + data.length);

  // Headers: invoice_id, empresa, data, descricao, subtotal, desconto, taxas, total, status, payment_url, project_url

  // Procurar a linha com o invoice_id correspondente
  for (let i = 1; i < data.length; i++) {
    const rowInvoiceId = data[i][0].toString().trim();
    const searchId = invoiceId.toString().trim();

    Logger.log('🔎 Comparando: "' + rowInvoiceId + '" com "' + searchId + '"');

    if (rowInvoiceId === searchId) {
      Logger.log("✅ Invoice encontrada na linha " + (i + 1));

      const subtotal = parseFloat(data[i][4]) || 0;
      const desconto = parseFloat(data[i][5]) || 0;
      const taxas = parseFloat(data[i][6]) || 0;
      const total = parseFloat(data[i][7]) || 0;

      return {
        invoiceNumber: data[i][0] || "", // invoice_id
        clientName: data[i][1] || "", // empresa
        invoiceDate: data[i][2] || "", // data
        projectDescription: data[i][3] || "", // descricao (tagline)
        subtotal: subtotal, // subtotal
        discount: desconto, // desconto
        taxRate: taxas, // taxas (%)
        totalAmount: total, // total
        status: data[i][8] || "Pendente", // status
        paymentUrl: data[i][9] || "", // payment_url (Pix/Checkout)
        projectUrl: data[i][10] || "", // project_url (Ver Projeto)

        // Dados adicionais para compatibilidade
        projectName: data[i][1] || "", // usa empresa como projectName
        companyName: "M2Group LTDA",
        companyEmail: "contato@m2group.pro",
        companyPhone: "+55 11 98765-4321",
        bankName: "Iniinfinitepay",
        accountName: "Alexandre Dpaula",
        accountNumber: "****-****-5678",
        notes:
          "Pagamento via transferência bancária ou Pix. Dúvidas entre em contato através do email contato.m2bstudio@gmail.com.",
      };
    }
  }

  Logger.log("❌ Invoice não encontrada");
  return null;
}

/**
 * Buscar itens da invoice na aba Itens
 */
function getInvoiceItems(sheet, invoiceId) {
  const data = sheet.getDataRange().getValues();
  const items = [];

  // Headers: invoice_id, servico, qtd, valor_unit

  // Encontrar todos os itens desta invoice
  for (let i = 1; i < data.length; i++) {
    const rowInvoiceId = data[i][0].toString().trim();
    const searchId = invoiceId.toString().trim();

    if (rowInvoiceId === searchId) {
      items.push({
        description: data[i][1] || "", // servico
        quantity: parseFloat(data[i][2]) || 0, // qtd
        unitPrice: parseFloat(data[i][3]) || 0, // valor_unit
      });
    }
  }

  return items;
}

/**
 * Criar estrutura de exemplo das planilhas
 * Execute esta função UMA VEZ para configurar as abas
 */
function setupSampleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log("🚀 Iniciando criação das planilhas...");

  // Criar aba Invoices
  createInvoicesSheet(ss);
  Logger.log("✅ Aba Invoices criada");

  // Criar aba Itens
  createItemsSheet(ss);
  Logger.log("✅ Aba Itens criada");

  Logger.log("🎉 Planilhas criadas com sucesso!");
  Logger.log("📝 Execute testGetInvoice() para testar a busca de dados");
}

/**
 * Criar aba Invoices com cabeçalhos e dados de exemplo
 */
function createInvoicesSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.INVOICE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.INVOICE_SHEET);
  } else {
    sheet.clear();
  }

  // Cabeçalhos
  const headers = [
    "invoice_id", // A - ex: INV-2025-001
    "empresa", // B - nome do cliente
    "data", // C - AAAA-MM-DD
    "descricao", // D - tagline curta
    "subtotal", // E - valor subtotal
    "desconto", // F - valor desconto
    "taxas", // G - percentual de taxas (%)
    "total", // H - valor total
    "status", // I - Pendente/Pago
    "payment_url", // J - Pix/Link Checkout
    "project_url", // K - link Ver Projeto
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.getRange(1, 1, 1, headers.length).setBackground("#0099ff");
  sheet.getRange(1, 1, 1, headers.length).setFontColor("#ffffff");

  // Dados de exemplo
  const sampleData = [
    [
      "INV-2025-001", // invoice_id
      "Empresa Cliente LTDA", // empresa
      "2025-01-15", // data
      "Produção Audiovisual Completa", // descricao
      35950, // subtotal
      1000, // desconto
      5, // taxas (%)
      36747.5, // total (subtotal + (subtotal * taxas/100) - desconto)
      "Pendente", // status
      "https://pix.exemplo.com/pay/INV-2025-001", // payment_url
      "https://m2group.pro/projects/cliente-2025-001", // project_url
    ],
  ];

  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Criar aba Itens com cabeçalhos e dados de exemplo
 */
function createItemsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.ITEMS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.ITEMS_SHEET);
  } else {
    sheet.clear();
  }

  // Cabeçalhos
  const headers = [
    "invoice_id", // A - ex: INV-2025-001
    "servico", // B - descrição do serviço
    "qtd", // C - quantidade
    "valor_unit", // D - valor unitário
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  sheet.getRange(1, 1, 1, headers.length).setBackground("#0099ff");
  sheet.getRange(1, 1, 1, headers.length).setFontColor("#ffffff");

  // Dados de exemplo
  const sampleData = [
    ["INV-2025-001", "Desenvolvimento de Roteiro e Storyboard", 20, 250],
    ["INV-2025-001", "Produção e Filmagem (2 dias)", 16, 450],
    ["INV-2025-001", "Edição e Pós-Produção", 40, 300],
    ["INV-2025-001", "Motion Graphics e Animações", 25, 350],
    ["INV-2025-001", "Correção de Cor e Finalização", 15, 280],
  ];

  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Testar busca de dados da invoice
 * Execute esta função para testar se tudo está funcionando
 */
function testGetInvoice() {
  Logger.log("🧪 Testando busca de invoice...");

  try {
    const data = getInvoiceData("INV-2025-001");
    Logger.log("✅ Teste bem-sucedido!");
    Logger.log("📄 Dados retornados:");
    Logger.log(JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    Logger.log("❌ Erro no teste: " + error.toString());
    throw error;
  }
}
