#!/usr/bin/env node

/**
 * Utilitário Independente de Auditoria e Verificação de Integridade de Pacote
 * 
 * Uso:
 *   node tools/verify-package.js <caminho_da_pasta_do_pacote>
 * Exemplo:
 *   node tools/verify-package.js ./FORM-2026-000123/
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Cores ANSI para terminal
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function calculateSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

function verifyPackage(targetDir) {
  console.log(`\n${BOLD}${CYAN}======================================================${RESET}`);
  console.log(`${BOLD}${CYAN}   VERIFICADOR INDEPENDENTE DE INTEGRIDADE FORENSE   ${RESET}`);
  console.log(`${BOLD}${CYAN}   Polícia Militar de Minas Gerais — 16º BPM / FONAR ${RESET}`);
  console.log(`${BOLD}${CYAN}======================================================${RESET}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error(`${RED}[ERRO] Diretório não encontrado: ${targetDir}${RESET}\n`);
    process.exit(1);
  }

  const manifestPath = path.join(targetDir, 'MANIFEST.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`${RED}[ERRO] Arquivo MANIFEST.json não encontrado no diretório: ${targetDir}${RESET}\n`);
    process.exit(1);
  }

  let manifest;
  try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
  } catch (err) {
    console.error(`${RED}[ERRO] Falha ao interpretar MANIFEST.json como JSON válido.${RESET}\n`);
    process.exit(1);
  }

  console.log(`${BOLD}Protocolo Analisado:${RESET}  ${manifest.protocol || 'Não informado'}`);
  console.log(`${BOLD}Evidence ID:${RESET}          ${manifest.evidence_id || 'Não informado'}`);
  console.log(`${BOLD}Data de Geração (UTC):${RESET} ${manifest.generated_at_utc || 'Não informado'}`);
  console.log(`${BOLD}Algoritmo Declarado:${RESET}   ${manifest.algorithm || 'SHA-256'}`);
  console.log(`${BOLD}Versão do Sistema:${RESET}     ${manifest.system_version || '1.0.0'}\n`);

  if (!manifest.files || Object.keys(manifest.files).length === 0) {
    console.error(`${RED}[ERRO] O MANIFEST não lista arquivos para verificação.${RESET}\n`);
    process.exit(1);
  }

  let allValid = true;
  const filenames = Object.keys(manifest.files);

  console.log(`${BOLD}Verificação Arquivo por Arquivo:${RESET}`);
  console.log('------------------------------------------------------');

  for (const filename of filenames) {
    const fileEntry = manifest.files[filename];
    const expectedHash = fileEntry.sha256 ? fileEntry.sha256.toLowerCase() : '';
    const filePath = path.join(targetDir, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`${RED}✗ [AUSENTE] ${filename}${RESET}`);
      console.log(`  Esperado: ${expectedHash}`);
      allValid = false;
      continue;
    }

    const actualHash = calculateSha256(filePath).toLowerCase();
    const stats = fs.statSync(filePath);

    if (actualHash === expectedHash) {
      console.log(`${GREEN}✓ [OK] ${filename}${RESET}`);
      console.log(`  Tamanho:  ${stats.size} bytes (Declarado no Manifest: ${fileEntry.size_bytes} bytes)`);
      console.log(`  SHA-256:  ${actualHash}`);
    } else {
      console.log(`${RED}✗ [ADULTERADO] ${filename}${RESET}`);
      console.log(`  Esperado:  ${expectedHash}`);
      console.log(`  Calculado: ${actualHash}`);
      allValid = false;
    }
    console.log('');
  }

  // Verificação complementar da Hash Chain no JSON
  const jsonFiles = filenames.filter(f => f.endsWith('.json') && f !== 'MANIFEST.json');
  if (jsonFiles.length > 0) {
    const jsonPath = path.join(targetDir, jsonFiles[0]);
    try {
      const jsonContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (jsonContent.audit_trail && Array.isArray(jsonContent.audit_trail.events)) {
        console.log(`${BOLD}Verificação da Hash Chain de Auditoria:${RESET}`);
        const events = jsonContent.audit_trail.events;
        let chainValid = true;
        let previous = 'GENESIS';

        for (let i = 0; i < events.length; i++) {
          const ev = events[i];
          if (ev.previous_hash !== previous) {
            chainValid = false;
            console.log(`${RED}  ✗ Discrepância no elo ${i} (${ev.event_type})${RESET}`);
            break;
          }
          previous = ev.event_hash;
        }

        if (chainValid) {
          console.log(`${GREEN}  ✓ Hash Chain consistente (${events.length} eventos sequenciais validados)${RESET}`);
          console.log(`  Elo final: ${previous}\n`);
        } else {
          allValid = false;
          console.log(`${RED}  ✗ Falha na integridade da Hash Chain de auditoria.${RESET}\n`);
        }
      }
    } catch (e) {
      console.log(`${YELLOW}  [AVISO] Não foi possível analisar a trilha de auditoria do arquivo JSON.${RESET}\n`);
    }
  }

  console.log('------------------------------------------------------');
  if (allValid) {
    console.log(`${GREEN}${BOLD}RESULTADO: INTEGRIDADE TÉCNICA PLENAMENTE CONFIRMADA.${RESET}`);
    console.log(`${GREEN}Nenhuma adulteração foi detectada nos arquivos arquivados.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${RED}${BOLD}RESULTADO: FALHA DE INTEGRIDADE. ARQUIVOS ADULTERADOS OU CORROMPIDOS.${RESET}\n`);
    process.exit(2);
  }
}

// Execução a partir de argumentos de linha de comando
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(`Uso: node tools/verify-package.js <caminho_do_diretório_da_submissao>`);
  console.log(`Exemplo: node tools/verify-package.js ./submissoes/FORM-2026-000123/`);
  process.exit(1);
}

verifyPackage(path.resolve(process.cwd(), args[0]));
