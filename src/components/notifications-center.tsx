/**
 * Notifications Center Component
 * Displays upcoming consultations and vaccinations
 */
import { useState } from 'react';
import { Icon } from '@iconify/react';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Chip from '@mui/material/Chip';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useNotifications, useDismissNotification, useMarkNotificationAsRead } from 'src/hooks/useNotificationsQuery';


export function NotificationsCenter() {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data: notifications = [], isLoading } = useNotifications();
  const dismissMutation = useDismissNotification();
  const readMutation = useMarkNotificationAsRead();

  const pendingNotifications = notifications.filter((n) => n.status === 'pending');
  const readNotifications = notifications.filter((n) => n.status === 'sent');
  const allNotifications = [...pendingNotifications, ...readNotifications];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDismiss = async (notificationId: string) => {
    setLoadingId(notificationId);
    try {
      await dismissMutation.mutateAsync(notificationId);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setLoadingId(notificationId);
    try {
      await readMutation.mutateAsync(notificationId);
    } finally {
      setLoadingId(null);
    }
  };

  const open = Boolean(anchorEl);

  const getNotificationColor = (daysUntil: number): 'error' | 'warning' | 'success' | 'default' => {
    if (daysUntil === 0) return 'error';
    if (daysUntil === 1) return 'warning';
    return 'default';
  };

  const getBackgroundColor = (status: string) => {
    if (status === 'pending') return '#E0F2FE'; // Azul claro da marca
    return '#DCFCE7'; // Verde claro da marca
  };

  const getBorderColor = (status: string) => {
    if (status === 'pending') return '#7DD3FC'; // Azul da marca
    return '#86EFAC'; // Verde da marca
  };

  const getTextOpacity = (status: string) => {
    if (status === 'pending') return 1;
    return 0.85;
  };

  const getNotificationIcon = (type: string) => type === 'vaccine' ? 'mdi:needle' : 'mdi:hospital-box';

  return (
    <>
      <Button
        variant="text"
        onClick={handleClick}
        startIcon={
          <Badge badgeContent={pendingNotifications.length} color="error">
            <Icon icon="solar:bell-bing-bold" width={24} />
          </Badge>
        }
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Notificações
            </Typography>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : allNotifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              Sem notificações
            </Typography>
          ) : (
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {allNotifications.map((notification) => (
                  <ListItem
                  key={notification.id}
                  disablePadding
                  sx={{
                    mb: 1,
                    p: 1.5,
                    bgcolor: getBackgroundColor(notification.status),
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: getBorderColor(notification.status),
                    opacity: getTextOpacity(notification.status),
                  }}
                >
                  <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                    <Box sx={{ flexShrink: 0, mt: 0.5 }}>
                      <Icon icon={getNotificationIcon(notification.type)} width={24} height={24} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={
                            notification.days_until === 0
                              ? 'Hoje'
                              : notification.days_until === 1
                                ? 'Amanhã'
                                : `${notification.days_until}d`
                          }
                          size="small"
                          color={getNotificationColor(notification.days_until)}
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                        {notification.message}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {notification.status === 'pending' && (
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={loadingId === notification.id}
                          >
                            {loadingId === notification.id ? 'Marcando...' : 'Ler'}
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDismiss(notification.id)}
                          disabled={loadingId === notification.id}
                        >
                          {loadingId === notification.id ? 'Descartando...' : 'Descartar'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
