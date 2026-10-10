import type { Prescription } from 'src/types';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { getPrescriptionPrintHtml } from 'src/api/prescriptionsApi';

import { Iconify } from 'src/components/iconify';

// -----------------------------------------------------------------------

interface PrescriptionReportDialogProps {
  open: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  petName?: string;
  ownerName?: string;
  vetName?: string;
}

export default function PrescriptionReportDialog({
  open,
  onClose,
  prescription,
  petName,
  ownerName,
  vetName,
}: PrescriptionReportDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [printing, setPrinting] = useState(false);

  if (!prescription) return null;

  // openPrintWindow writes a full HTML document into a new window and triggers
  // the browser print dialog. The backend's print document already calls
  // window.print() on load; the local fallback markup does not, so we trigger
  // it here when needed.
  const openPrintWindow = (html: string, triggerPrint: boolean) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    if (triggerPrint) {
      printWindow.print();
    }
  };

  // buildLocalDocument reproduces the previous client-side layout. It is only
  // used as a fallback when the backend print endpoint is unavailable.
  const buildLocalDocument = (inner: string) => `
    <html>
      <head>
        <title>Receituário - ${petName ?? ''}</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; color: #212B36; padding: 32px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          h2 { font-size: 15px; margin: 24px 0 8px; }
          .muted { color: #637381; font-size: 13px; }
          .item { border: 1px solid #DFE3E8; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }
          .item strong { font-size: 15px; }
          .row { font-size: 13px; margin-top: 4px; }
          .signature { margin-top: 64px; text-align: center; }
          .signature .line { border-top: 1px solid #212B36; width: 260px; margin: 0 auto 4px; }
        </style>
      </head>
      <body>${inner}</body>
    </html>
  `;

  const handlePrint = async () => {
    setPrinting(true);
    try {
      // Preferred path: the backend renders the canonical, print-ready document
      // (header resolved server-side) and opens the print dialog on load.
      const html = await getPrescriptionPrintHtml(prescription.id);
      openPrintWindow(html, false);
    } catch {
      // Fallback: render the preview markup locally if the endpoint fails.
      const content = printRef.current;
      if (content) {
        openPrintWindow(buildLocalDocument(content.innerHTML), true);
      }
    } finally {
      setPrinting(false);
    }
  };

  const formattedDate = new Date(prescription.date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogContent dividers sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <Box ref={printRef}>
          <Typography component="h1" variant="h5">
            Receituário Veterinário
          </Typography>
          <Typography className="muted" variant="body2" color="text.secondary">
            {formattedDate}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={0.5} sx={{ mb: 2 }}>
            {petName && (
              <Typography variant="body2">
                <strong>Paciente:</strong> {petName}
              </Typography>
            )}
            {ownerName && (
              <Typography variant="body2">
                <strong>Tutor:</strong> {ownerName}
              </Typography>
            )}
          </Stack>

          <Typography component="h2" variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
            Prescrição
          </Typography>

          {prescription.items.map((item, index) => (
            <Box
              key={index}
              className="item"
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, mb: 1.5 }}
            >
              <Typography variant="subtitle2">
                {index + 1}. {item.medication}
                {item.dosage ? ` — ${item.dosage}` : ''}
              </Typography>
              {(item.route || item.frequency || item.duration) && (
                <Typography className="row" variant="body2" color="text.secondary">
                  {[
                    item.route && `Via: ${item.route}`,
                    item.frequency && `Frequência: ${item.frequency}`,
                    item.duration && `Duração: ${item.duration}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              )}
              {item.instructions && (
                <Typography className="row" variant="body2" sx={{ mt: 0.5 }}>
                  {item.instructions}
                </Typography>
              )}
            </Box>
          ))}

          {prescription.general_notes && (
            <>
              <Typography component="h2" variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Observações
              </Typography>
              <Typography variant="body2">{prescription.general_notes}</Typography>
            </>
          )}

          <Box className="signature" sx={{ mt: 8, textAlign: 'center' }}>
            <Box
              className="line"
              sx={{ borderTop: '1px solid', borderColor: 'text.primary', width: 260, mx: 'auto', mb: 0.5 }}
            />
            <Typography variant="body2">{vetName || 'Médico(a) Veterinário(a)'}</Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={printing}>
          Fechar
        </Button>
        <Button
          onClick={handlePrint}
          variant="contained"
          disabled={printing}
          startIcon={<Iconify icon="solar:printer-bold" />}
        >
          {printing ? 'Preparando...' : 'Imprimir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
