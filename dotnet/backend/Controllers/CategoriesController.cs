using EMart.Services;
using Microsoft.AspNetCore.Mvc;

namespace EMart.Controllers
{
    [ApiController]
    [Route("api/catalog")]
    public class CatalogController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CatalogController(ICategoryService service)
        {
            _service = service;
        }

       
        [HttpGet("categories")]
        public async Task<IActionResult> GetMainCategories()
        {
            var result = await _service.GetMainCategoriesAsync();
            return Ok(result);
        }

        
        [HttpGet("categories/{catId}")]
        public async Task<IActionResult> BrowseCategory(string catId)
        {
            var result = await _service.BrowseByCategoryAsync(catId);
            return Ok(result);
        }
    
    }
}
