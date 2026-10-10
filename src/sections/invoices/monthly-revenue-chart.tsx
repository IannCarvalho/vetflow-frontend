/**
 * Monthly Revenue Chart
 * A dependency-free vertical bar chart (plain SVG) showing revenue per month.
 */
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { formatBRL } from './invoice-constants';

// -----------------------------------------------------------------------

export interface MonthlyRevenuePoint {
  label: string; // e.g. "jan/26"
  value: number;
}

interface MonthlyRevenueChartProps {
  data: MonthlyRevenuePoint[];
  height?: number;
}

export default function MonthlyRevenueChart({ data, height = 220 }: MonthlyRevenueChartProps) {
  const theme = useTheme();

  const max = Math.max(1, ...data.map((d) => d.value));
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">Sem receita registrada no período.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height, px: 1, pt: 2 }}>
      {data.map((point) => {
        const barHeight = Math.round((point.value / max) * (height - 48));
        return (
          <Box
            key={point.label}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              sx={{ mb: 0.5, color: 'text.secondary', whiteSpace: 'nowrap', fontSize: 11 }}
            >
              {point.value > 0 ? formatBRL(point.value) : ''}
            </Typography>
            <Box
              title={`${point.label}: ${formatBRL(point.value)}`}
              sx={{
                width: '70%',
                height: Math.max(barHeight, point.value > 0 ? 4 : 0),
                minHeight: point.value > 0 ? 4 : 0,
                borderRadius: 1,
                bgcolor: theme.palette.primary.main,
                transition: 'height 0.3s ease',
              }}
            />
            <Typography
              variant="caption"
              sx={{ mt: 0.5, color: 'text.secondary', whiteSpace: 'nowrap' }}
            >
              {point.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
