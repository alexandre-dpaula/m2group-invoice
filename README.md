# M2Group Invoice System

Sistema de invoice moderno com integração ao Google Sheets para M2Group Productions.

## Características

- 🎨 Design moderno com tema escuro e efeitos neon azul
- 📊 Integração simplificada com Google Sheets (2 abas)
- 💰 Cálculos automáticos de invoice
- 🖨️ Layout otimizado para impressão A4
- 📱 Design totalmente responsivo
- ⚡ Carregamento de dados em tempo real
- 💳 Links diretos para pagamento (Pix/Checkout)
- 🎬 Links para visualizar projetos
- ✨ Logo animada com efeito glow
- 🟢 Indicador pulsante verde no botão "Ver Projeto"

## Estrutura de Arquivos

```
Invoice/
├── index.html              # Página principal da invoice
├── styles.css              # Estilos CSS com efeitos neon
├── script.js               # JavaScript para carregar dados
├── Code.gs                 # Google Apps Script
├── Logo M2 studio Wh.png   # Logo do M2Group
├── bg.jpg                  # Imagem de fundo
├── landing.html            # Página landing (separada)
├── landing-styles.css      # Estilos da landing
└── README.md               # Este arquivo
```

## Configuração do Google Sheets

### Passo 1: Criar novo Google Sheets

