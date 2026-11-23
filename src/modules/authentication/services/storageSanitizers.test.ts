import { describe, expect, it } from 'vitest';
import { sanitizeEmail, sanitizeId, sanitizeToken } from './storageSanitizers';

describe('storageSanitizers', () => {
  describe('sanitizeToken', () => {
    it('acepta un JWT y un token opaco', () => {
      expect(sanitizeToken('aaa.bbb-ccc_ddd.eee')).toBe('aaa.bbb-ccc_ddd.eee');
      expect(sanitizeToken('access-123')).toBe('access-123');
    });

    it('rechaza valores que no son texto, vacíos, demasiado largos o con caracteres de marcado', () => {
      expect(sanitizeToken(undefined)).toBeNull();
      expect(sanitizeToken(42)).toBeNull();
      expect(sanitizeToken('')).toBeNull();
      expect(sanitizeToken('a'.repeat(8193))).toBeNull();
      expect(sanitizeToken('<script>alert(1)</script>')).toBeNull();
      expect(sanitizeToken('con espacio')).toBeNull();
    });
  });

  describe('sanitizeEmail', () => {
    it('acepta correos normales, incluidos los que llevan caracteres como ? o +', () => {
      expect(sanitizeEmail('ana@taskit.com')).toBe('ana@taskit.com');
      expect(sanitizeEmail('x?y+z@mail.example.co')).toBe('x?y+z@mail.example.co');
    });

    it('rechaza correos con forma inválida o caracteres peligrosos', () => {
      expect(sanitizeEmail(null)).toBeNull();
      expect(sanitizeEmail('')).toBeNull();
      expect(sanitizeEmail('sin-arroba')).toBeNull();
      expect(sanitizeEmail('@taskit.com')).toBeNull();
      expect(sanitizeEmail('a@@taskit.com')).toBeNull();
      expect(sanitizeEmail('ana@taskit')).toBeNull();
      expect(sanitizeEmail('ana@taskit.')).toBeNull();
      expect(sanitizeEmail('an a@taskit.com')).toBeNull();
      expect(sanitizeEmail(' ana@taskit.com')).toBeNull();
      expect(sanitizeEmail('ana@taskit..com')).toBeNull();
      expect(sanitizeEmail('<b>@taskit.com')).toBeNull();
      expect(sanitizeEmail(`${'a'.repeat(250)}@taskit.com`)).toBeNull();
    });
  });

  describe('sanitizeId', () => {
    it('acepta identificadores opacos', () => {
      expect(sanitizeId('ch-1')).toBe('ch-1');
      expect(sanitizeId('3f2b8c1e-aaaa-bbbb-cccc-1234567890ab')).toBe('3f2b8c1e-aaaa-bbbb-cccc-1234567890ab');
    });

    it('rechaza valores inválidos', () => {
      expect(sanitizeId(undefined)).toBeNull();
      expect(sanitizeId('')).toBeNull();
      expect(sanitizeId('a'.repeat(129))).toBeNull();
      expect(sanitizeId('ch 1')).toBeNull();
      expect(sanitizeId('"><img src=x>')).toBeNull();
    });
  });
});
