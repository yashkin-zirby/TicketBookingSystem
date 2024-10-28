using Microsoft.AspNetCore.Mvc;

namespace TicketBookingSystem
{
    [NonController]
    public class ConcertSearchQueryParameters
    {
        public string ConcertStatus { get; set; } = "";
        public string ConcertType { get; set; } = "";
        public DateTime BeginDate { get; set; } = DateTime.Now;
        public DateTime EndDate { get; set; } = DateTime.MaxValue;
        public float BeginPrice { get; set; } = 0;
        public float EndPrice { get; set; } = float.MaxValue;
        public string Query { get; set; } = "";
    }
}
