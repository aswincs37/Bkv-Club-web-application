"use client"
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import { ThemeProvider, createTheme, } from '@mui/material/styles';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  AdminPanelSettings,
  ErrorOutline
} from '@mui/icons-material';

import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebaseConfig';
import { FirebaseError } from 'firebase/app';

// Assuming firebase is initialized elsewhere in your app
// If not, you'll need to add the initialization code

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();


  const adminTheme = createTheme({
    palette: {
      primary: {
        main: '#3a36e0',
        dark: '#2a26d3',
        light: '#6f6ce8',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: '#f7f8fc',
      },
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '12px 24px',
            boxShadow: '0 4px 14px 0 rgba(58, 54, 224, 0.25)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3a36e0',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#3a36e0',
                borderWidth: 2,
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#3a36e0',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password); // Use initialized auth instance

      // On successful login
      router.push("/admin-home");
    } catch (err) {
      if (err instanceof FirebaseError) {   // Use FirebaseError for type safety
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
          setError("Invalid email or password");
        } else if (err.code === "auth/too-many-requests") {
          setError("Too many failed login attempts. Please try again later.");
        } else {
          setError("Invalid email or password");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
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
            <Link href="/" className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition duration-300 flex items-center">
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
            </Link>
          </div>
        </div>
      </div>
      <ThemeProvider theme={adminTheme}>
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: 4,
            pt: -3
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={4}
              sx={{
                p: { xs: 3, sm: 5 },
                overflow: 'hidden',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 64,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <AdminPanelSettings fontSize="large" />
                </Box>

                <Typography
                  variant="h4"
                  component="h1"
                  align="center"
                  sx={{ mb: 1, color: 'primary.main' }}
                >
                  Admin Portal
                </Typography>

                <Typography
                  variant="body1"
                  align="center"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Login to access your administrative dashboard
                </Typography>
              </Box>

              {error && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    backgroundColor: 'error.light',
                    color: 'white',
                    p: 2,
                    borderRadius: 2,
                    mb: 3,
                  }}
                >
                  <ErrorOutline fontSize="small" />
                  <Typography variant="body2">{error}</Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Email Address"
                  placeholder="admin@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoFocus
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  variant="outlined"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                      boxShadow: '0 6px 20px rgba(58, 54, 224, 0.3)',
                    },
                  }}
                  startIcon={loading ? undefined : <LockOutlined />}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Forgot your password? Please contact your system administrator.
                  </Typography>
                </Box>
              </Box>
            </Paper>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Bhagathsingh Kalavedhi Vazhakkad. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>
      </ThemeProvider></>
  );
};

export default AdminLoginPage;