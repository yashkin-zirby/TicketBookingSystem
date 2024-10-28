using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class Promocode
{
    public string Code { get; set; } = null!;

    public double Discount { get; set; }

    public int? Concert { get; set; }

    public string? ConcertType { get; set; }

    public string Available { get; set; } = null!;

    public virtual Concert? ConcertNavigation { get; set; }

    public virtual ConcertType? ConcertTypeNavigation { get; set; }

    public virtual ICollection<UserTicket> UserTickets { get; set; } = new List<UserTicket>();
}
