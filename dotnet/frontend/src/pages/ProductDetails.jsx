import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import styles from './ProductDetails.module.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems, totalPointsUsed } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Loyalty card state
    const [loyaltyCard, setLoyaltyCard] = useState(null);
    const [isLoyaltyUser, setIsLoyaltyUser] = useState(false);
    
    // Pricing selection state
    const [selectedPriceType, setSelectedPriceType] = useState('MRP');

    // Calculate if the product is currently in the cart
    const isInCart = product && cartItems.some(item => item.id == product.id);

    // ===============================
    // FETCH PRODUCT
    // ===============================
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/api/Products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    // ===============================
    // FETCH LOYALTY CARD
    // ===============================
    useEffect(() => {
        const fetchLoyaltyCard = async () => {
            try {
                const token = localStorage.getItem("token");
                const userJson = localStorage.getItem("user");
                
                if (!token || !userJson) {
                    setIsLoyaltyUser(false);
                    return;
                }

                const user = JSON.parse(userJson);
                const userId = user.id || user.userId;

                const response = await axios.get(
                    `http://localhost:8080/api/LoyaltyCard/user/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        validateStatus: (status) => status < 500
                    }
                );

                if (response.status === 200 && response.data) {
                    const card = response.data;
                    const isActive = card.isActive === 'Y' || card.isActive === 'y';
                    setLoyaltyCard(card);
                    setIsLoyaltyUser(isActive);
                }
            } catch (error) {
                console.error("Error fetching loyalty card:", error);
                setIsLoyaltyUser(false);
            }
        };

        fetchLoyaltyCard();
    }, []);

    // ===============================
    // DETERMINE PRICING CASE
    // ===============================
    const hasCardholderPrice = product?.cardholderPrice != null;
    const hasPoints = (product?.pointsToBeRedeem || 0) > 0;
    const mrp = Number(product?.mrpPrice) || 0;
    const cardPrice = Number(product?.cardholderPrice) || 0;
    const points = product?.pointsToBeRedeem || 0;

    // Calculate available points
    const pointsBalance = loyaltyCard?.pointsBalance || 0;
    const availablePoints = pointsBalance - totalPointsUsed;

    // Determine which case applies
    let pricingCase = 'MRP_ONLY'; // Default for non-loyalty users

    if (isLoyaltyUser) {
        if (hasCardholderPrice && hasPoints) {
            pricingCase = 'CASE_1'; // cardholderPrice + points > 0 → radio buttons
        } else if (hasCardholderPrice && !hasPoints) {
            pricingCase = 'CASE_2'; // cardholderPrice + points = 0 → auto-apply cardholder
        } else if (!hasCardholderPrice && hasPoints) {
            pricingCase = 'CASE_3'; // no cardholderPrice + points > 0 → MRP or Points radio
        } else {
            pricingCase = 'MRP_ONLY'; // No special pricing available
        }
    }

    // Set default selection based on case
    useEffect(() => {
        if (pricingCase === 'CASE_2') {
            setSelectedPriceType('LOYALTY');
        } else {
            setSelectedPriceType('MRP');
        }
    }, [pricingCase]);

    // ===============================
    // HANDLE ADD TO CART
    // ===============================
    const handleAddToCart = () => {
        if (!product) return;

        // Check points availability for points-based selections
        if ((selectedPriceType === 'LOYALTY' && hasPoints) || selectedPriceType === 'POINTS') {
            if (points > availablePoints) {
                alert("You have insufficient loyalty points. Please remove items from cart to continue.");
                return;
            }
        }

        const pointsToUse = 
            (selectedPriceType === 'POINTS') ? points :
            (selectedPriceType === 'LOYALTY' && hasPoints) ? points : 0;

        addToCart({
            id: product.id,
            name: product.prodName,
            price: selectedPriceType === 'MRP' ? mrp : (selectedPriceType === 'LOYALTY' ? cardPrice : mrp),
            mrpPrice: mrp,
            cardholderPrice: cardPrice,
            pointsToBeRedeem: points,
            image: `/${product.prodImagePath}`,
            quantity: 1
        }, selectedPriceType, pointsToUse);
    };

    const handleCartToggle = () => {
        if (isInCart) {
            removeFromCart(product.id);
        } else {
            handleAddToCart();
        }
    };

    const handlePriceTypeChange = (priceType) => {
        // Check points availability before allowing selection
        if (priceType === 'POINTS' || (priceType === 'LOYALTY' && hasPoints)) {
            if (points > availablePoints) {
                alert("You have insufficient loyalty points. Please remove items from cart to continue.");
                return;
            }
        }
        setSelectedPriceType(priceType);
    };

    // ===============================
    // RENDER
    // ===============================
    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (!product) {
        return (
            <div className={styles.loading}>
                <h2>Product not found</h2>
                <button className={styles.goBackBtn} onClick={() => navigate(-1)}>
                    Go Back
                </button>
            </div>
        );
    }

    const description = product.prodLongDesc || product.prodShortDesc || 'Experience premium quality with this exceptional product.';

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>

                {/* Left Side - Image */}
                <div className={styles.imageSection}>
                    <img
                        src={`${product.prodImagePath}`}
                        alt={product.prodName}
                        className={styles.productImage}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default.jpg';
                        }}
                    />
                </div>

                {/* Right Side - Details */}
                <div className={styles.detailsSection}>
                    <div className={styles.brand}>Premium Brand</div>
                    <h1 className={styles.title}>{product.prodName}</h1>
                    <p className={styles.description}>{description}</p>

                    <div className={styles.pricingCard}>
                        {/* NON-LOYALTY USER: Show only MRP */}
                        {!isLoyaltyUser && (
                            <>
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>Price</span>
                                    <span className={styles.mrpPrice}>₹{mrp.toFixed(2)}</span>
                                </div>
                            </>
                        )}

                        {/* LOYALTY USER - CASE 1: cardholderPrice + points > 0 */}
                        {isLoyaltyUser && pricingCase === 'CASE_1' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                    <span>{availablePoints} points available</span>
                                </div>
                                
                                <div className={styles.pricingOptions}>
                                    <label className={`${styles.priceOption} ${selectedPriceType === 'MRP' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="priceType"
                                            value="MRP"
                                            checked={selectedPriceType === 'MRP'}
                                            onChange={() => handlePriceTypeChange('MRP')}
                                        />
                                        <div className={styles.optionContent}>
                                            <span className={styles.optionLabel}>Pay by MRP</span>
                                            <span className={styles.optionPrice}>₹{mrp.toFixed(2)}</span>
                                        </div>
                                    </label>

                                    <label className={`${styles.priceOption} ${selectedPriceType === 'LOYALTY' ? styles.selected : ''} ${points > availablePoints ? styles.disabled : ''}`}>
                                        <input
                                            type="radio"
                                            name="priceType"
                                            value="LOYALTY"
                                            checked={selectedPriceType === 'LOYALTY'}
                                            onChange={() => handlePriceTypeChange('LOYALTY')}
                                            disabled={points > availablePoints}
                                        />
                                        <div className={styles.optionContent}>
                                            <span className={styles.optionLabel}>Pay by Cardholder Price + Redeem Points</span>
                                            <span className={styles.optionPrice}>₹{cardPrice.toFixed(2)} + {points} pts</span>
                                        </div>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* LOYALTY USER - CASE 2: cardholderPrice only (auto-apply) */}
                        {isLoyaltyUser && pricingCase === 'CASE_2' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                </div>
                                
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>MRP</span>
                                    <span className={styles.strikethrough}>₹{mrp.toFixed(2)}</span>
                                </div>
                                
                                <div className={styles.cardholderRow}>
                                    <div className={styles.cardholderLabel}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                            <line x1="1" y1="10" x2="23" y2="10"></line>
                                        </svg>
                                        Cardholder Price (Auto-Applied)
                                    </div>
                                    <span className={styles.cardholderPrice}>₹{cardPrice.toFixed(2)}</span>
                                </div>
                                
                                <div className={styles.savingsTag}>
                                    You save ₹{(mrp - cardPrice).toFixed(2)}!
                                </div>
                            </>
                        )}

                        {/* LOYALTY USER - CASE 3: MRP or Points */}
                        {isLoyaltyUser && pricingCase === 'CASE_3' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                    <span>{availablePoints} points available</span>
                                </div>

                                <div className={styles.pricingOptions}>
                                    <label className={`${styles.priceOption} ${selectedPriceType === 'MRP' ? styles.selected : ''}`}>
                                        <input
                                            type="radio"
                                            name="priceType"
                                            value="MRP"
                                            checked={selectedPriceType === 'MRP'}
                                            onChange={() => handlePriceTypeChange('MRP')}
                                        />
                                        <div className={styles.optionContent}>
                                            <span className={styles.optionLabel}>Pay by MRP</span>
                                            <span className={styles.optionPrice}>₹{mrp.toFixed(2)}</span>
                                        </div>
                                    </label>

                                    <label className={`${styles.priceOption} ${selectedPriceType === 'POINTS' ? styles.selected : ''} ${points > availablePoints ? styles.disabled : ''}`}>
                                        <input
                                            type="radio"
                                            name="priceType"
                                            value="POINTS"
                                            checked={selectedPriceType === 'POINTS'}
                                            onChange={() => handlePriceTypeChange('POINTS')}
                                            disabled={points > availablePoints}
                                        />
                                        <div className={styles.optionContent}>
                                            <span className={styles.optionLabel}>Pay by Redeeming Points</span>
                                            <span className={styles.optionPrice}>{points} points</span>
                                        </div>
                                    </label>
                                </div>
                            </>
                        )}

                        {/* LOYALTY USER - MRP ONLY (no special pricing) */}
                        {isLoyaltyUser && pricingCase === 'MRP_ONLY' && (
                            <>
                                <div className={styles.loyaltyBadge}>
                                    <span>🎖️ Loyalty Member</span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span className={styles.mrpLabel}>Price</span>
                                    <span className={styles.mrpPrice}>₹{mrp.toFixed(2)}</span>
                                </div>
                                <div className={styles.noDiscountNote}>
                                    No special pricing available for this product.
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.addToCartBtn} ${isInCart ? styles.addedBtn : ''}`}
                            onClick={handleCartToggle}
                            style={{
                                background: isInCart ? '#22c55e' : '',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {isInCart ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Added
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="9" cy="21" r="1"></circle>
                                        <circle cx="20" cy="21" r="1"></circle>
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </button>

                        <button className={styles.goBackBtn} onClick={() => navigate(-1)}>
                            Back
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;

