# Instruções de Implantação — Google Apps Script (Backend)

Este diretório contém o código do backend mínimo para recepção de pacotes, gravação no Google Drive e notificação via Gmail.

---

## 1. Passo a Passo de Implantação

### 1.1 Criar o Projeto no Google Apps Script
1. Acesse [script.google.com](https://script.google.com/) com a conta Google institucional ou mantenedora.
2. Clique em **"Novo projeto"** (New project).
3. Renomeie o projeto no topo para: `FONAR - Backend Institucional PMMG`.

### 1.2 Inserir o Código Fonte
1. Abra o arquivo padrão `Código.gs` (ou renomeie para `Code.gs`).
2. Apague todo o conteúdo e cole o código integral de [`apps-script/Code.js`](./Code.js).
3. Salve o projeto (Ctrl + S ou ícone de disquete).

### 1.3 Configurar o Manifesto (`appsscript.json`)
1. Nas configurações do projeto (ícone de engrenagem no menu lateral esquerdo), marque a opção:
   - **"Mostrar arquivo de manifesto 'appsscript.json' no editor"** (Show appsscript.json manifest file in editor).
2. Volte ao Editor (ícone `<>`), selecione o arquivo `appsscript.json` e substitua seu conteúdo pelo conteúdo de [`apps-script/appsscript.json`](./appsscript.json).
3. Salve o arquivo.

---

## 2. Configurar as Propriedades do Script (Segredos e Variáveis)

As configurações sensíveis ficam centralizadas nas **Propriedades do Script**, sem necessidade de alterar o código-fonte:

1. No menu lateral esquerdo do Apps Script, clique em **Configurações do Projeto** (ícone de engrenagem).
2. Role até a seção **"Propriedades do script"** (Script Properties) e clique em **"Editar propriedades do script"** (Edit script properties).
3. Adicione as seguintes chaves:

| Propriedade | Valor de Exemplo | Descrição |
| :--- | :--- | :--- |
| `DRIVE_ROOT_FOLDER_ID` | `1zsYALz3PqCXj5ZQJBV3eFOzHW-K0ig8J` | ID da pasta "Auditoria" criada no Google Drive |
| `EMAIL_DESTINATION` | `pvd16bpm@pmmg.mg.gov.br` | E-mail corporativo para receber alertas |
| `FORM_NAME` | `FONAR` | Nome da subpasta dentro do ano no Drive |
| `FORM_VERSION` | `1.0.0` | Versão do formulário |
| `ENVIRONMENT` | `production` | Ambiente de execução |

4. Clique em **Salvar propriedades do script**.

---

## 3. Autorização Inicial das Permissões

Antes da primeira publicação, o Google exige conceder permissão de acesso ao Drive e Gmail:

1. No editor de código, selecione no seletor de funções a função: `setupPermissions`.
2. Clique em **"Executar"** (Run).
3. Uma janela intitulada *"Autorização necessária"* será exibida. Clique em **"Revisar permissões"**.
4. Selecione sua conta Google.
5. Se aparecer a tela *"O Google não verificou este app"*, clique em **"Avançado"** (Advanced) e depois em **"Acessar FONAR - Backend Institucional PMMG (não seguro)"**.
6. Clique em **"Permitir"** (Allow) para autorizar a gravação de arquivos no Drive e o envio de e-mails institucionais.
7. Verifique o log de execução: deverá exibir `"Autorização concluída com sucesso"`.

---

## 4. Publicar como Web App

1. No canto superior direito, clique em **"Implantar"** (Deploy) > **"Nova implantação"** (New deployment).
2. Clique no ícone de engrenagem (ao lado de "Selecionar tipo") e escolha **"Aplicativo da Web"** (Web app).
3. Preencha os campos exatamente como abaixo:
   - **Descrição**: `Versão 1.0.0 - Produção FONAR 16º BPM`
   - **Executar como** (Execute as): **Eu (`seu-email@gmail.com`)**
   - **Quem pode acessar** (Who has access): **Qualquer pessoa (`Anyone`)**
4. Clique em **"Implantar"** (Deploy).
5. Copie a **URL do aplicativo da Web** (Web app URL). Ela terá o formato:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

---

## 5. Vincular ao Frontend

No seu projeto frontend ou no arquivo `.env`:

```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

Para deploy no GitHub Pages via GitHub Actions, adicione este valor como Secret ou Variable:
- **Settings** > **Secrets and variables** > **Actions** > **Variables** > `VITE_GOOGLE_APPS_SCRIPT_URL`.