1. Acesse [Google Sheets](https://sheets.google.com)
2. Crie uma nova planilha
3. Nomeie como "M2Group Invoices" ou nome de sua preferência

### Passo 2: Configurar Apps Script

1. No Google Sheets, vá em **Extensões** > **Apps Script**
2. Delete o código padrão
3. Copie todo o conteúdo do arquivo `Code.gs` e cole no editor
4. Clique em **Salvar** (💾)
5. Nomeie o projeto como "M2Group Invoice API"

### Passo 3: Criar estrutura das planilhas

1. No editor do Apps Script, clique em **Executar** > **setupSampleSheets**
2. Autorize o script quando solicitado (primeira vez)
3. Aguarde a execução (verifique os logs se necessário)

Isso criará 2 abas no seu Google Sheets com dados de exemplo:

#### Aba "Invoices"

Estrutura das colunas:

| Coluna | Campo       | Tipo   | Descrição                              |
| ------ | ----------- | ------ | -------------------------------------- |
| A      | invoice_id  | Texto  | ID único da invoice (ex: INV-2025-001) |
| B      | empresa     | Texto  | Nome do cliente/empresa                |
| C      | data        | Data   | Data da invoice (formato: AAAA-MM-DD)  |
| D      | descricao   | Texto  | Tagline/descrição curta do projeto     |
| E      | subtotal    | Número | Valor subtotal (soma dos itens)        |
| F      | desconto    | Número | Valor do desconto em reais             |
| G      | taxas       | Número | Percentual de taxas (ex: 5 para 5%)    |
| H      | total       | Número | Valor total final                      |
| I      | status      | Texto  | Status: "Pendente" ou "Pago"           |
| J      | payment_url | URL    | Link para pagamento (Pix/Checkout)     |
| K      | project_url | URL    | Link para visualizar o projeto         |

**Exemplo:**

```
INV-2025-001 | Empresa Cliente LTDA | 2025-01-15 | Produção Audiovisual Completa | 35950 | 1000 | 5 | 36747.5 | Pendente | https://pix.exemplo.com/pay/INV-2025-001 | https://m2group.pro/projects/cliente-2025-001
```

#### Aba "Itens"

Estrutura das colunas:

| Coluna | Campo      | Tipo   | Descrição                             |
| ------ | ---------- | ------ | ------------------------------------- |
| A      | invoice_id | Texto  | ID da invoice (mesmo da aba Invoices) |
| B      | servico    | Texto  | Descrição do serviço prestado         |
| C      | qtd        | Número | Quantidade de horas/unidades          |
| D      | valor_unit | Número | Valor unitário em reais               |

**Exemplo:**

```
INV-2025-001 | Desenvolvimento de Roteiro e Storyboard | 20 | 250
INV-2025-001 | Produção e Filmagem (2 dias) | 16 | 450
INV-2025-001 | Edição e Pós-Produção | 40 | 300
```

### Passo 4: Implantar como Web App

1. No Apps Script, clique em **Implantar** > **Nova implantação**
2. Em "Tipo", selecione **Aplicativo da Web**
3. Configure:
   - **Descrição**: "M2Group Invoice API"
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: Qualquer pessoa
4. Clique em **Implantar**
5. Copie a **URL do aplicativo da Web** gerada
6. Clique em **Concluído**

### Passo 5: Configurar o HTML

1. Abra o arquivo `script.js`
2. Localize a linha 2: `const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';`
3. Cole a URL copiada no passo anterior
4. Salve o arquivo

Exemplo:

```javascript
const SCRIPT_URL = "https://script.google.com/macros/s/ABC123.../exec";
```

## Como Usar

### Acessar uma Invoice

Abra o `index.html` no navegador com o parâmetro `id`:

```
index.html?id=INV-2025-001
```

Se não informar o ID, o sistema buscará o ID "1" por padrão.

### Adicionar Nova Invoice

1. Abra o Google Sheets
2. Na aba **Invoices**, adicione uma nova linha com todos os dados
3. Na aba **Itens**, adicione os serviços relacionados ao invoice_id
4. Acesse `index.html?id=SEU_INVOICE_ID`

### Botões Funcionais

- **Gerar PDF**: Abre o diálogo de impressão do navegador
- **Pagar**: Redireciona para o link em `payment_url` (se configurado)
- **Ver Projeto**: Redireciona para o link em `project_url` (se configurado)
- **Conectar ao Google Sheets**: Carrega os dados da planilha

## Cálculos Automáticos

O sistema calcula automaticamente:

```
Subtotal = Soma de (quantidade × valor_unit) de todos os itens
Taxas = Subtotal × (taxas / 100)
Total = Subtotal + Taxas - Desconto
```

**Exemplo:**

- Subtotal: R$ 35.950,00
- Taxas (5%): R$ 1.797,50
- Desconto: R$ 1.000,00
- **Total: R$ 36.747,50**

## Personalização

### Alterar Cores

Edite o arquivo `styles.css` e modifique as cores principais:

```css
/* Cor primária (azul neon) */
#00b4ff

/* Cor secundária (azul mais escuro) */
#0099ff

/* Cor do indicador verde */
#00ff88
```

### Alterar Informações da Empresa

No arquivo `Code.gs`, na função `findInvoiceById()`, atualize:

```javascript
companyName: 'M2Group Productions',
companyEmail: 'contato@m2group.pro',
companyPhone: '+55 11 98765-4321',
bankName: 'InfinitePay',
accountName: 'M2Group LTDA',
accountNumber: '****-****-5678',
```

## Testes

### Testar API do Google Sheets

1. No Apps Script, execute a função `testGetInvoice()`
2. Verifique os logs (**Ver** > **Logs**)
3. Deve aparecer o JSON com os dados da invoice

### Carregar Dados de Exemplo

1. No navegador, abra `index.html`
2. Abra o Console do desenvolvedor (F12)
3. Execute: `loadSampleData()`
4. Os dados de exemplo serão exibidos na tela

## Estrutura do Código

### Frontend (HTML/CSS/JS)

- **index.html**: Estrutura da página com todas as seções
- **styles.css**: Estilos com animações e efeitos neon
- **script.js**: Lógica de carregamento e formatação de dados

### Backend (Google Apps Script)

- **doGet()**: Endpoint HTTP que recebe requests
- **getInvoiceData()**: Busca dados da invoice no Sheets
- **findInvoiceById()**: Localiza invoice específica
- **getInvoiceItems()**: Busca itens relacionados à invoice
- **setupSampleSheets()**: Cria estrutura inicial das planilhas

## Troubleshooting

### "Invoice ID é obrigatório"

- Certifique-se de passar o parâmetro `?id=` na URL

### "Invoice não encontrada"

- Verifique se o invoice_id existe na aba Invoices
- Confira se não há espaços extras no ID

### "Configure a URL do Google Apps Script"

- Você precisa implantar o Apps Script e copiar a URL
- Cole a URL no arquivo `script.js`

### Dados não carregam

- Verifique se o Apps Script está implantado como "Qualquer pessoa"
- Teste a URL do script diretamente no navegador
- Verifique os logs do Apps Script

### Estilo não aparece

- Certifique-se que o arquivo `styles.css` está no mesmo diretório
- Verifique se o arquivo `Logo M2 studio Wh.png` existe
- Confirme que o arquivo `bg.jpg` está presente

## Tecnologias Utilizadas

- HTML5
- CSS3 (Animations, Flexbox, Grid)
- JavaScript (ES6+)
- Google Apps Script
- Google Sheets API

## Suporte

Para dúvidas ou problemas:

- Email: contato@m2group.pro
- Website: https://m2group.pro

---

**M2Group Productions** - Sistema de Invoice v2.0
# m2group-invoice
