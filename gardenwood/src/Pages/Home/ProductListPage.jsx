import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from "../../Components/ProductCard/ProductCard";

function ProductListPage() {
    const location = useLocation();
    const products = location.state?.results || [];
    return (
        <div className="product-list">
            {products.length === 0 ? (
                <p>Dont found product.</p>
            ) : (
                products.map(product => (
                    <ProductCard
                        key={product.id}
                        image={product.images[0]?.imageUrl}
                        name={product.name}
                        price={product.price}
                    />
                ))
            )}
        </div>
    );
}

export default ProductListPage;
