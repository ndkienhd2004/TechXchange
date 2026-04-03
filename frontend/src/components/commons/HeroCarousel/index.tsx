"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import carouselStyles from "./HeroCarousel.module.css";

interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  gradientKey: "brand_primary" | "brand_promo";
}

const slides: HeroSlide[] = [
  {
    id: 1,
    badge: "Premium Gaming Controller",
    title: "Upgrade smart, Work faster, Play harder",
    buttonText: "Start Buying",
    buttonLink: "/products",
    gradientKey: "brand_primary",
  },
  {
    id: 2,
    badge: "Up to 50% Off Electronics",
    title: "Black Friday Deals",
    buttonText: "Start Buying",
    buttonLink: "/promotions",
    gradientKey: "brand_promo",
  },
];

export default function HeroCarousel() {
  const { theme, themed } = useAppTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play
  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isHovered, nextSlide]);

  const currentSlideData = slides[currentSlide];
  const slideGradients: Record<HeroSlide["gradientKey"], string> = {
    brand_primary: `linear-gradient(135deg, ${theme.colors.palette.brand.purple[700]} 0%, ${theme.colors.palette.brand.purple[500]} 100%)`,
    brand_promo: `linear-gradient(135deg, ${theme.colors.palette.brand.pink[700]} 0%, ${theme.colors.palette.brand.pink[500]} 100%)`,
  };

  return (
    <div
      style={themed(styles.carousel)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slide Content */}
      <div
        className={carouselStyles.slideContainer}
        style={{
          ...themed(styles.slideContainer),
          background: slideGradients[currentSlideData.gradientKey],
        }}
      >
        <div style={themed(styles.slideContent)}>
          <span style={themed(styles.badge)}>{currentSlideData.badge}</span>
          <h1 className={carouselStyles.title} style={themed(styles.title)}>
            {currentSlideData.title}
          </h1>
          {currentSlideData.subtitle && (
            <p style={themed(styles.subtitle)}>{currentSlideData.subtitle}</p>
          )}
          <a
            href={currentSlideData.buttonLink}
            className={carouselStyles.button}
            style={themed(styles.button)}
          >
            {currentSlideData.buttonText}
          </a>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className={carouselStyles.navButton}
          style={themed(styles.navButton)}
          aria-label="Previous slide"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className={carouselStyles.navButtonRight}
          style={themed(styles.navButtonRight)}
          aria-label="Next slide"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div style={themed(styles.dotsContainer)}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={carouselStyles.dot}
              style={index === currentSlide ? styles.dotActive() : styles.dot()}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
