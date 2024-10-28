using Microsoft.AspNetCore.Mvc;
using TicketBookingSystem.Models;

namespace TicketBookingSystem.Controllers
{
    public class PlaceController : Controller
    {
        private TicketBookingDbContext _dbContext;
        public PlaceController(TicketBookingDbContext dbContext)
        {
            _dbContext = dbContext;
        }
        [HttpGet]
        public IActionResult List(string? placeType)
        {
            return Json(_dbContext.ConcertPlaces.Where(n => n.Type == placeType).ToList());
        }
    }
}
