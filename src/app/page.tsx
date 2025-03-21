"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  IconButton,
  Modal,
} from "@mui/material";
import { Element } from "react-scroll";
import About from "@/components/client/About/About";
import OurActivities from "@/components/client/OurActivities/OurActivities";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import CloseIcon from "@mui/icons-material/Close";
import PhoneIcon from "@mui/icons-material/Phone";
import HeroSection from "@/components/client/HeroSection/HeroSection";
import Navbar from "@/components/client/Navbar/Navbar";
import Footer from "@/components/client/Footer/Footer";

export default function Home() {
  const [contactOpen, setContactOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Add mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Early return during SSR to prevent hydration issues
  if (!mounted) {
    return null; // Return null on server-side to avoid hydration mismatch
  }

  return (
    <>
      <Box
        sx={{
          height: { md: "100%" },
          width: { md: "100%" },
        }}
      >
        <Navbar setContactOpen={setContactOpen} />

        <Element name="hero-section" >
          <HeroSection />
        </Element>

        <Element name="about">
          <About />
        </Element>

        <Element name="our-activities">
          <OurActivities />
        </Element>

        {/* Contact Popup Modal */}
        <Modal open={contactOpen} onClose={() => setContactOpen(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300,
              bgcolor: "white",
              boxShadow: 24,
              p: 3,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <IconButton
              onClick={() => setContactOpen(false)}
              sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              Contact Us
            </Typography>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <PhoneIcon sx={{ color: "green", mr: 1 }} />
              <Typography>9645501703</Typography>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <WhatsAppIcon sx={{ color: "green", mr: 1 }} />
              <Button href="https://wa.me/9645501703" target="_blank">
                WhatsApp
              </Button>
            </Box>
            <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
              <EmailIcon sx={{ color: "red", mr: 1 }} />
              <Button href="mailto:bagathsighkalavedi@gmail.com">
                bagathsighkalavedi
              </Button>
            </Box>
            <Box display="flex" alignItems="center">
              <FacebookIcon sx={{ color: "#3b5998", mr: 1 }} />
              <Button href="https://facebook.com/bkvpage" target="_blank">
                Facebook
              </Button>
            </Box>
          </Box>
        </Modal>
        <Footer />
      </Box>
    </>
  );
}