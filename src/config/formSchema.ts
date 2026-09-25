import { FormSection } from "../types/form";

export const FORM_SECTIONS: FormSection[] = [
  {
    "id": "section_victim",
    "title": "1. DADOS DO ATENDIMENTO E DA VÍTIMA",
    "badge": "Primeira Resposta",
    "description": "Informações iniciais do atendimento e qualificação da vítima.",
    "fields": [
      {
        "id": "field_0",
        "version": "1.0",
        "index": 0,
        "label": "DATA",
        "type": "date",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_1",
        "version": "1.0",
        "index": 1,
        "label": "HORÁRIO",
        "type": "time",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_2",
        "version": "1.0",
        "index": 2,
        "label": "RELAÇÃO VÍTIMA/AUTOR",
        "type": "select",
        "description": null,
        "options": [
          "CONJUGE / COMPANHEIRO",
          "EX-CONJUGE / EX-COMPANHEIRO",
          "FILHO / ENTEADO",
          "IRMÃO",
          "PAIS / RESPONSÁVEL LEGAL",
          "OUTRO PARENTESCO",
          "NAMORADO (A)",
          "AVÓS / BISAVÓS / TATARAVÓS",
          "NETOS / BISNETOS / TATARANETOS",
          "CO-HABITAÇÃO / HOSPITALIDADE / RELAÇÕES DOMÉSTICAS",
          "RELACIONAMENTO EXTRACONJUGAL",
          "EX-NAMORADO (A)",
          "PADRASTO",
          "MADRASTA",
          "TIO (A)",
          "PRIMO (A)",
          "CUNHADO (A)",
          "SOBRINHO (A)",
          "GENRO / NORA",
          "EX-RESIDENTE DO LAR",
          "CUIDADOR (A)",
          "EMPREGADO (A) DOMÉSTICO (A)"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_3",
        "version": "1.0",
        "index": 3,
        "label": "GRAU DA LESÃO",
        "type": "select",
        "description": null,
        "options": [
          "FATAL",
          "LEVES",
          "GRAVES OU INCONSCIENTE",
          "SEM LESÕES APARENTES",
          "GRAU DA LESÃO - IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_4",
        "version": "1.0",
        "index": 4,
        "label": "NOME DA VÍTIMA (DATA DE NASCIMENTO, NOME SOCIAL E OUTROS DADOS)",
        "type": "textarea",
        "description": null,
        "options": [],
        "allowOther": true,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_5",
        "version": "1.0",
        "index": 5,
        "label": "RG DA VÍTIMA",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_6",
        "version": "1.0",
        "index": 6,
        "label": "OCUPAÇÃO DA VÍTIMA",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_7",
        "version": "1.0",
        "index": 7,
        "label": "CPF DA VÍTIMA",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_8",
        "version": "1.0",
        "index": 8,
        "label": "ESCOLARIDADE DA VÍTIMA",
        "type": "select",
        "description": null,
        "options": [
          "ANALFABETO",
          "ALFABETIZADO",
          "ENSINO FUNDAMENTAL INCOMPLETO",
          "ENSINO FUNDAMENTAL COMPLETO",
          "ENSINO MÉDIO INCOMPLETO",
          "ENSINO MÉDIO COMPLETO",
          "ENSINO SUPERIOR INCOMPLETO",
          "ENSINO SUPERIOR COMPLETO",
          "MESTRADO",
          "DOUTORADO",
          "IGNORADO",
          "OUTROS"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_9",
        "version": "1.0",
        "index": 9,
        "label": "COR / RAÇA DA VÍTIMA",
        "type": "select",
        "description": null,
        "options": [
          "AMARELO",
          "BRANCO",
          "PRETO",
          "PARDO",
          "INDÍGENA",
          "IGNORADA"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_10",
        "version": "1.0",
        "index": 10,
        "label": "SEXO DA VÍTIMA",
        "type": "select",
        "description": null,
        "options": [
          "FEMININO",
          "MASCULINO",
          "NÃO IDENTIFICADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_11",
        "version": "1.0",
        "index": 11,
        "label": "ESTADO CIVIL DA VÍTIMA",
        "type": "select",
        "description": null,
        "options": [
          "CASADO",
          "DIVORCIADO",
          "SEPARADO JUDICIALMENTE",
          "SOLTEIRO",
          "VIÚVO",
          "UNIÃO ESTÁVEL",
          "NÃO DECLARADO",
          "IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_12",
        "version": "1.0",
        "index": 12,
        "label": "VÍTIMA DECLAROU ORIENTAÇÃO SEXUAL",
        "type": "select",
        "description": null,
        "options": [
          "NÃO",
          "SIM, HETEROSSEXUAL",
          "SIM, HOMOSSEXUAL",
          "SIM, BISSEXUAL",
          "SIM, ASSEXUAL"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_13",
        "version": "1.0",
        "index": 13,
        "label": "VÍTIMA DECLAROU IDENTIDADE DE GÊNERO",
        "type": "select",
        "description": null,
        "options": [
          "NÃO",
          "SIM, TRAVESTI",
          "SIM, MULHER TRANSEXUAL",
          "SIM, HOMEM TRANSEXUAL",
          "SIM, INTERSEXUAL",
          "SIM, NÃO-BINÁRIO",
          "SIM, QUEER",
          "SIM, MULHER CISGÊNERO",
          "SIM, HOMEM CISGÊNERO",
          "NÃO SE APLICA",
          "IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_14",
        "version": "1.0",
        "index": 14,
        "label": "NACIONALIDADE DA VÍTIMA (se necessário, especifique em outro)",
        "type": "checkbox",
        "description": null,
        "options": [
          "BRASILEIRA",
          "ESTRANGEIRA",
          "NATURALIZADA",
          "IGNORADA"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_15",
        "version": "1.0",
        "index": 15,
        "label": "ENDEREÇO DA VÍTIMA",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_16",
        "version": "1.0",
        "index": 16,
        "label": "TELEFONE DA VÍTIMA",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      },
      {
        "id": "field_17",
        "version": "1.0",
        "index": 17,
        "label": "E-MAIL DA VÍTIMA",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_victim"
      }
    ]
  },
  {
    "id": "section_author",
    "title": "2. DADOS DO AUTOR",
    "badge": "Qualificação",
    "description": "Qualificação completa do autor da agressão ou ameaça.",
    "fields": [
      {
        "id": "field_19",
        "version": "1.0",
        "index": 19,
        "label": "GRAU DA LESÃO",
        "type": "select",
        "description": null,
        "options": [
          "FATAL",
          "LEVE",
          "GRAVES OU INCONSCIENTE",
          "SEM LESÕES APARENTES",
          "GRAU DA LESÃO - IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_20",
        "version": "1.0",
        "index": 20,
        "label": "PRISÃO APREENSÃO",
        "type": "select",
        "description": null,
        "options": [
          "FLAGRANTE DE ATO INFRACIONAL",
          "FLAGRANTE DE CRIME / CONTRAVENÇÃO",
          "MANDADO JUDICIAL",
          "RECAPTURA",
          "SEM PRISÃO",
          "TCO / FLAGRANTE INFRAÇÃO DE MENOR POTENCIAL OFENSIVO",
          "OUTRAS - PRISÃO / APREENSÃO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_21",
        "version": "1.0",
        "index": 21,
        "label": "NOME DO AUTOR (DATA DE NASCIMENTO, NOME SOCIAL E OUTROS DADOS)",
        "type": "textarea",
        "description": null,
        "options": [],
        "allowOther": true,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_22",
        "version": "1.0",
        "index": 22,
        "label": "RG DO AUTOR",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_23",
        "version": "1.0",
        "index": 23,
        "label": "OCUPAÇÃO DO AUTOR",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_24",
        "version": "1.0",
        "index": 24,
        "label": "CPF DO AUTOR",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_25",
        "version": "1.0",
        "index": 25,
        "label": "ESCOLARIDADE DO AUTOR",
        "type": "select",
        "description": null,
        "options": [
          "ANALFABETO",
          "ALFABETIZADO",
          "ENSINO FUNDAMENTAL INCOMPLETO",
          "ENSINO FUNDAMENTAL COMPLETO",
          "ENSINO MÉDIO INCOMPLETO",
          "ENSINO MÉDIO COMPLETO",
          "ENSINO SUPERIOR INCOMPLETO",
          "ENSINO SUPERIOR COMPLETO",
          "MESTRADO",
          "DOUTORADO",
          "IGNORADO",
          "OUTROS"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_26",
        "version": "1.0",
        "index": 26,
        "label": "COR / RAÇA DO AUTOR",
        "type": "select",
        "description": null,
        "options": [
          "AMARELO",
          "BRANCO",
          "PRETO",
          "PARDO",
          "INDÍGENA",
          "IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_27",
        "version": "1.0",
        "index": 27,
        "label": "SEXO DO AUTOR",
        "type": "select",
        "description": null,
        "options": [
          "FEMININO",
          "MASCULINO",
          "NÃO IDENTIFICADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_28",
        "version": "1.0",
        "index": 28,
        "label": "ESTADO CIVIL DO AUTOR",
        "type": "select",
        "description": null,
        "options": [
          "CASADO",
          "DIVORCIADO",
          "SEPARADO JUDICIALMENTE",
          "SOLTEIRO",
          "VIÚVO",
          "UNIÃO ESTÁVEL",
          "NÃO DECLARADO",
          "IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_29",
        "version": "1.0",
        "index": 29,
        "label": "AUTOR DECLAROU ORIENTAÇÃO SEXUAL",
        "type": "select",
        "description": null,
        "options": [
          "NÃO",
          "SIM, HETEROSSEXUAL",
          "SIM, HOMOSSEXUAL",
          "SIM, BISSEXUAL",
          "SIM, ASSEXUAL"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_30",
        "version": "1.0",
        "index": 30,
        "label": "AUTOR DECLAROU IDENTIDADE DE GÊNERO",
        "type": "select",
        "description": null,
        "options": [
          "NÃO",
          "SIM, TRAVESTI",
          "SIM, MULHER TRANSEXUAL",
          "SIM, HOMEM TRANSEXUAL",
          "SIM, INTERSEXUAL",
          "SIM, NÃO-BINÁRIO",
          "SIM, QUEER",
          "SIM, MULHER CISGÊNERO",
          "SIM, HOMEM CISGÊNERO",
          "NÃO SE APLICA",
          "IGNORADO"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_31",
        "version": "1.0",
        "index": 31,
        "label": "NACIONALIDADE DO AUTOR (se necessário, especifique em outro)",
        "type": "checkbox",
        "description": null,
        "options": [
          "BRASILEIRA",
          "ESTRANGEIRA",
          "NATURALIZADA",
          "IGNORADA"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_32",
        "version": "1.0",
        "index": 32,
        "label": "ENDEREÇO DO AUTOR",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_33",
        "version": "1.0",
        "index": 33,
        "label": "TELEFONE DO AUTOR",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      },
      {
        "id": "field_34",
        "version": "1.0",
        "index": 34,
        "label": "E-MAIL DO AUTOR",
        "type": "text",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_author"
      }
    ]
  },
  {
    "id": "section_risk",
    "title": "3. FORMULÁRIO NACIONAL DE AVALIAÇÃO DE RISCO (FONAR)",
    "badge": "Avaliação de Risco",
    "description": "Questionário estruturado padronizado conforme Resolução Conjunta CNJ/CNMP nº 5/2020 e Instrução 01/2026 - 16º BPM.",
    "fields": [
      {
        "id": "field_36",
        "version": "1.0",
        "index": 36,
        "label": "PARA PREENCHIMENTO DO PROFISSIONAL",
        "type": "select",
        "description": null,
        "options": [
          "Vítima respondeu a este formulário sem ajuda profissional",
          "Vítima respondeu a este formulário com auxílio profissional",
          "Vítima não teve condições de responder a este formulário",
          "Vítima recusou-se a preencher o formulário",
          "Terceiro comunicante respondeu a este formulário"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_37",
        "version": "1.0",
        "index": 37,
        "label": "O(A) AGRESSOR(A) JÁ AMEAÇOU VOCÊ OU ALGUM FAMILIAR COM A FINALIDADE DE ATINGI-LA?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, com arma de fogo",
          "Sim, com faca",
          "Sim, de outra forma (especificar em outro)",
          "Não"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_38",
        "version": "1.0",
        "index": 38,
        "label": "O(A) AGRESSOR(A) JÁ PRATICOU ALGUMA(S) DAS SEGUINTES FORMAS GRAVES DE AGRESSÃO FÍSICA CONTRA VOCÊ?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Queimadura",
          "Enforcamento",
          "Sufocamento",
          "Estrangulamento",
          "Tiro",
          "Afogamento",
          "Facada",
          "Paulada",
          "Nenhuma agressão física"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_39",
        "version": "1.0",
        "index": 39,
        "label": "O(A) AGRESSOR(A) JÁ PRATICOU ALGUMA(S) DESTAS AGRESSÕES FÍSICAS CONTRA VOCÊ?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Soco",
          "Chute",
          "Tapa",
          "Empurrão",
          "Puxão de Cabelo",
          "Nenhuma agressão física"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_40",
        "version": "1.0",
        "index": 40,
        "label": "VOCÊ NECESSITOU DE ATENDIMENTO MÉDICO E/OU INTERNAÇÃO APÓS ALGUMAS DESSAS AGRESSÕES?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Prefiro não informar"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_41",
        "version": "1.0",
        "index": 41,
        "label": "O(A) AGRESSOR(A) JÁ OBRIGOU VOCÊ A TER RELAÇÕES SEXUAIS OU PRATICAR ATOS SEXUAIS CONTRA A SUA VONTADE?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_42",
        "version": "1.0",
        "index": 42,
        "label": "O(A) AGRESSOR(A) JÁ TEVE ALGUM DESTES COMPORTAMENTOS?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Disse algo parecido com: \"se não for minha, não será de mais ninguém\"",
          "Perturbou, perseguiu ou vigiou você nos locais que frequenta",
          "Proibiu você de visitar familiares ou amigos",
          "Proibiu você de trabalhar ou estudar",
          "Fez telefonemas, enviou mensagens pelo celular ou e-mails de forma insistente",
          "Impediu você de ter acesso a dinheiro, conta bancária, documentos pessoais, ou outros bens",
          "Teve outros comportamentos de ciúme excessivo e de controle",
          "Nenhum comportamento de ciúme excessivo ou controle"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_43",
        "version": "1.0",
        "index": 43,
        "label": "VOCÊ JÁ REGISTROU OCORRÊNCIA POLICIAL OU SOLICITOU MEDIDA PROTETIVA DE URGÊNCIA CONTRA O(A) AGRESSOR(A)?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, registrei ocorrência policial e solicitei medida protetiva de urgência",
          "Sim, registrei apenas ocorrência policial",
          "Sim, solicitei apenas medida protetiva de urgência",
          "Não, nunca registrei ocorrência ou solicitei medida protetiva"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_44",
        "version": "1.0",
        "index": 44,
        "label": "O(A) AGRESSOR(A) JÁ DESCUMPRIU MEDIDA PROTETIVA ANTERIORMENTE?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_45",
        "version": "1.0",
        "index": 45,
        "label": "AS AGRESSÕES OU AMEAÇAS DO(A) AGRESSOR(A) CONTRA VOCÊ SE TORNARAM MAIS FREQUENTES E/OU MAIS GRAVES NOS ÚLTIMOS 12 MESES?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, ficaram mais frequentes e/ou mais graves",
          "Não houve aumento da frequência e intensidade das agressões e/ou ameaças",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_46",
        "version": "1.0",
        "index": 46,
        "label": "O(A) AGRESSOR(A) FAZ USO ABUSIVO DE ÁLCOOL OU DE DROGAS OU DE MEDICAMENTOS?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, álcool",
          "Sim, drogas",
          "Sim, medicamentos",
          "Não faz uso das substâncias listadas",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_47",
        "version": "1.0",
        "index": 47,
        "label": "O(A) AGRESSOR(A) TEM ALGUMA DOENÇA MENTAL COMPROVADA POR AVALIAÇÃO MÉDICA?",
        "type": "select",
        "description": null,
        "options": [
          "Sim, e faz uso de medicação",
          "Sim, e não faz uso de medicação",
          "Não",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_48",
        "version": "1.0",
        "index": 48,
        "label": "O(A) AGRESSOR(A) JÁ TENTOU SUICÍDIO OU FALOU EM SUICIDAR-SE?",
        "type": "select",
        "description": null,
        "options": [
          "Sim, já tentou suicídio",
          "Sim, já falou em suicidar-se, mas nunca tentou",
          "Não, nunca tentou nem falou sobre suicídio",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_49",
        "version": "1.0",
        "index": 49,
        "label": "O(A) AGRESSOR(A) ESTÁ DESEMPREGADO OU TEM DIFICULDADES FINANCEIRAS?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_50",
        "version": "1.0",
        "index": 50,
        "label": "O(A) AGRESSOR(A) TEM FÁCIL A ARMA DE FOGO?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei",
          "Prefiro não informar"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_51",
        "version": "1.0",
        "index": 51,
        "label": "O(A) AGRESSOR(A) JÁ AMEAÇOU OU AGREDIU SEUS(SUAS) FILHOS(AS), OUTROS FAMILIARES, OUTRAS PARCEIRAS ÍNTIMAS, AMIGOS(AS), COLEGAS DE TRABALHO, PESSOAS DESCONHECIDAS OU ANIMAIS DE ESTIMAÇÃO?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, filhos(as)",
          "Sim, outros familiares",
          "Sim, animais de estimação",
          "Sim, outras parceiras íntimas",
          "Sim, outras pessoas (amigos(as), colegas de trabalho, pessoas desconhecidas etc.)",
          "Não",
          "Não sei"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_52",
        "version": "1.0",
        "index": 52,
        "label": "VOCÊ TEM CONHECIMENTO DE REGISTRO DE OCORRÊNCIA POLICIAL E/OU MEDIDA PROTETIVA DE URGÊNCIA CONTRA ELE/ELA POR ESSAS VIOLÊNCIAS?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_53",
        "version": "1.0",
        "index": 53,
        "label": "VOCÊ TERMINOU, TENTOU OU MANIFESTOU INTENÇÃO DE TERMINAR COM O(A) AGRESSOR(A) RECENTEMENTE?",
        "type": "select",
        "description": null,
        "options": [
          "Sim, terminei recentemente",
          "Sim, tentei terminar, mas ainda estou na relação",
          "Sim, manifestei intenção de terminar",
          "Não"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_54",
        "version": "1.0",
        "index": 54,
        "label": "VOCÊ TEM FILHOS? ",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, de outro relacionamento. Quantos? (Especifique quantos em outro)",
          "Sim, com o(a) agressor(a). Quantos? (Especifique em outro)",
          "Não possuo filhos"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_55",
        "version": "1.0",
        "index": 55,
        "label": "QUAL A FAIXA ETÁRIA DE SEUS FILHOS? SE TIVER MAIS DE UM FILHO, PODE ASSINALAR MAIS DE UMA OPÇÃO:",
        "type": "checkbox",
        "description": null,
        "options": [
          "0 a 11 anos",
          "12 a 17 anos",
          "A partir de 18 anos",
          "Não se aplica"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_56",
        "version": "1.0",
        "index": 56,
        "label": "ALGUM DE SEUS FILHOS É PESSOA COM DEFICIÊNCIA? ",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim. Quantos? (Especifique em outro)",
          "Não",
          "Não se aplica"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_57",
        "version": "1.0",
        "index": 57,
        "label": "ESTÃO VIVENDO ALGUM CONFLITO COM RELAÇÃO À GUARDA DOS FILHOS, VISITAS OU PAGAMENTO DE PENSÃO PELO(A) AGRESSOR(A)?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei",
          "Não se aplica"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_58",
        "version": "1.0",
        "index": 58,
        "label": "SEU(S) FILHO(S) JÁ PRESENCIARAM ATO(S) DE VIOLÊNCIA DO(A) AGRESSOR(A) CONTRA VOCÊ?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei",
          "Não se aplica"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_59",
        "version": "1.0",
        "index": 59,
        "label": "VOCÊ SOFREU ALGUM TIPO DE VIOLÊNCIA DURANTE A GRAVIDEZ OU ATÉ TRÊS 18 MESES APÓS O PARTO?",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, estou grávida atualmente e sofro violência",
          "Sim, tive filho(a) nos últimos 18 meses e sofro violência atualmente",
          "Sim, sofri violência durante a gravidez ou nos 18 meses após o parto, mas não atualmente",
          "Não sofri violência nesses períodos"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_60",
        "version": "1.0",
        "index": 60,
        "label": "SE VOCÊ ESTÁ EM UM NOVO RELACIONAMENTO, PERCEBEU QUE AS AMEAÇAS OU AGRESSÕES FÍSICAS AUMENTARAM EM RAZÃO DISSO?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não se aplica"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_61",
        "version": "1.0",
        "index": 61,
        "label": "VOCÊ SE SENTE ISOLADA DE AMIGOS, FAMILIARES, PESSOAS DA COMUNIDADE OU TRABALHO?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_62",
        "version": "1.0",
        "index": 62,
        "label": "VOCÊ POSSUI ALGUMA DEFICIÊNCIA OU DOENÇA DEGENERATIVA QUE ACARRETA CONDIÇÃO LIMITANTE OU DE VULNERABILIDADE FÍSICA OU MENTAL? ",
        "type": "checkbox",
        "description": null,
        "options": [
          "Sim, deficiência física",
          "Sim, deficiência visual",
          "Sim, deficiência auditiva",
          "Sim, deficiência intelectual",
          "Doença degenerativa. Qual? (Especificar em outro)",
          "Não",
          "Prefiro não informar"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_63",
        "version": "1.0",
        "index": 63,
        "label": "COM QUAL COR/RAÇA VOCÊ SE IDENTIFICA?",
        "type": "select",
        "description": null,
        "options": [
          "Preta (Negra)",
          "Parda (Negra)",
          "Indígena",
          "Branca",
          "Amarela",
          "Prefiro não informar"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_64",
        "version": "1.0",
        "index": 64,
        "label": "VOCÊ CONSIDERA QUE MORA EM BAIRRO, COMUNIDADE, ÁREA RURAL, TERRITÓRIO INDÍGENAS OU LOCAL DE MAIOR RISCO DE VIOLÊNCIA?",
        "type": "select",
        "description": null,
        "options": [
          "Sim, área rural",
          "Sim, território indígena",
          "Sim, área urbana",
          "Não",
          "Não sei"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_65",
        "version": "1.0",
        "index": 65,
        "label": "QUAL SUA SITUAÇÃO DE MORADIA? ",
        "type": "checkbox",
        "description": null,
        "options": [
          "Própria",
          "Alugada",
          "Cedida ou \"de favor\". Por quem? (Especificar em outro)"
        ],
        "allowOther": true,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_66",
        "version": "1.0",
        "index": 66,
        "label": "ATUALMENTE, VOCÊ RESIDE NO MESMO IMÓVEL COM O(A) AGRESSOR(A)?",
        "type": "select",
        "description": null,
        "options": [
          "Sim",
          "Não"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_67",
        "version": "1.0",
        "index": 67,
        "label": "VOCÊ SE CONSIDERA DEPENDENTE FINANCEIRAMENTE DO(A) AGRESSOR(A)?",
        "type": "select",
        "description": null,
        "options": [
          "Sim, totalmente",
          "Sim, parcialmente",
          "Não dependo financeiramente",
          "Prefiro não informar"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_68",
        "version": "1.0",
        "index": 68,
        "label": "VOCÊ QUER E ACEITA ABRIGAMENTO TEMPORÁRIO?",
        "type": "select",
        "description": null,
        "options": [
          "Sim, quero e aceito o abrigamento temporário",
          "Não desejo o abrigamento temporário"
        ],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      },
      {
        "id": "field_69",
        "version": "1.0",
        "index": 69,
        "label": "ESPAÇO PARA ANOTAR INFORMAÇÕES QUE JULGAR RELEVANTE PARA O HISTÓRICO DO FATO",
        "type": "textarea",
        "description": null,
        "options": [],
        "allowOther": false,
        "required": false,
        "sectionId": "section_risk"
      }
    ]
  }
];

export const ALL_FORM_FIELDS = FORM_SECTIONS.flatMap(s => s.fields);
