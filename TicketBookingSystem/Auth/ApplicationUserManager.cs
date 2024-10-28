using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System.Data;
using System.Security.Claims;
using System.Security.Cryptography;
using TicketBookingSystem.Models;

namespace TicketBookingSystem.Auth
{
	public class ApplicationUserManager : UserManager<User>
	{
		private TicketBookingDbContext _ticketBookingDbContext;
		public ApplicationUserManager(TicketBookingDbContext store, IOptions<IdentityOptions> optionsAccessor, IPasswordHasher<User> passwordHasher, IEnumerable<IUserValidator<User>> userValidators, IEnumerable<IPasswordValidator<User>> passwordValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, IServiceProvider services, ILogger<UserManager<User>> logger) : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
		{
			_ticketBookingDbContext = store;
		}
		private static SHA256 sha256 = SHA256.Create();
		public static string CalculateHash(string data)
		{
			var bytes = System.Text.Encoding.UTF8.GetBytes(data);
			var hashBytes = sha256.ComputeHash(bytes);
			return Convert.ToBase64String(hashBytes);
		}
		public override async Task<IdentityResult> CreateAsync(User user)
		{
			user.PasswordHash = CalculateHash(user.PasswordHash);
			return await _ticketBookingDbContext.CreateAsync(user, CancellationToken.None);
		}
		public override async Task<IdentityResult> CreateAsync(User user, string password)
		{
			user.PasswordHash = CalculateHash(password);
			return await _ticketBookingDbContext.CreateAsync(user, CancellationToken.None);
		}
		public async Task SignInAsync(HttpContext httpContext, User user, bool isPersistent = false)
		{
			ClaimsIdentity identity = new ClaimsIdentity(this.GetUserClaims(user), CookieAuthenticationDefaults.AuthenticationScheme);
			ClaimsPrincipal principal = new ClaimsPrincipal(identity);

			await httpContext.SignInAsync(
			  CookieAuthenticationDefaults.AuthenticationScheme, principal, new AuthenticationProperties() { IsPersistent = isPersistent }
			);
		}
		public override async Task<bool> CheckPasswordAsync(User user, string password)
		{
			if (user == null) return false;
			return CalculateHash(password) == (await _ticketBookingDbContext.FindByNameAsync(user.UserName,CancellationToken.None)).PasswordHash;
		}
        public bool ChangePassword(User user, string password, string newPassword)
        {
            if (user == null) return false;
			if(user.IsGoogle == "Y")
			{
				user.IsGoogle = "N";
				user.PasswordHash = CalculateHash(newPassword);
				if(_ticketBookingDbContext.SaveChanges() > 0) return true;
				return false;
			}
			if (CalculateHash(password) == user.PasswordHash)
			{
                user.PasswordHash = CalculateHash(newPassword);
                if (_ticketBookingDbContext.SaveChanges() > 0) return true;
                return false;
            }
			return false;
        }
        public async Task SignOutAsync(HttpContext httpContext)
		{
			await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
		}
		public override async Task<User> GetUserAsync(ClaimsPrincipal principal)
		{
			if (principal.Identity == null || !principal.Identity.IsAuthenticated) return null;
			Claim? claim = principal.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
			if (claim == null) return null;
			return await _ticketBookingDbContext.FindByNameAsync(claim.Value,CancellationToken.None);
		}
		public UserRole? GetUserRole(User user)
		{
			return _ticketBookingDbContext.UserRoles.FirstOrDefault(n=>n.Id == user.Role);
		}
		public string GetCurrentUserId(HttpContext httpContext)
		{
			if (httpContext.User.Identity == null || !httpContext.User.Identity.IsAuthenticated)
				return "";

			Claim? claim = httpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

			if (claim == null)
				return "";

			return claim.Value;
		}
		public User? GetCurrentUser(HttpContext httpContext)
		{
			string currentUserId = this.GetCurrentUserId(httpContext);
			return this._ticketBookingDbContext.Users.FirstOrDefault(n=>n.UserName == currentUserId);
		}
		public override async Task<IList<Claim>> GetClaimsAsync(User user)
		{
			return GetUserClaims(user);
		}
		public IList<Claim> GetUserClaims(User user)
		{
			List<Claim> claims = new List<Claim>();
			var role = _ticketBookingDbContext.UserRoles.FirstOrDefault(n => n.Id == user.Role);
			if (role != null)
			{
				claims.Add(new Claim(ClaimTypes.NameIdentifier, user.UserName));
				if (role.CanAddConcert == "Y") claims.Add(new Claim(ClaimTypes.Permission, Permissions.CanAddConcert));
				if (role.CanAddPromocode == "Y") claims.Add(new Claim(ClaimTypes.Permission, Permissions.CanAddPromocode));
				if (role.CanUseManagerPanel == "Y") claims.Add(new Claim(ClaimTypes.Permission, Permissions.CanUseManagerPanel));
			}
			return claims;
		}
		public async Task SignInAsync(HttpContext httpContext, User user)
		{
			var httpUser = await GetUserAsync(httpContext.User);
			if (httpUser != null && httpUser.UserName == user.UserName)
			{
				return;
			}
			ClaimsIdentity identity = new ClaimsIdentity(this.GetUserClaims(user), CookieAuthenticationDefaults.AuthenticationScheme);
			ClaimsPrincipal principal = new ClaimsPrincipal(identity);
			await httpContext.SignInAsync(
			  CookieAuthenticationDefaults.AuthenticationScheme, principal
			);
		}
	}
}
