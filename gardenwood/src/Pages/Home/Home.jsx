import * as React from 'react';
import { FaHeart } from "react-icons/fa";
import FurnitureCarousel from '../../Components/FurnitureCarousel/FurnitureCarousel';
import ProductCard from '../../Components/ProductCard/ProductCard';
import "./Home.css";

function Home() {
  const products = [
    { id: 1, image: '/images/blog-1.jpg', name: 'Modern Sofa', price: 499 },
    { id: 2, image: '/images/blog-3.jpg', name: 'Stylish Chair', price: 199 },
  ];
  return (
    <div className='divHome'>
      <FurnitureCarousel />
      <h1>Categories</h1>
      <div className="category-list">
        
      </div>
      <h1>Top Rated</h1>
      <div className="product-list">
        {products.map(product => (
          <ProductCard
            key={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
