import * as React from 'react';
import { FaHeart } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import "./ProductCard.css";

function ProductCard({ image, name, price }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <div className="info">
        <h3>{name}</h3>
        <p>{price} $</p>
      </div>
    </div>
  );
}

export default ProductCard;
