
import { useEffect, useState, useRef } from 'react';
import { FaAward, FaPalette, FaShieldAlt, FaCouch } from 'react-icons/fa';
import { FaArrowTrendUp } from "react-icons/fa6";
import FurnitureCarousel from '../../Components/FurnitureCarousel/FurnitureCarousel';
import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  const API_URL = window.BASE_URL + '/api';
  const [products, setProducts] = useState([]);
  const [weather, setWeather] = useState([]);

  const [productsLoading, setProductsLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(true);

  const [productsError, setProductsError] = useState(null);
  const [weatherError, setWeatherError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const response = await fetch(
          `${window.BASE_URL}/api/home/list`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Products could not be loaded.');
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);

      } catch (error) {
        if (error.name !== 'AbortError') {
          setProductsError(error.message);
          console.error('Products API error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setProductsLoading(false);
        }
      }
    };

    const fetchWeather = async () => {
      try {
        setWeatherLoading(true);

        const response = await fetch(
          `${window.BASE_URL}/WeatherForecast`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error('Weather data could not be loaded.');
        }

        const data = await response.json();
        setWeather(Array.isArray(data) ? data : []);

      } catch (error) {
        if (error.name !== 'AbortError') {
          setWeatherError(error.message);
          console.error('Weather API error:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setWeatherLoading(false);
        }
      }
    };
    const fetchCategories = async () => {
      try {

        const response = await fetch(
          `${window.BASE_URL}/api/admin/category/list`
        );

        if (!response.ok) {
          throw new Error("Kateqoriyalar yüklənə bilmədi.");
        }

        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Category fetch error:", error);
        setCategoryError("Kateqoriyaları yükləmək mümkün olmadı.");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
    fetchProducts();
    fetchWeather();

    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (loadingCategories || categories.length === 0) return;

    const track = document.querySelector('.categories-track');

    if (!track) return;

    const interval = setInterval(() => {

      const maxScroll = track.scrollWidth - track.clientWidth;

      if (maxScroll <= 0) return;

      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        track.scrollBy({
          left: 250,
          behavior: 'smooth'
        });
      }

    }, 3500);

    return () => clearInterval(interval);

  }, [categories, loadingCategories]);
  return (

    <div className="divHome page-home">

      {/* HERO CAROUSEL */}
      <section className="hero-section">
        <FurnitureCarousel />
      </section>

      {/* CATEGORIES */}
      <section className="categories-section section">

        <div className="container">

          <div className="categories-heading section-heading">
            <div>
              <h2 className="section-title">Kateqoriyalar</h2>
              <p className="section-subtitle">
                Hər zövqə uyğun, hər məkana özəl.
              </p>
            </div>
          </div>

          <div className="categories-carousel-wrapper">

            {loadingCategories ? (
              <p className="loading-message">Loading categories...</p>
            ) : categoryError ? (
              <p className="error-message">{categoryError}</p>
            ) : categories.length === 0 ? (
              <p className="empty-message">No categories available.</p>
            ) : (

              <div className="categories-track">

                {categories.map((category) => (

                  <Link
                    to={`/products?categoryId=${category.id}`}
                    className="category-item category-card"
                    key={category.id}
                  >

                    <div className="category-image">
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        loading="lazy"
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
          <Link to="/products" className="view-all-link">
            <button className="view-all btn btn-accent">
              Hamısına bax
              <FaArrowTrendUp />
            </button>
          </Link>
        </div>

      </section>

      {/* PRODUCTS */}
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

          {productsLoading && (
            <p className="loading-message">Loading products...</p>
          )}

          {productsError && (
            <p className="error-message">{productsError}</p>
          )}

          {!productsLoading && !productsError && products.length === 0 && (
            <p className="empty-message">No products available.</p>
          )}

          <div className="products-container">

            {products.map((product) => {
              const imageUrl = product.images?.[0]?.imageUrl;

              return (

                <div className="product-card" key={product.id}>

                  <div className="product-image">
                    <img
                      src={imageUrl || '/images/no-image.webp'}
                      alt={product.name || 'Furniture product'}
                      loading="lazy"
                    />
                  </div>

                  <div className="product-info product-card-content">
                    <h3 className="product-card-title">
                      {product.name}
                    </h3>

                    <p className="product-price">
                      {product.price} ₼
                    </p>
                  </div>

                </div>

              );
            })}

          </div>
          <Link to="/products" className="view-all-link">
            <button className="view-all btn btn-accent">
              Hamısına bax
              <FaArrowTrendUp />
            </button>
          </Link>
        </div>

      </section>
      {/* WHY CHOOSE US */}
      <section className="why-choose-us section">

        <div className="container">

          <h2 className="section-title why-main-title">
            Niyə Garden Wood?
          </h2>

          <div className="why-content">

            <div className="why-features">

              <div className="why-feature-card">
                <div className="why-feature-icon icon-blue">
                  <FaAward />
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
                  <FaPalette />
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
                  <FaShieldAlt />
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
                  <FaCouch />
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
                alt="Garden Wood premium bağ mebeli"
                loading="lazy"
              />
            </div>

          </div>

        </div>

      </section>


    </div>

  );
}

export default Home;
