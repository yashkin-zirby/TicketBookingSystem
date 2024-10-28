using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class UserTicket
{
    public Guid Id { get; set; }

    public string User { get; set; } = null!;

    public int ConcertId { get; set; }

    public int? Seat { get; set; }

    public string? Promocode { get; set; }

    public string TicketStatus { get; set; } = null!;

    public virtual Concert Concert { get; set; } = null!;

    public virtual Promocode? PromocodeNavigation { get; set; }

    public virtual User UserNavigation { get; set; } = null!;
}
