"use client";
import React from "react";
import { Box, Typography, Button, Container} from "@mui/material";
import { useRouter } from "next/navigation";
import { keyframes } from "@mui/system";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Chilanka } from "next/font/google";
import NoticeBoard from "../NoticeBoard/NoticeBoard";

// Configure the font properly
const chilanka = Chilanka({
  weight: "400",
  subsets: ["malayalam"],
  display: "swap",
});

// Enhanced animations
const fadeIn = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
  70% { box-shadow: 0 0 0 15px rgba(255, 77, 77, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
`;


const HeroSection = () => {
  const router = useRouter();
  return (
    <Box
      sx={{
        mt: { md: 8 },
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Premium Gradient Background */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, #a83271 0%, #4c0014 100%)",
          zIndex: -10,
        }}
      />

      {/* Abstract shapes */}
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,102,102,0.4) 0%, rgba(255,102,102,0) 70%)",
          zIndex: -5,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-15%",
          right: "-10%",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,102,102,0.3) 0%, rgba(255,102,102,0) 70%)",
          zIndex: -5,
        }}
      />

      {/* Decorative pattern overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/pattern-dots.png')",
          backgroundSize: "30px 30px",
          opacity: 0.1,
          zIndex: -3,
        }}
      />
     {/*Notice borad componet */}
      <NoticeBoard/>

      {/* Content container */}
      <Container maxWidth="md">
        <Box
          sx={{

            height:{xs:500,md:510,},
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: { xs: 2, md: 4 },
            py: { xs: 4, md: 6 },
            mt:{xs:15,md:10},
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          }}
        >
          {/* Club logo */}
          <Box
            component="img"
            src="/logo.png"
            alt="BKV Logo"
            sx={{
              width: { xs: 80, md: 120 },
              height: 'auto',
              mb: 4,
              animation: `${fadeIn} 1s ease-out`,
              filter: "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))"
            }}
          />

          {/* Title text */}
          <Typography
            variant="h2"
            className={chilanka.className}
            sx={{
              color: "white",
              fontWeight: "bold",
              textShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
              animation: `${fadeIn} 1.5s ease-out`,
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" },
              lineHeight: 1.4,
              letterSpacing: "0.02em",
              mb: 2,
              fontFamily: chilanka.style.fontFamily,
            }}
          >
            ഭഗത് സിംഗ് കലാവേദി വാഴക്കാട്
          </Typography>

          {/* Welcome text */}
          <Typography
            variant="h4"
            className={chilanka.className}
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              animation: `${fadeIn} 2s ease-out`,
              fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.8rem" },
              mb: 4,
              textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              fontFamily: chilanka.style.fontFamily,
            }}
          >
            സ്വാഗതം!
          </Typography>

          {/* Registration button */}
          <Button
            variant="contained"
            onClick={() => router.push("/member-registration")}
            sx={{
              animation: `${fadeIn} 2.5s ease-out`,
              bgcolor: "#ff4d4d",
              color: "white",
              fontSize: { xs: "0.9rem", md: "1.1rem" },
              fontWeight: "bold",
              py: { xs: 1.5, md: 2 },
              px: { xs: 4, md: 5 },
              borderRadius: "50px",
              textTransform: "none",
              boxShadow: "0 10px 15px -3px rgba(255, 77, 77, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#e60000",
                transform: "translateY(-3px)",
                boxShadow: "0 15px 20px -3px rgba(255, 77, 77, 0.4)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: "50px",
                animation: `${pulseGlow} 2s infinite`,
              }
            }}
            endIcon={<ArrowForwardIcon />}
          >
            Apply for Club Membership
          </Button>

          {/* Badge/tag line */}
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.7)",
              mt: 4,
              p: 1,
              borderRadius: "4px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: { xs: "0.7rem", md: "0.8rem" },
              background: "rgba(255, 255, 255, 0.05)",
              animation: `${fadeIn} 3s ease-out`,
            }}
          >
            Established since 1987
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;