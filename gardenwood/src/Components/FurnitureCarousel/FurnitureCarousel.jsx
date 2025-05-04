import "react-responsive-carousel/lib/styles/carousel.min.css"; // ÖNEMLİ: CSS import
import { Carousel } from 'react-responsive-carousel';

function FurnitureCarousel() {
  return (
    <Carousel
      className="carousel"
      autoPlay
      interval={3000}
      infiniteLoop
      showThumbs={false}
      showStatus={false}
      showArrows={false}
    >
      <div>
        <img src="/images/blog-1.jpg" alt="Sofa" />
      </div>
      <div>
        <img src="/images/blog-2.jpg" alt="Bed" />
      </div>
      <div>
        <img src="/images/blog-3.jpg" alt="Table" />
      </div>
    </Carousel>
  );
}

export default FurnitureCarousel;
