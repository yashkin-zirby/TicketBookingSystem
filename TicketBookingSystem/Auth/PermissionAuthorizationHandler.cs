using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using TicketBookingSystem.Models;

namespace TicketBookingSystem.Auth
{
	internal class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
	{
		private ApplicationUserManager _userManager;
		private TicketBookingDbContext _context;

		public PermissionAuthorizationHandler(TicketBookingDbContext context, ApplicationUserManager userManager)
		{
			_userManager = userManager;
			_context = context;
		}


		protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
		{
			if (context.User == null)
			{
				return;
			}
			var user = await _userManager.GetUserAsync(context.User);
			if (user != null) {
				var userRole = _userManager.GetUserRole(user);
				if(userRole != null)
				{
					if (requirement.Permission == Permissions.CanUseManagerPanel &&
					   userRole.CanUseManagerPanel == "Y") context.Succeed(requirement);
					if (requirement.Permission == Permissions.CanAddPromocode &&
					   userRole.CanAddPromocode == "Y") context.Succeed(requirement);
					if (requirement.Permission == Permissions.CanAddConcert &&
					   userRole.CanAddConcert == "Y") context.Succeed(requirement);
					return;
				}
			}
			context.Fail(new AuthorizationFailureReason(this,"У пользователя отсутствует нужная привилегия"));
			return;
		}
	}
}
