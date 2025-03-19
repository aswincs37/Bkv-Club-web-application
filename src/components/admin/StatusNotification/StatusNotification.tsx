import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatusNotificationProps {
  open: boolean;
  status: 'accepted' | 'rejected' | 'banned' | null;
  memberName: string;
  onClose: () => void;
}

const StatusNotification: React.FC<StatusNotificationProps> = ({
  open,
  status,
  memberName,
  onClose
}) => {
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [icon, setIcon] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (status === 'accepted') {
      setMessage(`${memberName} has been accepted successfully`);
      setSeverity('success');
      setIcon(<CheckCircle className="h-5 w-5" />);
    } else if (status === 'rejected') {
      setMessage(`${memberName} has been rejected`);
      setSeverity('error');
      setIcon(<XCircle className="h-5 w-5" />);
    } else if (status === 'banned') {
      setMessage(`${memberName}'s registration has been canceled`);
      setSeverity('warning');
      setIcon(<AlertCircle className="h-5 w-5" />);
    }
  }, [status, memberName]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        severity={severity}
        onClose={onClose}
        icon={icon}
        sx={{ width: '100%' }}
      >
        <AlertTitle>{status && status.charAt(0).toUpperCase() + status.slice(1)}</AlertTitle>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default StatusNotification;