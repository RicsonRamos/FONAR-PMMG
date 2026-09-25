import { describe, it, expect } from 'vitest';
import { buildSubmissionSnapshot } from '../src/services/snapshot';
import { generateSubmissionPdf } from '../src/services/pdfGenerator';
import { buildManifest } from '../src/services/manifest';
import { canonicalizeJson } from '../src/services/canonicalizer';
import { sha256, createAuditEvent } from '../src/services/crypto';

describe('Geração de Pacote de Evidência e Verificação de Integridade Ponta a Ponta', () => {
  it('deve gerar PDF, JSON e MANIFEST e atestar integridade 100% coincidente', async () => {
    const protocol = 'FORM-2026-777111';
    const evidenceId = 'EV-test-package-integration';
    const sessionId = 'sess-pkg-test';

    const ev1 = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');
    const ev2 = await createAuditEvent('FORM_SUBMITTED', protocol, sessionId, ev1.event_hash);

    const snapshot = await buildSubmissionSnapshot({
      protocol,
      evidenceId,
      sessionId,
      formValues: {
        field_0: '25/09/2026',
        field_1: '10:00',
        field_4: 'Vítima Exemplo Teste',
        field_7: '000.111.222-33'
      },
      declarationConfirmed: true,
      declarationConfirmedAtUtc: new Date().toISOString(),
      auditEvents: [ev1, ev2]
    });

    const snapshotCanonical = canonicalizeJson(snapshot);
    const snapshotSha256 = await sha256(snapshotCanonical);

    // 1. Gerar PDF
    const pdfBytes = await generateSubmissionPdf(snapshot, {
      snapshot_sha256: snapshotSha256,
      canonical_json_sha256: snapshotSha256,
      audit_chain_hash: ev2.event_hash
    });
    const pdfSha256 = await sha256(pdfBytes);
    expect(pdfBytes.length).toBeGreaterThan(1000);

    // 2. Gerar JSON Canônico
    const canonicalJsonString = canonicalizeJson(snapshot);
    const jsonSha256 = await sha256(canonicalJsonString);

    // 3. Gerar MANIFEST.json
    const pdfFilename = `${protocol}.pdf`;
    const jsonFilename = `${protocol}.json`;
    const { manifestDocument } = await buildManifest({
      protocol,
      evidenceId,
      systemVersion: '1.0.0',
      pdfFilename,
      pdfBytes,
      pdfSha256,
      jsonFilename,
      jsonContent: canonicalJsonString,
      jsonSha256
    });

    // 4. Verificação de integridade: recalcular e comparar
    const recomputedPdfHash = await sha256(pdfBytes);
    const recomputedJsonHash = await sha256(canonicalJsonString);

    expect(manifestDocument.files[pdfFilename].sha256).toBe(recomputedPdfHash);
    expect(manifestDocument.files[jsonFilename].sha256).toBe(recomputedJsonHash);
    expect(manifestDocument.files[pdfFilename].size_bytes).toBe(pdfBytes.length);
  });

  it('deve detectar adulteração se um único byte for modificado no arquivo', async () => {
    const originalBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const originalHash = await sha256(originalBytes);

    // Altera 1 byte
    const tamperedBytes = new Uint8Array([1, 2, 3, 99, 5, 6, 7, 8]);
    const tamperedHash = await sha256(tamperedBytes);

    expect(tamperedHash).not.toBe(originalHash);
  });
});
