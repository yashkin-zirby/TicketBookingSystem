using System.Data;
using TicketBookingSystem.Models;

namespace TicketBookingSystem.Auth
{
	public class UserInfoResult
	{
		public User? User { get; set; }
		public bool Success { get; set; }
		public string? Error { get; set; }

		public UserInfoResult(User? user = null, bool success = false, string? error = null)
		{
			this.User = user;
			this.Success = success;
			this.Error = error;
		}
	}
}
