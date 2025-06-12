import { useEffect, useState, useCallback } from "react";
import ProductCard from "../../Components/ProductCard/ProductCard";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await fetch(`https://gardenwoodasp-001-site1.ltempurl.com/api/product/list?page=${page}&pageSize=4`);
      const data = await res.json();

      if (data.length < 4) {
        setHasMore(false);
      }

      setProducts(prev => {
        const combined = [...prev, ...data];
        const uniqueProducts = Array.from(new Map(combined.map(p => [p.id, p])).values());
        console.log("Top:", uniqueProducts.length);
        return uniqueProducts;
      });

      setPage(prev => prev + 1);
    } catch (error) {
      console.error("Product Error:", error);
    }

    setLoading(false);
  }, [page, loading, hasMore]);

  // Scroll ile veri yükle
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
        fetchProducts();
        console.log("Yeni ürünler yükleniyor...");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="product-list">
      {products.map(product => (
        <ProductCard
          key={product.id}
          image={product.images[0]?.imageUrl}
          name={product.name}
          price={product.price}
        />
      ))}

      {loading && <p>Loading...</p>}
      {!hasMore && <p>All Product loaded.</p>}
    </div>
  );
}

export default ProductList;
