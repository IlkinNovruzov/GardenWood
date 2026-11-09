import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from "../../Components/ProductCard/ProductCard";
import "./ProductList.css";

function ProductListPage() {
    const [searchParams] = useSearchParams();

    const search = searchParams.get('search') ?? '';
    const categoryId = searchParams.get('categoryId') ?? '';

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams();

                // Search filter
                if (search.trim()) {
                    params.append('search', search.trim());
                }

                // Category filter
                if (categoryId) {
                    params.append('categoryId', categoryId);
                }
                console.log(params.toString())
                const response = await fetch(
                    `${window.BASE_URL}/api/admin/product/listt?${params.toString()}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch products.');
                }

                const data = await response.json();

                setProducts(data);

            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => controller.abort();

    }, [search, categoryId]);

    if (loading) {
        return <div className="product-list">Loading products...</div>;
    }

    if (error) {
        return <div className="product-list">{error}</div>;
    }

    return (
        <div className="product-grid">

            {products.length === 0 ? (
                <p className="no-products">No products found.</p>
            ) : (
                products.map(product => (
                    <Link
                        to={`/products/${product.id}`}
                        className="product-link"
                        key={product.id}
                    >
                        <ProductCard
                            image={product.images?.[0]?.imageUrl ?? ""}
                            name={product.name}
                            price={product.price}
                        />
                    </Link>
                ))
            )}

        </div>
    );
}

export default ProductListPage;
