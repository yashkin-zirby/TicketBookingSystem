using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class UserRole
{
    public int Id { get; set; }

    public string RoleTitle { get; set; } = null!;

    public string CanAddConcert { get; set; } = null!;

    public string CanAddPromocode { get; set; } = null!;

    public string CanUseManagerPanel { get; set; } = null!;

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
