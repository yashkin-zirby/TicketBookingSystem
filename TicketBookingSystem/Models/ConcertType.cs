using System;
using System.Collections.Generic;

namespace TicketBookingSystem.Models;

public partial class ConcertType
{
    public string Id { get; set; } = null!;

    public string TypeTitle { get; set; } = null!;

    public string HasSeats { get; set; } = null!;

    public virtual ICollection<ConcertPlace> ConcertPlaces { get; set; } = new List<ConcertPlace>();

    public virtual ICollection<Promocode> Promocodes { get; set; } = new List<Promocode>();
}
