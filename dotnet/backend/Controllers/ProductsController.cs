using EMart.Services;
using EMart.Models;
using Microsoft.AspNetCore.Mvc;

namespace EMart.Controllers
{
    [ApiController]
    [Route("api/products")] 
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        
        [HttpPost]
        public async Task<ActionResult<Product>> SaveProduct([FromBody] Product product)
        {
            var saved = await _productService.SaveProductAsync(product);
            return StatusCode(201, saved);
        }

        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllProductsAsync();
            return Ok(products);
        }

        // GET product by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null) return NotFound();
            return Ok(product);
        }

       
        [HttpDelete("{id}")]
        public async Task<ActionResult<string>> DeleteProduct(int id)
        {
            await _productService.DeleteProductAsync(id);
            return Ok("Product deleted successfully");
        }

        
        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId)
        {
            var products = await _productService.GetProductsByCategoryAsync(categoryId);
            return Ok(products);
        }

        
        [HttpGet("search")]
        public async Task<List<Product>> SearchProducts([FromQuery] string q)
        {
            return await _productService.SearchProductsAsync(q);
        }
    }
}
