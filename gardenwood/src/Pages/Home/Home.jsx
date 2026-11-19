
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  FaAward,
  FaPalette,
  FaShieldAlt,
  FaCouch,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp
} from "react-icons/fa";

import { FaArrowTrendUp } from "react-icons/fa6";

import FurnitureCarousel from "../../Components/FurnitureCarousel/FurnitureCarousel";
import UniversalCarousel from "../../Components/UniversalCarousel/UniversalCarousel";
import ProductCard from "../../Components/ProductCard/ProductCard";

import "./Home.css";

// =========================================
// API HELPER
// =========================================


async function fetchData(endpoint, signal) {
  const BASE_URL = window.BASE_URL;
  const response = await fetch(`${BASE_URL}${endpoint}`, { signal });
  
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

// =========================================
// HOME COMPONENT
// =========================================

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [productsError, setProductsError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");

  const categoriesTrackRef = useRef(null);

  // =========================================
  // FETCH PRODUCTS AND CATEGORIES
  // =========================================

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError("");

        const data = await fetchData("/api/home/list", signal);

        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setProductsError("Məhsulları yükləmək mümkün olmadı.");
          console.error("Products API error:", error);
        }
      } finally {
        if (!signal.aborted) {
          setProductsLoading(false);
        }
      }
    };

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const data = await fetchData(
          "/api/admin/category/list",
          signal
        );

        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setCategoriesError("Kateqoriyaları yükləmək mümkün olmadı.");
          console.error("Categories API error:", error);
        }
      } finally {
        if (!signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadProducts();
    loadCategories();

    return () => controller.abort();
  }, []);

  // =========================================
  // CATEGORY CAROUSEL AUTOPLAY
  // =========================================

  useEffect(() => {
    if (categories.length <= 1) return;

    const track = categoriesTrackRef.current;

    if (!track) return;

    const interval = setInterval(() => {
      const maxScroll = track.scrollWidth - track.clientWidth;

      if (maxScroll <= 5) return;

      if (track.scrollLeft >= maxScroll - 10) {
        track.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      } else {
        track.scrollBy({
          left: Math.min(250, track.clientWidth * 0.7),
          behavior: "smooth"
        });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [categories]);

  // =========================================
  // RENDER
  // =========================================

  return (
    <main className="divHome page-home">

      {/* HERO */}
      <section className="hero-section" aria-label="Featured collections">
        <FurnitureCarousel />
      </section>

      {/* =====================================
          CATEGORIES
      ===================================== */}

      <section className="categories-section section">

        <div className="container">

          <div className="categories-heading section-heading">
            <div>
              <h2 className="section-title">
                Kateqoriyalar
              </h2>

              <p className="section-subtitle">
                Hər zövqə uyğun, hər məkana özəl.
              </p>
            </div>
          </div>

          <div className="categories-carousel-wrapper">

            {categoriesLoading ? (
              <p className="loading-message" role="status">
                Kateqoriyalar yüklənir...
              </p>
            ) : categoriesError ? (
              <p className="error-message" role="alert">
                {categoriesError}
              </p>
            ) : categories.length === 0 ? (
              <p className="empty-message">
                Hazırda kateqoriya yoxdur.
              </p>
            ) : (

              <div
                className="categories-track"
                ref={categoriesTrackRef}
              >

                {categories.map((category) => (

                  <Link
                    to={`/products?categoryId=${encodeURIComponent(category.id)}`}
                    className="category-item category-card"
                    key={category.id}
                    aria-label={`${category.name} məhsullarına bax`}
                  >

                    <div className="category-image">

                      <img
                        src={category.imageUrl || "/images/no-image.webp"}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                      />

                    </div>

                    <h3 className="category-title">
                      {category.name}
                    </h3>

                  </Link>

                ))}

              </div>
            )}

          </div>

          <Link
            to="/products"
            className="view-all btn btn-accent"
          >
            Hamısına bax
            <FaArrowTrendUp aria-hidden="true" />
          </Link>

        </div>

      </section>

      {/* =====================================
          PRODUCTS
      ===================================== */}

      <section className="home-products section">

        <div className="container">

          <div className="section-heading">

            <h2 className="section-title">
              Məhsullarımız
            </h2>

            <p className="section-subtitle">
              Bağ və həyətiniz üçün xüsusi mebel kolleksiyaları.
            </p>

          </div>

          {productsLoading ? (

            <p className="loading-message" role="status">
              Məhsullar yüklənir...
            </p>

          ) : productsError ? (

            <p className="error-message" role="alert">
              {productsError}
            </p>

          ) : products.length === 0 ? (

            <p className="empty-message">
              Hazırda məhsul yoxdur.
            </p>

          ) : (

            <UniversalCarousel
              autoPlay={products.length > 3}
              interval={4000}
              scrollAmount={300}
              className="related-carousel home-products-carousel"
            >

              {products.map((product) => (

                <div
                  className="related-product-item"
                  key={product.id}
                >

                  <Link
                    to={`/products/${product.id}`}
                    className="product-link"
                    aria-label={`${product.name} məhsuluna bax`}
                  >

                    <ProductCard
                      image={
                        product.images?.[0]?.imageUrl ||
                        "/images/no-image.webp"
                      }
                      name={product.name}
                      price={product.price}
                    />

                  </Link>

                </div>

              ))}

            </UniversalCarousel>

          )}

          <Link
            to="/products"
            className="view-all btn btn-accent"
          >
            Bütün məhsullar
            <FaArrowTrendUp aria-hidden="true" />
          </Link>

        </div>

      </section>

      {/* =====================================
          CONTACT
      ===================================== */}

      <section className="contact-section section">

        <div className="container">

          <div className="contact-content">

            <div className="contact-text">

              <span className="contact-subtitle">
                GARDEN WOOD
              </span>

              <h2>
                Bizimlə əlaqə saxlayın
              </h2>

              <p>
                Kolleksiyalarımızı kəşf edin və ən son mebel
                dizaynları ilə yeniliklərdən xəbərdar olmaq
                üçün sosial media hesablarımızı izləyin.
              </p>

            </div>

            <div className="contact-socials">

              <a
                href="https://www.instagram.com/ilkin_novruzov_04/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link instagram"
                aria-label="Garden Wood Instagram"
              >
                <FaInstagram aria-hidden="true" />
                <span>Instagram</span>
              </a>

              <a
                href="https://www.facebook.com/YOUR_USERNAME"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link facebook"
                aria-label="Garden Wood Facebook"
              >
                <FaFacebookF aria-hidden="true" />
                <span>Facebook</span>
              </a>

              <a
                href="https://wa.me/YOUR_PHONE_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link whatsapp"
                aria-label="Garden Wood WhatsApp"
              >
                <FaWhatsapp aria-hidden="true" />
                <span>WhatsApp</span>
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================
          WHY CHOOSE GARDEN WOOD
      ===================================== */}

      <section className="why-choose-us section">

        <div className="container">

          <h2 className="section-title why-main-title">
            Niyə Garden Wood?
          </h2>

          <div className="why-content">

            <div className="why-features">

              <div className="why-feature-card">

                <div className="why-feature-icon icon-blue">
                  <FaAward aria-hidden="true" />
                </div>

                <div className="why-feature-text">
                  <h3>Premium Keyfiyyət</h3>

                  <p>
                    Hər detalda yüksək keyfiyyət və
                    peşəkar istehsal yanaşması.
                  </p>
                </div>

              </div>

              <div className="why-feature-card">

                <div className="why-feature-icon icon-purple">
                  <FaPalette aria-hidden="true" />
                </div>

                <div className="why-feature-text">
                  <h3>Fərdi Dizayn</h3>

                  <p>
                    Zövqünüzə uyğun rəng, ölçü və
                    material seçimləri.
                  </p>
                </div>

              </div>

              <div className="why-feature-card">

                <div className="why-feature-icon icon-red">
                  <FaShieldAlt aria-hidden="true" />
                </div>

                <div className="why-feature-text">
                  <h3>Davamlı Materiallar</h3>

                  <p>
                    Uzunmüddətli istifadə üçün
                    seçilmiş keyfiyyətli materiallar.
                  </p>
                </div>

              </div>

              <div className="why-feature-card">

                <div className="why-feature-icon icon-green">
                  <FaCouch aria-hidden="true" />
                </div>

                <div className="why-feature-text">
                  <h3>Müasir Dizayn</h3>

                  <p>
                    Bağ və həyətinizə xüsusi görünüş
                    qatan müasir mebel kolleksiyaları.
                  </p>
                </div>

              </div>

            </div>

            <div className="why-image">

              <img
                src="/images/blog-1.jpg"
                alt="Garden Wood premium bağ mebeli kolleksiyası"
                loading="lazy"
                decoding="async"
              />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Home;
