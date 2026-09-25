import { ManifestDocument } from '../types/evidence';
import { canonicalizeJson } from './canonicalizer';
import { sha256 } from './crypto';

export interface BuildManifestParams {
  protocol: string;
  evidenceId: string;
  systemVersion: string;
  pdfFilename: string;
  pdfBytes: Uint8Array;
  pdfSha256: string;
  jsonFilename: string;
  jsonContent: string;
  jsonSha256: string;
}

/**
 * Constrói o MANIFEST.json canônico com os hashes SHA-256 e tamanhos em bytes.
 */
export async function buildManifest(params: BuildManifestParams): Promise<{
  manifestDocument: ManifestDocument;
  manifestCanonicalString: string;
  manifestSha256: string;
}> {
  const jsonBytes = new TextEncoder().encode(params.jsonContent);

  const rawManifest: ManifestDocument = {
    manifest_version: '1.0.0',
    algorithm: 'SHA-256',
    protocol: params.protocol,
    evidence_id: params.evidenceId,
    generated_at_utc: new Date().toISOString(),
    system_version: params.systemVersion,
    files: {
      [params.pdfFilename]: {
        sha256: params.pdfSha256,
        size_bytes: params.pdfBytes.length,
        mime_type: 'application/pdf'
      },
      [params.jsonFilename]: {
        sha256: params.jsonSha256,
        size_bytes: jsonBytes.length,
        mime_type: 'application/json'
      }
    }
  };

  // Canonicaliza antes do hash
  const canonicalString = canonicalizeJson(rawManifest);
  const manifestHash = await sha256(canonicalString);

  // Adiciona o manifest_sha256 ao objeto final documentado
  const manifestDocument: ManifestDocument = {
    ...rawManifest,
    manifest_sha256: manifestHash
  };

  return {
    manifestDocument,
    manifestCanonicalString: canonicalizeJson(manifestDocument),
    manifestSha256: manifestHash
  };
}
