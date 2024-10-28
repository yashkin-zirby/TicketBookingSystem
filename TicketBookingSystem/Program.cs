using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TicketBookingSystem.Auth;
using TicketBookingSystem.Models;
using TicketBookingSystem.Utils;

var isRunInDocker = Environment.GetEnvironmentVariable("RUN_IN_DOCKER");
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<TicketBookingDbContext>(options =>
                options.UseSqlServer(
					Configuration
					.AppSettings
					.GetConnectionString(isRunInDocker != null? "ConnectionMSSQLServer2" : "ConnectionMSSQLServer")
				)
    );

builder.Services.AddIdentityCore<User>()
	.AddUserStore<TicketBookingDbContext>()
	.AddUserManager<ApplicationUserManager>()
	.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options=> {
		options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
		options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
	})
	.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme, options =>
	{
		options.ExpireTimeSpan = TimeSpan.FromDays(5);
	}).AddGoogle(options =>
	{
		options.ClientId = Configuration.GetGoogleAuthClientId();
		options.ClientSecret = Configuration.GetGoogleAuthClientSecret();
		options.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
	});

builder.Services.AddTransient<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddSingleton<GmailSender>();

builder.Services.AddAuthorization(options =>
{
	options.AddPolicy(Permissions.CanAddPromocode, builder =>
	{
		builder.AddRequirements(new PermissionRequirement(Permissions.CanAddPromocode));
	});
	options.AddPolicy(Permissions.CanAddConcert, builder =>
	{
		builder.AddRequirements(new PermissionRequirement(Permissions.CanAddConcert));
	});
	options.AddPolicy(Permissions.CanUseManagerPanel, builder =>
	{
		builder.AddRequirements(new PermissionRequirement(Permissions.CanUseManagerPanel));
	});
});
builder.Services.AddCors(options =>
{
	options.AddDefaultPolicy(
					  policy =>
					  {
						  policy.AllowAnyOrigin();
						  policy.AllowAnyMethod();
						  policy.AllowAnyHeader();
					  });
});
builder.Services.AddControllersWithViews();

var app = builder.Build();

 using (var scope = app.Services.CreateScope())
{
	var dataContext = scope.ServiceProvider.GetRequiredService<TicketBookingDbContext>();
	if (dataContext.Database.EnsureCreated())
    {
		dataContext.Database.ExecuteSqlRaw(@"CREATE VIEW CONCERT_TICKET as select c.id,c.performer,c.ticket_cost,c.concert_date,c.concert_data,c.status, cp.place_id, cp.place_room, cp.type, cp.row_counts, cp.seats_in_row,
				c.tickets_count - (select count(*) from USER_TICKET ut where concert_id = c.id and ticket_status = 'A') as [tickets_count]
			from CONCERT c JOIN CONCERT_PLACE cp on c.place = cp.id; ");
        dataContext.Database.ExecuteSqlRaw(@"CREATE VIEW CONCERTS_INFO as select c.id,c.performer,c.ticket_cost,c.concert_date,c.concert_data,c.status, cp.place_id, cp.place_room, cp.type, cp.row_counts, cp.seats_in_row,
				c.tickets_count - (select count(*) from USER_TICKET ut where concert_id = c.id and ticket_status in ('A','D')) as [tickets_count],
				c.tickets_count as [tickets_max_count]
			from CONCERT c JOIN CONCERT_PLACE cp on c.place = cp.id");
    }
}
// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseCookiePolicy(new CookiePolicyOptions
{
	MinimumSameSitePolicy = SameSiteMode.Lax,
	HttpOnly = HttpOnlyPolicy.Always,
	Secure = CookieSecurePolicy.Always
});
app.UseCors();

app.MapControllerRoute(
    name: "default",
    pattern: "api/{controller}/{action}");
app.MapControllerRoute(
	name: "default",
    defaults: new { controller = "Users"},
	pattern: "users/{action}");

app.MapFallbackToFile("index.html"); ;

app.Run();
