import React, { useState, useEffect } from 'react';
import styles from '../styles/CartPage.module.css';

const CartPage = ({ onContinueShopping }) => {
    // Dummy Data
    const initialItems = [
        {
            id: 1,
            name: "Wireless Noise Cancelling Headphones",
            category: "Electronics",
            price: 299.00,
            image: "https://placehold.co/200?text=Headphones",
            quantity: 1
        },
        {
            id: 2,
            name: "Smart Fitness Watch Series 5",
            category: "Wearables",
            price: 149.50,
            image: "https://placehold.co/200?text=Watch",
            quantity: 2
        },
        {
            id: 3,
            name: "Men's Casual Sneakers",
            category: "Fashion",
            price: 79.99,
            image: "https://placehold.co/200?text=Sneakers",
            quantity: 1
        }
    ];

    const [cartItems, setCartItems] = useState(initialItems);
    const [summary, setSummary] = useState({ subtotal: 0, discount: 0, delivery: 0, total: 0 });

    useEffect(() => {
        calculateTotal();
    }, [cartItems]);

    const calculateTotal = () => {
        const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const delivery = subtotal > 500 ? 0 : 40; // Free delivery over $500
        const total = subtotal + delivery; // Discount logic can be added here
        
        setSummary({
            subtotal: subtotal.toFixed(2),
            discount: 0, // No discount for now
            delivery: delivery,
            total: total.toFixed(2)
        });
    };

    const updateQuantity = (id, delta) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    if (cartItems.length === 0) {
        return (
            <div className={styles.cartContainer}>
                <div className={styles.emptyCart}>
                    <div className={styles.emptyMessage}>Your cart is empty!</div>
                    <button className={styles.continueBtn} onClick={onContinueShopping}>
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.cartContainer}>
            {/* Left: Cart Items */}
            <div className={styles.cartItemsSection}>
                <h2 className={styles.cartHeader}>My Cart ({cartItems.length})</h2>
                {cartItems.map(item => (
                    <div key={item.id} className={styles.cartItemCard}>
                        <div className={styles.itemImageContainer}>
                            <img src={item.image} alt={item.name} className={styles.itemImage} />
                        </div>
                        <div className={styles.itemDetails}>
                            <div>
                                <h3 className={styles.itemName}>{item.name}</h3>
                                <p className={styles.itemCategory}>{item.category}</p>
                                <div className={styles.itemPrice}>${item.price}</div>
                            </div>
                            <div className={styles.actions}>
                                <div className={styles.quantityControl}>
                                    <button 
                                        className={styles.qtyBtn} 
                                        onClick={() => updateQuantity(item.id, -1)}
                                        disabled={item.quantity <= 1}
                                    >-</button>
                                    <input 
                                        type="text" 
                                        className={styles.qtyValue} 
                                        value={item.quantity} 
                                        readOnly 
                                    />
                                    <button 
                                        className={styles.qtyBtn} 
                                        onClick={() => updateQuantity(item.id, 1)}
                                    >+</button>
                                </div>
                                <button 
                                    className={styles.removeBtn} 
                                    onClick={() => removeItem(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right: Price Summary */}
            <div className={styles.summarySection}>
                <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>PRICE DETAILS</h3>
                    <div className={styles.summaryRow}>
                        <span>Price ({cartItems.length} items)</span>
                        <span>${summary.subtotal}</span>
                    </div>
                    {/* <div className={styles.summaryRow}>
                        <span>Discount</span>
                        <span className={styles.freeText}>- $0</span>
                    </div> */}
                    <div className={styles.summaryRow}>
                        <span>Delivery Charges</span>
                        <span className={summary.delivery === 0 ? styles.freeText : ''}>
                            {summary.delivery === 0 ? 'Free' : `$${summary.delivery}`}
                        </span>
                    </div>
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>Total Amount</span>
                        <span>${summary.total}</span>
                    </div>
                    <button className={styles.checkoutBtn}>PROCEED TO CHECKOUT</button>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
