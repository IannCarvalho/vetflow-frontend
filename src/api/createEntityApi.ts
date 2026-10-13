/**
 * createEntityApi — Fábrica genérica de funções CRUD de API (axios)
 *
 * Gera o molde padrão que os módulos de recurso em `src/api/*Api.ts` repetiam
 * verbatim: `getAll`, `getById`, `create`, `update` e `remove`, cada um com as
 * mesmas duas linhas (chamada axios + `response.data`), variando apenas a rota
 * base e o tipo da entidade.
 *
 * É o espelho, na camada de API, do que `src/hooks/createEntityHooks.ts` já faz
 * na camada de React Query: aquela fábrica consome exatamente esta forma
 * (`EntityApi` em createEntityHooks), então o objetivo aqui é remover o
 * boilerplate SEM mudar nenhuma assinatura pública. Cada módulo continua
 * exportando os mesmos nomes (`getPets`, `createPet`, …), apenas delegando o
 * núcleo CRUD a esta fábrica e mantendo suas funções extras (filtros por
 * tutor/pet/cliente) escritas à mão.
 *
 * `basePath` é a rota do recurso (ex.: `'/pets'`). `getById`/`update`/`remove`
 * endereçam `${basePath}/${id}`, idêntico ao que cada módulo fazia.
 */
import axiosInstance from './axios';

export interface EntityApiFns<TEntity, TCreateInput> {
  /** GET {basePath} — lista todos. */
  getAll: () => Promise<TEntity[]>;
  /** GET {basePath}/{id} — detalhe por ID. */
  getById: (id: string) => Promise<TEntity>;
  /** POST {basePath} — cria. */
  create: (data: TCreateInput) => Promise<TEntity>;
  /** PUT {basePath}/{id} — atualiza (parcial). */
  update: (id: string, data: Partial<TEntity>) => Promise<TEntity>;
  /** DELETE {basePath}/{id} — remove. */
  remove: (id: string) => Promise<void>;
}

/**
 * Gera o conjunto padrão de funções CRUD para um recurso em `basePath`.
 */
export function createEntityApi<TEntity, TCreateInput>(
  basePath: string
): EntityApiFns<TEntity, TCreateInput> {
  const getAll = async (): Promise<TEntity[]> => {
    const response = await axiosInstance.get<TEntity[]>(basePath);
    return response.data;
  };

  const getById = async (id: string): Promise<TEntity> => {
    const response = await axiosInstance.get<TEntity>(`${basePath}/${id}`);
    return response.data;
  };

  const create = async (data: TCreateInput): Promise<TEntity> => {
    const response = await axiosInstance.post<TEntity>(basePath, data);
    return response.data;
  };

  const update = async (id: string, data: Partial<TEntity>): Promise<TEntity> => {
    const response = await axiosInstance.put<TEntity>(`${basePath}/${id}`, data);
    return response.data;
  };

  const remove = async (id: string): Promise<void> => {
    await axiosInstance.delete(`${basePath}/${id}`);
  };

  return { getAll, getById, create, update, remove };
}
