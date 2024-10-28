using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TicketBookingSystem.Auth;

namespace TicketBookingSystem.Models;

public partial class TicketBookingDbContext : DbContext, IUserStore<User>
{
    public TicketBookingDbContext()
    {
    }

    public TicketBookingDbContext(DbContextOptions<TicketBookingDbContext> options)
        : base(options)
    {
	}
    public DbSet<ConcertTicket> ConcertTickets { get; set; }
    public DbSet<ConcertInfo> ConcertInfos { get; set; }

    public virtual DbSet<Concert> Concerts { get; set; }

    public virtual DbSet<ConcertPlace> ConcertPlaces { get; set; }

    public virtual DbSet<ConcertType> ConcertTypes { get; set; }

    public virtual DbSet<Promocode> Promocodes { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserRole> UserRoles { get; set; }

    public virtual DbSet<UserTicket> UserTickets { get; set; }

	private bool IsEmailValid(string emailaddress)
	{
		try
		{
			MailAddress m = new MailAddress(emailaddress);
			return true;
		}
		catch (FormatException)
		{
			return false;
		}
	}
	public async Task<IdentityResult> CreateAsync(User user, CancellationToken cancellationToken)
	{
        List<string> errors = new List<string>();
        User? dbUser;
		if ((dbUser = Users.FirstOrDefault(u=>u.UserName == user.UserName || u.Email == user.Email)) == null) {
			bool Success = true;
			if (!IsEmailValid(user.Email))
            {
                errors.Add("email не валиден");
                Success = false;
			}
            if (Success)
            {
                Users.Add(user);
                int changed = await SaveChangesAsync();
                if (changed == 0)
                {
                    errors.Add("Не удалось выполнить регистрацию");
                    return IdentityResult.Failed(errors.Select(n => { var error = new IdentityError(); error.Description = n; return error; }).ToArray());
				}
                return IdentityResult.Success;
			}
		}
        if(dbUser.Email == user.Email)errors.Add("Email занят другим пользователем");
        errors.Add("Пользователь уже существует");
		return IdentityResult.Failed(errors.Select(n => { var error = new IdentityError(); error.Description = n; return error; }).ToArray());
	}

	public async Task<IdentityResult> DeleteAsync(User user, CancellationToken cancellationToken)
	{
		List<string> errors = new List<string>();
        var dbUser = await Users.FirstOrDefaultAsync(u => u.UserName == user.UserName || u.Email == user.Email);
		if (dbUser != null)
		{
            Users.Remove(dbUser);
            await SaveChangesAsync();
			return IdentityResult.Success;
		}
		errors.Add("Пользователь не существует");
		return IdentityResult.Failed(errors.Select(n => { var error = new IdentityError(); error.Description = n; return error; }).ToArray());
	}

	public async Task<User> FindByIdAsync(string userId, CancellationToken cancellationToken)
	{
		return await Users.FirstOrDefaultAsync(u => u.UserName == userId || u.Email == userId) ?? new User();
	}

	public async Task<User> FindByNameAsync(string userName, CancellationToken cancellationToken)
	{
		return await Users.FirstOrDefaultAsync(u => u.UserName == userName) ?? new User();
	}

	public async Task<string> GetNormalizedUserNameAsync(User user, CancellationToken cancellationToken)
	{
		var dbUser = await Users.FirstOrDefaultAsync(n => n.UserName == user.UserName || n.Email == user.Email);
		if (dbUser != null)
			return dbUser.UserName;
		return "";
	}

	public async Task<string> GetUserIdAsync(User user, CancellationToken cancellationToken)
	{
		var dbUser = await Users.FirstOrDefaultAsync(n => n.UserName == user.UserName || n.Email == user.Email);
		if (dbUser != null)
			return dbUser.UserName;
		return "";
	}

	public async Task<string> GetUserNameAsync(User user, CancellationToken cancellationToken)
	{
        var dbUser = await Users.FirstOrDefaultAsync(n => n.UserName == user.UserName || n.Email == user.Email);
        if(dbUser != null)
            return dbUser.UserName;
        return "";
	}

	public async Task SetNormalizedUserNameAsync(User user, string normalizedName, CancellationToken cancellationToken)
	{
		var dbUser = await Users.FirstOrDefaultAsync(n => n.UserName == user.UserName);
        if (dbUser != null)
        {
            dbUser.UserName = normalizedName;
            await SaveChangesAsync();
        }
		return;
	}

	public async Task SetUserNameAsync(User user, string userName, CancellationToken cancellationToken)
	{
		var dbUser = await Users.FirstOrDefaultAsync(n => n.UserName == user.UserName);
		if (dbUser != null)
		{
			dbUser.UserName = userName;
			await SaveChangesAsync();
		}
		return;
	}

	public async Task<IdentityResult> UpdateAsync(User user, CancellationToken cancellationToken)
	{
		var dbUser = await Users.FirstOrDefaultAsync(n => n.UserName == user.UserName || n.Email == user.Email);
		var error = new IdentityError();
		if (dbUser != null)
		{
			if(!string.IsNullOrEmpty(user.UserName))dbUser.UserName = user.UserName;
			if (IsEmailValid(user.Email)) dbUser.Email = user.Email;
			if (!string.IsNullOrEmpty(user.PasswordHash)) dbUser.PasswordHash = user.PasswordHash;
			if (!string.IsNullOrEmpty(user.IsGoogle)) dbUser.IsGoogle = user.IsGoogle;
			if (!string.IsNullOrEmpty(user.ImagePath)) dbUser.ImagePath = user.ImagePath;
			if (user.Role > 0) dbUser.Role = user.Role;
			var countUpdated = await SaveChangesAsync();
            if(countUpdated == 0)
            {
				error.Description = "Не удалось выполнить обновление";
				return IdentityResult.Failed(new IdentityError[] { error });
			}
			return IdentityResult.Success;
		}
        error.Description = "Пользователя с таким логином или email не существует";
		return IdentityResult.Failed(new IdentityError[] { error });
	}

	protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Concert>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CONCERT__ID");

            entity.ToTable("CONCERT", t=>t.HasCheckConstraint("CHECK__CONCERT__STATUS","status in ('A', 'D', 'P')"));

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnType("numeric(10, 0)")
                .HasColumnName("id");
            entity.Property(e => e.ConcertData)
				.HasMaxLength(64)
				.HasColumnName("concert_data");
            entity.Property(e => e.ConcertDate)
                .HasColumnType("datetime")
                .HasColumnName("concert_date");
            entity.Property(e => e.Performer)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("performer");
            entity.Property(e => e.Place)
                .HasColumnType("numeric(4, 0)")
                .HasColumnName("place");
            entity.Property(e => e.Status)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValueSql("('A')")
                .IsFixedLength()
                .HasColumnName("status");
            entity.Property(e => e.TicketCost).HasColumnName("ticket_cost");
            entity.Property(e => e.TicketsCount)
                .HasColumnType("numeric(5, 0)")
                .HasColumnName("tickets_count");

            entity.HasOne(d => d.PlaceNavigation).WithMany(p => p.Concerts)
                .HasForeignKey(d => d.Place)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("concert_fk0");
        });

        modelBuilder.Entity<ConcertPlace>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CONCERT_PLACE__ID");

            entity.ToTable("CONCERT_PLACE");

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnType("numeric(4, 0)")
                .HasColumnName("id");
            entity.Property(e => e.PlaceId)
                .HasMaxLength(32)
                .IsUnicode(false)
                .HasColumnName("place_id");
            entity.Property(e => e.PlaceRoom)
                .HasMaxLength(20)
                .HasColumnName("place_room");
            entity.Property(e => e.RowCounts)
                .HasColumnType("numeric(2, 0)")
                .HasColumnName("row_counts");
            entity.Property(e => e.SeatsInRow)
                .HasColumnType("numeric(2, 0)")
                .HasColumnName("seats_in_row");
            entity.Property(e => e.Type)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("type");

            entity.HasOne(d => d.TypeNavigation).WithMany(p => p.ConcertPlaces)
                .HasForeignKey(d => d.Type)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("concert_place_fk0");

			entity.HasIndex(e => e.PlaceId)
			.IsUnique();
		});

        modelBuilder.Entity<ConcertType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CONCERT_TYPE__ID");

            entity.ToTable("CONCERT_TYPE", t => t.HasCheckConstraint("CHECK__CONCERT_TYPE__HASSEATS", "has_seats in ('Y', 'N')"));

            entity.Property(e => e.Id)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("id");
            entity.Property(e => e.HasSeats)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("has_seats");
            entity.Property(e => e.TypeTitle)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("type_title");
		});

        modelBuilder.Entity<Promocode>(entity =>
        {
            entity.HasKey(e => e.Code).HasName("PK__PROMOCODE__CODE");

            entity.ToTable("PROMOCODE", t => t.HasCheckConstraint("CHECK__PROMOCODE__AVAILABLE", "available in ('Y', 'N')"));

            entity.Property(e => e.Code)
                .HasMaxLength(6)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("code");
            entity.Property(e => e.Available)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValueSql("('Y')")
                .IsFixedLength()
                .HasColumnName("available");
            entity.Property(e => e.Concert)
                .HasColumnType("numeric(10, 0)")
                .HasColumnName("concert");
            entity.Property(e => e.ConcertType)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("concert_type");
            entity.Property(e => e.Discount).HasColumnName("discount");

            entity.HasOne(d => d.ConcertNavigation).WithMany(p => p.Promocodes)
                .HasForeignKey(d => d.Concert)
                .HasConstraintName("promocode_fk0");

            entity.HasOne(d => d.ConcertTypeNavigation).WithMany(p => p.Promocodes)
                .HasForeignKey(d => d.ConcertType)
                .HasConstraintName("promocode_fk1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserName).HasName("PK__USER__USERNAME");

            entity.ToTable("USER", t => t.HasCheckConstraint("CHECK__USER__IS_GOOGLE", "is_google in ('Y', 'N')"));

            entity.Property(e => e.UserName)
                .HasMaxLength(30)
                .HasColumnName("login");
            entity.Property(e => e.Email)
                .HasMaxLength(320)
                .HasColumnName("email");
            entity.Property(e => e.ImagePath)
                .HasMaxLength(50)
                .HasColumnName("image_path");
            entity.Property(e => e.IsGoogle)
                .HasMaxLength(1)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("is_google");
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(64)
                .IsUnicode(false)
                .HasColumnName("password");
            entity.Property(e => e.Role)
                .HasColumnType("numeric(4, 0)")
                .HasColumnName("role");

            entity.HasOne(d => d.RoleNavigation).WithMany(p => p.Users)
                .HasForeignKey(d => d.Role)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_fk0");

			entity.HasIndex(e => e.Email)
			.IsUnique();
		});

        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__USER_ROLE__ID");

            entity.ToTable("USER_ROLE", t => { 
                t.HasCheckConstraint("CHECK__ROLE__CAN_ADD_CONCERT", "can_add_concert in ('Y', 'N')");
				t.HasCheckConstraint("CHECK__ROLE__CAN_ADD_PROMOCODE", "can_add_promocode in ('Y', 'N')");
				t.HasCheckConstraint("CHECK__ROLE__CAN_USE_PANEL", "can_use_manager_panel in ('Y', 'N')");
			});

            entity.Property(e => e.Id)
                .ValueGeneratedOnAdd()
                .HasColumnType("numeric(4, 0)")
                .HasColumnName("id");
            entity.Property(e => e.CanAddConcert)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValueSql("('N')")
                .IsFixedLength()
                .HasColumnName("can_add_concert");
            entity.Property(e => e.CanAddPromocode)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValueSql("('N')")
                .IsFixedLength()
                .HasColumnName("can_add_promocode");
            entity.Property(e => e.CanUseManagerPanel)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValueSql("('N')")
                .IsFixedLength()
                .HasColumnName("can_use_manager_panel");
            entity.Property(e => e.RoleTitle)
                .HasMaxLength(15)
                .HasColumnName("role_title");
        });

        modelBuilder.Entity<UserTicket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__USER_TICKET__ID");

            entity.ToTable("USER_TICKET", t => t.HasCheckConstraint("CHECK__TICKET__STATUS", "ticket_status in ('A', 'D', 'C', 'P')"));

            entity.Property(e => e.Id)
				.HasDefaultValueSql("newsequentialid()")
                .HasColumnName("id");
            entity.Property(e => e.ConcertId)
                .HasColumnType("numeric(10, 0)")
                .HasColumnName("concert_id");
            entity.Property(e => e.Promocode)
                .HasMaxLength(6)
                .IsUnicode(false)
                .IsFixedLength()
                .HasColumnName("promocode");
            entity.Property(e => e.Seat)
                .HasColumnType("numeric(4, 0)")
                .HasColumnName("seat");
            entity.Property(e => e.TicketStatus)
                .HasMaxLength(1)
                .IsUnicode(false)
                .HasDefaultValueSql("('A')")
                .IsFixedLength()
                .HasColumnName("ticket_status");
            entity.Property(e => e.User)
                .HasMaxLength(30)
                .HasColumnName("user");

            entity.HasOne(d => d.Concert).WithMany(p => p.UserTickets)
                .HasForeignKey(d => d.ConcertId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_ticket_fk1");

            entity.HasOne(d => d.PromocodeNavigation).WithMany(p => p.UserTickets)
                .HasForeignKey(d => d.Promocode)
                .HasConstraintName("user_ticket_fk2");

            entity.HasOne(d => d.UserNavigation).WithMany(p => p.UserTickets)
                .HasForeignKey(d => d.User)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_ticket_fk0");
        });

        modelBuilder.Entity<UserRole>().HasData(
           new UserRole { Id = 1, RoleTitle="User", CanAddConcert="N", CanAddPromocode="N", CanUseManagerPanel="N" },
		   new UserRole { Id = 2, RoleTitle = "Manager", CanAddConcert = "Y", CanAddPromocode = "Y", CanUseManagerPanel = "Y" }
		);

		modelBuilder.Entity<ConcertType>().HasData(
		   new ConcertType { Id = "O", TypeTitle = "Опенэир", HasSeats = "N" },
		   new ConcertType { Id = "P", TypeTitle = "Вечеринка", HasSeats = "N" },
		   new ConcertType { Id = "C", TypeTitle = "Классическая музыка", HasSeats = "Y" }
		);

        modelBuilder.Entity<User>().HasData(
            new User { UserName="Manager",
                Email="manager_mail_address",
                ImagePath="", IsGoogle="N",
                PasswordHash=ApplicationUserManager.CalculateHash("Manager"),
                Role=2
            }
        );

        modelBuilder.Entity<ConcertPlace>().HasData(
            new ConcertPlace { Id=1, PlaceId="ChIJE3B9yG_F20YRVDXp_U9w3II", PlaceRoom="пр-т. Победителей 65", Type="P", RowCounts=null, SeatsInRow=null },
            new ConcertPlace { Id=2, PlaceId="ChIJL5EV7urP20YRjTQbHbiim1A", PlaceRoom="пл. Свободы 23а", Type="C", RowCounts=7, SeatsInRow=10 },
            new ConcertPlace { Id = 3, PlaceId = "ChIJiYjsJMDP20YRWsuVHXn1PB8", PlaceRoom = "Дворец Республики", Type = "C", RowCounts = 8, SeatsInRow = 12 },
            new ConcertPlace { Id = 4, PlaceId = "ChIJmdsEacXP20YR1Jl4MKnB7iA", PlaceRoom = "ул. Октябрьская 5", Type = "C", RowCounts = 7, SeatsInRow = 9 },
            new ConcertPlace { Id = 5, PlaceId = "ChIJu29iXaTP20YRDZ4fuJLEKag", PlaceRoom = "пр. Независимости 50", Type = "C", RowCounts = 8, SeatsInRow = 9 },
            new ConcertPlace { Id = 6, PlaceId = "ChIJKfCTK5TP20YRwGcxtgr_3Gg", PlaceRoom = "Большой театр Бел.", Type = "C", RowCounts = 10, SeatsInRow = 12 },
            new ConcertPlace { Id = 7, PlaceId = "ChIJ3_2DZqDP20YR6TOG0j3ERYc", PlaceRoom = "Парк \"Троицкая гора\"", Type = "O", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 8, PlaceId = "ChIJA7W08rjP20YRnFSwrBR3nkw", PlaceRoom = "улица Фрунзе 2", Type = "O", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 9, PlaceId = "ChIJRwQmPTzF20YRmM9QsAa64s8", PlaceRoom = "Парк ул. Алишевского", Type = "O", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 10, PlaceId = "ChIJRS1EpGPQ20YRaC2Z-YIdsGg", PlaceRoom = "Студэнцкі парк", Type = "O", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 11, PlaceId = "ChIJ7b7_CHfP20YRIAKmr3Vk6no", PlaceRoom = "Парк Дружбы народов", Type = "O", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 12, PlaceId = "ChIJZ7DwijDO20YR9Sj3G7kbjAs", PlaceRoom = "Антоновский парк", Type = "O", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 13, PlaceId = "ChIJAYADLZXP20YRJH7AH6MeWV8", PlaceRoom = "ул. Зыбицкая 9", Type = "P", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 14, PlaceId = "ChIJP_56__HP20YRTo8ZkpQV9i0", PlaceRoom = "ул. Кальварийская 1", Type = "P", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 15, PlaceId = "ChIJUZI6xevP20YRqkPSr8YIiCM", PlaceRoom = "ул. Революционная 9а", Type = "P", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 16, PlaceId = "ChIJ4e-SOS3F20YRULYT8WaVRHk", PlaceRoom = "ул. Притыцкого 62", Type = "P", RowCounts = null, SeatsInRow = null },
            new ConcertPlace { Id = 17, PlaceId = "ChIJi-x0uavR20YRh3dsRLUS5mc", PlaceRoom = "пр. Дзержинского 15", Type = "P", RowCounts = null, SeatsInRow = null }
        );

		modelBuilder
        .Entity<ConcertTicket>(entity => {
            entity.Property(e => e.Id).HasColumnType("numeric(10, 0)").HasColumnName("id");
			entity.Property(e => e.Performer).HasColumnName("performer");
			entity.Property(e => e.TicketCost).HasColumnName("ticket_cost");
			entity.Property(e => e.ConcertDate).HasColumnName("concert_date");
			entity.Property(e => e.ConcertData).HasColumnName("concert_data");
			entity.Property(e => e.Status).HasColumnName("status");
			entity.Property(e => e.PlaceId).HasColumnName("place_id");
			entity.Property(e => e.PlaceRoom).HasColumnName("place_room");
			entity.Property(e => e.Type).HasColumnName("type");
			entity.Property(e => e.RowCounts).HasColumnType("numeric(2, 0)").HasColumnName("row_counts");
			entity.Property(e => e.SeatsInRow).HasColumnType("numeric(2, 0)").HasColumnName("seats_in_row");
			entity.Property(e => e.TicketsCount).HasColumnType("numeric(11, 0)").HasColumnName("tickets_count");
			entity.ToView("CONCERT_TICKET");
		});

        modelBuilder
        .Entity<ConcertInfo>(entity => {
            entity.Property(e => e.Id).HasColumnType("numeric(10, 0)").HasColumnName("id");
            entity.Property(e => e.Performer).HasColumnName("performer");
            entity.Property(e => e.TicketCost).HasColumnName("ticket_cost");
            entity.Property(e => e.ConcertDate).HasColumnName("concert_date");
            entity.Property(e => e.ConcertData).HasColumnName("concert_data");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.PlaceId).HasColumnName("place_id");
            entity.Property(e => e.PlaceRoom).HasColumnName("place_room");
            entity.Property(e => e.Type).HasColumnName("type");
            entity.Property(e => e.RowCounts).HasColumnType("numeric(2, 0)").HasColumnName("row_counts");
            entity.Property(e => e.SeatsInRow).HasColumnType("numeric(2, 0)").HasColumnName("seats_in_row");
            entity.Property(e => e.TicketsCount).HasColumnType("numeric(11, 0)").HasColumnName("tickets_count");
            entity.Property(e => e.MaxTicketsCount).HasColumnType("numeric(11, 0)").HasColumnName("tickets_max_count");
            entity.ToView("CONCERTS_INFO");
        });
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
