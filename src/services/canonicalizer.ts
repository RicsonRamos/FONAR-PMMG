/**
 * Canonicalização JSON segundo a RFC 8785 (JSON Canonicalization Scheme - JCS)
 * Garante que a representação em bytes seja 100% determinística em qualquer plataforma.
 */

export function canonicalizeJson(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError('Números infinitos ou NaN não são suportados em JSON canônico');
    }
    // Conforme RFC 8785: zeros negativos tornam-se 0
    if (Object.is(value, -0)) {
      return '0';
    }
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    // Normalização Unicode NFC
    const normalized = value.normalize('NFC');
    return JSON.stringify(normalized);
  }

  if (Array.isArray(value)) {
    const elements = value.map(element => {
      const canonicalElement = canonicalizeJson(element);
      return canonicalElement === undefined ? 'null' : canonicalElement;
    });
    return `[${elements.join(',')}]`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value as Record<string, unknown>).sort((a, b) => {
      // Ordenação lexicográfica por UTF-16 code units conforme RFC 8785
      return a < b ? -1 : a > b ? 1 : 0;
    });

    const entries: string[] = [];
    for (const key of keys) {
      const val = (value as Record<string, unknown>)[key];
      if (val !== undefined && typeof val !== 'function' && typeof val !== 'symbol') {
        const canonicalKey = JSON.stringify(key.normalize('NFC'));
        const canonicalVal = canonicalizeJson(val);
        if (canonicalVal !== undefined) {
          entries.push(`${canonicalKey}:${canonicalVal}`);
        }
      }
    }
    return `{${entries.join(',')}}`;
  }

  return undefined as unknown as string;
}
