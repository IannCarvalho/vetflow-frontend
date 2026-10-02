import { it, expect, describe } from 'vitest';

import { getActiveNavPath } from './nav-utils';

const paths = [
  '/',
  '/agenda',
  '/clientes',
  '/pets',
  '/consultas',
  '/vacinas',
  '/catalogo',
  '/financeiro',
  '/financeiro/painel',
];

describe('getActiveNavPath', () => {
  it('matches the root path only on an exact "/"', () => {
    expect(getActiveNavPath('/', paths)).toBe('/');
  });

  it('matches a top-level path exactly', () => {
    expect(getActiveNavPath('/agenda', paths)).toBe('/agenda');
  });

  it('matches the base path for sub-routes', () => {
    expect(getActiveNavPath('/pets/123/prontuario', paths)).toBe('/pets');
    expect(getActiveNavPath('/pets/123/vacinas', paths)).toBe('/pets');
    expect(getActiveNavPath('/clientes/456/pets', paths)).toBe('/clientes');
  });

  it('picks the base item when on the base path', () => {
    expect(getActiveNavPath('/financeiro', paths)).toBe('/financeiro');
  });

  it('picks the most specific item on an overlapping path', () => {
    expect(getActiveNavPath('/financeiro/painel', paths)).toBe('/financeiro/painel');
  });

  it('returns null for an unknown path', () => {
    expect(getActiveNavPath('/configuracoes', paths)).toBeNull();
  });

  it('does not match on a partial segment prefix', () => {
    expect(getActiveNavPath('/petshop', paths)).toBeNull();
  });
});
