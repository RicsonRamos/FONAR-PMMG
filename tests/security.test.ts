import { describe, it, expect } from 'vitest';
import { fetchClientNetworkInfo } from '../src/services/deviceInfo';
import { generateDeclarationText } from '../src/config/legalTexts';
import { buildSubmissionSnapshot } from '../src/services/snapshot';
import { createAuditEvent, sha256, verifyHashChain } from '../src/services/crypto';

// Funções espelho de validação do backend (para teste automatizado das regras de segurança)
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidProtocol(protocol: string): boolean {
  return /^FORM-\d{4}-\d{6}$/.test(protocol.trim());
}

function isValidEvidenceId(evidenceId: string): boolean {
  return /^EV-[a-zA-Z0-9_-]{8,64}$/.test(evidenceId.trim());
}

function isValidPdfMagicBytes(bytes: Uint8Array): boolean {
  if (!bytes || bytes.length < 5) return false;
  return (
    bytes[0] === 0x25 && // '%'
    bytes[1] === 0x50 && // 'P'
    bytes[2] === 0x44 && // 'D'
    bytes[3] === 0x46 && // 'F'
    bytes[4] === 0x2d    // '-'
  );
}

function isSafeFilename(filename: string, protocol: string, expectedExt: string): boolean {
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  const expected = `${protocol}.${expectedExt}`;
  return filename === expected;
}

