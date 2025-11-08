// Configuration - Replace with your Google Apps Script Web App URL
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzaRXydG3QsHwIZIU2Dx6Ou0cXkdxqp0OYfjrlbz-Qnu5vSnGahzMlsyeR7Gr2Yy0De/exec";

// Get invoice ID from URL parameter or use default
function getInvoiceId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id") || "INV-2025-001"; // Default to invoice ID INV-2025-001
}

// Format currency in Brazilian Real
function formatCurrency(amount) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
}

// Format date in Brazilian format
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Update current date display
function updateCurrentDate() {
  const now = new Date();
  const dateString = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  document.getElementById("currentDate").textContent = dateString;
}

// Populate invoice data
function populateInvoiceData(data) {
  try {
    // Armazenar dados globalmente para uso nos botões
    window.invoiceData = data;

    // Update invoice info
    document.getElementById("clientName").textContent =
      data.clientName || "N/A";
    document.getElementById("invoiceDate").textContent = formatDate(
      data.invoiceDate
    );

    // Populate items table
    populateItems(data.items || []);

    // Calculate and display totals
    const subtotal = parseFloat(data.subtotal) || 0;
    const taxRate = parseFloat(data.taxRate) || 0;
    const discount = parseFloat(data.discount) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount - discount;

    document.getElementById("subtotal").textContent = formatCurrency(subtotal);
    document.getElementById("taxRate").textContent = taxRate;
    document.getElementById("taxAmount").textContent =
      formatCurrency(taxAmount);
    document.getElementById("discount").textContent = formatCurrency(discount);
    document.getElementById("totalAmount").textContent = formatCurrency(total);

    // Populate additional details
    document.getElementById("projectName").textContent =
      data.projectName || "-";
    document.getElementById("projectDescription").textContent =
      data.projectDescription || "-";
    document.getElementById("companyName").textContent =
      data.companyName || "-";
    document.getElementById("companyEmail").textContent =
      data.companyEmail || "-";
    document.getElementById("companyPhone").textContent =
      data.companyPhone || "-";
    document.getElementById("bankName").textContent = data.bankName || "-";
    document.getElementById("accountName").textContent =
      data.accountName || "-";
    document.getElementById("accountNumber").textContent =
      data.accountNumber || "-";
    document.getElementById("invoiceNotes").textContent =
      data.notes || "Nenhuma observação adicional.";

    // Update status tag
    const statusTag = document.getElementById("statusTag");
    if (statusTag) {
      statusTag.textContent = data.status || "Pendente";
    }

    // Show content and hide placeholder
    document.querySelector(".services-placeholder").style.display = "none";
    document.getElementById("servicesContent").style.display = "block";
  } catch (error) {
    console.error("Error populating data:", error);
    showError("Erro ao exibir dados da invoice");
  }
}

// Populate items table
function populateItems(items) {
  const tbody = document.getElementById("itemsTableBody");
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" style="text-align: center; color: rgba(255,255,255,0.5);">Nenhum item encontrado</td></tr>';
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const amount = quantity * unitPrice;

    row.innerHTML = `
            <td>${item.description || ""}</td>
            <td>${quantity}</td>
            <td>${formatCurrency(unitPrice)}</td>
            <td>${formatCurrency(amount)}</td>
        `;
    tbody.appendChild(row);
  });
}

// Show error message
function showError(message) {
  // Create error notification
  const errorDiv = document.createElement("div");
  errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 50, 50, 0.95);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => errorDiv.remove(), 300);
  }, 5000);
}

