import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const LoyaltyContext = createContext();

export const LoyaltyProvider = ({ children }) => {
    const [loyaltyCard, setLoyaltyCard] = useState(null);
    const [loading, setLoading] = useState(false);

    // ===============================
    // AUTH HEADER
    // ===============================
    const getAuthHeader = () => {
        const token = localStorage.getItem("token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // ===============================
    // FETCH LOYALTY CARD
    // ===============================
    const refreshLoyaltyCard = useCallback(async () => {
        const token = localStorage.getItem("token");
        const userJson = localStorage.getItem("user");

        if (!token || !userJson) {
            setLoyaltyCard(null);
            return;
        }

        try {
            setLoading(true);
            const user = JSON.parse(userJson);
            const userId = user.id || user.userId;

            const response = await axios.get(
                `http://localhost:8080/api/LoyaltyCard/user/${userId}`,
                {
                    headers: getAuthHeader(),
                    validateStatus: (status) => status < 500
                }
            );

            if (response.status === 200 && response.data) {
                setLoyaltyCard(response.data);
            } else {
                setLoyaltyCard(null);
            }
        } catch (error) {
            console.error("❌ Error fetching loyalty card:", error);
            setLoyaltyCard(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // ===============================
    // INIT LOAD
    // ===============================
    useEffect(() => {
        refreshLoyaltyCard();
    }, [refreshLoyaltyCard]);

    // ===============================
    // DERIVED STATE
    // ===============================
    
    /**
     * Check if user has an ACTIVE loyalty card
     */
    const isLoyaltyUser = Boolean(
        loyaltyCard && 
        (loyaltyCard.isActive === 'Y' || loyaltyCard.isActive === 'y')
    );

    /**
     * Get the points balance from loyalty card
     */
    const pointsBalance = loyaltyCard?.pointsBalance || 0;

    /**
     * Check if user can redeem specified points given currently used points
     * @param {number} points - Points to check
     * @param {number} usedPoints - Points currently used in cart
     * @returns {boolean} - True if user has enough available points
     */
    const canRedeemPoints = useCallback((points, usedPoints = 0) => {
        if (!isLoyaltyUser) return false;
        const availablePoints = pointsBalance - usedPoints;
        return points <= availablePoints;
    }, [isLoyaltyUser, pointsBalance]);

    return (
        <LoyaltyContext.Provider
            value={{
                loyaltyCard,
                isLoyaltyUser,
                pointsBalance,
                loading,
                refreshLoyaltyCard,
                canRedeemPoints
            }}
        >
            {children}
        </LoyaltyContext.Provider>
    );
};

// ===============================
// HOOK
// ===============================
export const useLoyalty = () => {
    const context = useContext(LoyaltyContext);
    if (!context) {
        throw new Error("useLoyalty must be used within a LoyaltyProvider");
    }
    return context;
};