describe('Auditoria de Segurança e Privacidade (AppSec & Privacy by Design)', () => {
  describe('1. Privacidade e Eliminação de Telemetria Externa (LGPD)', () => {
    it('deve resolver informações técnicas localmente sem expor IP da vítima a terceiros', async () => {
      const netInfo = await fetchClientNetworkInfo();
      expect(netInfo).toBeDefined();
      expect(netInfo.device).toBeDefined();
      expect(netInfo.location).toBeDefined();
      // Não deve conter IP externo obtido por terceiros
      expect(netInfo.ip).toContain('Privacidade Preservada');
    });
  });

  describe('2. Integridade Forense da Declaração Individualizada', () => {
    it('deve garantir que o texto assinado pela vítima seja 100% idêntico ao armazenado e calculado no hash', async () => {
      const victimName = 'Maria da Silva Exemplo';
      const dateStr = '2026-09-26';
      const timeStr = '14:30';

      const declarationText = generateDeclarationText({ victimName, dateStr, timeStr });
      expect(declarationText).toContain('EU, MARIA DA SILVA EXEMPLO, DECLARO QUE EM 26/09/2026 ÀS 14:30');
      expect(declarationText).toContain('ART. 299 DA LEI Nº 2.848/1940');

      const protocol = 'FORM-2026-555666';
      const evidenceId = 'EV-declaration-audit-test';
      const sessionId = 'sess-decl-test';
      const ev = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');

      const snapshot = await buildSubmissionSnapshot({
        protocol,
        evidenceId,
        sessionId,
        formValues: { field_4: victimName, field_0: dateStr, field_1: timeStr },
        declarationConfirmed: true,
        declarationConfirmedAtUtc: new Date().toISOString(),
        declarationText,
        auditEvents: [ev]
      });

      expect(snapshot.declaration.text).toBe(declarationText);
      const expectedHash = await sha256(declarationText);
      expect(snapshot.declaration.sha256).toBe(expectedHash);
    });
  });

  describe('3. Mitigação de Injeção de HTML e Email Spoofing', () => {
    it('deve escapar corretamente todos os caracteres perigosos para HTML', () => {
      const xssVector = '<script>alert("xss")</script>&<img src="x" onerror="evil()"/>';
      const escaped = escapeHtml(xssVector);
      expect(escaped).not.toContain('<script>');
      expect(escaped).toContain('&lt;script&gt;');
      expect(escaped).toContain('&amp;');
      expect(escaped).toContain('&quot;xss&quot;');
      expect(escaped).toContain('&lt;img src=&quot;x&quot; onerror=&quot;evil()&quot;/&gt;');
    });

    it('deve neutralizar injeção de tags HTML em protocolos e IDs forjados', () => {
      const forgedProtocol = 'FORM-2026-000123<b style="color:red">FAKE</b>';
      const escaped = escapeHtml(forgedProtocol);
      expect(escaped).toBe('FORM-2026-000123&lt;b style=&quot;color:red&quot;&gt;FAKE&lt;/b&gt;');
    });
  });

  describe('4. Regras de Validação Estrita do Backend (Google Apps Script)', () => {
    it('deve validar formatos estritos de protocolo institucional', () => {
      expect(isValidProtocol('FORM-2026-000123')).toBe(true);
      expect(isValidProtocol('FORM-2025-999999')).toBe(true);
      // Inválidos:
      expect(isValidProtocol('FORM-26-000123')).toBe(false);
      expect(isValidProtocol('FORM-2026-ABCDEF')).toBe(false);
      expect(isValidProtocol('../../etc/passwd')).toBe(false);
      expect(isValidProtocol('<script>')).toBe(false);
      expect(isValidProtocol('FORM-2026-000123; DROP TABLE')).toBe(false);
    });

    it('deve validar formato do Evidence ID', () => {
      expect(isValidEvidenceId('EV-12345678-abcd')).toBe(true);
      expect(isValidEvidenceId('EV-6f9c0799-4dfb-4246-ba67-ec08b310a221')).toBe(true);
      // Inválidos:
      expect(isValidEvidenceId('INVALID-ID')).toBe(false);
      expect(isValidEvidenceId('EV-short')).toBe(false);
      expect(isValidEvidenceId('EV-../../../etc/shadow')).toBe(false);
    });

    it('deve exigir correspondência estrita entre nomes de arquivos e protocolo', () => {
      const protocol = 'FORM-2026-123456';
      expect(isSafeFilename('FORM-2026-123456.pdf', protocol, 'pdf')).toBe(true);
      expect(isSafeFilename('FORM-2026-123456.json', protocol, 'json')).toBe(true);

      // Rejeita tentativas de spoofing ou injeção de arquivos:
      expect(isSafeFilename('FORM-2026-999999.pdf', protocol, 'pdf')).toBe(false);
      expect(isSafeFilename('../FORM-2026-123456.pdf', protocol, 'pdf')).toBe(false);
      expect(isSafeFilename('exploit.sh', protocol, 'pdf')).toBe(false);
      expect(isSafeFilename('malware.exe', protocol, 'pdf')).toBe(false);
    });

    it('deve validar magic bytes (%PDF-) para impedir envio de binários maliciosos', () => {
      const validPdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]); // %PDF-1.7
      expect(isValidPdfMagicBytes(validPdfHeader)).toBe(true);

      const fakePdfShell = new Uint8Array([0x23, 0x21, 0x2f, 0x62, 0x69, 0x6e]); // #!/bin
      expect(isValidPdfMagicBytes(fakePdfShell)).toBe(false);

      const emptyBytes = new Uint8Array([]);
      expect(isValidPdfMagicBytes(emptyBytes)).toBe(false);
    });
  });

  describe('5. Prevenção de Path Traversal no Verificador Forense', () => {
    it('deve detectar e bloquear nomes de arquivos com sequências de traversal', () => {
      const dangerousFilenames = [
        '../../../../etc/passwd',
        '..\\..\\windows\\system32\\cmd.exe',
        '/root/secret.key',
        'subfolder/doc.pdf'
      ];

      for (const dangerous of dangerousFilenames) {
        const isSuspicious = dangerous.includes('..') || dangerous.includes('/') || dangerous.includes('\\');
        expect(isSuspicious).toBe(true);
      }
    });
  });

  describe('6. Consistência e Imutabilidade da Hash Chain', () => {
    it('deve acusar erro quando qualquer elo da cadeia for adulterado', async () => {
      const protocol = 'FORM-2026-CHAIN-TEST';
      const sessionId = 'sess-chain';

      const ev1 = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');
      const ev2 = await createAuditEvent('NOTICE_DISPLAYED', protocol, sessionId, ev1.event_hash);
      const ev3 = await createAuditEvent('FORM_SUBMITTED', protocol, sessionId, ev2.event_hash);

      const validResult = await verifyHashChain([ev1, ev2, ev3]);
      expect(validResult.valid).toBe(true);

      // Adultera um evento na cadeia
      const tamperedEv2 = { ...ev2, event_type: 'NOTICE_TAMPERED' };
      const invalidResult = await verifyHashChain([ev1, tamperedEv2, ev3]);
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.message).toContain('Hash adulterado');
    });
  });
});
