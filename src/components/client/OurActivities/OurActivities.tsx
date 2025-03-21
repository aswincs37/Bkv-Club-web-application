"use client"
import { useState, useEffect, SetStateAction, useRef } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Modal,
  IconButton, keyframes, useMediaQuery, useTheme,
  Container, Fade, Zoom, Chip, Avatar, Slider as MUISlider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

// Enhanced gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
`;

// Shine effect animation
const shineAnimation = keyframes`
  0% { left: -100%; }
  50%, 100% { left: 100%; }
`;

interface Photo {
  url?: string;
  thumbnailUrl?: string;
}

// Interface for activity data
interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  photos: {
    name: string;
    thumbnailUrl: string;
    url: string; // Adding full-size image URL
    uploadedAt: string;
  }[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const OurActivities = () => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const setLoading = useState<boolean>(true)[1];
  const setError = useState<string | null>(null)[1];
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Image zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Fetch activities from Firestore
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const activitiesQuery = query(
          collection(db, "activities"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(activitiesQuery);
        const activitiesData: Activity[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          activitiesData.push({
            id: doc.id,
            title: data.title || "No Title",
            description: data.description || "No Description",
            date: data.date || "",
            photos: (data.photos || []).map((photo: Photo) => ({
              ...photo,
              url: photo.url  // Make sure we have a full-size URL
            })),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          });
        });
        setActivities(activitiesData);

      } catch (err) {
        console.error("Error fetching activities: ", err);
        setError("Failed to load activities. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities().catch(err => {
      console.error("Unhandled promise rejection in fetchActivities:", err);
      setError("Failed to load activities. Please try again later.");
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (activity: typeof activities[number]) => {
    setSelectedActivity(activity);
    // Reset zoom and position when opening modal
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    setCurrentSlide(0);
  };

  const handleCloseModal = () => {
    setSelectedActivity(null);
  };

  // Image zoom and pan handlers
  const handleZoomIn = () => {
    if (zoomLevel < 3) {
      setZoomLevel(prev => prev + 0.5);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(1, prev - 0.5));
    } else {
      // Reset position when fully zoomed out
      setImagePosition({ x: 0, y: 0 });
    }
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomChange = (_event: Event, newValue: number | number[]) => {
    setZoomLevel(newValue as number);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      // Calculate bounds to prevent dragging image out of view
      const containerWidth = imageRef.current?.clientWidth || 0;
      const containerHeight = imageRef.current?.clientHeight || 0;
      const maxX = (containerWidth * (zoomLevel - 1)) / 2;
      const maxY = (containerHeight * (zoomLevel - 1)) / 2;

      // Bound the drag within limits
      const boundedX = Math.max(-maxX, Math.min(maxX, newX));
      const boundedY = Math.max(-maxY, Math.min(maxY, newY));

      setImagePosition({ x: boundedX, y: boundedY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - imagePosition.x,
        y: e.touches[0].clientY - imagePosition.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;

      // Calculate bounds to prevent dragging image out of view
      const containerWidth = imageRef.current?.clientWidth || 0;
      const containerHeight = imageRef.current?.clientHeight || 0;
      const maxX = (containerWidth * (zoomLevel - 1)) / 2;
      const maxY = (containerHeight * (zoomLevel - 1)) / 2;

      // Bound the drag within limits
      const boundedX = Math.max(-maxX, Math.min(maxX, newX));
      const boundedY = Math.max(-maxY, Math.min(maxY, newY));

      setImagePosition({ x: boundedX, y: boundedY });

      // Prevent page scrolling when dragging image
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Reset zoom and position when changing slides
  const handleAfterChange = (index: number) => {
    setCurrentSlide(index);
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  // Get dynamic slider settings for cards based on photo count
  const getCardSliderSettings = (photoCount: number) => {
    // Base settings for all scenarios
    const baseSettings = {
      dots: true,
      infinite: photoCount > 1, // Only make it infinite if we have multiple photos
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: photoCount > 1, // Only autoplay if there are multiple images
      autoplaySpeed: 3000,
      arrows: false,
      afterChange: (current: SetStateAction<number>) => setActiveIndex(current),
      customPaging: (i: number) => (
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
            transition: 'all 0.3s ease',
            margin: '0 2px',
          }}
        />
      ),
      dotsClass: "slick-dots custom-dots"
    };

    // If there's only one photo, hide the dots
    if (photoCount <= 1) {
      return {
        ...baseSettings,
        dots: false
      };
    }

    return baseSettings;
  };

  // Get dynamic slider settings for modal based on photo count
  const getModalSliderSettings = (photoCount: number) => {
    return {
      dots: photoCount > 1,
      infinite: photoCount > 1,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: false, // Disable autoplay for better user control with zoom
      arrows: photoCount > 1,
      pauseOnHover: true,
      fade: true,
      afterChange: handleAfterChange
    };
  };

  // Animate cards on scroll effect
  const [visible, setVisible] = useState(Array(activities.length).fill(false));

  useEffect(() => {
    const handleScroll = () => {
      const newVisible = [...visible];
      const cards = document.querySelectorAll('.activity-card');

      cards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.85) {
          newVisible[index] = true;
        }
      });

      setVisible(newVisible);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    setTimeout(handleScroll, 500);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [visible]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        // Premium background with rich gradient
        background: "linear-gradient(-45deg, #7f0000, #ff4d4d, #ffcccb, #ff1a1a)",
        backgroundSize: "300% 300%",
        animation: `${gradientAnimation} 15s ease infinite`,
        // Texture overlay for premium feel
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('/textures/noise.png')",
          backgroundRepeat: "repeat",
          opacity: 0.05,
          zIndex: 0,
        }
      }}
    >
      {/* Abstract decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "30vw",
          height: "30vw",
          maxWidth: "400px",
          maxHeight: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          right: "5%",
          width: "25vw",
          height: "25vw",
          maxWidth: "350px",
          maxHeight: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
          filter: "blur(30px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8 }, mt: -4 }}>
        {/* Section Title with enhanced typography */}
        <Fade in={true} timeout={1000}>
          <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                letterSpacing: "1px",
                mb: 2,
              }}
            >
              Our Activities
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: { xs: "16px", md: "18px" },
                maxWidth: "800px",
                mx: "auto",
                letterSpacing: "0.5px",
              }}
            >
              Explore the diverse range of events and initiatives organized by BKV to promote culture, sports, and community welfare
            </Typography>
          </Box>
        </Fade>

        {/* Grid Container for Cards with enhanced styling */}
        <Grid container spacing={4} sx={{ maxWidth: "1300px", width: "100%" }}>
          {activities.map((activity, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} className="activity-card">
              <Zoom in={visible[index]} style={{ transitionDelay: `${index * 150}ms` }}>
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: "hidden",
                    height: "100%",
                    cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    boxShadow: "0 13px 27px -5px rgba(50,50,93,0.25), 0 8px 16px -8px rgba(0,0,0,0.3)",
                    transform: visible[index] ? "translateY(0)" : "translateY(50px)",
                    opacity: visible[index] ? 1 : 0,
                    "&:hover": {
                      transform: "translateY(-15px)",
                      boxShadow: "0 30px 60px -12px rgba(50,50,93,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)",
                      "& .card-overlay": {
                        opacity: 0.2,
                      },
                      "& .card-content": {
                        transform: "translateY(-10px)",
                      },
                      "& .shine": {
                        opacity: 1,
                      }
                    },
                    position: "relative",
                  }}
                  onClick={() => handleOpenModal(activity)}
                >
                  {/* Shine effect on hover */}
                  <Box
                    className="shine"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "60%",
                      height: "100%",
                      background: "linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)",
                      transform: "skewX(-25deg)",
                      zIndex: 2,
                      opacity: 0,
                      transition: "opacity 0.1s ease",
                      "&:hover": {
                        animation: `${shineAnimation} 1s ease`,
                      }
                    }}
                  />

                  {/* Single photo or carousel based on photo count */}
                  <Box sx={{ position: "relative" }}>
                    {activity.photos.length === 1 ? (
                      // Single photo display
                      <Box sx={{ position: "relative", height: { xs: 180, sm: 200, md: 220 } }}>
                        <img
                          src={activity.photos[0].url || activity.photos[0].url}
                          alt={activity.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                        <Box
                          className="card-overlay"
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
                            opacity: 0.6,
                            transition: "opacity 0.3s ease",
                          }}
                        />
                      </Box>
                    ) : (
                      // Multiple photos carousel
                      <Slider {...getCardSliderSettings(activity.photos.length)}>
                        {activity.photos.map((img, idx) => (
                          <Box key={idx} sx={{ position: "relative", height: { xs: 180, sm: 200, md: 220 } }}>
                            <img
                              src={img.url || img.url}
                              alt={activity.title}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover"
                              }}
                            />
                            <Box
                              className="card-overlay"
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
                                opacity: 0.6,
                                transition: "opacity 0.3s ease",
                              }}
                            />
                          </Box>
                        ))}
                      </Slider>
                    )}

                    {/* Year chip positioned on image */}
                    <Chip
                      avatar={<Avatar sx={{ bgcolor: "transparent" }}><CalendarTodayIcon fontSize="small" /></Avatar>}
                      label={activity.date}
                      sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        backgroundColor: "rgba(255,255,255,0.85)",
                        backdropFilter: "blur(5px)",
                        fontWeight: 500,
                        zIndex: 1,
                        border: "1px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                  </Box>

                  <CardContent className="card-content" sx={{
                    transition: "transform 0.3s ease",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
                    backdropFilter: "blur(10px)",
                  }}>
                    <Typography variant="h6" sx={{
                      fontWeight: "bold",
                      mb: 0.5,
                      background: "linear-gradient(45deg, #7f0000, #ff1a1a)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      {activity.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        lineHeight: 1.6,
                      }}
                    >
                      {activity.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Enhanced Modal for Full Details with Zoom Functionality */}
      <Modal
        open={!!selectedActivity}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
        }}
      >
        <Fade in={!!selectedActivity}>
          <Box
            sx={{
              position: "relative",
              bgcolor: "white",
              borderRadius: 4,
              maxWidth: { xs: "95vw", sm: "90vw", md: "90vw" },
              maxHeight: "90vh",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {/* Close button */}
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: 15,
                right: 15,
                bgcolor: "rgba(255,255,255,0.7)",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                }
              }}
            >
              <CloseIcon />
            </IconButton>

            {selectedActivity && (
              <>
                {/* Left side: Full-screen Image Display with Zoom Controls */}
                <Box sx={{
                  width: { xs: "100%", md: "60%" },
                  position: "relative",
                  overflow: "hidden",
                  bgcolor: "#f0f0f0",
                }}>
                  {/* Zoom controls */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 15,
                      left: 15,
                      zIndex: 5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      bgcolor: "rgba(255,255,255,0.7)",
                      borderRadius: 2,
                      p: 0.5,
                    }}
                  >
                    <IconButton size="small" onClick={handleZoomIn}>
                      <ZoomInIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleZoomOut}>
                      <ZoomOutIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleZoomReset}>
                      <RestartAltIcon />
                    </IconButton>
                  </Box>

                  {/* Zoom slider */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 15,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "60%",
                      zIndex: 5,
                      bgcolor: "rgba(255,255,255,0.7)",
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ZoomOutIcon sx={{ fontSize: 18, mr: 1 }} />
                    <MUISlider
                      value={zoomLevel}
                      min={1}
                      max={3}
                      step={0.1}
                      onChange={handleZoomChange}
                      aria-labelledby="zoom-slider"
                      sx={{ mx: 1 }}
                    />
                    <ZoomInIcon sx={{ fontSize: 18, ml: 1 }} />
                  </Box>

                  {selectedActivity.photos.length === 1 ? (
                    // Single image display with zoom & pan
                    <Box
                      ref={imageRef}
                      sx={{
                        position: "relative",
                        height: { xs: 300, md: 600 },
                        overflow: "hidden",
                        cursor: zoomLevel > 1 ? "grab" : "default",
                        "&:active": {
                          cursor: zoomLevel > 1 ? "grabbing" : "default",
                        }
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: "100%",
                          height: "100%",
                          transform: `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`,
                          transition: isDragging ? "none" : "transform 0.2s ease-out",
                        }}
                      >
                        <img
                          src={selectedActivity.photos[0].url}
                          alt={selectedActivity.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain"
                          }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    // Multiple images slider with zoom & pan
                    <Box>
                      <Slider {...getModalSliderSettings(selectedActivity.photos.length)}>
                        {selectedActivity.photos.map((img, index) => (
                          <Box
                            key={index}
                            ref={index === currentSlide ? imageRef : null}
                            sx={{
                              position: "relative",
                              height: { xs: 300, md: 600 },
                              overflow: "hidden",
                              cursor: zoomLevel > 1 ? "grab" : "default",
                              "&:active": {
                                cursor: zoomLevel > 1 ? "grabbing" : "default",
                              }
                            }}
                            onMouseDown={index === currentSlide ? handleMouseDown : undefined}
                            onMouseMove={index === currentSlide ? handleMouseMove : undefined}
                            onMouseUp={index === currentSlide ? handleMouseUp : undefined}
                            onMouseLeave={index === currentSlide ? handleMouseUp : undefined}
                            onTouchStart={index === currentSlide ? handleTouchStart : undefined}
                            onTouchMove={index === currentSlide ? handleTouchMove : undefined}
                            onTouchEnd={index === currentSlide ? handleTouchEnd : undefined}
                          >
                            <Box
                              sx={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: "100%",
                                height: "100%",
                                transform: index === currentSlide
                                  ? `translate(-50%, -50%) translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${zoomLevel})`
                                  : "translate(-50%, -50%) scale(1)",
                                transition: isDragging ? "none" : "transform 0.2s ease-out",
                              }}
                            >
                              <img
                                src={img.url}
                                alt={selectedActivity.title}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain"
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Slider>
                    </Box>
                  )}
                </Box>

                {/* Right side: Content */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "40%" },
                    p: { xs: 3, md: 4 },
                    display: "flex",
                    flexDirection: "column",
                    overflow: "auto",
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, color: "#1a1a1a" }}>
                    {selectedActivity.title}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                    <Chip
                      icon={<CalendarTodayIcon />}
                      label={`Year: ${selectedActivity.date}`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: "#333333" }}>
                    Event Description
                  </Typography>

                  <Typography variant="body1" sx={{
                    color: "#555555",
                    fontSize: "16px",
                    lineHeight: 1.8,
                    mb: 4
                  }}>
                    {selectedActivity.description}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default OurActivities;