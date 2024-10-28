using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class ConcertPlace
{
    public int Id { get; set; }

    public string PlaceId { get; set; } = null!;

    public string PlaceRoom { get; set; } = null!;

    public string Type { get; set; } = null!;

    public int? RowCounts { get; set; }

    public int? SeatsInRow { get; set; }

    public virtual ICollection<Concert> Concerts { get; set; } = new List<Concert>();

    public virtual ConcertType TypeNavigation { get; set; } = null!;
}
