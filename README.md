Formulário Auxiliar FONAR

Aplicação web independente para preenchimento, organização e geração de arquivos relacionados ao Formulário Nacional de Avaliação de Risco (FONAR).

Arquitetura: GitHub Pages + Google Apps Script + Google Drive + Gmail
Sem: Supabase, banco de dados SQL/NoSQL, VPS, Kubernetes ou infraestrutura complexa.

«[!WARNING]
Aplicação independente e não oficial

Este projeto é uma ferramenta de software independente. Não é desenvolvido, mantido, hospedado, homologado, certificado ou administrado por órgão público, força policial, entidade governamental ou qualquer outra instituição.

O projeto não representa sistema oficial, não substitui sistemas governamentais ou corporativos e não implica autorização, endosso, homologação ou vínculo institucional.

A utilização deve observar a legislação aplicável, as regras de proteção de dados e os procedimentos eventualmente exigidos pelo responsável pelo atendimento.»

---

1. Finalidade

O projeto disponibiliza uma aplicação web estática destinada ao preenchimento estruturado de um formulário baseado no Formulário Nacional de Avaliação de Risco (FONAR).

A aplicação foi projetada para:

- apresentar perguntas e opções de forma estruturada;
- manter as respostas em memória durante o preenchimento;
- gerar uma representação JSON dos dados;
- gerar um documento PDF;
- produzir um "MANIFEST.json" contendo hashes dos arquivos;
- registrar uma cadeia de integridade baseada em hashes;
- transmitir o pacote para um backend mínimo;
- armazenar os arquivos em uma pasta do Google Drive;
- permitir verificação posterior da integridade dos arquivos.

O projeto não pretende substituir sistemas oficiais, bancos de dados governamentais ou procedimentos administrativos.

---

2. Diagrama do Fluxo de Dados

                    USUÁRIO
                       |
                       | HTTPS
                       v
        +------------------------------------+
        |        GitHub Pages                |
        |      Frontend Estático             |
        |                                    |
        |  • Dados mantidos em memória       |
        |  • Snapshot dos dados              |
        |  • JSON Canônico                   |
        |  • PDF                             |
        |  • MANIFEST com SHA-256            |
        |  • Hash Chain                      |
        +----------------+-------------------+
                         |
                         | HTTPS POST
                         | JSON + PDF + MANIFEST
                         v
        +------------------------------------+
        |       Google Apps Script           |
        |       Backend mínimo               |
        |                                    |
        |  • Validação do payload            |
        |  • Controle de duplicidade         |
        |  • Verificação de integridade      |
        +------------+-------------+---------+
                     |             |
                     v             v
          +----------------+  +----------------+
          | Google Drive   |  | Gmail          |
          |                |  |                |
          | Arquivos       |  | Notificação    |
          | do pacote      |  | opcional       |
          +----------------+  +----------------+

Fluxo

1. O usuário acessa a aplicação pelo navegador.
2. As respostas permanecem em estruturas de memória JavaScript durante o preenchimento.
3. Nenhuma resposta é gravada intencionalmente em "localStorage", "sessionStorage", "IndexedDB" ou cookies.
4. Ao solicitar o envio, a aplicação gera:
   - PDF;
   - JSON;
   - "MANIFEST.json";
   - hashes SHA-256;
   - cadeia de integridade.
5. O pacote é enviado ao Google Apps Script.
6. O backend valida o payload e os hashes.
7. Os arquivos podem ser armazenados no Google Drive.
8. Opcionalmente, o sistema pode enviar uma notificação por e-mail.
9. Após a conclusão do envio, as referências às estruturas que continham as respostas são descartadas pelo código da aplicação.

---

3. Privacidade e Armazenamento no Navegador

«[!CAUTION]
Não armazenamento intencional das respostas no armazenamento persistente do navegador»

A aplicação não utiliza, para armazenamento das respostas:

- "localStorage";
- "sessionStorage";
- "IndexedDB";
- WebSQL;
- cookies;
- CacheStorage.

