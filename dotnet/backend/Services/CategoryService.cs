using EMart.Data;
using EMart.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetMainCategoriesAsync();
        Task<CategoryBrowseResponse> BrowseByCategoryAsync(string catId);
    }

    public class CategoryService : ICategoryService
    {
        private readonly EMartDbContext _context;

        public CategoryService(EMartDbContext context)
        {
            _context = context;
        }



        public async Task<IEnumerable<CategoryDto>> GetMainCategoriesAsync()
        {
            return await _context.Catmasters
                .Where(c => c.SubcatId == null || c.SubcatId == "0")
                .Select(c => new CategoryDto(
                    c.Id,
                    c.CatId,
                    c.SubcatId,
                    c.CatName,
                    c.CatImagePath,
                    c.Flag
                ))
                .ToListAsync();
        }


        public async Task<CategoryBrowseResponse> BrowseByCategoryAsync(string catId)
        {
            var response = new CategoryBrowseResponse();

           
            var category = await _context.Catmasters
                .FirstOrDefaultAsync(c => c.CatId == catId);

            if (category == null)
                throw new Exception($"Category not found: {catId}");

        
            var subCategories = await _context.Catmasters
                .Where(c => c.SubcatId == catId)
                .Select(c => new CategoryDto(
                    c.Id,
                    c.CatId,
                    c.SubcatId,
                    c.CatName,
                    c.CatImagePath,
                    c.Flag
                ))
                .ToListAsync();

           
            if (subCategories.Any())
            {
                response.HasSubCategories = true;
                response.SubCategories = subCategories;
                response.Products = null;
                return response;
            }

        
            var products = await _context.Products
    .Where(p => p.CategoryId == category.Id)
    .Select(p => new ProductDto(
        p.Id,
        p.ProdName,
        p.ProdImagePath,
        p.ProdShortDesc,
        p.ProdLongDesc,
        p.MrpPrice,
        p.CardholderPrice,
        p.PointsToBeRedeem,
        p.CategoryId
    ))
    .ToListAsync();


            response.HasSubCategories = false;
            response.SubCategories = null;
            response.Products = products;

            return response;
        }
    }
}
