import * as React from 'react';
import { FaHeart } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import "./ProductCard.css";

function ProductCard({ image, name, price }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-card-image" />
      <div className="product-card-overlay">
        <h3>{name}</h3>
        <span>{price} ₼</span>
      </div>
    </div>
  );
}

export default ProductCard;