// Show success message
function showSuccess(message) {
  // Create success notification
  const successDiv = document.createElement("div");
  successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #00b4ff 0%, #0099ff 100%);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 180, 255, 0.5);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
  successDiv.textContent = message;
  document.body.appendChild(successDiv);

  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

// Fetch invoice data from Google Sheets
async function fetchInvoiceData() {
  const invoiceId = getInvoiceId();

  // Show loading state
  const loadBtn = document.querySelector(".btn-load-sheets");
  const placeholder = document.querySelector(".services-placeholder");

  if (loadBtn) {
    loadBtn.textContent = "Carregando...";
    loadBtn.disabled = true;
  }

  // Update placeholder text to show loading
  if (placeholder) {
    const placeholderTitle = placeholder.querySelector("h3");
    if (placeholderTitle) {
      placeholderTitle.textContent = "Carregando dados...";
    }
  }

  try {
    // Check if script URL is configured
    if (SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      throw new Error(
        "Configure a URL do Google Apps Script no arquivo script.js"
      );
    }

    const response = await fetch(`${SCRIPT_URL}?id=${invoiceId}`);

    if (!response.ok) {
      throw new Error("Falha ao carregar dados da invoice");
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    populateInvoiceData(data);
    showSuccess("Dados carregados com sucesso!");
  } catch (error) {
    console.error("Error fetching data:", error);
    showError(
      error.message || "Falha ao carregar dados. Verifique sua conexão."
    );

    // Reset placeholder
    if (placeholder) {
      const placeholderTitle = placeholder.querySelector("h3");
      if (placeholderTitle) {
        placeholderTitle.textContent = "Carregar Planilha Sheets";
      }
    }

    // Reset button
    if (loadBtn) {
      loadBtn.innerHTML = "<span>📊</span> Conectar ao Google Sheets";
      loadBtn.disabled = false;
    }
  }
}

// Process payment
function processPayment() {
  // Se existir payment_url nos dados carregados, redireciona
  const paymentUrl = window.invoiceData?.paymentUrl;

  if (paymentUrl) {
    window.open(paymentUrl, "_blank");
  } else {
    showSuccess("Funcionalidade de pagamento será implementada em breve!");
  }
}

// View project
function viewProject() {
  // Se existir project_url nos dados carregados, redireciona
  const projectUrl = window.invoiceData?.projectUrl;

  if (projectUrl) {
    window.open(projectUrl, "_blank");
  } else {
    showSuccess("Redirecionando para detalhes do projeto...");
  }
}

// Load sample data for demo
function loadSampleData() {
  const sampleData = {
    invoiceNumber: "INV-2025-001",
    invoiceDate: "2025-01-15",
    dueDate: "2025-02-15",
    status: "Pending",
    companyName: "M2Group Productions",
    companyAddress: "Rua Criativa, 123",
    companyCity: "São Paulo, SP 01000-000",
    companyEmail: "contato@m2group.pro",
    companyPhone: "+55 11 98765-4321",
    clientName: "Empresa Cliente LTDA",
    clientAddress: "Av. Comercial, 456",
    clientCity: "Rio de Janeiro, RJ 20000-000",
    clientEmail: "financeiro@cliente.com.br",
    clientPhone: "+55 21 91234-5678",
    projectName: "Produção Audiovisual Completa",
    projectDescription:
      "Criação de conteúdo audiovisual incluindo roteiro, filmagem, edição e pós-produção para campanha digital.",
    items: [
      {
        description: "Desenvolvimento de Roteiro e Storyboard",
        quantity: 20,
        unitPrice: 250,
      },
      {
        description: "Produção e Filmagem (2 dias)",
        quantity: 16,
        unitPrice: 450,
      },
      {
        description: "Edição e Pós-Produção",
        quantity: 40,
        unitPrice: 300,
      },
      {
        description: "Motion Graphics e Animações",
        quantity: 25,
        unitPrice: 350,
      },
      {
        description: "Correção de Cor e Finalização",
        quantity: 15,
        unitPrice: 280,
      },
    ],
    subtotal: 35950,
    taxRate: 5,
    discount: 1000,
    bankName: "InfinitePay",
    accountName: "M2Group LTDA",
    accountNumber: "****-****-5678",
    routingNumber: "001",
    notes:
      "Pagamento via transferência bancária. Prazo de 30 dias após emissão. Multa de 2% ao mês em caso de atraso. Dúvidas entre em contato através do email financeiro@m2group.pro",
  };

  populateInvoiceData(sampleData);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ Página carregada com sucesso!");
  console.log("📍 URL da página:", window.location.href);
  console.log("🔗 Script URL configurada:", SCRIPT_URL);

  // Update current date
  updateCurrentDate();

  // Check if script URL is configured
  if (SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
    console.log(
      "⚠️ Google Apps Script URL not configured. Using sample data for demo."
    );
    // Optionally auto-load sample data for demo
    // loadSampleData();
  } else {
    // Auto-load data from Google Sheets
    console.log("🔄 Carregando dados automaticamente do Google Sheets...");
    fetchInvoiceData();
  }
});

// Add CSS animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
