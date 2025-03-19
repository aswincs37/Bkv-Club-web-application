"use client";
import React from 'react';
import { Box, Typography, Container, Grid, IconButton, Divider, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        backgroundColor: "#f8f9fa",
        boxShadow: "0px -4px 10px rgba(0, 0, 0, 0.05)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #007BFF, #00c6ff)",
        },
      }}
    >
      {/* Main Footer Content */}
      <Container maxWidth="lg">
        <Grid
          container
          spacing={3}
          sx={{
            py: { xs: 4, md: 6 },
            textAlign: { xs: "center", md: "left" }
          }}
        >
          {/* Organization Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                color: "#333"
              }}
            >
              Bhagath Singh Kalavedhi
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: "text.secondary",
                maxWidth: { xs: "100%", md: "90%" },
                mx: { xs: "auto", md: 0 }
              }}
            >
              Promoting arts, culture and literature while fostering community development and social awareness.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                justifyContent: { xs: "center", md: "flex-start" },
                mb: { xs: 3, md: 0 }
              }}
            >
              <IconButton
                size="small"
                aria-label="facebook"
                sx={{
                  color: "#1877F2",
                  backgroundColor: "rgba(24, 119, 242, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(24, 119, 242, 0.2)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="instagram"
                sx={{
                  color: "#E1306C",
                  backgroundColor: "rgba(225, 48, 108, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(225, 48, 108, 0.2)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="youtube"
                sx={{
                  color: "#FF0000",
                  backgroundColor: "rgba(255, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 0, 0, 0.2)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <YouTubeIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                aria-label="whatsapp"
                sx={{
                  color: "#25D366",
                  backgroundColor: "rgba(37, 211, 102, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(37, 211, 102, 0.2)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <WhatsAppIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}


<Grid item xs={12} sm={6} md={4}>
  <Typography
    variant="h6"
    sx={{
      fontWeight: 700,
      mb: 2,
      fontSize: { xs: '1.1rem', md: '1.25rem' },
      color: "#333"
    }}
  >
    Quick Links
  </Typography>

  <Grid container spacing={1}>
    {/* Use an array with paths */}
    {[
      { label: 'Home', path: '/' },
      { label: 'Member Registration', path: '/member-registration' },
      { label: 'Registration Status', path: '/registration-status' }
    ].map((link) => (
      <Grid item xs={isMobile ? 6 : (isTablet ? 6 : 12)} key={link.label}>

        {/* Next.js Link for navigation */}
        <Link href={link.path} passHref>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#007BFF",
                paddingLeft: "4px"
              },
              display: "inline-block",
              textDecoration: "none",
              cursor: "pointer"
            }}
          >
            {link.label}
          </Typography>
        </Link>

      </Grid>
    ))}
  </Grid>
</Grid>


          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={4}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                color: "#333"
              }}
            >
              Contact Us
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                alignItems: { xs: "center", md: "flex-start" }
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <LocationOnIcon
                  fontSize="small"
                  sx={{ color: "#007BFF" }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  Vazhakkad,Vaikom,Kottayan, Kerala-686607
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <EmailIcon
                  fontSize="small"
                  sx={{ color: "#007BFF" }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                 bhagathsinghkalavedi@gmail.com
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1
                }}
              >
                <PhoneIcon
                  fontSize="small"
                  sx={{ color: "#007BFF" }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary" }}
                >
                  +91 9645501703
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Copyright Section */}
      <Divider sx={{ opacity: 0.6 }} />
      <Container maxWidth="lg">
        <Box
          sx={{
            py: 2.5,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            }}
          >
            &copy; {currentYear} Bhagath Singh Kalavedhi Vazhakkad. All Rights Reserved.
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.75rem", sm: "0.875rem" }
            }}
          >
            <Link
              href="#"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                marginRight: '12px'
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              style={{
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              Terms of Service
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;