
import { useEffect, useState, useRef } from 'react';
import { FaAward, FaPalette, FaShieldAlt, FaCouch } from 'react-icons/fa';
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
    <div className="divHome">

      <FurnitureCarousel />

      <section className="categories-section">

        <div className="categories-heading">
          <div>
            <h2>Explore Categories</h2>
            <p>Find the perfect furniture for your outdoor space.</p>
          </div>
        </div>

        <div className="categories-carousel-wrapper">

          {loadingCategories ? (
            <p>Loading categories...</p>
          ) : categoryError ? (
            <p>{categoryError}</p>
          ) : categories.length === 0 ? (
            <p>No categories available.</p>
          ) : (

            <div className="categories-track">

              {categories.map((category) => (

                <Link
                  to={`/products?categoryId=${category.id}`}
                  className="category-item"
                  key={category.id}
                >

                  <div className="category-image">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      loading="lazy"
                    />
                  </div>

                  <h3>{category.name}</h3>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>

      <section className="why-choose-us">

        <h2 className="why-main-title">
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
            />
          </div>

        </div>

      </section>


      <section className="home-products">
        <h2>Our Categories</h2>

        {productsLoading && <p>Loading products...</p>}

        {productsError && (
          <p className="error-message">{productsError}</p>
        )}

        {!productsLoading && !productsError && products.length === 0 && (
          <p>No products available.</p>
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

                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">
                    ${product.price}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </section>

      <section className="weather-section">
        <h2>Weather Forecast</h2>

        {weatherLoading && <p>Loading weather...</p>}

        {weatherError && (
          <p className="error-message">{weatherError}</p>
        )}

        {!weatherLoading && !weatherError && (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Temperature C</th>
                <th>Temperature F</th>
                <th>Summary</th>
              </tr>
            </thead>

            <tbody>
              {weather.map((item) => (
                <tr key={item.date}>
                  <td>{item.date}</td>
                  <td>{item.temperatureC}</td>
                  <td>{item.temperatureF}</td>
                  <td>{item.summary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

    </div>
  );
}

export default Home;
