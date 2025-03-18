"use client"
import { useState, useEffect, SetStateAction } from "react";
import {
  Box, Typography, Grid, Card, CardContent, Modal,
  IconButton, keyframes, useMediaQuery, useTheme,
  Button, Container, Fade, Zoom, Chip, Avatar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from "next/navigation";

// Enhanced gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
`;

// Floating animation for cards
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Shine effect animation
const shineAnimation = keyframes`
  0% { left: -100%; }
  50%, 100% { left: 100%; }
`;

// Activity data with multiple images
const activities = [
  {
    images: ["/about-images/bkv-1.jpg", "/about-images/bkv-2.jpg", "/about-images/bkv-3.jpg"],
    title: "Cultural Festival",
    subtitle: "Celebrating Arts & Traditions",
    year: "2023",
    participants: "500+",
    description: "A grand festival celebrating art, music, and dance. Featuring talented artists from all around. This event brings together various performers from different regions, giving them a platform to showcase their skills. With live music, drama, and dance performances, the festival aims to promote cultural diversity and unity among communities. The event also includes food stalls, traditional arts and crafts exhibitions, and interactive sessions with renowned artists."
  },
  {
    images: ["/about-images/bkv-4.jpg", "/about-images/bkv-5.jpg", "/about-images/bkv-6.jpg"],
    title: "Annual Sports Meet",
    subtitle: "Promoting Athletic Excellence",
    year: "2023",
    participants: "300+",
    description: "Encouraging youth participation in various sports and games to promote a healthy lifestyle. The event includes running races, football tournaments, badminton, and relay races. We also conduct motivational sessions by professional athletes who share their journey to success. Every year, we witness an increase in participation, which is a testament to the growing enthusiasm for sports in our community."
  },
  {
    images: ["/about-images/bkv-7.jpg", "/about-images/bkv-8.jpg", "/about-images/bkv-9.jpg"],
    title: "Community Service",
    subtitle: "Giving Back to Society",
    year: "2023",
    participants: "200+",
    description: "Organizing charity events, blood donation camps, and volunteering activities for social good. Our community service programs aim to uplift the underprivileged and create awareness about important social issues. Activities include free health check-up camps, educational support for children, and environmental conservation initiatives such as tree plantation drives."
  },
  {
    images: ["/about-images/bkv-1.jpg", "/about-images/bkv-2.jpg", "/about-images/bkv-3.jpg"],
    title: "Art Exhibition",
    subtitle: "Showcasing Local Talent",
    year: "2022",
    participants: "150+",
    description: "A grand festival celebrating art, music, and dance. Featuring talented artists from all around. This event brings together various performers from different regions, giving them a platform to showcase their skills. With live music, drama, and dance performances, the festival aims to promote cultural diversity and unity among communities. The event also includes food stalls, traditional arts and crafts exhibitions, and interactive sessions with renowned artists."
  },
  {
    images: ["/about-images/bkv-4.jpg", "/about-images/bkv-5.jpg", "/about-images/bkv-6.jpg"],
    title: "Youth Conference",
    subtitle: "Shaping Tomorrow's Leaders",
    year: "2022",
    participants: "250+",
    description: "Encouraging youth participation in various sports and games to promote a healthy lifestyle. The event includes running races, football tournaments, badminton, and relay races. We also conduct motivational sessions by professional athletes who share their journey to success. Every year, we witness an increase in participation, which is a testament to the growing enthusiasm for sports in our community."
  },
  {
    images: ["/about-images/bkv-7.jpg", "/about-images/bkv-8.jpg", "/about-images/bkv-9.jpg"],
    title: "Charity Fundraiser",
    subtitle: "Supporting Local Causes",
    year: "2022",
    participants: "400+",
    description: "Organizing charity events, blood donation camps, and volunteering activities for social good. Our community service programs aim to uplift the underprivileged and create awareness about important social issues. Activities include free health check-up camps, educational support for children, and environmental conservation initiatives such as tree plantation drives."
  }
];

const OurActivities = () => {
  const router = useRouter();
  const [selectedActivity, setSelectedActivity] = useState<null | typeof activities[number]>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const handleOpenModal = (activity: typeof activities[number]) => {
    setSelectedActivity(activity);
  };


  const handleCloseModal = () => {
    setSelectedActivity(null);
  };

  // Enhanced slider settings for cards with responsive options
  const cardSliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
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

  // Enhanced slider settings for modal
  const modalSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    pauseOnHover: true,
    fade: true
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

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8 } }}>
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

                  {/* Enhanced mini-carousel inside each card */}
                  <Box sx={{ position: "relative" }}>
                    <Slider {...cardSliderSettings}>
                      {activity.images.map((img, idx) => (
                        <Box key={idx} sx={{ position: "relative", height: { xs: 180, sm: 200, md: 220 } }}>
                          <img
                            src={img}
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

                    {/* Year chip positioned on image */}
                    <Chip
                     avatar={<Avatar sx={{ bgcolor: "transparent" }}><CalendarTodayIcon fontSize="small" /></Avatar>}
                     label={activity.year}
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

                   {/* Participants chip positioned on image */}
                   <Chip
                     avatar={<Avatar sx={{ bgcolor: "transparent" }}><PeopleAltIcon fontSize="small" /></Avatar>}
                     label={activity.participants}
                     sx={{
                       position: "absolute",
                       bottom: 10,
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

                   <Typography variant="body2" sx={{
                     color: "text.secondary",
                     mb: 1.5,
                     fontStyle: "italic"
                   }}>
                     {activity.subtitle}
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

       {/* Enhanced View More Button */}
       <Fade in={true} timeout={2000}>
         <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
           <Button
             variant="contained"
             endIcon={<ArrowForwardIcon />}
             sx={{
               px: 4,
               py: 1.5,
               fontSize: "16px",
               fontWeight: "bold",
               borderRadius: "30px",
               background: "rgba(255,255,255,0.2)",
               backdropFilter: "blur(10px)",
               color: "white",
               border: "1px solid rgba(255,255,255,0.3)",
               textTransform: "none",
               transition: "all 0.3s ease",
               boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
               "&:hover": {
                 background: "rgba(255,255,255,0.3)",
                 transform: "translateY(-5px)",
                 boxShadow: "0 15px 30px rgba(0,0,0,0.2)",
               }
             }}
             onClick={() => router.push("/our-activities")}
           >
             Explore All Activities
           </Button>
         </Box>
       </Fade>
     </Container>

     {/* Enhanced Modal for Full Details */}
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
             maxWidth: { xs: "95vw", sm: "90vw", md: "80vw" },
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
               {/* Left side: Full-screen Image Slider */}
               <Box sx={{
                 width: { xs: "100%", md: "55%" },
                 position: "relative",
                 overflow: "hidden",
               }}>
                 <Slider {...modalSliderSettings}>
                   {selectedActivity.images.map((img, index) => (
                     <Box key={index} sx={{ position: "relative" }}>
                       <img
                         src={img}
                         alt={selectedActivity.title}
                         style={{
                           width: "100%",
                           height: isMobile ? "250px" : "500px",
                           objectFit: "cover",
                         }}
                       />
                     </Box>
                   ))}
                 </Slider>
               </Box>

               {/* Right side: Content */}
               <Box
                 sx={{
                   width: { xs: "100%", md: "45%" },
                   p: { xs: 3, md: 4 },
                   display: "flex",
                   flexDirection: "column",
                   overflow: "auto",
                 }}
               >
                 <Typography variant="overline" sx={{ color: "#7f0000", fontWeight: 600, letterSpacing: 1 }}>
                   {selectedActivity.year}
                 </Typography>

                 <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, color: "#1a1a1a" }}>
                   {selectedActivity.title}
                 </Typography>

                 <Typography variant="subtitle1" sx={{ color: "#666666", mb: 3, fontStyle: "italic" }}>
                   {selectedActivity.subtitle}
                 </Typography>

                 <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                   <Chip
                     icon={<CalendarTodayIcon />}
                     label={`Year: ${selectedActivity.year}`}
                     color="primary"
                     variant="outlined"
                   />
                   <Chip
                     icon={<PeopleAltIcon />}
                     label={`Participants: ${selectedActivity.participants}`}
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

                 {/* <Button
                   variant="contained"
                   color="primary"
                   endIcon={<ArrowForwardIcon />}
                   sx={{
                     borderRadius: "30px",
                     py: 1.2,
                     mt: "auto",
                     textTransform: "none",
                     background: "linear-gradient(45deg, #7f0000, #ff1a1a)",
                     fontWeight: 600,
                     boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                     "&:hover": {
                       boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                     }
                   }}
                 >
                   Register for this event
                 </Button> */}
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