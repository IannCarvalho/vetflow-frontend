import type { Pet, Client } from 'src/types';

import { useNavigate } from 'react-router-dom';
/**
 * Global Search
 *
 * A command-palette-style quick search in the header. Searches across clients
 * and pets (data already cached by React Query) and lets the user jump straight
 * to the relevant page. Opens on click or with Ctrl/Cmd + K.
 */
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemButton from '@mui/material/ListItemButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useGetPets } from 'src/hooks/usePetsQuery';
import { useGetClients } from 'src/hooks/useClientsQuery';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

interface SearchResult {
  id: string;
  kind: 'client' | 'pet';
  primary: string;
  secondary: string;
  to: string;
}

const MAX_RESULTS_PER_GROUP = 6;

export function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');

  // Only fetch when the palette is open to avoid unnecessary requests.
  const { data: clients } = useGetClients();
  const { data: pets } = useGetPets();

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => {
    setOpen(false);
    setTerm('');
  }, []);

  // Ctrl/Cmd + K toggles the palette.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const clientNameById = useMemo(() => {
    const map = new Map<string, string>();
    clients?.forEach((c) => map.set(c.id, c.full_name));
    return map;
  }, [clients]);

  const { clientResults, petResults } = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return { clientResults: [], petResults: [] };

    const cResults: SearchResult[] = (clients ?? [])
      .filter(
        (c: Client) =>
          c.full_name.toLowerCase().includes(q) ||
          c.cpf?.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_GROUP)
      .map((c) => ({
        id: c.id,
        kind: 'client' as const,
        primary: c.full_name,
        secondary: c.phone || c.cpf || 'Cliente',
        to: `/clientes/${c.id}/pets`,
      }));

    const pResults: SearchResult[] = (pets ?? [])
      .filter(
        (p: Pet) =>
          p.name.toLowerCase().includes(q) ||
          p.species?.toLowerCase().includes(q) ||
          p.breed?.toLowerCase().includes(q)
      )
      .slice(0, MAX_RESULTS_PER_GROUP)
      .map((p) => ({
        id: p.id,
        kind: 'pet' as const,
        primary: p.name,
        secondary: `${p.species}${p.breed ? ` · ${p.breed}` : ''} · ${
          clientNameById.get(p.owner_id) ?? 'Sem tutor'
        }`,
        to: `/pets/${p.id}/prontuario`,
      }));

    return { clientResults: cResults, petResults: pResults };
  }, [term, clients, pets, clientNameById]);

  const handleSelect = useCallback(
    (to: string) => {
      handleClose();
      navigate(to);
    },
    [handleClose, navigate]
  );

  const hasResults = clientResults.length > 0 || petResults.length > 0;

  return (
    <>
      <Button
        onClick={handleOpen}
        startIcon={<Iconify icon="eva:search-fill" />}
        sx={{
          color: 'text.secondary',
          bgcolor: 'action.hover',
          fontWeight: 'fontWeightMedium',
          px: 1.5,
          minWidth: { xs: 40, sm: 200 },
          justifyContent: { xs: 'center', sm: 'flex-start' },
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Buscar...
        </Box>
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { position: 'fixed', top: 80, m: 0 } } }}
      >
        <Box sx={{ p: 2 }}>
          <OutlinedInput
            autoFocus
            fullWidth
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar clientes e pets..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
          />
        </Box>

        <Divider />

        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {!term.trim() ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">
                Digite para buscar clientes e pets. Dica: Ctrl/Cmd + K abre a busca.
              </Typography>
            </Box>
          ) : !hasResults ? (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">Nenhum resultado para “{term}”.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {clientResults.length > 0 && (
                <>
                  <ListSubheader disableSticky>Clientes</ListSubheader>
                  {clientResults.map((r) => (
                    <ListItemButton key={`client-${r.id}`} onClick={() => handleSelect(r.to)}>
                      <Iconify icon="mdi:account-multiple" sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={r.primary} secondary={r.secondary} />
                    </ListItemButton>
                  ))}
                </>
              )}
              {petResults.length > 0 && (
                <>
                  <ListSubheader disableSticky>Pets</ListSubheader>
                  {petResults.map((r) => (
                    <ListItemButton key={`pet-${r.id}`} onClick={() => handleSelect(r.to)}>
                      <Iconify icon="solar:paw-bold" sx={{ mr: 2, color: 'text.secondary' }} />
                      <ListItemText primary={r.primary} secondary={r.secondary} />
                    </ListItemButton>
                  ))}
                </>
              )}
            </List>
          )}
        </Box>
      </Dialog>
    </>
  );
}
