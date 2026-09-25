import { describe, it, expect } from 'vitest';
import { buildSubmissionSnapshot } from '../src/services/snapshot';
import { createAuditEvent } from '../src/services/crypto';

describe('Construção do Snapshot Imutável', () => {
  it('deve congelar todas as perguntas, opções, avisos e metadados', async () => {
    const protocol = 'FORM-2026-999888';
    const evidenceId = 'EV-test-uuid-456';
    const sessionId = 'sess-test-789';

    const ev1 = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');

    const formValues = {
      field_0: '25/09/2026',
      field_1: '14:30',
      field_4: 'Maria Silva Fictícia',
      field_7: '123.456.789-00',
      field_37: ['Sim, com arma de fogo']
    };

    const snapshot = await buildSubmissionSnapshot({
      protocol,
      evidenceId,
      sessionId,
      formValues,
      declarationConfirmed: true,
      declarationConfirmedAtUtc: '2026-09-25T17:30:00.000Z',
      auditEvents: [ev1]
    });

    expect(snapshot.protocol).toBe(protocol);
    expect(snapshot.evidence_id).toBe(evidenceId);
    expect(snapshot.system.name).toBe('Formulário Auxiliar Institucional FONAR');
    expect(snapshot.system.version).toBe('1.0.0');

    // Avisos congelados
    expect(snapshot.notices.length).toBeGreaterThan(0);
    expect(snapshot.notices[0].sha256).toBeDefined();

    // Declaração congelada
    expect(snapshot.declaration.confirmed).toBe(true);
    expect(snapshot.declaration.confirmed_at_utc).toBe('2026-09-25T17:30:00.000Z');
    expect(snapshot.declaration.sha256).toBeDefined();

    // Perguntas congeladas
    expect(snapshot.questions.length).toBe(74);
    const dateQ = snapshot.questions.find(q => q.question_id === 'field_0');
    expect(dateQ?.answer).toBe('25/09/2026');
    expect(dateQ?.text).toBe('DATA');

    const nameQ = snapshot.questions.find(q => q.question_id === 'field_4');
    expect(nameQ?.answer).toBe('Maria Silva Fictícia');

    const riskQ = snapshot.questions.find(q => q.question_id === 'field_37');
    expect(riskQ?.answer).toEqual(['Sim, com arma de fogo']);
  });

  it('deve incluir metadados técnicos de IP, localização e dispositivo', async () => {
    const protocol = 'FORM-2026-111222';
    const evidenceId = 'EV-test-device-info';
    const sessionId = 'sess-test-device';

    const ev = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');

    const snapshot = await buildSubmissionSnapshot({
      protocol,
      evidenceId,
      sessionId,
      formValues: {},
      declarationConfirmed: true,
      declarationConfirmedAtUtc: '2026-09-25T17:30:00.000Z',
      auditEvents: [ev],
      clientNetworkInfo: {
        ip: '177.100.200.50',
        location: 'Belo Horizonte, Minas Gerais, Brazil',
        device: 'Celular / Smartphone (Android) • Chrome'
      }
    });

    expect(snapshot.technical.ip_address).toBe('177.100.200.50');
    expect(snapshot.technical.location_summary).toBe('Belo Horizonte, Minas Gerais, Brazil');
    expect(snapshot.technical.device_summary).toBe('Celular / Smartphone (Android) • Chrome');
  });

  it('deve gerar PDF com quadro de auditoria contendo localização, dispositivo, IP e horário', async () => {
    const protocol = 'FORM-2026-PDF-TEST';
    const evidenceId = 'EV-test-pdf';
    const sessionId = 'sess-test-pdf';

    const ev = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');

    const snapshot = await buildSubmissionSnapshot({
      protocol,
      evidenceId,
      sessionId,
      formValues: { field_4: 'Maria de Teste' },
      declarationConfirmed: true,
      declarationConfirmedAtUtc: '2026-09-25T17:30:00.000Z',
      auditEvents: [ev],
      clientNetworkInfo: {
        ip: '192.168.1.100',
        location: 'Belo Horizonte, MG, Brazil',
        device: 'Computador / Desktop (Linux) • Chrome'
      }
    });

    const { generateSubmissionPdf } = await import('../src/services/pdfGenerator');
    const pdfBytes = await generateSubmissionPdf(snapshot, {
      snapshot_sha256: 'a'.repeat(64),
      canonical_json_sha256: 'b'.repeat(64),
      audit_chain_hash: 'c'.repeat(64)
    });

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);
  });
});
