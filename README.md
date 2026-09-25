# Formulário Auxiliar Institucional — FONAR (PMMG)
### Polícia Militar de Minas Gerais — 16º BPM / 1ª Cia PM Ind PVD
**Arquitetura Estrita**: GitHub Pages + Google Apps Script + Google Drive + Gmail  
*(Sem Supabase, sem banco de dados SQL/NoSQL, sem VPS, sem Kubernetes, sem infraestrutura complexa)*

---

## 1. Princípio Fundamental e Finalidade

Este projeto disponibiliza uma aplicação web estática, leve e segura desenvolvida para reproduzir fielmente as perguntas do **Formulário Nacional de Avaliação de Risco (FONAR)** da Primeira Resposta, em apoio às ações de prevenção à violência doméstica da Polícia Militar de Minas Gerais (16º BPM), em consonância com a **Instrução de Serviço nº 01/2026 - 16º BPM** e a **Lei Maria da Penha (Lei Federal nº 11.340/2006)**.

> [!IMPORTANT]
> **Aviso de Ferramenta Auxiliar (Não Substituição do Sistema Institucional):**
> Esta aplicação **NÃO substitui o sistema institucional oficial (REDS)**. Ela atua como ferramenta auxiliar para coleta, padronização e geração de um **Pacote de Evidência Autocontido**.
> O envio oficial e a inserção dos dados no REDS deverão ser realizados manualmente pelo militar responsável pelo atendimento. [VALIDAR JURIDICAMENTE]

---

## 2. Diagrama do Fluxo de Dados

```
                USUÁRIO (Policial / Atendente)
                            |
                            | HTTPS (Acesso público / QR Code / NFC)
                            v
          +------------------------------------+
          |   GitHub Pages (Frontend Estático) |
          |                                    |
          |  • Coleta em Memória RAM           |
          |  • Snapshot Imutável               |
          |  • JSON Canônico (RFC 8785)        |
          |  • PDF Determinístico              |
          |  • MANIFEST com Hashes SHA-256     |
          |  • Trilha de Auditoria (Hash Chain)|
          +-----------------+------------------+
                            |
                            | HTTPS POST (Payload JSON + PDF Base64 + MANIFEST)
                            v
          +------------------------------------+
          |        Google Apps Script          |
          |  (Backend Mínimo sem Banco)        |
          |                                    |
          |  • Validação de Schema (<10MB)     |
          |  • Idempotência via ScriptLock     |
          |  • Conferência de Integridade      |
          +--------+------------------+--------+
                   |                  |
                   v                  v
         +------------------+   +------------------+
         |   Google Drive   |   |      Gmail       |
         |  (Arquivo Fixo   |   |   (Notificação   |
         |   de Evidências) |   |    Secundária)   |
         +------------------+   +------------------+
                   |
                   v
         PREENCHIMENTO MANUAL
         NO SISTEMA INSTITUCIONAL (REDS)
```

### O que passa por cada etapa:
1. **Navegador (Frontend)**: Os dados residem **exclusivamente na memória RAM** durante o preenchimento. Nenhuma resposta é salva em `localStorage`, `sessionStorage`, `IndexedDB` ou cookies. Ao clicar em *Enviar*, o navegador gera o PDF, o JSON canônico e o MANIFEST, calcula todos os hashes SHA-256 e envia o pacote ao Apps Script. Após a resposta do servidor, a memória RAM do formulário é higienizada.
2. **Google Apps Script**: Recebe o payload, valida a integridade dos hashes, evita duplicidades e grava os arquivos na pasta correspondente no Google Drive.
3. **Google Drive**: Arquivo primário e definitivo da evidência (`FORM-YYYY-NNNNNN.pdf`, `FORM-YYYY-NNNNNN.json` e `MANIFEST.json`).
4. **Gmail**: Processo secundário que despacha notificação com resumo e anexos para o e-mail configurado.

---

## 3. Privacidade dos Dados no Navegador (Requisito Crítico)

> [!CAUTION]
> **Regra Estrita de Não Armazenamento no Cliente:**
> - O formulário **NÃO utiliza** `localStorage`, `sessionStorage`, `IndexedDB`, `WebSQL`, `Cookies` ou `CacheStorage` para armazenar as respostas ou dados pessoais do usuário.
> - As respostas existem **exclusivamente em memória volátil (RAM)** durante a sessão de preenchimento.
> - Não há funcionalidade de rascunho automático nem recuperação de sessão após recarregamento.
> - Ao clicar em **"Enviar formulário"**, os dados são transmitidos imediatamente ao Google Apps Script.
> - Após a confirmação de recebimento (`SUCCESS`), a aplicação executa a limpeza e descarte de referências das estruturas JavaScript que continham as respostas sensíveis.
> - A aplicação não utiliza ferramentas de analytics, rastreadores ou telemetria de terceiros.
> - Nenhum dado pessoal é exibido em logs de console (`console.log`) ou em parâmetros de URL (`?cpf=`, `?nome=`).

