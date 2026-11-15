
import React, { useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./UniversalCarousel.css";

function UniversalCarousel({
    children,
    autoPlay = false,
    interval = 3500,
    scrollAmount = 300,
    className = ""
}) {
    const trackRef = useRef(null);

    const scroll = (direction) => {
        if (!trackRef.current) return;

        trackRef.current.scrollBy({
            left: direction * scrollAmount,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(() => {
            const track = trackRef.current;

            if (!track) return;

            const maxScroll =
                track.scrollWidth - track.clientWidth;

            if (maxScroll <= 0) return;

            if (track.scrollLeft >= maxScroll - 10) {
                track.scrollTo({
                    left: 0,
                    behavior: "smooth"
                });
            } else {
                track.scrollBy({
                    left: scrollAmount,
                    behavior: "smooth"
                });
            }
        }, interval);

        return () => clearInterval(timer);

    }, [autoPlay, interval, scrollAmount]);

    return (
        <div className={`universal-carousel ${className}`}>
            <div
                className="universal-carousel-track"
                ref={trackRef}
            >
                {children}
            </div>
        </div>
    );
}

export default UniversalCarousel;
