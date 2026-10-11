import type { ReactNode } from 'react';
import type { TableCellProps } from '@mui/material/TableCell';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

// ----------------------------------------------------------------------

export interface ListColumn {
  /** Texto do cabeçalho da coluna. */
  label: ReactNode;
  /** Alinhamento, repassado ao `<TableCell>` do header e do skeleton. */
  align?: TableCellProps['align'];
}

export interface ListTableShellProps<T> {
  /** Definição das colunas (cabeçalho + alinhamento). */
  columns: ListColumn[];
  /** Lista JÁ filtrada e ordenada (usada para `count` da paginação e vazio). */
  rows: readonly T[];
  /** Fatia da página atual (resultado de `paginate(rows)`). */
  pageRows: readonly T[];
  /** Renderiza UMA linha `<TableRow>` — específico de cada página. */
  renderRow: (row: T) => ReactNode;
  /** `true` enquanto a query de lista carrega (mostra skeleton). */
  isLoading?: boolean;
  /** Mensagem exibida quando `rows` está vazio e não está carregando. */
  emptyMessage?: ReactNode;
  /** Número de linhas-skeleton durante o loading. Default `5`. */
  skeletonRows?: number;

  // --- paginação (vem do useListPage) ---
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
}

// Mesmos labels PT-BR que todas as páginas-lista repetiam.
const labelDisplayedRows = ({
  from,
  to,
  count,
}: {
  from: number;
  to: number;
  count: number;
}) => `${from}-${to} de ${count}`;

/**
 * Chassi de tabela das páginas-lista do VetFlow.
 *
 * Absorve o invólucro idêntico que ~6 páginas repetiam: o `<Card>` com borda, o
 * ramo de loading (header + 5 linhas de `<Skeleton>`), o estado vazio centrado,
 * o header de colunas e o `<TablePagination>` com os labels PT-BR
 * (`"Linhas por página:"` e `"{from}-{to} de {count}"`). As COLUNAS e as linhas
 * continuam específicas de cada página: as colunas entram como `columns` e cada
 * linha é renderizada por `renderRow` (render prop). As células NÃO são
 * genericizadas — a página monta cada `<TableCell>` como hoje.
 */
export function ListTableShell<T>({
  columns,
  rows,
  pageRows,
  renderRow,
  isLoading = false,
  emptyMessage = 'Nenhum registro encontrado',
  skeletonRows = 5,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25],
}: ListTableShellProps<T>) {
  const header = (
    <TableHead>
      <TableRow sx={{ backgroundColor: 'background.neutral' }}>
        {columns.map((col, index) => (
          <TableCell key={index} align={col.align}>
            {col.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  return (
    <Card sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      {isLoading ? (
        <TableContainer>
          <Table>
            {header}
            <TableBody>
              {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => (
                    <TableCell key={colIndex} align={col.align}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : rows.length > 0 ? (
        <TableContainer>
          <Table>
            {header}
            <TableBody>{pageRows.map((row) => renderRow(row))}</TableBody>
          </Table>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onPageChange={(_, newPage) => onPageChange(newPage)}
            onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
            labelRowsPerPage="Linhas por página:"
            labelDisplayedRows={labelDisplayedRows}
          />
        </TableContainer>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>{emptyMessage}</Box>
      )}
    </Card>
  );
}