As respostas permanecem nas estruturas de memória utilizadas pela aplicação durante a sessão.

Não existe mecanismo de rascunho automático ou recuperação das respostas após um recarregamento da página.

Após a confirmação do envio, a aplicação descarta as referências às estruturas JavaScript utilizadas durante o preenchimento.

A aplicação também não depende de ferramentas de analytics, rastreadores ou telemetria de terceiros.

Dados pessoais não devem ser inseridos em:

- URLs;
- parâmetros de consulta;
- logs de depuração;
- mensagens de commit;
- arquivos de configuração;
- código-fonte público.

«[!NOTE]
O descarte das referências JavaScript não significa que seja possível garantir a sobrescrita física imediata dos bytes correspondentes na memória RAM. O gerenciamento da memória é realizado pelo navegador e pelo sistema operacional. A aplicação apenas elimina as referências aos objetos utilizados pelo formulário.»

---

4. Pré-requisitos

Para instalar, testar e executar o projeto:

- conta Google, caso sejam utilizados Google Drive e Google Apps Script;
- conta GitHub, caso seja utilizado GitHub Pages;
- Git;
- Node.js 20 ou 22 LTS;
- npm;
- navegador moderno atualizado.

---

5. Configuração

5.1 Criar a pasta no Google Drive

1. Acesse o "Google Drive" (https://drive.google.com/).
2. Crie uma pasta para armazenamento dos arquivos.
3. Copie o ID da pasta pela URL.

Exemplo:

https://drive.google.com/drive/folders/1a2B3c4D5e6F7g8H9...

O ID corresponde ao trecho:

1a2B3c4D5e6F7g8H9...

4. Guarde o ID para configuração do backend.
5. Configure as permissões da pasta de acordo com a finalidade do projeto.

«[!WARNING]
Não utilize a opção "Qualquer pessoa com o link" para arquivos que contenham dados pessoais, salvo quando houver uma justificativa específica e adequada para isso.»

---

5.2 Configurar o Google Apps Script

1. Acesse "Google Apps Script" (https://script.google.com/).
2. Crie um novo projeto.
3. Substitua o conteúdo do arquivo principal pelo código localizado em:

apps-script/Code.js

4. Em Configurações do Projeto, habilite a exibição do arquivo "appsscript.json", se necessário.
5. Configure as propriedades do script:

DRIVE_ROOT_FOLDER_ID
EMAIL_DESTINATION
FORM_NAME
FORM_VERSION
ENVIRONMENT

Exemplo:

DRIVE_ROOT_FOLDER_ID = ID_DA_PASTA
EMAIL_DESTINATION = email@exemplo.com
FORM_NAME = FONAR
FORM_VERSION = 1.0.0
ENVIRONMENT = production

6. Configure o arquivo:

apps-script/appsscript.json

7. Execute a função de configuração de permissões, caso exista no projeto.
8. Conceda somente as permissões necessárias.

Publicação como Web App

No Google Apps Script:

Implantar
→ Nova implantação
→ Aplicativo da Web

Configure conforme a necessidade do projeto e copie a URL gerada:

https://script.google.com/macros/s/.../exec

«[!WARNING]
A configuração de acesso como "Qualquer pessoa" significa que o endpoint poderá receber requisições externas. Caso o projeto manipule dados pessoais, devem ser implementados controles adicionais de autenticação, autorização, validação e proteção contra abuso antes de utilização real.»

---

6. Configuração do Frontend

Crie um arquivo ".env" na raiz do projeto ou utilize ".env.example":

VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbx.../exec

Quando a variável estiver vazia durante o desenvolvimento local, a aplicação poderá utilizar o modo de simulação, caso essa funcionalidade esteja implementada no código.

Nesse modo, o processamento pode ocorrer localmente, permitindo testar a geração dos arquivos sem realizar o envio ao backend.

---

7. Instalação e Execução

Instalar dependências

npm install

Executar em desenvolvimento

npm run dev

Normalmente a aplicação estará disponível em:

http://localhost:5173/

Executar testes

npm run test

Gerar build

npm run build

O resultado será produzido no diretório:

dist/

---

8. Teste Ponta a Ponta

Utilize exclusivamente dados fictícios durante os testes.

1. Abra a aplicação.
2. Verifique os avisos apresentados pela interface.
3. Preencha o formulário com dados de teste.
4. Tente enviar sem cumprir as validações obrigatórias.
5. Confirme que a aplicação bloqueia o envio inválido.
6. Preencha corretamente os campos obrigatórios.
7. Execute o envio.
8. Verifique a geração do:
   - PDF;
   - JSON;
   - "MANIFEST.json".
9. Verifique o protocolo gerado, quando aplicável.
10. Verifique os arquivos armazenados no Google Drive.
11. Verifique o envio de e-mail, caso essa função esteja habilitada.
12. Recarregue a página e confirme que não existe mecanismo de recuperação automática das respostas anteriores.
13. Teste a prevenção contra duplo envio.

---

9. Verificação de Integridade

O pacote de arquivos utiliza hashes SHA-256 para permitir a detecção de alterações posteriores.

Um pacote típico contém:

FORM-YYYY-NNNNNN.pdf
FORM-YYYY-NNNNNN.json
MANIFEST.json

O "MANIFEST.json" registra os hashes correspondentes aos arquivos.

Verificação pelo Node.js

Execute:

npm run verify /caminho/para/pasta/FORM-2026-000123/

Ou:

node tools/verify-package.js /caminho/para/pasta/FORM-2026-000123/

O verificador:

1. lê o "MANIFEST.json";
2. calcula o SHA-256 dos arquivos;
3. compara os valores calculados com os valores registrados;
4. verifica a cadeia de eventos, quando presente;
5. informa o resultado da validação.

Exemplo:

✓ [OK]

ou:

✗ [ADULTERADO]

---

10. Verificador no Navegador

Caso o projeto contenha o verificador integrado:

1. Abra a opção Verificador de Integridade.
2. Selecione o "MANIFEST.json".
3. Selecione o PDF correspondente.
4. Selecione o JSON correspondente.
5. Execute a verificação.

Os hashes podem ser calculados localmente utilizando a Web Crypto API.

---

11. Publicação no GitHub Pages

O projeto contém um workflow de GitHub Actions:

.github/workflows/deploy.yml

Para publicar:

git add .
git commit -m "implementacao do formulario"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main

No GitHub:

Settings
→ Pages
→ Build and deployment
→ Source
→ GitHub Actions

Configure a variável:

VITE_GOOGLE_APPS_SCRIPT_URL

em:

Settings
→ Secrets and variables
→ Actions
→ Variables

Após o push, o workflow executará os testes, realizará o build e publicará o conteúdo.

A URL normalmente terá o formato:

https://seu-usuario.github.io/seu-repositorio/

---

12. QR Code e NFC

A aplicação pode ser acessada por QR Code ou NFC.

QR Code

O QR Code deve apontar somente para a URL pública da aplicação.

Exemplo:

https://seu-usuario.github.io/seu-repositorio/

Não coloque dados pessoais na URL.

Evite parâmetros como:

?cpf=
?nome=
?telefone=
?endereco=

Também não utilize informações de pessoas como identificadores de sessão.

NFC

Uma tag NFC pode conter um registro NDEF com a URL HTTPS da aplicação.

Exemplo:

https://seu-usuario.github.io/seu-repositorio/

Não armazene na tag:

- dados pessoais;
- respostas do formulário;
- senhas;
- tokens permanentes;
- chaves criptográficas;
- informações confidenciais.

---

13. Versionamento do Formulário

Alterações nas perguntas ou opções devem gerar uma nova versão.

Exemplo:

1.0.0
↓
1.1.0

Atualize:

src/config/version.ts

Altere as perguntas em:

src/config/formSchema.ts

Altere os textos em:

src/config/legalTexts.ts

Depois execute:

npm run test
npm run build

Cada submissão deve preservar a versão do formulário utilizada no momento da geração do pacote.

Isso permite identificar posteriormente qual estrutura de formulário originou determinado arquivo.

---

14. Estrutura de Arquivos

Uma estrutura típica:

.
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── apps-script/
│   ├── Code.js
│   └── appsscript.json
│
├── src/
│   ├── config/
│   │   ├── formSchema.ts
│   │   ├── legalTexts.ts
│   │   └── version.ts
│   └── ...
│
├── tools/
│   └── verify-package.js
│
├── .env.example
├── package.json
├── README.md
└── vite.config.ts

---

15. Resolução de Problemas

Sintoma| Possível causa| Solução
Não foi possível concluir o envio| URL do Apps Script incorreta ou indisponível| Verifique "VITE_GOOGLE_APPS_SCRIPT_URL" e a implantação do Web App.
Erro de CORS| Configuração da requisição ou endpoint| Verifique o método utilizado e a configuração do Web App.
Arquivos não aparecem no Drive| ID da pasta incorreto ou falta de permissão| Verifique "DRIVE_ROOT_FOLDER_ID" e as permissões do script.
E-mail não recebido| Endereço incorreto ou limite de envio| Verifique "EMAIL_DESTINATION" e as cotas do serviço.
Hash divergente| Arquivo alterado ou corrompido| Compare os arquivos com os arquivos originais.
GitHub Pages em branco| Configuração incorreta do caminho base| Verifique "base" no "vite.config.ts".

---

16. Limitações Técnicas

Google Apps Script

O serviço possui limitações próprias de execução, armazenamento, requisições e envio de e-mails.

Os limites aplicáveis podem mudar ao longo do tempo. Consulte a documentação atual do Google antes de dimensionar o sistema para uso em produção.

Identificação do dispositivo

Informações fornecidas pelo navegador, como:

- User-Agent;
- fuso horário;
- resolução de tela;

não constituem identificação inequívoca da pessoa que utilizou o dispositivo.

SHA-256

O SHA-256 permite verificar a integridade dos arquivos.

Ele não prova, por si só:

- quem criou o arquivo;
- quem o preencheu;
- quem possuía o dispositivo;
- a autenticidade jurídica das informações;
- a identidade da pessoa que realizou uma ação.

Hash Chain

A cadeia de hashes permite detectar alterações na sequência registrada.

Ela não equivale a uma assinatura digital baseada em certificado.

Memória do navegador

O descarte das referências JavaScript não garante apagamento físico imediato dos dados da memória RAM.

Google Drive

O armazenamento no Google Drive não deve ser considerado, isoladamente, uma estratégia completa de backup.

Para dados importantes, deve existir uma estratégia independente de backup e recuperação.

---

17. Proteção de Dados

O projeto pode processar dados pessoais e, dependendo do conteúdo preenchido, dados pessoais potencialmente sensíveis.

Antes de utilizar a aplicação com dados reais, deve ser realizada uma análise específica sobre:

- finalidade do tratamento;
- base legal aplicável;
- minimização dos dados;
- controle de acesso;
- retenção;
- descarte;
- compartilhamento;
- armazenamento;
- segurança;
- transferência de dados;
- responsabilidades dos operadores e controladores;
- requisitos legais aplicáveis.

Este README não constitui parecer jurídico.

A configuração do Google Drive, Google Apps Script, Gmail e GitHub deve ser compatível com o nível de proteção necessário para os dados tratados.

---

18. Aviso de Independência

Este projeto é um software independente.

Nenhum elemento deste repositório deve ser interpretado como:

- representação oficial de órgão público;
- sistema governamental;
- sistema policial oficial;
- software homologado;
- software certificado;
- produto desenvolvido por órgão público;
- produto mantido por órgão público;
- autorização para utilização de sistemas oficiais;
- substituição de procedimentos oficiais;
- substituição de sistemas corporativos ou governamentais.

O uso do software é de responsabilidade de quem o instala, configura e utiliza.

A presença de referências a legislação, formulários públicos ou procedimentos existentes tem finalidade exclusivamente descritiva e técnica e não estabelece vínculo institucional com os respectivos órgãos ou entidades.