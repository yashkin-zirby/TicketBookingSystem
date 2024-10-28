using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using System.Text.RegularExpressions;
using TicketBookingSystem.Auth;
using TicketBookingSystem.Models;
using static Org.BouncyCastle.Crypto.Engines.SM2Engine;

namespace TicketBookingSystem.Controllers
{
    public class PromocodeController : Controller
    {
        private TicketBookingDbContext _context;
        public PromocodeController(TicketBookingDbContext context)
        {
            _context = context;
        }
        public IActionResult Check(string code)
        {
            var promocode = _context.Promocodes.Select(n => new {n.Code,n.Concert,n.Available,n.ConcertType,n.Discount }).FirstOrDefault(n => n.Code == code);
            return Json(promocode);
        }
        [Authorize(Permissions.CanUseManagerPanel)]
        [HttpGet]
        public IActionResult All(int page)
        {
            if (page < 1) page = 1;
            var promocodes = _context.Promocodes.Select(t=>new
                {
                    t.Code,
                    t.Discount,
                    t.Available,
                    ConcertId=t.Concert,
                    t.ConcertType,
                    Concert=_context.Concerts.Select(n=>new {n.Id, n.Performer, n.ConcertDate}).FirstOrDefault(n=>n.Id == t.Concert)
                }
                ).OrderBy(n => n.Code);
            var pagesCount = (promocodes.Count() - 1) / 12 + 1;
            if (page > pagesCount) page = pagesCount;
            return Json(new
            {
                promocodes = promocodes
                .Skip(page * 12 - 12)
                .Take(12),
                page,
                pagesCount
            });
        }
        [Authorize(Permissions.CanAddPromocode)]
        [HttpPost]
        public IActionResult Add(string code, int? concertId, string concertType, double discount)
        {
            Regex regex = new Regex("[^A-Za-zА-Яа-я\\d]");
            if(code == null || code.Length != 6 || regex.IsMatch(code)) return Json(new { errors = new string[] { "Некоректный код промокода" } });
            if (concertId == null && string.IsNullOrEmpty(concertType)) return Json(new { errors = new string[] { "Требуется задать либо id концерта либо тип" } });
            if (concertId != null && _context.Concerts.Count(n=>n.Id == concertId && n.Status == "A") == 0)
                return Json(new { errors = new string[] { "Данный концерт не существует или удалён" } });
            if (!string.IsNullOrEmpty(concertType) && _context.ConcertTypes.Count(n => n.Id == concertType) == 0)
                return Json(new { errors = new string[] { "Данный тип концерта не существует" } });
            if(discount < 0 || discount > 1) return Json(new { errors = new string[] { "Скидка должна быть в пределах от 0 до 1" } });
            var promocode = new Promocode();
            promocode.Available = "Y";
            promocode.Code = code;
            promocode.Concert = concertId;
            promocode.ConcertType = concertType;
            promocode.Discount = discount;
            _context.Promocodes.Add(promocode);
            if(_context.SaveChanges() > 0)
                return Json(new { promocode.Code, promocode.Available, promocode.Discount, promocode.Concert, promocode.ConcertType });
            return Json(new { errors = new string[] { "Не удалось добавить промокод, возможно промокод с таким кодом уже существует" } });
        }
        [Authorize(Permissions.CanAddPromocode)]
        [HttpDelete]
        public IActionResult Remove(string code)
        {
            Regex regex = new Regex("[^A-Za-zА-Яа-я\\d]");
            if (code == null || code.Length != 6 || regex.IsMatch(code)) return Json(new { errors = new string[] { "Некоректный код промокода" } });
            var promocode = _context.Promocodes.FirstOrDefault(n => n.Code == code);
            if(promocode == null)return Json(new { errors = new string[] { "Такой промокод не существует" } });
            if(promocode.Available == "N") return Json(new { errors = new string[] { "Промокод уже деактевирован" } });
            promocode.Available = "N";
            if (_context.SaveChanges() > 0)
                return Json(new { promocode.Code, promocode.Available, promocode.Discount, promocode.Concert, promocode.ConcertType });
            return Json(new { errors = new string[] { "Не удалось удалить промокод" } });
        }
    }
}
