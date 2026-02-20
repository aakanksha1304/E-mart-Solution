using Microsoft.AspNetCore.Mvc;
using EMart.Models;
using EMart.DTOs;
using EMart.Services;

namespace EMart.Controllers
{
    [ApiController]
    [Route("auth")] // Matches Java @RequestMapping("/auth")
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJwtTokenService _jwtService;
        private readonly IEmailService _emailService;

        public AuthController(IUserService userService, IJwtTokenService jwtService, IEmailService emailService)
        {
            _userService = userService;
            _jwtService = jwtService;
            _emailService = emailService;
        }

     
        [HttpPost("register")]
        public async Task<ActionResult<LoginResponseDTO>> Register([FromBody] User user)
        {
            try 
            {
                var savedUser = await _userService.RegisterAsync(user);

                var response = new LoginResponseDTO
                {
                    UserId = savedUser.Id,
                    CartId = savedUser.Cart?.Id,
                    FullName = savedUser.FullName,
                    Email = savedUser.Email,
                    Message = "Registration successful"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

  
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginRequest request)
        {
            try
            {
             
                var user = await _userService.LoginAsync(request.Email, request.Password);

                if (user == null) return Unauthorized(new { message = "Invalid credentials" });

                
                await _emailService.SendLoginSuccessMailAsync(user);

             
                var token = _jwtService.GenerateToken(user);

                
                var response = new LoginResponseDTO
                {
                    UserId = user.Id,
                    CartId = user.Cart?.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Token = token,
                    Message = "Login successful + Email Sent!"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }

 
 [HttpPost("google")]
        public async Task<ActionResult<LoginResponseDTO>> GoogleLogin([FromBody] GoogleLoginRequest request)
        {
            try
            {
               
                var user = await _userService.LoginWithGoogleAsync(request.Email, request.FullName);

                if (user == null) return BadRequest(new { message = "Google login failed" });

                
                await _emailService.SendLoginSuccessMailAsync(user);

                
                var token = _jwtService.GenerateToken(user);

           
                var response = new LoginResponseDTO
                {
                    UserId = user.Id,
                    CartId = user.Cart?.Id,
                    FullName = user.FullName,
                    Email = user.Email,
                    Token = token,
                    Message = "Google login successful + Email Sent!"
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
