import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { SubmissionSnapshot } from '../types/snapshot';

// Conversão de cores PMMG para RGB [0, 1] do pdf-lib
const COLOR_BLACK = rgb(55 / 255, 52 / 255, 53 / 255);       // #373435
const COLOR_GOLD = rgb(160 / 255, 143 / 255, 99 / 255);      // #A08F63
const COLOR_RED = rgb(171 / 255, 35 / 255, 40 / 255);        // #AB2328
const COLOR_GRAY_BG = rgb(245 / 255, 246 / 255, 248 / 255);  // #F5F6F8
const COLOR_GRAY_BORDER = rgb(220 / 255, 224 / 255, 230 / 255);
const COLOR_TEXT = rgb(31 / 255, 36 / 255, 33 / 255);        // #1F2421
const COLOR_MUTED = rgb(95 / 255, 99 / 255, 104 / 255);

// Dimensões A4 em pontos (72 dpi)
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_LEFT = 40;
const MARGIN_RIGHT = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT; // 515.28 pt
const MARGIN_TOP = 40;
const MARGIN_BOTTOM = 50;

/**
 * Utilitário de quebra de linha determinística para pdf-lib.
 */
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  if (!text) return [''];
  const words = text.replace(/[\r\n]+/g, ' ').split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      // Se uma única palavra for maior que a largura máxima, force quebra
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = '';
        for (const char of word) {
          if (font.widthOfTextAtSize(chunk + char, fontSize) <= maxWidth) {
            chunk += char;
          } else {
            lines.push(chunk);
            chunk = char;
          }
        }
        currentLine = chunk;
      } else {
        currentLine = word;
      }
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Gera o documento PDF determinístico e estilizado conforme a identidade visual PMMG.
 */
