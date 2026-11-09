
import { useEffect, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import './FurnitureCarousel.css';

function FurnitureCarousel() {
  const API_URL = window.BASE_URL + '/api/admin/carousel';
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${API_URL}/list`);

        if (!response.ok) {
          throw new Error("Carousel məlumatları alınmadı");
        }

        const data = await response.json();

        setSlides(data);
      } catch (error) {
        console.error("Carousel error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  if (loading) return <p>Loading...</p>;

  if (slides.length === 0) return null;

  return (
    <div className="carousel-full-width">
      <Carousel
        className="carousel"
        autoPlay
        interval={3000}
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        showArrows={false}
      >
        {slides.map((slide) => (
          <div key={slide.id}>
            <img
              src={slide.imageUrl}
              alt={slide.title || "Furniture"}
              className="carousel-image"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default FurnitureCarousel;
