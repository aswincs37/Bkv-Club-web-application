"use client";
import React, { useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { Chilanka, Manjari } from "next/font/google";

interface NotificationAlertProps {
  text: string;
}

const malayalamFont = Manjari({
  weight: "400",
  subsets: ["malayalam"],
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

    // Run once on mount
    updateDimensions();

    // Use ResizeObserver instead of resize event
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [text]);

  // Use CSS transform for animation instead of JavaScript animation
  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        padding: "8px 0",
        minHeight: "40px",
        // Use will-change to optimize animation
        "& *": {
          willChange: "transform"
        }
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Typography
        ref={textRef}
        className={malayalamFont.className}
        sx={{
          fontSize:22,
          whiteSpace: "nowrap",
          display: "inline-block",
          position: "absolute",
          left: 0,
          animation: `marquee 30s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
          "@keyframes marquee": {
            "0%": { transform: `translateX(100%)` },
            "100%": { transform: `translateX(-100%)` }
          },
          // Use GPU acceleration
          transform: "translateZ(0)",
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

export default NotificationAlert;