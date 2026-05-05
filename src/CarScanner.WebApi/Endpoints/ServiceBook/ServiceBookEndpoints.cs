using CarScanner.Application.Features.ServiceBook.Commands.CreateReminder;
using CarScanner.Application.Features.ServiceBook.Commands.CreateServiceRecord;
using CarScanner.Application.Features.ServiceBook.Commands.DeleteServiceRecord;
using CarScanner.Application.Features.ServiceBook.Commands.DismissReminder;
using CarScanner.Application.Features.ServiceBook.Commands.UpdateReminder;
using CarScanner.Application.Features.ServiceBook.Commands.UpdateServiceRecord;
using CarScanner.Application.Features.ServiceBook.Queries.GetRemindersForVehicle;
using CarScanner.Application.Features.ServiceBook.Queries.GetServiceRecordById;
using CarScanner.Application.Features.ServiceBook.Queries.GetServiceRecords;
using CarScanner.Application.Features.ServiceBook.Queries.GetUpcomingReminders;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.Authorization;
using CarScanner.WebApi.Authorization;
using MediatR;

namespace CarScanner.WebApi.Endpoints.ServiceBook;

public static class ServiceBookEndpoints
{
    public static IEndpointRouteBuilder MapServiceBookEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/service-book")
            .WithTags("ServiceBook")
            .RequireAuthorization()
            .RequireModule(Module.ServiceBook);

        // Service records
        group.MapPost("/records", CreateServiceRecord);
        group.MapGet("/records", GetServiceRecords);
        group.MapGet("/records/{id:guid}", GetServiceRecordById);
        group.MapPut("/records/{id:guid}", UpdateServiceRecord);
        group.MapDelete("/records/{id:guid}", DeleteServiceRecord);

        // Reminders
        group.MapPost("/reminders", CreateReminder);
        group.MapGet("/reminders/by-vehicle/{vehicleId:guid}", GetRemindersForVehicle);
        group.MapGet("/reminders/upcoming", GetUpcomingReminders);
        group.MapPut("/reminders/{id:guid}", UpdateReminder);
        group.MapPost("/reminders/{id:guid}/dismiss", DismissReminder);

        return app;
    }

    private static async Task<IResult> CreateServiceRecord(
        CreateServiceRecordRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateServiceRecordCommand(
            request.VehicleId,
            request.ServiceDate,
            request.MileageAtService,
            request.Type,
            request.Cost,
            request.Currency,
            request.Description,
            request.WorkshopName,
            request.WorkshopContact);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/service-book/records/{success.ServiceRecordId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetServiceRecords(
        ISender sender,
        Guid? vehicleId = null,
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetServiceRecordsQuery(vehicleId, page, pageSize), cancellationToken);
        return result.Match(success => Results.Ok(success), error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetServiceRecordById(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GetServiceRecordByIdQuery(id), cancellationToken);
        return result.Match(success => Results.Ok(success), error => Results.NotFound(error));
    }

    private static async Task<IResult> UpdateServiceRecord(
        Guid id,
        UpdateServiceRecordRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateServiceRecordCommand(
            id,
            request.ServiceDate,
            request.MileageAtService,
            request.Type,
            request.Cost,
            request.Currency,
            request.Description,
            request.WorkshopName,
            request.WorkshopContact);

        var result = await sender.Send(command, cancellationToken);
        return result.Match(() => Results.NoContent(), error => Results.BadRequest(error));
    }

    private static async Task<IResult> DeleteServiceRecord(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DeleteServiceRecordCommand(id), cancellationToken);
        return result.Match(() => Results.NoContent(), error => Results.BadRequest(error));
    }

    private static async Task<IResult> CreateReminder(
        CreateReminderRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateReminderCommand(
            request.VehicleId,
            request.Type,
            request.DueDate,
            request.DueMileage,
            request.Description);

        var result = await sender.Send(command, cancellationToken);
        return result.Match(
            success => Results.Created($"/api/service-book/reminders/{success.ReminderId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetRemindersForVehicle(
        Guid vehicleId,
        ISender sender,
        bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(
            new GetRemindersForVehicleQuery(vehicleId, includeInactive), cancellationToken);
        return result.Match(success => Results.Ok(success), error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetUpcomingReminders(
        ISender sender,
        int days = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await sender.Send(new GetUpcomingRemindersQuery(days), cancellationToken);
        return result.Match(success => Results.Ok(success), error => Results.BadRequest(error));
    }

    private static async Task<IResult> UpdateReminder(
        Guid id,
        UpdateReminderRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateReminderCommand(id, request.DueDate, request.DueMileage, request.Description);
        var result = await sender.Send(command, cancellationToken);
        return result.Match(() => Results.NoContent(), error => Results.BadRequest(error));
    }

    private static async Task<IResult> DismissReminder(
        Guid id,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new DismissReminderCommand(id), cancellationToken);
        return result.Match(() => Results.NoContent(), error => Results.BadRequest(error));
    }
}

public sealed record CreateServiceRecordRequest(
    Guid VehicleId,
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type,
    decimal Cost,
    string? Currency,
    string? Description,
    string? WorkshopName,
    string? WorkshopContact);

public sealed record UpdateServiceRecordRequest(
    DateOnly ServiceDate,
    int MileageAtService,
    ServiceRecordType Type,
    decimal Cost,
    string? Currency,
    string? Description,
    string? WorkshopName,
    string? WorkshopContact);

public sealed record CreateReminderRequest(
    Guid VehicleId,
    ReminderType Type,
    DateOnly? DueDate,
    int? DueMileage,
    string Description);

public sealed record UpdateReminderRequest(
    DateOnly? DueDate,
    int? DueMileage,
    string Description);
