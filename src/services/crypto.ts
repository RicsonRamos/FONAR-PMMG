import { AuditEvent } from '../types/snapshot';
import { canonicalizeJson } from './canonicalizer';

/**
 * Converte um ArrayBuffer / Uint8Array em representação hexadecimal minúscula.
 */
export function bytesToHex(buffer: ArrayBuffer | Uint8Array): string {
  const byteArray = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(byteArray)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Calcula o hash SHA-256 de uma string (UTF-8) ou de um array binário Uint8Array.
 */
export async function sha256(data: string | Uint8Array): Promise<string> {
  const binaryData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', binaryData as unknown as BufferSource);
  return bytesToHex(hashBuffer);
}

/**
 * Gera um ID de evidência opaco, aleatório e não sequencial (EV-UUID).
 */
export function generateEvidenceId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return `EV-${globalThis.crypto.randomUUID()}`;
  }
  // Fallback seguro caso randomUUID não esteja disponível
  const array = new Uint8Array(16);
  globalThis.crypto.getRandomValues(array);
  return `EV-${bytesToHex(array)}`;
}

/**
 * Gera um protocolo legível no formato FORM-YYYY-NNNNNN.
 */
export function generateProtocol(year: number = new Date().getUTCFullYear()): string {
  const randomArray = new Uint32Array(1);
  globalThis.crypto.getRandomValues(randomArray);
  const randomNum = (randomArray[0] % 900000) + 100000; // Número de 6 dígitos (100000-999999)
  return `FORM-${year}-${randomNum}`;
}

/**
 * Cria e assina o próximo elo da Hash Chain para um evento de auditoria.
 */
export async function createAuditEvent(
  eventType: string,
  protocol: string,
  sessionId: string,
  previousHash: string = 'GENESIS',
  details?: Record<string, unknown>
): Promise<AuditEvent> {
  const timestamp = new Date().toISOString();
  
  const eventPayload = {
    details: details || {},
    event_type: eventType,
    previous_hash: previousHash,
    protocol,
    session_id: sessionId,
    timestamp_utc: timestamp
  };

  const canonicalPayload = canonicalizeJson(eventPayload);
  const eventHash = await sha256(canonicalPayload);

  return {
    timestamp_utc: timestamp,
    event_type: eventType,
    protocol,
    session_id: sessionId,
    previous_hash: previousHash,
    event_hash: eventHash,
    details
  };
}

/**
 * Verifica a consistência de uma trilha de auditoria (Hash Chain).
 */
export async function verifyHashChain(events: AuditEvent[]): Promise<{ valid: boolean; errorIndex?: number; message?: string }> {
  if (!events || events.length === 0) {
    return { valid: true };
  }

  let expectedPreviousHash = 'GENESIS';

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];

    if (ev.previous_hash !== expectedPreviousHash) {
      return {
        valid: false,
        errorIndex: i,
        message: `Discrepância no previous_hash do evento ${i} (${ev.event_type}). Esperado: ${expectedPreviousHash}, Encontrado: ${ev.previous_hash}`
      };
    }

    const payload = {
      details: ev.details || {},
      event_type: ev.event_type,
      previous_hash: ev.previous_hash,
      protocol: ev.protocol,
      session_id: ev.session_id,
      timestamp_utc: ev.timestamp_utc
    };

    const recomputedHash = await sha256(canonicalizeJson(payload));
    if (recomputedHash !== ev.event_hash) {
      return {
        valid: false,
        errorIndex: i,
        message: `Hash adulterado no evento ${i} (${ev.event_type}). Esperado: ${recomputedHash}, Encontrado: ${ev.event_hash}`
      };
    }

    expectedPreviousHash = ev.event_hash;
  }

  return { valid: true };
}
