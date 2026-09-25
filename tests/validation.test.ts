import { describe, it, expect } from 'vitest';
import { canonicalizeJson } from '../src/services/canonicalizer';

describe('Validação, Sanitização e Casos de Borda', () => {
  it('deve suportar respostas longas com até 5.000 caracteres sem corromper', () => {
    const longText = 'A'.repeat(5000);
    const obj = { text: longText };
    const canonical = canonicalizeJson(obj);
    expect(canonical.length).toBeGreaterThan(5000);
    expect(JSON.parse(canonical).text).toBe(longText);
  });

  it('deve tratar e escapar tags HTML / potenciais vetores XSS sem executar código', () => {
    const maliciousPayload = '<script>alert("xss")</script><img src="x" onerror="steal()"/>';
    const canonical = canonicalizeJson({ input: maliciousPayload });
    expect(canonical).toContain('"input":"<script>alert(\\"xss\\")</script>');
    const reparsed = JSON.parse(canonical);
    expect(reparsed.input).toBe(maliciousPayload); // texto puro inerte
  });

  it('deve aceitar dados com caracteres acentuados, cedilha e emojis', () => {
    const specialData = {
      nome: 'José da Conceição — Batalhão de Polícia 🛡️',
      cidade: 'Belo Horizonte/MG',
      observacao: 'Agressor disse: "Não se aproxime!" às 19:40h.'
    };
    const canonical = canonicalizeJson(specialData);
    expect(canonical).toBeDefined();
    const parsed = JSON.parse(canonical);
    expect(parsed.nome).toBe(specialData.nome);
  });

  it('deve preservar formatações especiais como CPF e telefone', () => {
    const formatted = {
      cpf: '123.456.789-00',
      telefone: '(31) 98765-4321'
    };
    const canonical = canonicalizeJson(formatted);
    expect(canonical).toContain('"cpf":"123.456.789-00"');
    expect(canonical).toContain('"telefone":"(31) 98765-4321"');
  });
});
