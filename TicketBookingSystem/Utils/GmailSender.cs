using MimeKit;
using MailKit.Net.Smtp;
using System.Threading.Tasks;
using SixLabors.ImageSharp;

namespace TicketBookingSystem.Utils
{
	public class GmailSender
	{
		private string _email;
		private string _password;
		public GmailSender()
		{
			var mailUser = Configuration.GetApplicationMailUser();
			_email = mailUser.email;
			_password = mailUser.password;
		}
        public async void SendMessage(string email, string subject, string message)
        {
            using var emailMessage = new MimeMessage();
            emailMessage.From.Add(new MailboxAddress("Tickets.By", _email));
            emailMessage.To.Add(new MailboxAddress("", email));
            emailMessage.Subject = subject;
            emailMessage.Body = new TextPart() { Text = message };

            using (var client = new SmtpClient())
            {
                await client.ConnectAsync("smtp.gmail.com", 587, false);
                await client.AuthenticateAsync(_email, _password);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);
            }
        }
        public async void SendTicketByEmail(string email, Image ticket)
		{
			using var emailMessage = new MimeMessage();
			emailMessage.From.Add(new MailboxAddress("Tickets.By", _email));
			emailMessage.To.Add(new MailboxAddress("",email));
			emailMessage.Subject = "Билет успешно забронирован";
			var stream = new MemoryStream();
			ticket.SaveAsPng(stream);
			stream.Seek(0, SeekOrigin.Begin);
			var attachment = new MimePart("ticket", "png")
			{
				Content = new MimeContent(stream),
				ContentDisposition = new ContentDisposition(ContentDisposition.Attachment),
				ContentTransferEncoding = ContentEncoding.Base64,
				FileName = "ticket.png"
			};
			var multipart = new Multipart("mixed");
			multipart.Add(new TextPart("plain") {Text= "Ваш билет был успешно забронирован. Оплата за билет производиться на месте." });
			multipart.Add(attachment);
			emailMessage.Body = multipart;

			using (var client = new SmtpClient())
			{
				await client.ConnectAsync("smtp.gmail.com", 587, false);
				await client.AuthenticateAsync(_email, _password);
				await client.SendAsync(emailMessage);
				await client.DisconnectAsync(true);
			}
		}
	}
}
