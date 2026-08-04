import * as React from 'react';
import { FaHeart } from "react-icons/fa";
import FurnitureCarousel from '../../Components/FurnitureCarousel/FurnitureCarousel';
import ProductList from '../../Components/ProductList/ProductList';
import "./Home.css";
import { useEffect, useState } from 'react';

function Home() {
  const username = "kullanici";
const password = "parola";


  const products = [
    { id: 1, image: '/images/blog-1.jpg', name: 'Modern Sofa', price: 499 },
    { id: 2, image: '/images/logo.svg', name: 'Stylish Chair', price: 199 },
    { id: 3, image: '/images/blog-3.jpg', name: 'Stylish Chair', price: 199 },
    { id: 4, image: '/images/blog-3.jpg', name: 'Stylish Chair', price: 199 },
    { id: 5, image: '/images/blog-3.jpg', name: 'Stylish Chair', price: 199 },
    { id: 6, image: '/images/blog-3.jpg', name: 'Stylish Chair', price: 199 },
    { id: 7, image: '/images/blog-3.jpg', name: 'Stylish Chair', price: 199 }
  ];
  const [weather, setWeather] = useState([]);

  useEffect(() => {
    fetch
    (window.BASE_URL+'weatherforecast')
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
      <h1>Products</h1>
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