export async function generateSubmissionPdf(
  snapshot: SubmissionSnapshot,
  hashes: { snapshot_sha256: string; canonical_json_sha256: string; audit_chain_hash: string }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  
  // Metadados do PDF
  doc.setTitle(`FONAR - ${snapshot.protocol}`);
  doc.setAuthor('Polícia Militar de Minas Gerais - 16º BPM');
  doc.setSubject('Formulário Nacional de Avaliação de Risco - Primeira Resposta');
  doc.setCreationDate(new Date(snapshot.timestamps.submitted_at_utc));

  // Incorpora fontes padrão
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontMono = await doc.embedFont(StandardFonts.Courier);
  const fontMonoBold = await doc.embedFont(StandardFonts.CourierBold);

  let currentPage: PDFPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let currentY = PAGE_HEIGHT - MARGIN_TOP;

  function checkPageBreak(requiredHeight: number) {
    if (currentY - requiredHeight < MARGIN_BOTTOM) {
      currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      currentY = PAGE_HEIGHT - MARGIN_TOP;
      drawRunningHeader();
    }
  }

  function drawRunningHeader() {
    currentPage.drawRectangle({
      x: MARGIN_LEFT,
      y: currentY - 2,
      width: CONTENT_WIDTH,
      height: 1.5,
      color: COLOR_GOLD
    });
    currentPage.drawText('POLÍCIA MILITAR DE MINAS GERAIS — 16º BPM / 1ª Cia PM Ind PVD', {
      x: MARGIN_LEFT,
      y: currentY + 3,
      size: 7,
      font: fontBold,
      color: COLOR_MUTED
    });
    currentPage.drawText(`PROTOCOLO: ${snapshot.protocol}`, {
      x: PAGE_WIDTH - MARGIN_RIGHT - 120,
      y: currentY + 3,
      size: 7,
      font: fontMonoBold,
      color: COLOR_MUTED
    });
    currentY -= 20;
  }

  // --- CABEÇALHO PRINCIPAL DA PÁGINA 1 ---
  // Barra superior decorativa
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - 45,
    width: CONTENT_WIDTH,
    height: 48,
    color: COLOR_BLACK
  });
  // Faixa de destaque ouro
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - 47,
    width: CONTENT_WIDTH,
    height: 3,
    color: COLOR_GOLD
  });
  // Emblema PMMG estilizado em vermelho e dourado
  currentPage.drawRectangle({
    x: MARGIN_LEFT + 10,
    y: currentY - 36,
    width: 18,
    height: 22,
    color: COLOR_RED,
    borderColor: COLOR_GOLD,
    borderWidth: 1.5
  });

  currentPage.drawText('POLÍCIA MILITAR DE MINAS GERAIS', {
    x: MARGIN_LEFT + 36,
    y: currentY - 18,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1)
  });
  currentPage.drawText('16º BATALHÃO DE POLÍCIA MILITAR — 1ª Cia PM Ind PVD (RMBH)', {
    x: MARGIN_LEFT + 36,
    y: currentY - 30,
    size: 8,
    font: fontRegular,
    color: COLOR_GOLD
  });
  currentPage.drawText('ATENDIMENTO 1ª RESPOSTA — FONAR (FORMULÁRIO AUXILIAR)', {
    x: MARGIN_LEFT + 36,
    y: currentY - 41,
    size: 8,
    font: fontBold,
    color: rgb(0.9, 0.9, 0.9)
  });

  currentY -= 65;

  // --- QUADRO DE AVISO DE FERRAMENTA AUXILIAR ---
  const disclaimerText =
    'AVISO OBRIGATÓRIO: Este formulário é uma ferramenta auxiliar para coleta preliminar de dados. ' +
    'NÃO substitui o registro oficial no sistema REDS. O preenchimento oficial deve ser executado pelo militar responsável.';
  const disclaimerLines = wrapText(disclaimerText, CONTENT_WIDTH - 24, fontRegular, 8);
  const disclaimerBoxHeight = disclaimerLines.length * 11 + 14;

  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - disclaimerBoxHeight,
    width: CONTENT_WIDTH,
    height: disclaimerBoxHeight,
    color: COLOR_GRAY_BG,
    borderColor: COLOR_RED,
    borderWidth: 1
  });
  // Barra lateral vermelha
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - disclaimerBoxHeight,
    width: 4,
    height: disclaimerBoxHeight,
    color: COLOR_RED
  });

  let lineY = currentY - 12;
  for (const line of disclaimerLines) {
    currentPage.drawText(line, {
      x: MARGIN_LEFT + 12,
      y: lineY,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT
    });
    lineY -= 11;
  }
  currentY -= disclaimerBoxHeight + 12;

  // --- QUADRO DE IDENTIFICAÇÃO TÉCNICA E METADADOS ---
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - 44,
    width: CONTENT_WIDTH,
    height: 44,
    color: COLOR_GRAY_BG,
    borderColor: COLOR_GRAY_BORDER,
    borderWidth: 1
  });

  currentPage.drawText('PROTOCOLO:', { x: MARGIN_LEFT + 10, y: currentY - 14, size: 8, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(snapshot.protocol, { x: MARGIN_LEFT + 75, y: currentY - 14, size: 9, font: fontMonoBold, color: COLOR_RED });

  currentPage.drawText('EVIDENCE ID:', { x: MARGIN_LEFT + 220, y: currentY - 14, size: 8, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(snapshot.evidence_id, { x: MARGIN_LEFT + 285, y: currentY - 14, size: 7.5, font: fontMono, color: COLOR_TEXT });

  currentPage.drawText('DATA/HORA LOCAL:', { x: MARGIN_LEFT + 10, y: currentY - 28, size: 8, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(snapshot.timestamps.submitted_at_local, { x: MARGIN_LEFT + 105, y: currentY - 28, size: 8, font: fontRegular, color: COLOR_TEXT });

  currentPage.drawText('DATA/HORA UTC:', { x: MARGIN_LEFT + 220, y: currentY - 28, size: 8, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(snapshot.timestamps.submitted_at_utc, { x: MARGIN_LEFT + 300, y: currentY - 28, size: 7.5, font: fontMono, color: COLOR_TEXT });

  currentPage.drawText(`VERSÃO SISTEMA: ${snapshot.system.version} (Build: ${snapshot.system.build_id})`, {
    x: MARGIN_LEFT + 10,
    y: currentY - 40,
    size: 7,
    font: fontRegular,
    color: COLOR_MUTED
  });

  currentY -= 56;

  // --- RENDERIZAÇÃO DAS PERGUNTAS E RESPOSTAS ---
  let lastSection = '';

  for (const q of snapshot.questions) {
    // Cabeçalho de Seção se mudou
    if (q.section_id !== lastSection) {
      lastSection = q.section_id;
      let sectionTitle = 'DADOS DA SUBMISSÃO';
      if (q.section_id === 'section_victim') sectionTitle = '1. DADOS DO ATENDIMENTO E DA VÍTIMA';
      else if (q.section_id === 'section_author') sectionTitle = '2. DADOS DO AUTOR';
      else if (q.section_id === 'section_risk') sectionTitle = '3. FORMULÁRIO NACIONAL DE AVALIAÇÃO DE RISCO (FONAR)';

      checkPageBreak(35);
      currentY -= 6;
      currentPage.drawRectangle({
        x: MARGIN_LEFT,
        y: currentY - 18,
        width: CONTENT_WIDTH,
        height: 18,
        color: COLOR_BLACK
      });
      currentPage.drawRectangle({
        x: MARGIN_LEFT,
        y: currentY - 18,
        width: 4,
        height: 18,
        color: COLOR_GOLD
      });
      currentPage.drawText(sectionTitle, {
        x: MARGIN_LEFT + 10,
        y: currentY - 13,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1)
      });
      currentY -= 26;
    }

    // Preparar texto da pergunta e resposta
    const qLines = wrapText(q.text, CONTENT_WIDTH - 20, fontBold, 8);
    const answerStr = Array.isArray(q.answer)
      ? q.answer.length > 0 ? q.answer.join('; ') : '[Nenhum item assinalado / Não informado]'
      : q.answer || '[Não informado / Campo em branco]';
    const aLines = wrapText(`Resposta: ${answerStr}`, CONTENT_WIDTH - 24, fontRegular, 8);

    const itemHeight = (qLines.length + aLines.length) * 10 + 8;
    checkPageBreak(itemHeight + 4);

    // Borda lateral sutil para organização
    currentPage.drawRectangle({
      x: MARGIN_LEFT + 4,
      y: currentY - itemHeight,
      width: 2,
      height: itemHeight,
      color: COLOR_GRAY_BORDER
    });

    // Pergunta
    let textY = currentY - 8;
    for (const ql of qLines) {
      currentPage.drawText(ql, {
        x: MARGIN_LEFT + 12,
        y: textY,
        size: 8,
        font: fontBold,
        color: COLOR_BLACK
      });
      textY -= 10;
    }

    // Resposta
    for (const al of aLines) {
      currentPage.drawText(al, {
        x: MARGIN_LEFT + 16,
        y: textY,
        size: 8,
        font: fontRegular,
        color: answerStr.startsWith('[') ? COLOR_MUTED : COLOR_TEXT
      });
      textY -= 10;
    }

    currentY -= itemHeight + 3;
  }

  // --- SEÇÃO DE DECLARAÇÃO FINAL ---
  checkPageBreak(70);
  currentY -= 10;
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - 16,
    width: CONTENT_WIDTH,
    height: 16,
    color: COLOR_BLACK
  });
  currentPage.drawText('DECLARAÇÃO DE FIDEDIGNIDADE TÉCNICA', {
    x: MARGIN_LEFT + 8,
    y: currentY - 12,
    size: 8.5,
    font: fontBold,
    color: rgb(1, 1, 1)
  });
  currentY -= 22;

  const declLines = wrapText(snapshot.declaration.text, CONTENT_WIDTH - 16, fontRegular, 8);
  for (const dl of declLines) {
    checkPageBreak(12);
    currentPage.drawText(dl, {
      x: MARGIN_LEFT + 8,
      y: currentY - 8,
      size: 8,
      font: fontRegular,
      color: COLOR_TEXT
    });
    currentY -= 10;
  }

  checkPageBreak(18);
  currentPage.drawText(
    `[X] CONFIRMADO EM: ${snapshot.declaration.confirmed_at_utc} (UTC) | HASH DA DECLARAÇÃO: ${snapshot.declaration.sha256.substring(0, 16)}...`,
    {
      x: MARGIN_LEFT + 8,
      y: currentY - 8,
      size: 7.5,
      font: fontMonoBold,
      color: COLOR_RED
    }
  );
  currentY -= 20;

  // --- SEÇÃO DE INTEGRIDADE E AUDITORIA FORENSE ---
  checkPageBreak(90);
  currentY -= 8;
  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - 16,
    width: CONTENT_WIDTH,
    height: 16,
    color: COLOR_BLACK
  });
  currentPage.drawText('REGISTRO TÉCNICO DE INTEGRIDADE (SHA-256 E AUDITORIA)', {
    x: MARGIN_LEFT + 8,
    y: currentY - 12,
    size: 8.5,
    font: fontBold,
    color: COLOR_GOLD
  });
  currentY -= 24;

  currentPage.drawRectangle({
    x: MARGIN_LEFT,
    y: currentY - 60,
    width: CONTENT_WIDTH,
    height: 60,
    color: COLOR_GRAY_BG,
    borderColor: COLOR_GRAY_BORDER,
    borderWidth: 1
  });

  currentPage.drawText('SNAPSHOT SHA-256:', { x: MARGIN_LEFT + 8, y: currentY - 13, size: 7.5, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(hashes.snapshot_sha256, { x: MARGIN_LEFT + 120, y: currentY - 13, size: 7, font: fontMono, color: COLOR_TEXT });

  currentPage.drawText('JSON CANÔNICO SHA-256:', { x: MARGIN_LEFT + 8, y: currentY - 26, size: 7.5, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(hashes.canonical_json_sha256, { x: MARGIN_LEFT + 120, y: currentY - 26, size: 7, font: fontMono, color: COLOR_TEXT });

  currentPage.drawText('HASH CHAIN AUDIT:', { x: MARGIN_LEFT + 8, y: currentY - 39, size: 7.5, font: fontBold, color: COLOR_MUTED });
  currentPage.drawText(hashes.audit_chain_hash, { x: MARGIN_LEFT + 120, y: currentY - 39, size: 7, font: fontMono, color: COLOR_TEXT });

  currentPage.drawText(
    '* NOTA DE INTEGRIDADE: O SHA-256 deste PDF é calculado após sua compilação e inserido no MANIFEST.json correspondente.',
    {
      x: MARGIN_LEFT + 8,
      y: currentY - 52,
      size: 6.5,
      font: fontRegular,
      color: COLOR_MUTED
    }
  );

  // --- NUMERAÇÃO DE PÁGINAS E RODAPÉ EM TODAS AS PÁGINAS ---
  const totalPages = doc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const page = doc.getPage(i);
    // Linha inferior decorativa
    page.drawRectangle({
      x: MARGIN_LEFT,
      y: MARGIN_BOTTOM - 12,
      width: CONTENT_WIDTH,
      height: 1,
      color: COLOR_GRAY_BORDER
    });

    page.drawText('PMMG / 16º BPM — Formulário Auxiliar FONAR (Uso Exclusivo Interno)', {
      x: MARGIN_LEFT,
      y: MARGIN_BOTTOM - 24,
      size: 7,
      font: fontRegular,
      color: COLOR_MUTED
    });

    const pageStr = `Página ${i + 1} de ${totalPages}`;
    const pageStrWidth = fontRegular.widthOfTextAtSize(pageStr, 7);
    page.drawText(pageStr, {
      x: PAGE_WIDTH - MARGIN_RIGHT - pageStrWidth,
      y: MARGIN_BOTTOM - 24,
      size: 7,
      font: fontRegular,
      color: COLOR_MUTED
    });
  }

  return await doc.save();
}
