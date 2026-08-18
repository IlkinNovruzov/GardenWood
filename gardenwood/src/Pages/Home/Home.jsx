import * as React from 'react';
import { FaHeart } from "react-icons/fa";
import FurnitureCarousel from '../../Components/FurnitureCarousel/FurnitureCarousel';
import ProductList from '../../Components/ProductList/ProductList';
import "./Home.css";
import { useEffect, useState } from 'react';

function Home() {
  const [products, setProducts] = useState([]);
  const apiKey = localStorage.getItem('adminKey');
  useEffect(() => {
    const allowed = localStorage.getItem('adminAccess') === 'true';
    if (!allowed) {
      navigate('/adminpanel');
    }
    fetchProducts();
  }, []);
  const [weather, setWeather] = useState([]);
  const fetchProducts = async () => {
    try {
      const res = await fetch(window.BASE_URL + '/api/admin/product/list', {
        headers: { 'X-API-KEY': apiKey }
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("API error:", err.message);
    }
  };
  useEffect(() => {
    fetch
      (window.BASE_URL + '/WeatherForecast')
      .then((response) => {
        if (!response.ok) {
          throw new Error("API isteği başarısız.");
        }
        return response.json();
      })
      .then((data) => {
        setWeather(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  return (
    <div className='divHome'>
      <FurnitureCarousel />
      {/* <h1>Categories</h1>
      <div className="category-list">
        
      </div> */}
      <section className="home-products">
        <h2>Our Products</h2>

        <div className="products-container">
          {products.map((product) => (
            <div className="product-card" key={product.id}>

              <div className="product-image">
                <img src={product.images[0]?.imageUrl || ''} alt={product.name} />
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price}</p>
              </div>

            </div>
          ))}
        </div>
      </section>
      <div>
        <h2>Weather Forecast</h2>

        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>bbbbb C</th>
              <th>Temperature F</th>
              <th>Summary</th>
            </tr>
          </thead>

          <tbody>
            {weather.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.temperatureC}</td>
                <td>{item.temperatureF}</td>
                <td>{item.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* <ProductList /> */}
    </div>
  );
}

export default Home;
