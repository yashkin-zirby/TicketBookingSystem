using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using TicketBookingSystem.Auth;
using TicketBookingSystem.Models;

namespace TicketBookingSystem.Controllers
{
	public class UsersController : Controller
	{
		private TicketBookingDbContext _context;
		private ApplicationUserManager _userManager;
        private IWebHostEnvironment Environment;

        public UsersController(TicketBookingDbContext context, ApplicationUserManager userManager, IWebHostEnvironment _environment) {
			_context = context;
			_userManager = userManager;
            Environment = _environment;
        }
		[HttpPost]
		public async Task<IActionResult> Login(string userId, string password)
		{
			List<string> errors = new List<string>();
			var user = _context.Users.FirstOrDefault(n=>n.UserName == userId || n.Email == userId);
			if(user != null && await _userManager.CheckPasswordAsync(user,password))
			{
				await _userManager.SignInAsync(HttpContext, user);
				var claims = (await _userManager.GetClaimsAsync(user)).Where(n => n.Type == ClaimTypes.Permission).Select(n => n.Value);
                return Json(new
                {
                    username = user.UserName,
                    email = user.Email,
                    imagePath = user.ImagePath,
                    claims,
                    url = claims.Contains(Permissions.CanUseManagerPanel) ? "/panel" : "/"
                });
            }
			else
			{
				if(user == null)errors.Add("Пользователя с таким логином или email не существует");
				else errors.Add("Неправильный пароль");
				return Json(new { errors });
			}
		}
		[HttpPost]
		public async Task<IActionResult> Register(string username, string email, string password)
		{
			User newUser = new User();
			newUser.UserName = username;
			newUser.Email = email;
			newUser.PasswordHash = password;
			newUser.Role = 1;
			newUser.ImagePath = "";
			newUser.IsGoogle = "N";
			var result = await _userManager.CreateAsync(newUser);
			if (result.Succeeded)
			{
				await _userManager.SignInAsync(HttpContext, newUser);
				var claims = (await _userManager.GetClaimsAsync(newUser)).Where(n => n.Type == ClaimTypes.Permission).Select(n => n.Value);
                return Json(new
                {
                    username = newUser.UserName,
                    email = newUser.Email,
                    imagePath = newUser.ImagePath,
                    claims,
                    url = claims.Contains(Permissions.CanUseManagerPanel) ? "/panel" : "/"
                });
            }
			return Json(new {errors=result.Errors.Select(n=>n.Description) });
		}
		[HttpPost]
		public IActionResult GoogleLogin()
		{
			var properties = new AuthenticationProperties { RedirectUri = "/users/GoogleAuth" };
			return Challenge(properties, GoogleDefaults.AuthenticationScheme);
		}
		[Authorize]
		[HttpPost]
		public async Task<IActionResult> UploadProfile([FromForm]IFormFile profile)
		{
			var user = _userManager.GetCurrentUser(HttpContext);
            if (profile == null)
            {
                return Json(new { errors=new string[] { "Не выбран файл профиля" } });
            }
            if (user == null)
			{
				return BadRequest("Пользователь не определён");
            }
            string path = "/profile/"+ user.UserName + Path.GetExtension(profile.FileName);
            using (Stream fileStream = new FileStream("ClientApp/public" + path, FileMode.Create))
            {
                await profile.CopyToAsync(fileStream);
            }
			user.ImagePath = path;
			_context.SaveChanges();
            return Json(new { profilePath=path });
        }
        [Authorize]
		public async Task<IActionResult> Claims()
		{
			List<string> errors = new List<string>();
			var user = _userManager.GetCurrentUser(HttpContext);
			if (user != null)
			{
				var claims = (await _userManager.GetClaimsAsync(user)).Where(n => n.Type == ClaimTypes.Permission).Select(n => n.Value);
				return Json(new
				{
					username = user.UserName,
					email = user.Email,
                    imagePath = user.ImagePath,
					claims,
					url = claims.Contains(Permissions.CanUseManagerPanel) ? "/panel" : "/"
				});
			}
			return BadRequest("Пользователь не определён");
		}
        [Authorize]
		[HttpGet]
        public IActionResult Info()
        {
            List<string> errors = new List<string>();
            var user = _userManager.GetCurrentUser(HttpContext);
            if (user != null)
            {
				var role = _context.UserRoles.FirstOrDefault(n => n.Id == user.Role);
				if(role != null)user.RoleNavigation = role;
                return Json(user);
            }
            return BadRequest("Пользователь не определён");
        }
        [Authorize]
        [HttpPut]
        public IActionResult ChangePassword(string? oldPassword, string newPassword)
        {
            var user = _userManager.GetCurrentUser(HttpContext);
            if (user != null)
            {
                if(_userManager.ChangePassword(user, oldPassword??"", newPassword))
				{
                    return Json(new {message="Пароль успешно изменён" });
                }
				if(oldPassword == newPassword) Json(new { errors = new string[] { "Новый пароль не может совпадать со старым" } });
                if (newPassword.Length == 0) return Json(new { errors = new string[] { "Пароль не может быть пустым" } });
                return Json(new { errors = new string[]{"Не верный пароль"} });
            }
            return BadRequest("Пользователь не определён");
        }
        public async Task<IActionResult> GoogleAuth()
		{
			var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
			if(result.Principal == null) return Redirect("/auth/login");
			var claims = result.Principal.Identities.First()
				.Claims.ToDictionary(claim=> claim.Type,claim=>claim.Value);
			User user = await _context.FindByIdAsync(claims[ClaimTypes.GoogleEmail], cancellationToken: CancellationToken.None);
			if(user.Email != claims[ClaimTypes.GoogleEmail])
			{
				user.UserName = claims[ClaimTypes.GoogleName];
				while (_context.Users.Any(n => n.UserName == user.UserName)) user.UserName = "User"+DateTime.Now.Ticks+user.UserName.First();
				user.Email = claims[ClaimTypes.GoogleEmail];
				user.IsGoogle = "Y";
				user.PasswordHash = "";
				user.ImagePath = "";
				user.Role = 1;
				var createResult = await _context.CreateAsync(user, CancellationToken.None);
				if(!createResult.Succeeded)
				{
					return Redirect("/auth/login");
				}
			}
			await _userManager.SignInAsync(HttpContext, user);
			return Redirect("/auth/confirm");
		}
		[Authorize]
		[HttpPost]
		public async Task<IActionResult> Logout()
		{
			await _userManager.SignOutAsync(HttpContext);
			return Ok();
		}
	}
}
