import { describe, it, expect, vi, beforeEach } from 'vitest';

import axiosInstance from './axios';
import { createEntityApi } from './createEntityApi';

// Mocka a instância axios: cada verbo é um vi.fn() que devolve { data }.
vi.mock('./axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance, true);

interface Thing {
  id: string;
  name: string;
}
type CreateThingInput = Omit<Thing, 'id'>;

const BASE = '/things';

describe('createEntityApi', () => {
  const api = createEntityApi<Thing, CreateThingInput>(BASE);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAll faz GET na rota base e devolve response.data', async () => {
    const items: Thing[] = [{ id: '1', name: 'a' }];
    mockedAxios.get.mockResolvedValueOnce({ data: items });

    const result = await api.getAll();

    expect(mockedAxios.get).toHaveBeenCalledWith(BASE);
    expect(result).toEqual(items);
  });

  it('getById faz GET em {base}/{id} e devolve response.data', async () => {
    const item: Thing = { id: '42', name: 'x' };
    mockedAxios.get.mockResolvedValueOnce({ data: item });

    const result = await api.getById('42');

    expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE}/42`);
    expect(result).toEqual(item);
  });

  it('create faz POST na rota base com o payload e devolve response.data', async () => {
    const input: CreateThingInput = { name: 'novo' };
    const created: Thing = { id: '7', name: 'novo' };
    mockedAxios.post.mockResolvedValueOnce({ data: created });

    const result = await api.create(input);

    expect(mockedAxios.post).toHaveBeenCalledWith(BASE, input);
    expect(result).toEqual(created);
  });

  it('update faz PUT em {base}/{id} com o payload parcial e devolve response.data', async () => {
    const patch: Partial<Thing> = { name: 'editado' };
    const updated: Thing = { id: '7', name: 'editado' };
    mockedAxios.put.mockResolvedValueOnce({ data: updated });

    const result = await api.update('7', patch);

    expect(mockedAxios.put).toHaveBeenCalledWith(`${BASE}/7`, patch);
    expect(result).toEqual(updated);
  });

  it('remove faz DELETE em {base}/{id} e resolve void', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: undefined });

    const result = await api.remove('7');

    expect(mockedAxios.delete).toHaveBeenCalledWith(`${BASE}/7`);
    expect(result).toBeUndefined();
  });

  it('propaga o erro quando o axios rejeita', async () => {
    const boom = new Error('network');
    mockedAxios.get.mockRejectedValueOnce(boom);

    await expect(api.getAll()).rejects.toThrow('network');
  });

  it('isola a rota base por instância (duas entidades não se misturam)', async () => {
    const other = createEntityApi<Thing, CreateThingInput>('/others');
    mockedAxios.get.mockResolvedValue({ data: [] });

    await api.getAll();
    await other.getAll();

    expect(mockedAxios.get).toHaveBeenNthCalledWith(1, '/things');
    expect(mockedAxios.get).toHaveBeenNthCalledWith(2, '/others');
  });
});
