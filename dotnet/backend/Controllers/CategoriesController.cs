using EMart.Services;
using Microsoft.AspNetCore.Mvc;

namespace EMart.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoriesController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _categoryService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _categoryService.GetCategoryByIdAsync(id);
            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpGet("subcategories/{catId}")]
        public async Task<IActionResult> GetSubcategories(string catId)
        {
            var subcategories = await _categoryService.GetSubcategoriesAsync(catId);
            return Ok(subcategories);
        }
    }
}
