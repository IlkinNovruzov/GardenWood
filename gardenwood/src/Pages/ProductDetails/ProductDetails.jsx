import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./ProductDetails.css";
import ProductCard from "../../Components/ProductCard/ProductCard";
import UniversalCarousel from "../../Components/UniversalCarousel/UniversalCarousel";
function ProductDetailsPage() {
    const { id } = useParams();
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                setProduct(null);
                setSelectedImage(null);

                const response = await fetch(
                    `${window.BASE_URL}/api/admin/product/${id}`,
                    { signal: controller.signal }
                );

                if (!response.ok) {
                    throw new Error("Product not found.");
                }

                const data = await response.json();

                setProduct(data);
                setSelectedImage(data.images?.[0] || null);

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
    useEffect(() => {
        if (!product?.categoryId) return;

        const fetchRelatedProducts = async () => {
            try {
                const response = await fetch(
                    `${window.BASE_URL}/api/admin/product/listt?categoryId=${product.categoryId}`
                );

                if (!response.ok) {
                    throw new Error("Related products could not be loaded.");
                }

                const data = await response.json();

                const filteredProducts = data.filter(
                    item => item.id !== Number(id)
                );

                setRelatedProducts(filteredProducts);

            } catch (error) {
                console.error("Related products error:", error);
            }
        };

        fetchRelatedProducts();

    }, [product, id]);
    if (loading) {
        return (
            <div className="product-details-state">
                <div className="loading-spinner"></div>
                <p>Loading product...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="product-details-state">
                <h2>Something went wrong</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-details-state">
                <h2>Product not found</h2>
            </div>
        );
    }

    return (
        <section className="product-details-page">

            <div className="product-details-container">

                {/* LEFT: IMAGE GALLERY */}

                <div className="product-gallery">

                    <div className="main-product-image">

                        {selectedImage ? (
                            <img
                                src={selectedImage.imageUrl}
                                alt={product.name}
                            />
                        ) : (
                            <div className="no-product-image">
                                No image available
                            </div>
                        )}

                    </div>

                    {product.images?.length > 0 && (
                        <div className="product-thumbnails">

                            {product.images.map((image) => (

                                <button
                                    type="button"
                                    key={image.id}
                                    className={`thumbnail-item ${selectedImage?.id === image.id
                                        ? "active"
                                        : ""
                                        }`}
                                    onClick={() => setSelectedImage(image)}
                                    aria-label={`View image of ${product.name}`}
                                >
                                    <img
                                        src={image.imageUrl}
                                        alt={product.name}
                                    />
                                </button>

                            ))}

                        </div>
                    )}

                </div>


                {/* RIGHT: PRODUCT INFORMATION */}

                <div className="product-information">
                    <h1>{product.name}</h1>

                    {product.description && (
                        <p className="product-description">
                            {product.description}
                        </p>
                    )}

                    <div className="product-price">
                        <span>{product.price} AZN</span>
                    </div>

                    <div className="product-info-divider"></div>

                    <div className="product-info-footer">
                        <span>Premium Outdoor Furniture</span>
                        <span>Garden Wood</span>
                    </div>

                </div>

            </div>
            {/* RELATED PRODUCTS */}

            {relatedProducts.length > 0 && (
                <div className="related-products-section">

                    <div className="related-products-heading">
                        <div>
                            <span>DISCOVER MORE</span>
                            <h2>Related Products</h2>
                        </div>
                    </div>
                    <UniversalCarousel
                        autoPlay={true}
                        scrollAmount={300}
                        className="related-carousel"
                    >
                        {relatedProducts.map((item) => (
                            <div className="related-product-item" key={item.id}>
                                <Link to={`/products/${item.id}`}
                                    className="product-link"
                                    key={item.id}
                                >
                                    <ProductCard
                                        image={item.images?.[0]?.imageUrl ?? ""}
                                        name={item.name}
                                        price={item.price}
                                    />
                                </Link>
                            </div>
                        ))}
                    </UniversalCarousel>


                </div>
            )}
        </section>
    );
}
export default ProductDetailsPage;
//  {relatedProducts.map((item) => (

//                             <Link
//                                 to={`/products/${item.id}`}
//                                 className="related-product-card"
//                                 key={item.id}
//                             >

//                                 <div className="related-product-image">
//                                     <img
//                                         src={item.images?.[0]?.imageUrl}
//                                         alt={item.name}
//                                         loading="lazy"
//                                     />
//                                 </div>

//                                 <div className="related-product-info">
//                                     <h3>{item.name}</h3>
//                                     <p>{item.price} AZN</p>
//                                 </div>

//                             </Link>

//                         ))}

