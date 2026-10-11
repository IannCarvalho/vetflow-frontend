import { useMemo, useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type SnackbarSeverity = 'success' | 'error';

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
}

export interface UseListPageOptions {
  /** Linhas por página inicial. Default `10` (igual às páginas-lista atuais). */
  initialRowsPerPage?: number;
}

export interface UseListPageReturn {
  // --- busca ---
  /** Texto de busca atual. */
  searchTerm: string;
  /**
   * Atualiza o texto de busca E volta para a primeira página — espelha o
   * `onChange` que cada página repetia (`setSearchTerm(...)` + `setPage(0)`).
   */
  setSearchTerm: (value: string) => void;

  // --- paginação client-side ---
  /** Página atual (base 0). */
  page: number;
  /** Troca de página (handler do `onPageChange` do `<TablePagination>`). */
  setPage: (value: number) => void;
  /** Linhas por página. */
  rowsPerPage: number;
  /**
   * Troca o número de linhas por página E volta para a primeira página —
   * espelha o `onRowsPerPageChange` repetido.
   */
  setRowsPerPage: (value: number) => void;
  /**
   * Recorta a lista JÁ filtrada na página atual (a paginação é client-side).
   * Substitui o `list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)`.
   */
  paginate: <T>(items: readonly T[]) => T[];

  // --- snackbar ---
  /** Estado do `<Snackbar>` (`{ open, message, severity }`). */
  snackbar: SnackbarState;
  /** Abre o snackbar com a mensagem/severidade informadas. */
  notify: (message: string, severity?: SnackbarSeverity) => void;
  /** Fecha o snackbar (handler do `onClose`). */
  closeSnackbar: () => void;
}

/**
 * Encapsula o scaffold repetido pelas páginas-lista do VetFlow: o estado de
 * busca (`searchTerm`), a paginação client-side (`page`/`rowsPerPage` + o
 * recorte via `paginate`) e o estado do `<Snackbar>` com o helper `notify`.
 *
 * NÃO decide a lógica de filtro — cada página continua derivando sua lista
 * visível como preferir (filtros por chip, ordenação, janelas de data). O hook
 * apenas realoca o boilerplate idêntico de estado + os `setPage(0)` ao buscar
 * ou trocar o tamanho da página. Comportamento 100% idêntico ao inline.
 */
export function useListPage(options: UseListPageOptions = {}): UseListPageReturn {
  const { initialRowsPerPage = 10 } = options;

  const [searchTerm, setSearchTermState] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPageState] = useState(initialRowsPerPage);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const setSearchTerm = useCallback((value: string) => {
    setSearchTermState(value);
    setPage(0);
  }, []);

  const setRowsPerPage = useCallback((value: number) => {
    setRowsPerPageState(value);
    setPage(0);
  }, []);

  const paginate = useCallback(
    <T,>(items: readonly T[]): T[] =>
      items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) as T[],
    [page, rowsPerPage]
  );

  const notify = useCallback((message: string, severity: SnackbarSeverity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const closeSnackbar = useCallback(() => {
    setSnackbar((s) => ({ ...s, open: false }));
  }, []);

  return useMemo(
    () => ({
      searchTerm,
      setSearchTerm,
      page,
      setPage,
      rowsPerPage,
      setRowsPerPage,
      paginate,
      snackbar,
      notify,
      closeSnackbar,
    }),
    [
      searchTerm,
      setSearchTerm,
      page,
      rowsPerPage,
      setRowsPerPage,
      paginate,
      snackbar,
      notify,
      closeSnackbar,
    ]
  );
}
