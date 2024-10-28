using QRCoder;
using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using TicketBookingSystem.Models;

namespace TicketBookingSystem.Utils
{
	public static class TicketGenerator
	{
		public static Image GenerateTicket(UserTicket ticket)
		{
			if (ticket.Concert == null) throw new ArgumentException("Concert not defined in UserTicket");
			var id = ticket.Id.ToString("N");
			var qr = GenerateQR(id);
			Image<Rgb48> image = new Image<Rgb48>(370,600, Color.White.ToPixel<Rgb48>());
			image.Mutate(n => n.DrawImage(qr, new Point(0,0),1));
			image = DrawCommonText(image, new Point(0,qr.Height),ticket.Concert.Performer,20, 20,true);
			image = DrawCommonText(image, new Point(0, qr.Height + 40),"Дата: " + ticket.Concert.ConcertDate.ToString("dd.MM.yyyy HH:mm"), 18, 30);
			image = DrawCommonText(image, new Point(0, qr.Height + 80), "Место проведения: " + ticket.Concert.PlaceNavigation.PlaceRoom, 18, 30);

			var font = SystemFonts.CreateFont("Arial", 18);
			var textOptions = new RichTextOptions(font);
			textOptions.HorizontalAlignment = HorizontalAlignment.Center;
			textOptions.Origin = new Point(image.Width/2,image.Height-76);
			if(ticket.Seat != null) image.Mutate(n => n.DrawText(textOptions, "Ряд    " + (ticket.Seat / 100 + 1) + "    Место    " + (ticket.Seat % 100 + 1), Color.Black)
			);
			textOptions = new RichTextOptions(SystemFonts.CreateFont("Arial", 18, FontStyle.Bold));
			textOptions.HorizontalAlignment = HorizontalAlignment.Center;
			textOptions.Origin = new Point(image.Width / 2, image.Height - 32);
			image.Mutate(n => n.FillPolygon(new SolidBrush(Color.FromRgb(0, 255, 144)), new PointF[] {
				new PointF(0,image.Height-50),
				new PointF(image.Width,image.Height-50),
				new PointF(image.Width,image.Height),
				new PointF(0,image.Height),
			}));
			image.Mutate(n => n.DrawText(textOptions, (ticket.Concert.TicketCost) + " BYN", Color.White));
			return image;
		}
		private static Image<Rgb48> DrawCommonText(Image<Rgb48> image, Point possition, string text, int fontSize, int padding, bool bold = false)
		{
			var font = SystemFonts.CreateFont("Arial", fontSize, bold?FontStyle.Bold:FontStyle.Regular);
			var textOptions = new RichTextOptions(font);
			textOptions.WrappingLength = image.Width - (padding * 2) - possition.X;
			possition.X += padding;
			textOptions.Origin = possition;
			image.Mutate(n => n.DrawText(textOptions, text, Color.Black)
			);
			return image;
		}
		public static Image GenerateQR(string ticketId)
		{
			QRCodeGenerator _qrGenerator = new QRCodeGenerator();
			var qrCodeData = _qrGenerator.CreateQrCode(ticketId, QRCodeGenerator.ECCLevel.Q);
			QRCode qrCode = new QRCode(qrCodeData);
			return qrCode.GetGraphic(10,Color.FromRgb(29,29,29), Color.White, true);
		}
		public static void SaveQrCode(Image qr)
		{
			qr.SaveAsPng("qr.png");
		}
	}
}
