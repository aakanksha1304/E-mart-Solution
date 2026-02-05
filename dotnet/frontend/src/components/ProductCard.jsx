import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart, removeFromCart, cartItems } = useCart();
    const { isLoyaltyUser, pointsBalance } = useLoyalty();

    // Calculate total points used in cart to determine available points
    const totalPointsUsed = cartItems.reduce((sum, item) => sum + (item.pointsUsed || 0), 0);
    const availablePoints = pointsBalance - totalPointsUsed;

    // Pricing selection state
    const [selectedPriceType, setSelectedPriceType] = useState('MRP');

    // Check if product is in cart
    const isInCart = cartItems.some(item => item.id === product.id);

    // Pricing data
    const mrp = Number(product.mrpPrice) || Number(product.price) || 0;
    const cardPrice = Number(product.cardholderPrice) || 0;
    const points = product.pointsToBeRedeem || 0;
    const hasCardholderPrice = product.cardholderPrice != null;
    const hasPoints = points > 0;

    // Determine Pricing Case
    let pricingCase = 'MRP_ONLY';
    if (isLoyaltyUser) {
        if (hasCardholderPrice && hasPoints) pricingCase = 'CASE_1';
        else if (hasCardholderPrice && !hasPoints) pricingCase = 'CASE_2';
        else if (!hasCardholderPrice && hasPoints) pricingCase = 'CASE_3';
    }

    // Set default selection
    useEffect(() => {
        if (pricingCase === 'CASE_2') {
            setSelectedPriceType('LOYALTY');
        } else {
            setSelectedPriceType('MRP');
        }
    }, [pricingCase]);

    const handlePriceTypeChange = (e, type) => {
        e.stopPropagation();
        if ((type === 'POINTS' || (type === 'LOYALTY' && hasPoints)) && points > availablePoints) {
            alert(`Insufficient points! You need ${points} points, but only ${availablePoints} available.`);
            return;
        }
        setSelectedPriceType(type);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        
        if (isInCart) {
            removeFromCart(product.id);
            return;
        }

        const pointsToUse = 
            (selectedPriceType === 'POINTS') ? points :
            (selectedPriceType === 'LOYALTY' && hasPoints) ? points : 0;

        if (pointsToUse > availablePoints) {
            alert(`Insufficient points! You need ${pointsToUse} points, but only ${availablePoints} available.`);
            return;
        }

        addToCart({
            id: product.id,
            name: product.prodName,
            price: selectedPriceType === 'MRP' ? mrp : (selectedPriceType === 'LOYALTY' ? cardPrice : mrp),
            mrpPrice: mrp,
            cardholderPrice: cardPrice,
            pointsToBeRedeem: points,
            image: `${product.prodImagePath}`,
            quantity: 1
        }, selectedPriceType, pointsToUse);
    };

    return (
        <div className={styles.productCard} onClick={() => navigate(`/product/${product.id}`)}>
            <button className={styles.wishlistBtn} onClick={(e) => e.stopPropagation()}>
                <svg className={styles.wishlistIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>

            <div className={styles.prodImageContainer}>
                <img
                    src={`${product.prodImagePath}`}
                    alt={product.prodName}
                    className={styles.prodImage}
                    onError={(e) => e.target.src = '/images/default.jpg'}
                />
            </div>

            <div className={styles.prodInfo}>
                <h3 className={styles.prodName}>{product.prodName}</h3>
                
                <div className={styles.prodPriceRow}>
                    <div className={styles.prodPrice}>₹{mrp}</div>
                    <div className={styles.rating}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>4.8</span>
                    </div>
                </div>

                {/* LOYALTY PRICING RADIOS */}
                {isLoyaltyUser && pricingCase !== 'MRP_ONLY' && (
                    <div className={styles.loyaltySection} onClick={(e) => e.stopPropagation()}>
                        <span className={styles.loyaltyTitle}>Special Offers</span>
                        
                        {pricingCase === 'CASE_1' && (
                            <div className={styles.pricingOptions}>
                                <div 
                                    className={`${styles.priceOption} ${selectedPriceType === 'MRP' ? styles.selected : ''}`}
                                    onClick={(e) => handlePriceTypeChange(e, 'MRP')}
                                >
                                    <input type="radio" checked={selectedPriceType === 'MRP'} readOnly />
                                    <div className={styles.optionContent}>
                                        <span className={styles.optionLabel}>MRP</span>
                                        <span className={styles.optionPrice}>₹{mrp}</span>
                                    </div>
                                </div>
                                <div 
                                    className={`${styles.priceOption} ${selectedPriceType === 'LOYALTY' ? styles.selected : ''} ${points > availablePoints ? styles.disabled : ''}`}
                                    onClick={(e) => handlePriceTypeChange(e, 'LOYALTY')}
                                >
                                    <input type="radio" checked={selectedPriceType === 'LOYALTY'} readOnly />
                                    <div className={styles.optionContent}>
                                        <span className={styles.optionLabel}>Cardholder + Pts</span>
                                        <span className={styles.optionPrice}>₹{cardPrice} + {points} pts</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {pricingCase === 'CASE_2' && (
                            <div className={styles.autoApplyBox}>
                                <span className={styles.autoApplyLabel}>Cardholder Price</span>
                                <div>
                                    <span className={styles.mrpStrikethrough}>₹{mrp}</span>
                                    <span className={styles.autoApplyPrice}>₹{cardPrice}</span>
                                </div>
                            </div>
                        )}

                        {pricingCase === 'CASE_3' && (
                            <div className={styles.pricingOptions}>
                                <div 
                                    className={`${styles.priceOption} ${selectedPriceType === 'MRP' ? styles.selected : ''}`}
                                    onClick={(e) => handlePriceTypeChange(e, 'MRP')}
                                >
                                    <input type="radio" checked={selectedPriceType === 'MRP'} readOnly />
                                    <div className={styles.optionContent}>
                                        <span className={styles.optionLabel}>MRP</span>
                                        <span className={styles.optionPrice}>₹{mrp}</span>
                                    </div>
                                </div>
                                <div 
                                    className={`${styles.priceOption} ${selectedPriceType === 'POINTS' ? styles.selected : ''} ${points > availablePoints ? styles.disabled : ''}`}
                                    onClick={(e) => handlePriceTypeChange(e, 'POINTS')}
                                >
                                    <input type="radio" checked={selectedPriceType === 'POINTS'} readOnly />
                                    <div className={styles.optionContent}>
                                        <span className={styles.optionLabel}>Redeem Points</span>
                                        <span className={styles.optionPrice}>{points} pts</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <button
                    className={`${styles.addToCartBtn} ${isInCart ? styles.addedBtn : ''}`}
                    onClick={handleAddToCart}
                >
                    {isInCart ? 'Remove from Cart' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
