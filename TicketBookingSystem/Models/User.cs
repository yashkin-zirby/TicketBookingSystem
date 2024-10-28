using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class User
{
    public string UserName { get; set; } = null!;

	public string PasswordHash { get; set; } = null!;

	public string Email { get; set; } = null!;

    public string IsGoogle { get; set; } = null!;

    public int Role { get; set; }

    public string ImagePath { get; set; } = null!;

    public virtual UserRole RoleNavigation { get; set; } = null!;

    public virtual ICollection<UserTicket> UserTickets { get; set; } = new List<UserTicket>();
}
