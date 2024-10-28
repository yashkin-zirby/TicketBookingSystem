using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class Concert
{
    public int Id { get; set; }

    public string Performer { get; set; } = null!;

    public int TicketsCount { get; set; }

    public DateTime ConcertDate { get; set; }

    public int Place { get; set; }

    public string ConcertData { get; set; } = null!;

    public string Status { get; set; } = null!;

    public double TicketCost { get; set; }

    public virtual ConcertPlace PlaceNavigation { get; set; } = null!;

    public virtual ICollection<Promocode> Promocodes { get; set; } = new List<Promocode>();

    public virtual ICollection<UserTicket> UserTickets { get; set; } = new List<UserTicket>();
}
