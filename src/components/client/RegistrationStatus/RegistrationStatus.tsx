"use client"
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';


// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 24px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// TypeScript interface for registration status
interface RegistrationStatus {
  id: string; // Changed from memberId to id to match where it's used in the UI
  status: 'approved' | 'pending' | 'rejected';
  name: string;
  email: string;
  date: string;
  message?: string;
  memberId:string;
}

// Function to fetch registration status from Firestore
const checkRegistrationStatus = async (memberId: string): Promise<RegistrationStatus> => {
    try {
        const q = query(collection(db, "members"), where("memberId", "==", memberId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();

            const registrationData: RegistrationStatus = {
                id: docSnap.id,
                memberId: data.memberId,
                status: data.status || "pending",
                name: data.fullName || "Unknown",
                email: data.email || "No email provided",
                date: data.registrationDate
                    ? new Date(data.registrationDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                message: getStatusMessage(data.status, data.customMessage),
            };

            return registrationData;
        } else {
            return Promise.reject("Registration ID not found");
        }
    } catch (error) {
        return Promise.reject("Error fetching registration status");
    }
};

// Helper function to get appropriate message based on status
const getStatusMessage = (status: string, customMessage?: string): string => {
  if (customMessage) return customMessage;

  switch (status) {
    case 'approved':
      return 'Your registration has been approved. Welcome aboard!';
    case 'pending':
      return 'Your registration is currently being reviewed.';
    case 'rejected':
      return 'Your registration has been rejected. Please contact support for more information.';
    default:
      return 'Status information not available.';
  }
};

const RegistrationStatus: React.FC = () => {
  const [registrationId, setRegistrationId] = useState('');
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId.trim()) {
      setError('Please enter a registration ID');
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const result = await checkRegistrationStatus(registrationId);
      setStatus(result);
    } catch (err) {
      setError('Registration ID not found. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />;
      case 'pending':
        return <PendingIcon sx={{ color: 'warning.main', fontSize: 40 }} />;
      case 'rejected':
        return <CancelIcon sx={{ color: 'error.main', fontSize: 40 }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'rejected':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  return (
    <>
    <div className="bg-blue-700 py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/logo.png"
              alt="Club Logo"
              className="h-15 w-12 rounded-full border-2 border-white"
            />
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg md:text-xl">
                BHAGATH SINGH KALAVEDHÍ VAZHAKKAD (BKV)
              </span>
            </div>
          </div>
          <div>
            <a
              href="/"
              className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </a>
          </div>
        </div>
      </div>
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Check Registration Status
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Enter your registration ID to check the current status of your application
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Registration ID"
              placeholder="Enter your registration ID"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SearchIcon />}
              disabled={loading}
              sx={{
                minWidth: { xs: '100%', sm: '150px' },
                height: { sm: '56px' }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Check'}
            </Button>
          </Box>
        </Paper>

        {status && (
          <Card elevation={2} sx={{ mt: 4, overflow: 'visible' }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: -3,
              position: 'relative'
            }}>
              <Box sx={{
                backgroundColor: 'background.paper',
                borderRadius: '50%',
                p: 1,
                boxShadow: 1
              }}>
                {getStatusIcon(status.status)}
              </Box>
            </Box>
            <CardContent sx={{ pt: 4 }}>
              <Typography variant="h5" align="center" color={getStatusColor(status.status)} gutterBottom sx={{ textTransform: 'capitalize' }}>
                {status.status}
              </Typography>
              <Typography variant="body1" align="center" paragraph>
                {status.message}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Registration ID</Typography>
                  <Typography variant="body1">{status.memberId}</Typography>
                </Box>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{status.name}</Typography>
                </Box>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{status.email}</Typography>
                </Box>
                <Box sx={{ minWidth: '45%' }}>
                  <Typography variant="body2" color="text.secondary">Submission Date</Typography>
                  <Typography variant="body1">{status.date}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </ThemeProvider>
    </>
  );
};

export default RegistrationStatus;