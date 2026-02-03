using EMart.Data;
using EMart.DTOs;
using Microsoft.EntityFrameworkCore;

namespace EMart.Services
{
    public interface ICategoryService
    {
        Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync();
        Task<CategoryDto?> GetCategoryByIdAsync(int id);
        Task<IEnumerable<CategoryDto>> GetSubcategoriesAsync(string catId);
    }

    public class CategoryService : ICategoryService
    {
        private readonly EMartDbContext _context;

        public CategoryService(EMartDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllCategoriesAsync()
        {
            return await _context.Catmasters
                .Select(c => new CategoryDto(c.Id, c.CatId, c.SubcatId, c.CatName, c.CatImagePath, c.Flag))
                .ToListAsync();
        }

        public async Task<CategoryDto?> GetCategoryByIdAsync(int id)
        {
            var c = await _context.Catmasters.FindAsync(id);
            if (c == null) return null;
            return new CategoryDto(c.Id, c.CatId, c.SubcatId, c.CatName, c.CatImagePath, c.Flag);
        }

        public async Task<IEnumerable<CategoryDto>> GetSubcategoriesAsync(string catId)
        {
            return await _context.Catmasters
                .Where(c => c.CatId == catId && c.SubcatId != "0")
                .Select(c => new CategoryDto(c.Id, c.CatId, c.SubcatId, c.CatName, c.CatImagePath, c.Flag))
                .ToListAsync();
        }
    }
}
