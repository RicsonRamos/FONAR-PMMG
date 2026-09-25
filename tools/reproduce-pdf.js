#!/usr/bin/env node

/**
 * Utilitário para reproduzir o PDF a partir do JSON Canônico
 * 
 * Uso:
 *   node tools/reproduce-pdf.js <caminho_do_arquivo.json>
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function calculateSha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function reproducePdf(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    console.error(`Arquivo não encontrado: ${jsonPath}`);
    process.exit(1);
  }

  const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Lendo JSON da submissão: ${jsonContent.protocol} (Evidence: ${jsonContent.evidence_id})`);

  // Monta PDF com as mesmas regras determinísticas
  const doc = await PDFDocument.create();
  doc.setTitle(`FONAR - ${jsonContent.protocol}`);
  doc.setAuthor('Polícia Militar de Minas Gerais - 16º BPM');

  const page = doc.addPage([595.28, 841.89]);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  page.drawText('POLÍCIA MILITAR DE MINAS GERAIS', {
    x: 40,
    y: 800,
    size: 14,
    font: fontBold,
    color: rgb(0.22, 0.20, 0.21)
  });

  page.drawText(`PROTOCOLO: ${jsonContent.protocol}`, {
    x: 40,
    y: 780,
    size: 10,
    font: fontBold,
    color: rgb(0.67, 0.14, 0.16)
  });

  page.drawText(`EVIDENCE ID: ${jsonContent.evidence_id}`, {
    x: 40,
    y: 765,
    size: 9,
    font: fontRegular,
    color: rgb(0.37, 0.39, 0.41)
  });

  const pdfBytes = await doc.save();
  const outPath = jsonPath.replace(/\.json$/, '_reproduced.pdf');
  fs.writeFileSync(outPath, pdfBytes);

  const hash = calculateSha256(pdfBytes);
  console.log(`PDF reproduzido com sucesso em: ${outPath}`);
  console.log(`Tamanho: ${pdfBytes.length} bytes | SHA-256: ${hash}`);
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Uso: node tools/reproduce-pdf.js <caminho_do_arquivo.json>');
  process.exit(1);
}

reproducePdf(path.resolve(process.cwd(), args[0]));
