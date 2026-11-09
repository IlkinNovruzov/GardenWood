import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ProductDetailsPage() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `${window.BASE_URL}/api/admin/product/${id}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Product not found.");
                }

                const data = await response.json();

                setProduct(data);

            } catch (err) {
                if (err.name !== "AbortError") {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

       fetchProduct();

        return () => controller.abort();

    }, [id]);

    if (loading) return <div>Loading product...</div>;

    if (error) return <div>{error}</div>;

    if (!product) return <div>Product not found.</div>;
    return (
         <div className="product-details">

            <h1>{product.name}</h1>

            <p>Price: {product.price}</p>

            <div>
                {product.images?.map(image => (
                    <img
                        key={image.id}
                        src={image.imageUrl}
                        alt={product.name}
                        width="200"
                    />
                ))}
            </div>

        </div>
    );
}

export default ProductDetailsPage;