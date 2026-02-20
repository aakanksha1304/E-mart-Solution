using EMart.Data;
using EMart.DTOs;
using EMart.Models;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    public interface ICartService
    {
        Task<CartResponse> GetUserCartAsync(string email);
        Task<CartItemResponse> AddOrUpdateItemAsync(string email, CartItemRequest request);
        Task<bool> RemoveItemAsync(string email, int cartItemId);
        Task<CartItemResponse> UpdateQuantityAsync(string email, int cartItemId, int quantity);
    }

    public class CartService : ICartService
    {
        private readonly EMartDbContext _context;
        private readonly ILoyaltycardService _loyaltycardService;

        public CartService(EMartDbContext context, ILoyaltycardService loyaltycardService)
        {
            _context = context;
            _loyaltycardService = loyaltycardService;
        }

        private async Task<Cart> GetOrCreateCartAsync(string email)
        {
            var user = await _context.Users
                .Include(u => u.Cart)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null) throw new Exception("User not found");

            if (user.Cart == null)
            {
                var newCart = new Cart
                {
                    UserId = user.Id,
                    IsActive = 'Y'
                };
                _context.Carts.Add(newCart);
                await _context.SaveChangesAsync();
                return newCart;
            }

            return user.Cart;
        }

        
        private async Task<Loyaltycard?> GetActiveLoyaltyCard(int userId)
        {
            var card = await _loyaltycardService.GetLoyaltycardByUserIdAsync(userId);
            if (card != null && (card.IsActive == 'Y' || card.IsActive == 'y'))
            {
                return card;
            }
            return null;
        }

        private async Task<int> GetUsedPointsInCart(int cartId)
        {
            return await _context.Cartitems
                .Where(ci => ci.CartId == cartId)
                .SumAsync(ci => ci.PointsUsed);
        }

        public async Task<CartResponse> GetUserCartAsync(string email)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.User.Email == email);

            if (cart == null)
            {
                cart = await GetOrCreateCartAsync(email);
            }

            var itemResponses = cart.CartItems.Select(MapToResponse).ToList();
            var total = itemResponses.Sum(i => i.TotalPrice);
            var totalPointsUsed = cart.CartItems.Sum(ci => ci.PointsUsed);

            return new CartResponse(cart.Id, cart.IsActive, itemResponses, total, totalPointsUsed);
        }

        public async Task<CartItemResponse> AddOrUpdateItemAsync(string email, CartItemRequest request)
        {
            var cart = await GetOrCreateCartAsync(email);
            var product = await _context.Products.FindAsync(request.ProductId);
            
            if (product == null) throw new Exception("Product not found");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) throw new Exception("User not found");

           
            decimal priceToUse;
            int pointsToUse = 0;
            string priceType = request.PriceType?.ToUpper() ?? "MRP";

            if (priceType == "MRP")
            {
               
                priceToUse = product.MrpPrice ?? 0;
            }
            else if (priceType == "LOYALTY")
            {
                
                var loyaltyCard = await GetActiveLoyaltyCard(user.Id);
                if (loyaltyCard == null)
                {
                    throw new Exception("Loyalty pricing requires an active loyalty card");
                }
                if (product.CardholderPrice == null)
                {
                    throw new Exception("This product does not have a cardholder price");
                }
                priceToUse = product.CardholderPrice.Value;
                
                
                if (product.PointsToBeRedeem != null && product.PointsToBeRedeem > 0)
                {
                    pointsToUse = product.PointsToBeRedeem.Value * request.Quantity;
                    
                    
                    int usedInCart = await GetUsedPointsInCart(cart.Id);
                    int availablePoints = (loyaltyCard.PointsBalance ?? 0) - usedInCart;
                    
                    if (pointsToUse > availablePoints)
                    {
                        throw new Exception($"Insufficient loyalty points. Required: {pointsToUse}, Available: {availablePoints}. Please remove items from cart to continue.");
                    }
                }
            }
            else if (priceType == "POINTS")
            {
                
                var loyaltyCard = await GetActiveLoyaltyCard(user.Id);
                if (loyaltyCard == null)
                {
                    throw new Exception("Points redemption requires an active loyalty card");
                }
                if (product.PointsToBeRedeem == null || product.PointsToBeRedeem <= 0)
                {
                    throw new Exception("This product cannot be purchased with points");
                }
                
                pointsToUse = product.PointsToBeRedeem.Value * request.Quantity;
                
              
                int usedInCart = await GetUsedPointsInCart(cart.Id);
                int availablePoints = (loyaltyCard.PointsBalance ?? 0) - usedInCart;
                
                if (pointsToUse > availablePoints)
                {
                    throw new Exception($"Insufficient loyalty points. Required: {pointsToUse}, Available: {availablePoints}. Please remove items from cart to continue.");
                }
                
               
                priceToUse = product.MrpPrice ?? 0;
            }
            else
            {
                throw new Exception($"Invalid price type: {priceType}. Must be MRP, LOYALTY, or POINTS");
            }

            
            var cartItem = await _context.Cartitems
                .FirstOrDefaultAsync(ci => ci.CartId == cart.Id && ci.ProductId == request.ProductId);

            if (cartItem != null)
            {
                
                int oldPointsUsed = cartItem.PointsUsed;
                cartItem.Quantity += request.Quantity;
                cartItem.PriceSnapshot = priceToUse;
                cartItem.PriceType = priceType;
                
                
                if (priceType == "POINTS" || (priceType == "LOYALTY" && product.PointsToBeRedeem > 0))
                {
                    cartItem.PointsUsed = (product.PointsToBeRedeem ?? 0) * cartItem.Quantity;
                }
                else
                {
                    cartItem.PointsUsed = 0;
                }
            }
            else
            {
                cartItem = new Cartitem
                {
                    CartId = cart.Id,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    PriceSnapshot = priceToUse,
                    PriceType = priceType,
                    PointsUsed = pointsToUse
                };
                _context.Cartitems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            
           
            await _context.Entry(cartItem).Reference(ci => ci.Product).LoadAsync();
            return MapToResponse(cartItem);
        }

        public async Task<bool> RemoveItemAsync(string email, int cartItemId)
        {
            var cartItem = await _context.Cartitems
                .Include(ci => ci.Cart)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null || cartItem.Cart.User.Email != email) return false;

            _context.Cartitems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CartItemResponse> UpdateQuantityAsync(string email, int cartItemId, int quantity)
        {
            var cartItem = await _context.Cartitems
                .Include(ci => ci.Product)
                .Include(ci => ci.Cart)
                    .ThenInclude(c => c.User)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null || cartItem.Cart.User.Email != email) 
                throw new Exception("Not authorized or item not found");

            if (quantity <= 0) throw new Exception("Quantity must be greater than 0");

            
            if (cartItem.PriceType == "POINTS" || 
                (cartItem.PriceType == "LOYALTY" && cartItem.Product?.PointsToBeRedeem > 0))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user != null)
                {
                    var loyaltyCard = await GetActiveLoyaltyCard(user.Id);
                    if (loyaltyCard != null)
                    {
                        int newPointsRequired = (cartItem.Product?.PointsToBeRedeem ?? 0) * quantity;
                        int currentUsedPoints = await GetUsedPointsInCart(cartItem.CartId);
                        int pointsFromThisItem = cartItem.PointsUsed;
                        int availablePoints = (loyaltyCard.PointsBalance ?? 0) - currentUsedPoints + pointsFromThisItem;

                        if (newPointsRequired > availablePoints)
                        {
                            throw new Exception($"Insufficient loyalty points for this quantity. Maximum allowed: {availablePoints / (cartItem.Product?.PointsToBeRedeem ?? 1)}");
                        }

                        cartItem.PointsUsed = newPointsRequired;
                    }
                }
            }

            cartItem.Quantity = quantity;
            await _context.SaveChangesAsync();
            return MapToResponse(cartItem);
        }

        private CartItemResponse MapToResponse(Cartitem item)
        {
            return new CartItemResponse(
                item.Id,
                item.CartId,
                item.ProductId,
                item.Product?.ProdName ?? "Unknown Product",
                item.Product?.ProdImagePath,
                item.Quantity,
                item.PriceSnapshot,
                item.Product?.MrpPrice,
                item.Product?.CardholderPrice,
                item.Product?.PointsToBeRedeem,
                item.PriceSnapshot * item.Quantity,
                item.PriceType,
                item.PointsUsed
            );
        }
    }
}
