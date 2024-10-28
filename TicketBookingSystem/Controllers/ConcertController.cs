using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Runtime.Serialization.Json;
using TicketBookingSystem.Auth;
using TicketBookingSystem.Models;
using TicketBookingSystem.Utils;

namespace TicketBookingSystem.Controllers
{
    public class ConcertController : Controller
    {
        private TicketBookingDbContext _context;
        private GmailSender _gmailSender;
        public ConcertController(TicketBookingDbContext context, GmailSender gmailSender)
        {
            _context = context;
            _gmailSender = gmailSender;
		}
		[HttpGet]
        public IActionResult List(int page, ConcertSearchQueryParameters parameters)
        {
			if (page < 1) page = 1;
            var query = parameters.Query.ToLower();
            DateTime expired = DateTime.Now + TimeSpan.FromHours(2);
            _context.Concerts.Where(n => n.Status == "A" && n.ConcertDate <= expired)
                .ExecuteUpdate(n => n.SetProperty(n => n.Status, "P"));
			var tickets = _context.ConcertTickets.Where(n => n.ConcertDate >= parameters.BeginDate && n.ConcertDate <= parameters.EndDate &&
                                                      n.TicketCost >= parameters.BeginPrice && n.TicketCost <= parameters.EndPrice &&
                                                      n.Status.Contains(parameters.ConcertStatus) && n.Type.Contains(parameters.ConcertType) &&
                                                      (n.ConcertData.ToLower().Contains(query) ||
													   n.Performer.ToLower().Contains(query)))
                                            .OrderBy(n => n.Id);
			var pagesCount = (tickets.Count() - 1) / 9 + 1;
            if (page > pagesCount) page = pagesCount;
			return Json(new {
                concerts=tickets
                .Skip(page * 9 - 9)
                .Take(9),
                page,
                pagesCount
			});
        }
        public IActionResult BookiedSeats(int concertId)
        {
            return Json(
                _context.UserTickets
                .Where(n => n.ConcertId == concertId && n.TicketStatus == "A")
                .Select(n => n.Seat)
                );
        }
        [HttpGet]
        public IActionResult AvailableConcertTimesInDate(int place ,DateTime date)
        {
            var times = new DateTime[] {
                date.Date.Add(TimeSpan.FromHours(9)),
                date.Date.Add(TimeSpan.FromHours(10.5)),
                date.Date.Add(TimeSpan.FromHours(12)),
                date.Date.Add(TimeSpan.FromHours(13.5)),
                date.Date.Add(TimeSpan.FromHours(15)),
                date.Date.Add(TimeSpan.FromHours(16.5)),
                date.Date.Add(TimeSpan.FromHours(18))
            };
            return Json(times.Except(
                    _context.Concerts.Where(n => n.ConcertDate.Date == date.Date && n.Status == "A" && n.Place == place).Select(n=>n.ConcertDate))
                );
        }
        [HttpGet]
        [Authorize(Permissions.CanUseManagerPanel)]
        public IActionResult All(int page)
        {
            if (page < 1) page = 1;
            DateTime expired = DateTime.Now + TimeSpan.FromHours(2);
            _context.Concerts.Where(n => n.Status == "A" && n.ConcertDate <= expired)
                .ExecuteUpdate(n => n.SetProperty(n => n.Status, "P"));
            var tickets = _context.ConcertInfos.OrderBy(n => n.Id);
            var pagesCount = (tickets.Count() - 1) / 12 + 1;
            if (page > pagesCount) page = pagesCount;
            return Json(new
            {
                concerts = tickets
                .Skip(page * 12 - 12)
                .Take(12),
                page,
                pagesCount
            });
        }
        [Authorize(Permissions.CanAddConcert)]
        [HttpDelete]
        public IActionResult Remove(int? id, string message)
        {
            var concert = _context.Concerts.FirstOrDefault(n => n.Id == id);
            if (concert == null) return Json(new { errors = new string[] {$"Концерт с заданным id({id}) не существует" } });
            if(concert.Status != "A") return Json(new { errors = new string[] { $"Не активный концерт отменить невозможно" } });
            if (string.IsNullOrEmpty(message)) return Json(new { errors = new string[] { $"Требуется обязательно указать причину отмены концерта" } });
            concert.Status = "D";
            var tickets = _context.UserTickets.Where(n => n.ConcertId == concert.Id);
            foreach(var ticket in tickets)
            {
                ticket.TicketStatus = "D";
                var user = _context.Users.FirstOrDefault(n => n.UserName == ticket.User);
                if (user != null)
                {
                    try
                    {
                        _gmailSender.SendMessage(user.Email, "Сожалеем, но концерт отменён", message);
                    }
                    catch(Exception e)
                    {
                        Console.WriteLine(e.Message);
                    }
                }
            }
            if (_context.SaveChanges() == 0) return Json(new { errors = new string[] { $"Не удалось удалить концерт" } });
            return Json(new{concert.Id,concert.Status,concert.ConcertData,concert.ConcertDate,concert.TicketCost,concert.TicketsCount,concert.Performer, concert.Place });
        }
        [Authorize(Permissions.CanAddConcert)]
        [HttpPost]
        public IActionResult Add(string performer, DateTime? concertDate, int place, int ticketsCount, double ticketCost, string data)
        {
            var concert = new Concert();
            List<string> errors = new List<string>();
            if (string.IsNullOrEmpty(performer)) errors.Add("Параметр Performer обязателен");
            concert.Performer = performer;
			if (concertDate == null || concertDate.Value.Date == DateTime.Today) errors.Add("Параметр ConcertDate обязателен и не может быть равен сегодняшнему дню");
			else concert.ConcertDate = concertDate.Value;
            if (_context.ConcertPlaces.Count(x => x.Id == place) == 0) errors.Add($"Место с id {place} не существует");
            concert.Place = place;
			if (ticketsCount <= 0) errors.Add($"Число билетов должно быть больше 0");
			concert.TicketsCount = ticketsCount;
			if (ticketCost < 0) errors.Add($"Цена за билет не может быть меньше 0");
			concert.TicketCost = ticketCost;
			if (string.IsNullOrEmpty(data)) errors.Add($"Параметр ConcertData обязятельный");
            if(errors.Count() > 0)return Json(new {errors});
			concert.ConcertData = string.Join('\n',data.Split(";"));
			concert.Status = "A";
			_context.Concerts.Add(concert);
            try
            {
                if (_context.SaveChanges() == 0) return Json(new { errors = new string[] { $"Не удалось добавить концерт" } });
            }
            catch(Exception e)
            {
                return Json(new { errors = new string[] { e.Message } });
            }
			return Json(concert);
        }
	}
}
