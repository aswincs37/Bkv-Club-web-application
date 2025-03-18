"use client";
import React, { useState, MouseEvent, KeyboardEvent } from "react";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  Fade,
  useScrollTrigger,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Link } from "react-scroll";
import { useRouter } from "next/navigation";

interface NavbarProps {
  setContactOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setContactOpen }) => {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const toggleDrawer =
    (open: boolean) =>
    (event: MouseEvent<HTMLButtonElement | HTMLDivElement> | KeyboardEvent) => {
      if ("key" in event && (event.key === "Tab" || event.key === "Shift")) {
        return;
      }
      setDrawerOpen(open);
    };

  const handleSetActive = (to: string) => {
    console.log("Activated section:", to);
    setActiveLink(to);
  };

  const handleLinkClick = (to: string) => {
    setActiveLink(to); // Manually update the active link
    setDrawerOpen(false); // Close drawer after selection
  };

  const handleContactClick = () => {
    setContactOpen(true);
    setDrawerOpen(false);
  };

  const handleRegistrationStatus = () => {
    router.push("/registration-status");
    setDrawerOpen(false);
  };

  const handleAdminLogin = () => {
    router.push("/admin-login");
  };

  const navLinks = [
    { text: "Home", to: "hero-section" },
    { text: "About", to: "about" },
    { text: "Our Activities", to: "our-activities" },
    { text: "Registration Status", to: "registration-status", isExternalLink: true },
    { text: "Contact Us", to: "contact" },
  ];

  return (
    <AppBar
      position="fixed"
      sx={{
        background: trigger
          ? "rgba(255, 255, 255, 0.95)"
          : "rgba(255, 255, 255, 0.8)",
        boxShadow: trigger ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
        backdropFilter: "blur(10px)",
        borderBottom: trigger ? "none" : "1px solid rgba(0,0,0,0.1)",
        transition: "all 0.3s ease",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
        {/* Logo */}
        <Fade in={true} timeout={1000}>
          <Box display="flex" alignItems="center">
            <Link
              to="hero-section"
              smooth
              duration={500}
              style={{
                cursor: "pointer",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Image
                src="/logo.png"
                alt="BKV Logo"
                width={50}
                height={50}
                style={{
                  objectFit: "contain",
                  transition: "transform 0.3s ease",
                  transform: trigger ? "scale(0.9)" : "scale(1)",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  ml: 1,
                  color: "black",
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  transition: "all 0.3s ease",
                  borderBottom: "2px solid transparent",
                }}
              >
                <div className="flex flex-col">
                  <span className="text-Black font-bold text-lg md:text-xl">BHAGATH SINGH KALAVEDHÍ VAZHAKKAD (BKV) </span>
                </div>
              </Typography>
            </Link>
          </Box>
        </Fade>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
          {navLinks.map((link) => {
            if (link.text === "Contact Us") {
              return (
                <Button
                  key={link.text}
                  sx={{
                    color: "black",
                    fontSize: "1rem",
                    textTransform: "capitalize",
                    position: "relative",
                    "&:hover": {
                      color: "#007BFF",
                      "&::after": {
                        width: "100%",
                        left: "0",
                      },
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "0",
                      height: "2px",
                      bottom: "0",
                      right: "0",
                      background: "#007BFF",
                      transition: "width 0.3s ease",
                    },
                  }}
                  onClick={handleContactClick}
                >
                  {link.text}
                </Button>
              );
            } else if (link.text === "Registration Status") {
              return (
                <Button
                  key={link.text}
                  sx={{
                    color: "black",
                    fontSize: "1rem",
                    textTransform: "capitalize",
                    position: "relative",
                    "&:hover": {
                      color: "#007BFF",
                      "&::after": {
                        width: "100%",
                        left: "0",
                      },
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      width: "0",
                      height: "2px",
                      bottom: "0",
                      right: "0",
                      background: "#007BFF",
                      transition: "width 0.3s ease",
                    },
                  }}
                  onClick={handleRegistrationStatus}
                >
                  {link.text}
                </Button>
              );
            } else {
              return (
                <Link
                  key={link.text}
                  to={link.to}
                  smooth
                  duration={500}
                  spy
                  offset={-100}
                  onSetActive={handleSetActive}
                >
                  <Button
                    sx={{
                      color: activeLink === link.to ? "#007BFF" : "black",
                      fontSize: "1rem",
                      textTransform: "capitalize",
                      position: "relative",
                      "&:hover": {
                        color: "#007BFF",
                        "&::after": {
                          width: "100%",
                          left: "0",
                        },
                      },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: activeLink === link.to ? "100%" : "0",
                        height: "2px",
                        bottom: "0",
                        right: "0",
                        background: "#007BFF",
                        transition: "width 0.3s ease",
                      },
                    }}
                    component="span"
                  >
                    {link.text}
                  </Button>
                </Link>
              );
            }
          })}
          {/* Admin Login Button */}
          <Button
            sx={{
              backgroundColor: "red",
              color: "white",
              fontSize: "1rem",
              textTransform: "capitalize",
              "&:hover": {
                backgroundColor: "darkred",
              },
            }}
            onClick={handleAdminLogin}
          >
            Admin Login
          </Button>
        </Box>

        {/* Mobile Menu Button */}
        <IconButton
          sx={{
            display: { xs: "flex", md: "none" },
            color: "black",
            background: "rgba(0,0,0,0.05)",
            "&:hover": {
              background: "rgba(0,0,0,0.1)",
            },
          }}
          onClick={toggleDrawer(true)}
        >
          <MenuIcon fontSize="medium" />
        </IconButton>

        {/* Mobile Drawer Menu */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          sx={{
            "& .MuiDrawer-paper": {
              borderRadius: "16px 0 0 16px",
              boxShadow: "-5px 0 15px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Box
            sx={{
              width: 280,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              height: "100%",
            }}
          >
            {/* Close Button */}
            <IconButton
              sx={{
                alignSelf: "flex-end",
                color: "black",
                background: "rgba(0,0,0,0.05)",
                "&:hover": {
                  background: "rgba(0,0,0,0.1)",
                },
              }}
              onClick={toggleDrawer(false)}
            >
              <CloseIcon />
            </IconButton>

            <Box sx={{ mt: 4, mb: 2, textAlign: "center" }}>
              <Image
                src="/logo.png"
                alt="BKV Logo"
                width={60}
                height={60}
                style={{ objectFit: "contain" }}
              />
              <Typography
                variant="h6"
                sx={{
                  mt: 1,
                  color: "black",
                  fontWeight: "bold",
                }}
              >
                BKV
              </Typography>
            </Box>

            <List sx={{ width: "100%", textAlign: "center", mt: 2 }}>
              {navLinks.map((link) => {
                if (link.text === "Contact Us") {
                  return (
                    <ListItem
                      key={link.text}
                      sx={{
                        justifyContent: "center",
                        mb: 1,
                        borderRadius: "8px",
                        transition: "background 0.3s ease",
                        background: "transparent",
                        "&:hover": {
                          background: "rgba(0, 123, 255, 0.05)",
                        },
                      }}
                    >
                      <Button
                        sx={{
                          color: "black",
                          fontSize: "1.1rem",
                          textTransform: "capitalize",
                          width: "100%",
                          py: 1,
                          "&:hover": { color: "#007BFF" },
                        }}
                        onClick={handleContactClick}
                      >
                        {link.text}
                      </Button>
                    </ListItem>
                  );
                } else if (link.text === "Registration Status") {
                  return (
                    <ListItem
                      key={link.text}
                      sx={{
                        justifyContent: "center",
                        mb: 1,
                        borderRadius: "8px",
                        transition: "background 0.3s ease",
                        background: "transparent",
                        "&:hover": {
                          background: "rgba(0, 123, 255, 0.05)",
                        },
                      }}
                    >
                      <Button
                        sx={{
                          color: "black",
                          fontSize: "1.1rem",
                          textTransform: "capitalize",
                          width: "100%",
                          py: 1,
                          "&:hover": { color: "#007BFF" },
                        }}
                        onClick={handleRegistrationStatus}
                      >
                        {link.text}
                      </Button>
                    </ListItem>
                  );
                } else {
                  return (
                    <ListItem
                      key={link.text}
                      sx={{
                        justifyContent: "center",
                        mb: 1,
                        borderRadius: "8px",
                        transition: "background 0.3s ease",
                        background:
                          activeLink === link.to
                            ? "rgba(0, 123, 255, 0.1)"
                            : "transparent",
                        "&:hover": {
                          background: "rgba(0, 123, 255, 0.05)",
                        },
                      }}
                    >
                      <Link
                        to={link.to}
                        smooth
                        duration={500}
                        spy
                        offset={-80}
                        onClick={() => handleLinkClick(link.to)}
                      >
                        <Button
                          sx={{
                            color: activeLink === link.to ? "#007BFF" : "black",
                            fontSize: "1.1rem",
                            fontWeight:
                              activeLink === link.to ? "medium" : "normal",
                            textTransform: "capitalize",
                            width: "100%",
                            py: 1,
                            "&:hover": { color: "#007BFF" },
                          }}
                          component="span"
                        >
                          {link.text}
                        </Button>
                      </Link>
                    </ListItem>
                  );
                }
              })}
              <ListItem sx={{ justifyContent: "center" }}>
                <Button
                  sx={{
                    backgroundColor: "red",
                    color: "white",
                    fontSize: "1.1rem",
                    textTransform: "capitalize",
                    width: "100%",
                    "&:hover": { backgroundColor: "darkred" },
                  }}
                  onClick={handleAdminLogin}
                >
                  Admin Login
                </Button>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;