namespace EMart.DTOs
{
    /// <summary>
    /// Request DTO for adding/updating cart items.
    /// PriceType: "MRP" | "LOYALTY" | "POINTS"
    /// PointsUsed: Number of points to redeem (only when PriceType is POINTS)
    /// </summary>
    public record CartItemRequest(
        int ProductId, 
        int Quantity,
        string PriceType = "MRP",
        int PointsUsed = 0
    );

    public record CartItemResponse(
        int CartItemId,
        int CartId,
        int ProductId,
        string ProductName,
        string? ProdImagePath,
        int Quantity,
        decimal PriceSnapshot,
        decimal? MrpPrice,
        decimal? CardholderPrice,
        int? PointsToBeRedeem,
        decimal TotalPrice,
        string PriceType,
        int PointsUsed
    );

    public record CartResponse(
        int CartId,
        char IsActive,
        List<CartItemResponse> Items,
        decimal GrantTotal,
        int TotalPointsUsed
    );
}

