

import React, { useState, useEffect } from 'react';
import styles from '../styles/AdBanner.module.css';
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdBanner = () => {
    const { t } = useTranslation();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const navigate = useNavigate();

    const slides = [
        {
            id: 1,
            category: "MB01",
            headline: t("hero.title"),
            tagline: t("hero.subtitle"),
            description: t("hero.description"),
            discount: t("hero.discountBadge"),
            primaryBtn: t("hero.shopNow"),
            secondaryBtn: t("hero.viewOffers"),
            bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        },
        {
            id: 2,
            category: "FW01",
            headline: t("banner2.title"),
            tagline: t("banner2.subtitle"),
            description: t("banner2.description"),
            discount: "40% OFF",
            primaryBtn: t("hero.shopNow"),
            secondaryBtn: t("banner2.secondary"),
            bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
        },
        {
            id: 3,
            category: "HP001",
            headline: t("banner3.title"),
            tagline: t("banner3.subtitle"),
            description: t("banner3.description"),
            discount: "30% OFF",
            primaryBtn: t("hero.shopNow"),
            secondaryBtn: t("banner3.secondary"),
            bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        }
    ];

    useEffect(() => {
        let interval;
        if (!isPaused) {
            interval = setInterval(() => {
                setCurrentSlide((prev) =>
                    prev === slides.length - 1 ? 0 : prev + 1
                );
            }, 4000);
        }
        return () => clearInterval(interval);
    }, [isPaused, slides.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) =>
            prev === slides.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrentSlide((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const handleCategoryNavigation = (category) => {
        setIsPaused(true);
        navigate(`/browse/${category}`);
    };

    return (
        <div
            className={styles.bannerContainer}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div
                className={styles.slideTrack}
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className={styles.slide}
                        style={{ background: slide.bgGradient }}
                    >
                        <div className={styles.contentWrapper}>
                            <div className={styles.textSection}>
                                <div className={styles.discountBadge}>
                                    <span>{slide.discount}</span>
                                </div>

                                <h2 className={styles.headline}>
                                    {slide.headline}
                                </h2>

                                <p className={styles.tagline}>
                                    {slide.tagline}
                                </p>

                                <p className={styles.description}>
                                    {slide.description}
                                </p>

                                <div className={styles.buttonGroup}>
                                    <button
                                        className={styles.primaryBtn}
                                        onClick={() =>
                                            handleCategoryNavigation(slide.category)
                                        }
                                    >
                                        {slide.primaryBtn}
                                    </button>

                                    <button
                                        className={styles.secondaryBtn}
                                        onClick={() =>
                                            handleCategoryNavigation(slide.category)
                                        }
                                    >
                                        {slide.secondaryBtn}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Left Arrow */}
            <button
                className={`${styles.arrow} ${styles.leftArrow}`}
                onClick={prevSlide}
            >
                ‹
            </button>

            {/* Right Arrow */}
            <button
                className={`${styles.arrow} ${styles.rightArrow}`}
                onClick={nextSlide}
            >
                ›
            </button>

            {/* Dots */}
            <div className={styles.dotsContainer}>
                {slides.map((_, index) => (
                    <div
                        key={index}
                        className={`${styles.dot} ${
                            currentSlide === index ? styles.active : ""
                        }`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdBanner;
