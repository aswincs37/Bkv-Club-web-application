"use client";
import React, { useState, useEffect, useRef, TouchEvent } from "react";
import { Box, Typography, Paper, IconButton, Container, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { keyframes } from "@mui/system";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

// Define Notice type
interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  important: boolean;
}

// Animation for notices
const slideFromRight = keyframes`
  0% { transform: translateX(100%); opacity: 0; }
  10% { transform: translateX(0); opacity: 1; }
  90% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-100%); opacity: 0; }
`;

const NoticeBoard = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);
  const [showNotice, setShowNotice] = useState(true);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const noticeRef = useRef<HTMLDivElement>(null);

  // For "Read More" functionality
  const [expandedNotice, setExpandedNotice] = useState<Notice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const maxPreviewLength = 60; // Characters to show in the preview

  // Touch swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Required minimum swipe distance in pixels
  const minSwipeDistance = 50;

  // Fetch notices from Firebase Firestore
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const noticesRef = collection(db, "notification");
        const q = query(noticesRef, orderBy("createdAt", "desc"), limit(5));
        const querySnapshot = await getDocs(q);

        const noticesList: Notice[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          noticesList.push({
            id: doc.id,
            title: data.title || "NOTICE", // Use title from Firebase if available
            message: data.alert || "No content",
            date: formatDate(
              data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate()
                : new Date()
            )
            ,
            important: Math.random() > 0.7 // randomly mark some as important for visual interest
          });
        });

        setNotices(noticesList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notices:", error);
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Format date to readable string
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get truncated message for preview
  const getPreviewMessage = (message: string): string => {
    if (message.length <= maxPreviewLength) return message;
    return `${message.substring(0, maxPreviewLength)}...`;
  };

  // Auto-rotate through notices
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isAutoRotating && notices.length > 1) {
      interval = setInterval(() => {
        setAnimationKey(prev => prev + 1);
        setCurrentNoticeIndex(prevIndex => (prevIndex + 1) % notices.length);
      }, 6000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [notices, isAutoRotating]);

  const handleNextNotice = () => {
    setAnimationKey(prev => prev + 1);
    setCurrentNoticeIndex(prevIndex => (prevIndex + 1) % notices.length);
  };

  const handlePrevNotice = () => {
    setAnimationKey(prev => prev + 1);
    setCurrentNoticeIndex(prevIndex =>
      prevIndex === 0 ? notices.length - 1 : prevIndex - 1
    );
  };

  const handleReadMore = () => {
    setExpandedNotice(notices[currentNoticeIndex]);
    setDialogOpen(true);
    setIsAutoRotating(false);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setIsAutoRotating(true);
  };

  const handleMouseEnter = () => {
    setIsAutoRotating(false);
  };

  const handleMouseLeave = () => {
    setIsAutoRotating(true);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoRotating(false);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    setIsAutoRotating(true);

    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;

    if (isSwipe) {
      // Swiped left
      if (distance > 0) {
        handleNextNotice();
      }
      // Swiped right
      else {
        handlePrevNotice();
      }
    }

    // Reset touch values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Don't render anything if there are no notices or loading failed
  if (loading) {
    return null; // Don't show anything while loading
  }

  if (!showNotice || notices.length === 0) {
    return null;
  }

  const currentNotice = notices[currentNoticeIndex];
  const isLongMessage = currentNotice?.message.length > maxPreviewLength;

  return (
    <Box
      sx={{

        position: "absolute",
        top: { xs: 70, sm: 80, md: 5 }, // Positioned below navbar
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: "hidden",
        height: "auto"
      }}
    >
      <Container maxWidth="md">
        <Paper
          key={animationKey}
          ref={noticeRef}
          elevation={3}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            borderRadius: "10px",
            backgroundColor:
               "rgba(219, 191, 225, 0.9)",
              // "rgba(74, 186, 234, 0.9)",

            backdropFilter: "blur(5px)",
            boxShadow: currentNotice?.important
              ? "0 4px 15px rgba(255, 77, 77, 0.5)"
              : "0 4px 15px rgba(0, 0, 0, 0.15)",
            animation: `${slideFromRight} 6s ease-in-out`,
            position: "relative"
          }}
        >
          {/* Navigation buttons */}
          {notices.length > 1 && (
            <IconButton
              size="small"
              onClick={handlePrevNotice}
              sx={{
                mr: 1,
                color: currentNotice?.important ? "text.secondary" : "text.secondary",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)"
                },
                display: { xs: "none", sm: "flex" }
              }}
            >
              <NavigateBeforeIcon fontSize="small" />
            </IconButton>
          )}

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color={currentNotice?.important ? "text.primary" : "text.primary"}
            >
              {currentNotice?.title}
            </Typography>

            {/* Message preview - Fixed to avoid p > div nesting */}
            <Box sx={{ mt: 1, mb: 1 }}>
              <Typography
                variant="body2"
                component="span"
                color={currentNotice?.important ? "text.primary" : "text.secondary"}
              >
                {getPreviewMessage(currentNotice?.message)}
              </Typography>
              {isLongMessage && (
                <Button
                  size="small"
                  onClick={handleReadMore}
                  endIcon={<ExpandMoreIcon />}
                  sx={{
                    ml: 1,
                    p: 0,
                    minWidth: "auto",
                    color: currentNotice?.important ? "white" : "primary.main",
                    textTransform: "none",
                    verticalAlign: "middle"
                  }}
                >
                  Read More
                </Button>
              )}
            </Box>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: currentNotice?.important ? "rgba(15, 15, 16, 0.7)" : "text.disabled"
              }}
            >
              Posted: {currentNotice?.date}
            </Typography>
          </Box>

          {notices.length > 1 && (
            <IconButton
              size="small"
              onClick={handleNextNotice}
              sx={{
                ml: 1,
                color: currentNotice?.important ? "white" : "text.secondary",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.3)"
                },
                display: { xs: "none", sm: "flex" }
              }}
            >
              <NavigateNextIcon fontSize="small" />
            </IconButton>
          )}

        </Paper>

        {/* Pagination dots for mobile */}
        {notices.length > 1 && (
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              justifyContent: "center",
              mt: 1
            }}
          >
            {notices.map((_, index) => (
              <Box
                key={index}
                onClick={() => {
                  setAnimationKey(prev => prev + 1);
                  setCurrentNoticeIndex(index);
                }}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  mx: 0.5,
                  backgroundColor: index === currentNoticeIndex ?
                    (currentNotice?.important ? "rgba(255, 77, 77, 0.9)" : "white") :
                    "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
              />
            ))}
          </Box>
        )}
      </Container>

      {/* Full Message Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "sm",
            mx: 2,
            borderRadius: "10px"
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          backgroundColor: expandedNotice?.important ? "error.light" : "primary.light",
          color: "white"
        }}>
          {expandedNotice?.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1">
            {expandedNotice?.message}
          </Typography>
          <Typography variant="caption" sx={{ display: "block", mt: 2, color: "text.disabled" }}>
            Posted: {expandedNotice?.date}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoticeBoard;