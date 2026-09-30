import type { Vaccine, Consultation } from 'src/types';
import type { IconifyName } from 'src/components/iconify/register-icons';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Typography from '@mui/material/Typography';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

type TimelineKind = 'consultation' | 'vaccine';

interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  date: string;
  title: string;
  description: string;
  raw: Consultation | Vaccine;
}

interface PetTimelineProps {
  consultations?: Consultation[];
  vaccines?: Vaccine[];
  onViewConsultation?: (consultation: Consultation) => void;
}

const KIND_META: Record<
  TimelineKind,
  { label: string; icon: IconifyName; color: 'primary' | 'success' }
> = {
  consultation: { label: 'Consulta', icon: 'solar:medical-visit-bold', color: 'primary' },
  vaccine: { label: 'Vacina', icon: 'solar:vaccine-bold', color: 'success' },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PetTimeline({
  consultations,
  vaccines,
  onViewConsultation,
}: PetTimelineProps) {
  const entries = useMemo<TimelineEntry[]>(() => {
    const consultationEntries: TimelineEntry[] = (consultations ?? []).map((c) => ({
      id: `consultation-${c.id}`,
      kind: 'consultation',
      date: c.date,
      title: c.anamnesis?.main_complaint?.trim() || 'Consulta clínica',
      description: c.summary?.evolution_time
        ? `Evolução: ${c.summary.evolution_time}`
        : 'Registro de consulta',
      raw: c,
    }));

    const vaccineEntries: TimelineEntry[] = (vaccines ?? []).map((v) => ({
      id: `vaccine-${v.id}`,
      kind: 'vaccine',
      date: v.date_applied,
      title: v.vaccine_name,
      description: v.next_dose_date
        ? `Próxima dose: ${formatDate(v.next_dose_date)}`
        : v.manufacturer || 'Vacina aplicada',
      raw: v,
    }));

    return [...consultationEntries, ...vaccineEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [consultations, vaccines]);

  if (entries.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
        Nenhum registro no prontuário deste pet ainda.
      </Box>
    );
  }

  return (
    <Timeline
      sx={{
        p: 0,
        m: 0,
        [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 },
      }}
    >
      {entries.map((entry, index) => {
        const meta = KIND_META[entry.kind];
        const clickable = entry.kind === 'consultation' && !!onViewConsultation;
        return (
          <TimelineItem key={entry.id}>
            <TimelineOppositeContent sx={{ flex: 0.2, minWidth: 96, color: 'text.secondary' }}>
              <Typography variant="caption">{formatDate(entry.date)}</Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color={meta.color}>
                <Iconify icon={meta.icon} width={16} />
              </TimelineDot>
              {index < entries.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box
                onClick={
                  clickable ? () => onViewConsultation!(entry.raw as Consultation) : undefined
                }
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 1,
                  cursor: clickable ? 'pointer' : 'default',
                  transition: 'background-color 0.15s',
                  '&:hover': clickable ? { backgroundColor: 'action.hover' } : undefined,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
                  <Typography variant="subtitle2" noWrap>
                    {entry.title}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {entry.description}
                </Typography>
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}
