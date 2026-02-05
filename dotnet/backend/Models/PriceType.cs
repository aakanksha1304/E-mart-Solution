namespace EMart.Models
{
    /// <summary>
    /// Defines the pricing type used for a cart item.
    /// MRP = Standard retail price (for non-loyalty users or by choice)
    /// LOYALTY = Cardholder discounted price
    /// POINTS = Paid using loyalty points
    /// </summary>
    public enum PriceType
    {
        MRP,
        LOYALTY,
        POINTS
    }
}
