import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/HomePage.module.css"; // reuse same grid styles

const BrowseCategory = () => {

    const { catId } = useParams();   // C001, C002, etc
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Browsing category:", catId);

        axios
            .get(`http://localhost:8080/api/catalog/categories/${catId}`)
            .then(res => {
                console.log("Browse API response:", res.data);

                // If this category has NO subcategories → products come here
                if (!res.data.hasSubCategories) {
                    setProducts(res.data.products || []);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading category products:", err);
                setLoading(false);
            });

    }, [catId]);

    if (loading) {
        return <h2 style={{ textAlign: "center", marginTop: "40px" }}>Loading products...</h2>;
    }

    return (
        <div style={{ padding: "40px" }}>
            <h2 style={{ marginBottom: "25px" }}>Products</h2>

            <div className={styles.productGrid}>

                {products.length === 0 && (
                    <p style={{ fontSize: "18px" }}>No products found in this category.</p>
                )}

                {products.map(prod => {
                    console.log("IMAGE PATH FROM API:", prod.prodImagePath); // 🔥 DEBUG

                    return (
                        <div key={prod.id} className={styles.productCard}>

                            {/* 🔥 PRODUCT IMAGE */}
                            <div className={styles.prodImageContainer}>
                                <img
                                    src={`/${prod.prodImagePath}`}   // 🔥 CORRECT PATH
                                    alt={prod.prodName}
                                    className={styles.prodImage}
                                    onError={(e) => {
                                        console.log("Image failed:", prod.prodImagePath);
                                        e.target.src = "/images/default.jpg";
                                    }}
                                />

                            </div>

                            {/* 🔥 PRODUCT INFO */}
                            <div className={styles.prodInfo}>
                                <h3 className={styles.prodName}>{prod.prodName}</h3>

                                <div className={styles.prodPrice}>
                                    ₹ {prod.cardholderPrice}
                                </div>

                                <button className={styles.addToCartBtn}>
                                    Add to Cart
                                </button>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BrowseCategory;
