"use client"
import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Modal,
  IconButton,
  keyframes,
  useMediaQuery,
  useTheme,
  Button,
  Stack,
  Container,
  Fade,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Enhanced gradient animation with more premium colors
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Subtle shine animation for cards
const shineAnimation = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 200% 0; }
`;

const About = () => {
  const images = [
    "/about-images/bkv-1.jpg",
    "/about-images/bkv-2.jpg",
    "/about-images/bkv-2.jpg",
    "/about-images/bkv-1.jpg",
  ];

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const handleOpenImage = (src: string) => setSelectedImage(src);

  const handleCloseImage = () => setSelectedImage(null);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        // Premium gradient background with richer colors
        background: "linear-gradient(-45deg, #3a1c71, #d76d77, #ffaf7b, #5e60ce)",
        backgroundSize: "400% 400%",
        animation: `${gradientAnimation} 15s ease infinite`,
        // Add texture overlay for premium feel
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/textures/subtle-pattern.png')",
          backgroundRepeat: "repeat",
          opacity: 0.05,
          zIndex: 0,
        },
      }}
    >
      {/* Abstract shapes for visual interest */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          filter: "blur(35px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 10 } }}>
        {/* Section Title with enhanced typography */}
        <Fade in={true} timeout={1000}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "white",
              mb: 6,
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
              letterSpacing: "0.5px",
              background: "linear-gradient(90deg, #ffffff, #f0f0f0)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            About Bhagathsingh Kalavedhi Vazhakkad
          </Typography>
        </Fade>

        {/* Content Wrapper with enhanced spacing */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 6, md: 8 },
            mb: 6,
          }}
        >
          {/* Left: Grid of Images with improved styling */}
          <Grid container spacing={3} sx={{ width: { xs: "100%", md: "50%" } }}>
            {images.map((src, index) => (
              <Grid item xs={6} key={index}>
                <Fade in={true} timeout={(index + 1) * 500}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.4s ease",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "200%",
                        height: "100%",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                        transform: "skewX(-30deg)",
                        animation: `${shineAnimation} 3s infinite linear`,
                        zIndex: 1,
                      },
                      "&:hover": {
                        transform: "translateY(-10px) scale(1.03)",
                        boxShadow: "0 15px 30px rgba(0,0,0,0.25)",
                      },
                    }}
                    onClick={() => handleOpenImage(src)}
                  >
                    <CardMedia
                      component="img"
                      image={src}
                      alt={`BKV Image ${index + 1}`}
                      sx={{
                        width: "100%",
                        height: "auto",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        transition: "transform 0.8s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    />
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>

          {/* Right: About Content with glass morphism effect */}
          <Box
            sx={{
              width: { xs: "100%", md: "50%" },
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: 4,
              p: { xs: 3, md: 5 },
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "white",
                fontSize: { xs: "17px", md: "19px" },
                lineHeight: 1.8,
                mb: 4,
                fontWeight: 300,
                letterSpacing: "0.3px",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Bhagat Singh Kalavedhi Vazhakkad (BKV) was established in <span style={{ fontWeight: 600 }}>1987</span> with the vision of promoting
              cultural and social activities. Every year, we conduct numerous <span style={{ fontWeight: 600 }}>social programs</span> and celebrate
              our <span style={{ fontWeight: 600 }}>club anniversary</span> with grand events that last for <span style={{ fontWeight: 600 }}>2 to 3 days</span>. Our mission is to create
              a space where <span style={{ fontWeight: 600 }}>art, culture, and community</span> thrive together.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "white",
                fontSize: { xs: "17px", md: "19px" },
                lineHeight: 1.8,
                fontWeight: 300,
                letterSpacing: "0.3px",
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              For over three decades, we have been at the forefront of cultural enrichment, bringing together talented individuals and creating memorable experiences for our community.
            </Typography>
          </Box>
        </Box>

        {/* Call to action button with better styling */}
        <Fade in={true} timeout={2000}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              spacing={2}
              sx={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                p: 3,
                borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 500,
                  textShadow: "1px 1px 2px rgba(0,0,0,0.2)"
                }}
              >
                To know more about us...
              </Typography>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: "30px",
                  px: 4,
                  py: 1.5,
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  background: "linear-gradient(90deg, #3a1c71, #d76d77)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #3a1c71, #d76d77)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 7px 15px rgba(0,0,0,0.3)",
                  },
                  transition: "all 0.3s ease",
                }}
                //onClick={() => router.push("/our-history")}
              >
                Our History
              </Button>
            </Stack>
          </Box>
        </Fade>
      </Container>

      {/* Enhanced Modal for Image */}
      <Modal
        open={!!selectedImage}
        onClose={handleCloseImage}
        closeAfterTransition
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(5px)",
        }}
      >
        <Fade in={!!selectedImage}>
          <Box
            sx={{
              position: "relative",
              bgcolor: "rgba(0,0,0,0.8)",
              boxShadow: 24,
              p: 2,
              borderRadius: 3,
              maxWidth: "90vw",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <IconButton
              onClick={handleCloseImage}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                zIndex: 2,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedImage && (
  <img
    src={selectedImage}
    alt="Selected BKV"
    style={{
      maxWidth: "100%",
      maxHeight: "80vh",
      borderRadius: 8,
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    }}
  />
)}

          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default About;