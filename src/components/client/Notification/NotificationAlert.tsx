"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Manjari } from "next/font/google";

interface NotificationAlertProps {
  text: string;
}

// Load font outside component to ensure it's loaded once
const malayalamFont = Manjari({
  weight: "400",
  subsets: ["malayalam"],
  display: "swap", // Add display swap for better font loading behavior
  variable: "--manjari-font", // Use CSS variable for consistent application
});

const NotificationAlert: React.FC<NotificationAlertProps> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [textWidth, setTextWidth] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && textRef.current) {
        const containerW = containerRef.current.offsetWidth;
        const textW = textRef.current.scrollWidth;

        setContainerWidth(containerW);
        setTextWidth(textW);
      }
    };

    // Wait for fonts to load before measuring
    document.fonts.ready.then(() => {
      updateDimensions();
    });

    // Use ResizeObserver for responsive updates
    const resizeObserver = new ResizeObserver(() => {
      // Add small timeout to ensure measurements happen after render
      setTimeout(updateDimensions, 50);
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  // Calculate animation duration based on text length for consistent speed
  const animationDuration = Math.max(15, textWidth / 50);

  return (
    <Box
      ref={containerRef}
      className={malayalamFont.variable} // Apply font variable to container
      sx={{
        width: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        padding: "8px 0",
        minHeight: "40px",
        "& *": {
          willChange: "transform"
        }
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Typography
        ref={textRef}
        sx={{
          fontSize: 22,
          whiteSpace: "nowrap",
          display: "inline-block",
          position: "absolute",
          left: 0,
          fontFamily: "var(--manjari-font)", // Use CSS variable for font
          animation: `marquee ${animationDuration}s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
          "@keyframes marquee": {
            "0%": { transform: "translateX(100%)" },
            // Have the text go to mid-screen before resetting
            "100%": { transform: `translateX(-${textWidth / 2 + containerWidth / 2}px)` }
          },
          transform: "translateZ(0)",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default NotificationAlert;