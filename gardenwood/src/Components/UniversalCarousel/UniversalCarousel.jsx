
import React, { useEffect, useRef } from "react";
import "./UniversalCarousel.css";

function UniversalCarousel({
    children,
    autoPlay = false,
    interval = 3500,
    scrollAmount = 300,
    className = ""
}) {
    const carouselRef = useRef(null);
    const isPausedRef = useRef(false);

    useEffect(() => {
        const carousel = carouselRef.current;

        if (!carousel || !autoPlay) return;

        // İstifadəçi hərəkətin azaldılmasını istəyirsə autoplay işləmir
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (reducedMotion.matches) return;

        const pause = () => {
            isPausedRef.current = true;
        };

        const resume = () => {
            isPausedRef.current = false;
        };

        const handleVisibilityChange = () => {
            isPausedRef.current = document.hidden;
        };

        // İstifadəçi ilə qarşılıqlı əlaqə
        carousel.addEventListener("pointerenter", pause);
        carousel.addEventListener("pointerleave", resume);
        carousel.addEventListener("pointerdown", pause);
        carousel.addEventListener("pointerup", resume);
        carousel.addEventListener("pointercancel", resume);

        // Klaviatura ilə idarəetmə
        carousel.addEventListener("focusin", pause);
        carousel.addEventListener("focusout", resume);

        // Başqa tab açıldıqda autoplay dayandırılır
        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        const timer = setInterval(() => {
            if (isPausedRef.current || document.hidden) return;

            const maxScroll =
                carousel.scrollWidth - carousel.clientWidth;

            // Sürüşdürmək üçün kifayət qədər element yoxdursa
            if (maxScroll <= 5) return;

            const currentPosition = carousel.scrollLeft;
            const isAtEnd =
                currentPosition >= maxScroll - 5;

            if (isAtEnd) {
                carousel.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });
            } else {
                carousel.scrollBy({
                    left: scrollAmount,
                    behavior: "smooth"
                });
            }
        }, Math.max(interval, 1000));

        return () => {
            clearInterval(timer);

            carousel.removeEventListener("pointerenter", pause);
            carousel.removeEventListener("pointerleave", resume);
            carousel.removeEventListener("pointerdown", pause);
            carousel.removeEventListener("pointerup", resume);
            carousel.removeEventListener("pointercancel", resume);

            carousel.removeEventListener("focusin", pause);
            carousel.removeEventListener("focusout", resume);

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [autoPlay, interval, scrollAmount]);

    return (
        <div className={`universal-carousel ${className}`}>
            <div
                className="universal-carousel-track"
                ref={carouselRef}
            >
                {children}
            </div>
        </div>
    );
}

export default UniversalCarousel;
