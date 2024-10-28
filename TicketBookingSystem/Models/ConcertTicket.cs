using System.ComponentModel.DataAnnotations.Schema;

namespace TicketBookingSystem.Models
{
	public class ConcertTicket
	{
		public decimal Id { get; set; }

		public string Performer { get; set; } = null!;

		public double TicketCost { get; set; }

		public DateTime ConcertDate { get; set; }

		public string ConcertData { get; set; } = null!;

		public string Status { get; set; } = null!;

		public string PlaceId { get; set; } = null!;

		public string PlaceRoom { get; set; } = null!;

		public string Type { get; set; } = null!;

		public decimal? RowCounts { get; set; }

		public decimal? SeatsInRow { get; set; }

		public decimal TicketsCount { get; set; }

	}
}
