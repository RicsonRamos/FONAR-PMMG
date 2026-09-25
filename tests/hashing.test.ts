import { describe, it, expect } from 'vitest';
import {
  sha256,
  createAuditEvent,
  verifyHashChain,
  generateProtocol,
  generateEvidenceId
} from '../src/services/crypto';

describe('Serviços Criptográficos e Hash Chain', () => {
  it('deve calcular o hash SHA-256 correto para vetores conhecidos', async () => {
    // Vetor conhecido: string vazia
    const emptyHash = await sha256('');
    expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    // Vetor conhecido: "hello world"
    const helloHash = await sha256('hello world');
    expect(helloHash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
  });

  it('deve gerar protocolo no formato FORM-YYYY-NNNNNN', () => {
    const proto = generateProtocol(2026);
    expect(proto).toMatch(/^FORM-2026-\d{6}$/);
  });

  it('deve gerar evidence_id com prefixo EV- e formato aleatório', () => {
    const ev1 = generateEvidenceId();
    const ev2 = generateEvidenceId();
    expect(ev1).toMatch(/^EV-/);
    expect(ev2).toMatch(/^EV-/);
    expect(ev1).not.toBe(ev2);
  });

  it('deve construir e validar uma Hash Chain de eventos íntegra', async () => {
    const protocol = 'FORM-2026-123456';
    const sessionId = 'sess-test-123';

    const ev1 = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');
    const ev2 = await createAuditEvent('NOTICE_DISPLAYED', protocol, sessionId, ev1.event_hash);
    const ev3 = await createAuditEvent('FORM_STARTED', protocol, sessionId, ev2.event_hash);
    const ev4 = await createAuditEvent('FORM_SUBMITTED', protocol, sessionId, ev3.event_hash);

    const chain = [ev1, ev2, ev3, ev4];
    const verification = await verifyHashChain(chain);
    expect(verification.valid).toBe(true);
  });

  it('deve detectar adulteração de dados ou quebra de elo na Hash Chain', async () => {
    const protocol = 'FORM-2026-123456';
    const sessionId = 'sess-test-123';

    const ev1 = await createAuditEvent('FORM_OPENED', protocol, sessionId, 'GENESIS');
    const ev2 = await createAuditEvent('NOTICE_DISPLAYED', protocol, sessionId, ev1.event_hash);
    
    // Adulteração intencional do payload do evento 2
    const tamperedEv2 = { ...ev2, details: { injected: 'malicious' } };

    const verification = await verifyHashChain([ev1, tamperedEv2]);
    expect(verification.valid).toBe(false);
    expect(verification.errorIndex).toBe(1);
    expect(verification.message).toContain('Hash adulterado');
  });
});
