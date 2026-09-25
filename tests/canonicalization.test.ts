import { describe, it, expect } from 'vitest';
import { canonicalizeJson } from '../src/services/canonicalizer';

describe('Canonicalização JSON (RFC 8785 / JCS)', () => {
  it('deve ordenar chaves de objetos lexicograficamente', () => {
    const objA = { z: 1, a: 2, m: 3 };
    const objB = { m: 3, z: 1, a: 2 };
    expect(canonicalizeJson(objA)).toBe('{"a":2,"m":3,"z":1}');
    expect(canonicalizeJson(objA)).toBe(canonicalizeJson(objB));
  });

  it('deve ordenar chaves em objetos aninhados', () => {
    const nestedA = { outer: { b: 2, a: 1 }, x: 10 };
    const nestedB = { x: 10, outer: { a: 1, b: 2 } };
    expect(canonicalizeJson(nestedA)).toBe('{"outer":{"a":1,"b":2},"x":10}');
    expect(canonicalizeJson(nestedA)).toBe(canonicalizeJson(nestedB));
  });

  it('deve preservar a ordem de elementos em arrays', () => {
    const arr = [3, 1, 2];
    expect(canonicalizeJson(arr)).toBe('[3,1,2]');
  });

  it('deve normalizar strings com acentuação e caracteres Unicode (NFC)', () => {
    // Letra 'é' composta vs pré-composta
    const composed = 'e\u0301'; // 'e' + acento agudo combinatório
    const precomposed = '\u00e9'; // 'é' pré-composto
    expect(canonicalizeJson(composed)).toBe(canonicalizeJson(precomposed));
  });

  it('deve tratar booleanos, números e null corretamente', () => {
    expect(canonicalizeJson(true)).toBe('true');
    expect(canonicalizeJson(false)).toBe('false');
    expect(canonicalizeJson(null)).toBe('null');
    expect(canonicalizeJson(123.456)).toBe('123.456');
    expect(canonicalizeJson(-0)).toBe('0');
  });

  it('deve rejeitar NaN e Infinity', () => {
    expect(() => canonicalizeJson(NaN)).toThrow(TypeError);
    expect(() => canonicalizeJson(Infinity)).toThrow(TypeError);
  });
});
