import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/HomePage.module.css";
import ProductCard from "../components/ProductCard";

const SearchResults = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search).get("q");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    axios
      .get(`http://localhost:8080/api/products/search?q=${query}`)
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setLoading(false);
      });
  }, [query]);

  if (loading) {
    return <div style={{ padding: "40px" }}>Searching products...</div>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "25px" }}>
        Search results for “{query}”
      </h2>

      <div className={styles.productGrid}>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          products.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))
        )}
      </div>

    </div>
  );
};

export default SearchResults;