*Nota técnica: Em qualquer navegador moderno sob sandbox de sistema operacional, não é possível garantir a sobrescrita física de bytes de memória física pelo JavaScript devido ao gerenciador de lixo (Garbage Collector). A aplicação descarta todas as referências em nível de código.* [LIMITAÇÃO TÉCNICA]

---

## 4. Pré-Requisitos

Para instalar, testar e publicar o projeto, você precisará de:
- **Conta Google**: Para hospedar o Google Drive e o Google Apps Script.
- **Conta GitHub**: Para hospedar o repositório e publicar no GitHub Pages.
- **Git**: Instalado localmente (`git --version`).
- **Node.js**: Versão 20 ou 22 LTS instalada (`node -v`).
- **npm**: Gerenciador de pacotes (`npm -v`).
- **Navegador moderno**: Chrome, Firefox, Safari ou Edge atualizados.

---

## 5. Passo a Passo de Configuração

### 5.1 Criar a Pasta de Auditoria no Google Drive
1. Acesse o [Google Drive](https://drive.google.com/) com a conta corporativa ou mantenedora.
2. Crie uma pasta principal denominada: `Auditoria`.
3. Abra a pasta `Auditoria` e copie o **ID da pasta** a partir da barra de endereços do navegador:
   - Exemplo de URL: `https://drive.google.com/drive/folders/1a2B3c4D5e6F7g8H9...`
   - O ID é a sequência após `/folders/`: `1a2B3c4D5e6F7g8H9...`.
4. Guarde esse ID para a etapa seguinte.
5. **Controle de Acesso ao Drive**: Mantenha a pasta com acesso restrito apenas aos militares e administradores autorizados. **Nunca compartilhe a pasta com "Qualquer pessoa com o link"**.

### 5.2 Criar e Publicar o Google Apps Script
1. Acesse [script.google.com](https://script.google.com/) e clique em **"Novo projeto"**.
2. Nomeie o projeto como: `FONAR - Backend Institucional PMMG`.
3. Substitua o conteúdo do arquivo `Código.gs` pelo código presente em [`apps-script/Code.js`](./apps-script/Code.js).
4. No menu lateral, acesse **Configurações do Projeto** (ícone de engrenagem):
   - Marque a opção: *"Mostrar arquivo de manifesto 'appsscript.json' no editor"*.
   - Na seção **Propriedades do script**, adicione:
     - `DRIVE_ROOT_FOLDER_ID`: Cole o ID da pasta do Drive obtido no passo 5.1.
     - `EMAIL_DESTINATION`: Digite o e-mail institucional de destino (ex: `pvd16bpm@pmmg.mg.gov.br`).
     - `FORM_NAME`: `FONAR`.
     - `FORM_VERSION`: `1.0.0`.
     - `ENVIRONMENT`: `production`.
5. Volte ao Editor (`<>`), abra o arquivo `appsscript.json` e cole o conteúdo de [`apps-script/appsscript.json`](./apps-script/appsscript.json).
6. **Autorização Inicial**:
   - No seletor de funções no topo, selecione `setupPermissions` e clique em **Executar**.
   - Conceda as permissões de acesso ao Drive e envio de e-mails para sua conta Google.
7. **Publicar como Web App**:
   - Clique em **Implantar** (Deploy) > **Nova implantação** (New deployment).
   - Tipo: **Aplicativo da Web** (Web app).
   - Descrição: `v1.0.0 - Produção FONAR`.
   - Executar como: **Eu (seu-email@gmail.com)**.
   - Quem pode acessar: **Qualquer pessoa (Anyone)**.
   - Clique em **Implantar** e copie a **URL do aplicativo da Web** (`https://script.google.com/macros/s/.../exec`).

### 5.3 Configurar o Frontend
Crie um arquivo `.env` na raiz do projeto clonado (ou copie de `.env.example`):

```bash
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec
```

> [!NOTE]
> Se a variável `VITE_GOOGLE_APPS_SCRIPT_URL` for deixada vazia durante o desenvolvimento local, o sistema entrará automaticamente em **Modo de Simulação Local**, gerando todos os hashes e arquivos para download sem falhar na tela.

---

## 6. Instalação e Execução Local

### 6.1 Instalar Dependências
No terminal, execute:
```bash
npm install
```

### 6.2 Rodar em Modo de Desenvolvimento
```bash
npm run dev
```
Abra o navegador no endereço exibido (geralmente `http://localhost:5173/`).

### 6.3 Executar Testes Automatizados
```bash
npm run test
```

### 6.4 Compilar para Produção
```bash
npm run build
```
O build estático pronto para publicação será gerado na pasta `dist/`.

---

## 7. Roteiro de Teste Ponta a Ponta

1. Abra a aplicação no navegador (`http://localhost:5173/`).
2. Observe o aviso em vermelho de **Ferramenta Auxiliar** e o informativo de privacidade.
3. Preencha os campos com **dados fictícios de teste** (nunca use dados pessoais reais em testes).
4. Tente clicar em **"Enviar Formulário"** sem confirmar a declaração: o sistema impedirá o envio e indicará o erro.
5. Marque a caixa de confirmação da **Declaração de Fidedignidade Técnica**.
6. Clique em **"Enviar Formulário"**:
   - O botão mudará para *"ENVIANDO E CALCULANDO HASHES..."*.
   - A tela de confirmação exibirá o **Protocolo** (ex: `FORM-2026-784192`), o **Evidence ID** e o horário.
7. Baixe a cópia do pacote clicando em **PDF**, **JSON** e **MANIFEST.json**.
8. Verifique o Google Drive: acesse a pasta `Auditoria/2026/FONAR/FORM-2026-XXXXXX/` e confirme a gravação dos 3 arquivos.
9. Verifique a caixa de entrada do Gmail: confirme o recebimento do e-mail com resumo e hashes.
10. Verifique se o formulário foi limpo em memória e não permite duplo envio.

---

## 8. Verificação Independente de Hashes e MANIFEST

O pacote arquivado é **autocontido**: ele não depende do servidor ou de software proprietário para ser auditado.

### Método 1: Linha de Comando (CLI via Node.js)
Abra o terminal e execute o utilitário fornecido:

```bash
npm run verify /caminho/para/pasta/FORM-2026-000123/
```
ou diretamente:
```bash
node tools/verify-package.js /caminho/para/pasta/FORM-2026-000123/
```

O script:
1. Lê o `MANIFEST.json`.
2. Calcula o SHA-256 de cada arquivo no diretório.
3. Compara byte a byte contra os valores catalogados.
4. Audita a cadeia de eventos (Hash Chain) registrada no arquivo JSON.
5. Exibe `✓ [OK]` ou `✗ [ADULTERADO]`.

### Método 2: Verificador Integrado no Navegador
Na barra superior da aplicação web, clique em **"Verificador de Integridade"**:
1. Selecione o arquivo `MANIFEST.json`.
2. Selecione os arquivos `FORM-YYYY-XXXXXX.pdf` e `FORM-YYYY-XXXXXX.json`.
3. Clique em **Executar Verificação de Hashes**.
4. O navegador calculará os hashes localmente via Web Crypto API e informará o resultado.

---

## 9. Publicação no GitHub Pages

O projeto já inclui um workflow pronto do GitHub Actions em [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

1. Crie um repositório no seu GitHub (público ou privado).
2. Adicione os arquivos e faça o push para a branch `main`:
   ```bash
   git add .
   git commit -m "feat: implementacao completa do formulario auxiliar FONAR"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. No GitHub, acesse **Settings** > **Pages**:
   - Em **Build and deployment** > **Source**, selecione: **GitHub Actions**.
4. Configure a URL do Apps Script:
   - Acesse **Settings** > **Secrets and variables** > **Actions** > aba **Variables**.
   - Clique em **New repository variable**.
   - Nome: `VITE_GOOGLE_APPS_SCRIPT_URL`.
   - Valor: URL do Web App do Google Apps Script (`https://script.google.com/macros/s/.../exec`).
5. Ao realizar o push na branch `main`, a Action executará os testes, compilará o projeto e publicará no GitHub Pages.
6. A URL pública será disponibilizada (ex: `https://seu-usuario.github.io/seu-repositorio/`).

---

## 10. Configuração de QR Code e NFC

Para disponibilizar o acesso aos policiais militares ou atendentes:

### 10.1 QR Code
- Gere um QR Code apontando **exclusivamente para a URL pública do GitHub Pages**:
  - Exemplo: `https://pmmg-16bpm.github.io/fonar/`
  - Se utilizar token de acesso aleatório de sessão: `https://pmmg-16bpm.github.io/fonar/#token=a8f93bc...`
- **REGRA DE SEGURANÇA**: Nunca inclua dados pessoais ou identificadores de vítimas/autores na URL (proibido o uso de `?cpf=`, `?nome=`, etc.).

### 10.2 Cartão ou Tag NFC
- Grave na memória NDEF da tag NFC apenas o link HTTPS público do formulário.
- Não armazene chaves criptográficas ou dados confidenciais na memória do chip NFC.

---

## 11. Como Configurar Nova Versão do Formulário

Quando houver alteração nas perguntas, avisos ou opções da Instrução de Serviço:
1. **Nunca altere perguntas retroativamente**: Toda alteração deve gerar uma nova versão.
2. Edite `src/config/version.ts` incrementando `form_version` (ex: de `1.0.0` para `1.1.0`).
3. Edite as perguntas e opções em `src/config/formSchema.ts`.
4. Edite textos e avisos em `src/config/legalTexts.ts`.
5. Execute `npm run test` e `npm run build` para validar a integridade.
6. Submissões antigas arquivadas no Google Drive permanecerão perfeitamente auditáveis porque continham o snapshot congelado da versão vigente na época.

---

## 12. Resolução de Problemas (Troubleshooting)

| Sintoma | Causa Mais Provável | Solução |
| :--- | :--- | :--- |
| **"Não foi possível concluir o envio"** | URL do Apps Script incorreta ou bloqueio de rede | Verifique se a variável `VITE_GOOGLE_APPS_SCRIPT_URL` está correta e se a implantação do Apps Script está como "Qualquer pessoa" (Anyone). |
| **Erro de CORS no navegador** | Requisição enviada com Content-Type complexo | O serviço já utiliza `text/plain;charset=utf-8` para evitar requisição preflight OPTIONS no Apps Script. Verifique a URL do Web App. |
| **Arquivos não aparecem no Google Drive** | `DRIVE_ROOT_FOLDER_ID` incorreto ou sem permissão | Verifique nas Propriedades do Script se o ID da pasta "Auditoria" está correto e execute a função `setupPermissions` no editor. |
| **E-mail não é recebido no Gmail** | Cota diária de envio excedida ou endereço inválido | O Drive ainda assim arquiva os arquivos com sucesso. Verifique o e-mail em `EMAIL_DESTINATION` e consulte a cota do Google. |
| **Hash Divergente no Verificador** | Arquivo PDF ou JSON foi editado ou corrompido após download | Qualquer alteração de um único espaço ou byte altera o SHA-256. Utilize sempre os arquivos originais baixados do Drive. |
| **GitHub Pages com tela em branco** | Caminho relativo de base incorreto | O projeto já está configurado com `base: './'` em `vite.config.ts`, suportando subpastas do GitHub Pages. |

---

## 13. Limitações do Plano e do Serviço

- **[LIMITAÇÃO DO SERVIÇO] Google Apps Script**:
  - Limite de tempo de execução de 6 minutos por requisição (a geração do PDF no cliente elimina o risco de timeout).
  - Limite de tamanho de requisição POST de aproximadamente 10 MB.
  - Cota diária de despacho de e-mails via `MailApp`/`GmailApp` (100 destinatários/dia para contas gratuitas; 1.500 para Google Workspace).
- **[LIMITAÇÃO TÉCNICA] Identificação do Dispositivo**:
  - A aplicação coleta dados técnicos fornecidos pelo navegador (User-Agent, fuso horário, resolução de tela).
  - O registro desses dados **não constitui prova absoluta da identidade física da pessoa** que manuseava o dispositivo.
- **[LIMITAÇÃO TÉCNICA] Hash vs Assinatura Digital**:
  - O cálculo do SHA-256 e o encadeamento de eventos (Hash Chain) atestam matematicamente a **integridade do conteúdo** e a detecção de adulteração, mas não substituem uma assinatura digital com certificado ICP-Brasil.
- **[LIMITAÇÃO DO SERVIÇO] Backup do Google Drive**:
  - Recomenda-se definir um procedimento operacional periódico de backup da pasta `Auditoria` do Google Drive para armazenamento secundário.

---

## 14. Conformidade e Validação Jurídica (LGPD)

O software não substitui a análise jurídica formal. Os seguintes pontos devem ser validados pela assessoria jurídica da instituição:

- **[VALIDAR JURIDICAMENTE] Base Legal**: Definição da base legal da LGPD (art. 7º, II - cumprimento de obrigação legal e art. 7º, III - execução de políticas públicas pela administração pública).
- **[VALIDAR JURIDICAMENTE] Prazo de Retenção**: Fixação do tempo máximo de guarda dos arquivos de auditoria no Google Drive.
- **[VALIDAR JURIDICAMENTE] Compartilhamento**: Controle de acesso às pastas do Drive e destinação de notificações por e-mail.
- **[VALIDAR JURIDICAMENTE] Texto da Declaração**: Redação final dos termos de fidedignidade técnica apresentados ao atendente ou comunicante.
