namespace TicketBookingSystem.Utils
{
	public class Configuration
	{
		private static string environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "";
        private static IConfigurationRoot _configuration = new ConfigurationBuilder()
            .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
            .AddJsonFile($"appsettings.json").Build();
		private static IConfigurationRoot _googleAuthConfig = new ConfigurationBuilder()
			.SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
			.AddJsonFile("google-auth-settings.json").Build();
		public static IConfigurationRoot AppSettings { get { return _configuration; } }
		public static string? GetConnectionString(string connectionStringName) =>
		   _configuration.GetConnectionString(connectionStringName);
		public static (string email, string password) GetApplicationMailUser()
		{
			return (_configuration.GetValue<string>("ApplicationMailUser:MailAddress"),
				_configuration.GetValue<string>("ApplicationMailUser:Password"));
		}
		public static string GetGoogleAuthClientId() => _googleAuthConfig.GetValue<string>("web:client_id");
		public static string GetGoogleAuthClientSecret() => _googleAuthConfig.GetValue<string>("web:client_secret");
	}
}
