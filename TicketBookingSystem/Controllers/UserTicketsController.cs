using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using TicketBookingSystem.Auth;
using TicketBookingSystem.Models;
using TicketBookingSystem.Utils;

namespace TicketBookingSystem.Controllers
{
	public class UserTicketsController : Controller
	{
		private TicketBookingDbContext _context;
		private ApplicationUserManager _userManager;
		private GmailSender _mailSender;

        public UserTicketsController(TicketBookingDbContext context, ApplicationUserManager userManager, GmailSender mailSender)
		{
			_context = context;
			_userManager = userManager;
			_mailSender = mailSender;
        }
		[HttpPost]
		public IActionResult Check(Guid ticketId)
		{
            _context.UserTickets.Where(n => n.TicketStatus == "A" && n.Concert.Status == "P")
                .ExecuteUpdate(n => n.SetProperty(n => n.TicketStatus, "C"));
			var ticket = _context.UserTickets.FirstOrDefault(n => n.Id == ticketId);
			if (ticket == null) return Json(new { status="not exist" });
			if(ticket.TicketStatus != "A") return Json(new { status = "ticket not active" });
            return Json(new { status = "succesful" });
        }
		[HttpPost]
		[Authorize]
		public IActionResult Book(int concertId, int? seat, string? promocode)
		{
			var concert = _context.Concerts.FirstOrDefault(n=>n.Id == concertId);
            var user = _userManager.GetCurrentUser(HttpContext);
            if (user != null && concert!= null && concert.Status == "A") {
				if(_userManager.GetUserClaims(user).Count(n=>n.Value == Permissions.CanUseManagerPanel) > 0)
                    return Json(new { errors = new string[] { "Менеджер не может бронировать билеты" } });
                if ((concert.ConcertDate - DateTime.Now).TotalHours > 2)
				{
					int count = _context.UserTickets.Count(n => n.ConcertId == concert.Id && n.TicketStatus == "A");
					if (count < concert.TicketsCount)
					{
						var place = _context.ConcertPlaces.FirstOrDefault(n => n.Id == concert.Place);
						if(place == null) return Json(new { errors = new string[] {"Ошибка место проведения данного концерта не существует" } });
						Promocode? promocodeInfo = _context.Promocodes.FirstOrDefault(n => n.Available == "Y" && n.Code == promocode);
						if (promocode != null)
						{
							if (promocodeInfo == null) return Json(new { errors = new string[] { "Введённый промокод не существует" }, });
							else if(promocodeInfo.Concert != concertId && promocodeInfo.ConcertType != place.Type)
								return Json(new { errors = new string[] { "Введённый промокод не действует на данный товар" }, });
						}
						if (seat != null)
						{
							if (seat < 0 || place.SeatsInRow == null || place.RowCounts == null || seat % 100 >= place.SeatsInRow  && seat/100 >= place.RowCounts)
							{
								return Json(new { errors = new string[] { "Бронирование данного места в зале невозможно" }, });
							}
							if(_context.UserTickets.Any(n=>n.ConcertId == concertId && n.TicketStatus == "A" && n.Seat == seat))
							{
								return Json(new { errors = new string[] { "Выбранное место в зале уже занято" }, });
							}
						}
						else if (place.SeatsInRow != null)
							{
								return Json(new { errors = new string[] { "Для бронирования билета на данный концерт требуется выбрать место в зале" }, });
							}
						var bookied = _context.UserTickets.Where(n => n.User == user.UserName && n.ConcertId == concert.Id && n.TicketStatus == "C")
							.AsEnumerable().FirstOrDefault(n => n.User == user.UserName);
						if (bookied != null)
						{
							bookied.TicketStatus = "A";
							bookied.Promocode = promocode;
							bookied.Seat = seat;
							try
							{
                                _context.SaveChanges();
                                bookied.Concert = concert;
                                _mailSender.SendTicketByEmail(user.Email, TicketGenerator.GenerateTicket(bookied));
							}catch
							{
								var added = _context.UserTickets.FirstOrDefault(n => n.Id == bookied.Id);
								if(added != null)
								{
									_context.UserTickets.Remove(added);
                                    _context.SaveChanges();
                                }
                                return Json(new { errors = new string[] { "Не удалось забронировать билет из-за неполадок на сервере" }, });
                            }
                            return Json(new
							{
								concert_id = bookied.ConcertId,
								concert = concert.Performer,
								concert_date = concert.ConcertDate,
								ticket_cost = concert.TicketCost * (promocodeInfo != null ? 1 - promocodeInfo.Discount : 1)
							});
						}
						UserTicket ticket = new UserTicket();
						ticket.TicketStatus = "A";
						ticket.Seat = seat;
						ticket.Promocode = promocode;
						ticket.User = user.UserName;
						ticket.ConcertId = concertId;
                        try
                        {
                            _context.UserTickets.Add(ticket);
                            _context.SaveChanges();
                            ticket.Concert = concert;
                            _mailSender.SendTicketByEmail(user.Email, TicketGenerator.GenerateTicket(ticket));
                        }
                        catch
                        {
                            var added = _context.UserTickets.FirstOrDefault(n => n.Id == ticket.Id);
                            if (added != null)
                            {
                                _context.UserTickets.Remove(added);
                                _context.SaveChanges();
                            }
                            return Json(new { errors = new string[] { "Не удалось забронировать билет из-за неполадок на сервере" }, });
                        }
                        return Json(new
						{
							concert_id = ticket.ConcertId,
							concert = concert.Performer,
							concert_date = concert.ConcertDate,
							ticket_cost = concert.TicketCost * (promocodeInfo != null ? 1 - promocodeInfo.Discount : 1)
						});
					}
					else
					{
						return Json(new { errors = new string[] { "Билеты закончились, невозможно забронировать" }, });
					}
				}
				else
				{
					concert.Status = "P";
					_context.SaveChanges();
				}
			}
			return Json(new{ errors = new string[] {"Концерт не доступен для бронирования"}, });
		}
		[HttpDelete]
		[Authorize]
		public IActionResult Unbook(Guid ticketId)
		{
			var ticket = _context.UserTickets.FirstOrDefault(n => n.Id == ticketId && n.TicketStatus == "A");
			if(ticket == null)return Json(new { errors = new string[] { "Данный билет не забронирован" }, });
			string username = _userManager.GetCurrentUserId(HttpContext);
			if(ticket.User != username) return Json(new { errors = new string[] { "Невозможно отменить бронирование билета если он вам не принадлежит" }, });
			ticket.TicketStatus = "C";
			_context.SaveChanges();
			var concert = _context.Concerts.First(n => n.Id == ticket.ConcertId);
			return Json(new {
				concert_id = ticket.ConcertId,
				concert = concert.Performer,
				concert_date = concert.ConcertDate,
			});
		}
		[HttpGet]
		[Authorize]
		public IActionResult List(int page)
		{
			if (page < 1) page = 1;
			string username = _userManager.GetCurrentUserId(HttpContext);
			_context.UserTickets.Where(n => n.User == username && n.TicketStatus == "A" && n.Concert.Status == "P")
				.ExecuteUpdate(n => n.SetProperty(n => n.TicketStatus, "C"));
            var tickets = _context.UserTickets
				.Join(_context.ConcertTickets,
                      u => u.ConcertId,
					  c => c.Id,
					  (u, c) => new {
						  u.Id,
						  u.Seat,
						  Concert=c,
						  Promocode=_context.Promocodes.FirstOrDefault(n=>n.Code == u.Promocode),
                          u.User,
                          u.TicketStatus 
					  }
                ).Where(n => n.User == username && n.TicketStatus == "A").OrderBy(n=>n.Id).AsEnumerable().Where(n => n.User == username);
			var pagesCount = (tickets.Count() - 1) / 9 + 1;
			if (page > pagesCount) page = pagesCount;
			return Json(new
			{
				tickets = tickets
				.Skip(page * 9 - 9)
				.Take(9),
				page,
				pagesCount
			});
		}
        [HttpGet]
        [Authorize]
        public IActionResult ListNotActive(int page)
        {
            if (page < 1) page = 1;
            string username = _userManager.GetCurrentUserId(HttpContext);
            _context.UserTickets.Where(n => n.User == username && n.TicketStatus == "A" && n.Concert.Status == "P")
                .ExecuteUpdate(n => n.SetProperty(n => n.TicketStatus, "C"));
            var tickets = _context.UserTickets
                .Join(_context.ConcertTickets,
                      u => u.ConcertId,
                      c => c.Id,
                      (u, c) => new {
						  u.Id,
                          c.Performer,
						  c.ConcertDate,
						  c.PlaceRoom,
                          c.TicketCost,
                          Promocode = _context.Promocodes.FirstOrDefault(n => n.Code == u.Promocode),
                          u.User,
                          u.TicketStatus
                      }
                ).Where(n => n.User == username && n.TicketStatus != "A").OrderBy(n => n.Id).AsEnumerable().Where(n => n.User == username);
            var pagesCount = (tickets.Count() - 1) / 9 + 1;
            if (page > pagesCount) page = pagesCount;
            return Json(new
            {
                tickets = tickets
                .Skip(page * 9 - 9)
                .Take(9),
                page,
                pagesCount
            });
        }
    }
}
