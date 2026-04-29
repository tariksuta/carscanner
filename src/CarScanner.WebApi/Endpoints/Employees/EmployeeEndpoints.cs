using CarScanner.Application.Features.Employees.Commands.CreateEmployee;
using CarScanner.Application.Features.Employees.Commands.GrantLoginAccess;
using CarScanner.Application.Features.Employees.Commands.UpdateEmployee;
using CarScanner.Application.Features.Employees.Queries.GetEmployeeById;
using CarScanner.Application.Features.Employees.Queries.GetEmployeePermissions;
using CarScanner.Application.Features.Employees.Queries.GetEmployeeRecentInspections;
using CarScanner.Application.Features.Employees.Queries.GetEmployees;
using CarScanner.Application.Features.Employees.Queries.GetEmployeeStats;
using MediatR;

namespace CarScanner.WebApi.Endpoints.Employees;

public static class EmployeeEndpoints
{
    public static IEndpointRouteBuilder MapEmployeeEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/employees")
            .WithTags("Employees");

        group.MapGet("/", GetEmployees);
        group.MapGet("/{employeeId:guid}", GetEmployeeById);
        group.MapGet("/{employeeId:guid}/permissions", GetEmployeePermissions);
        group.MapGet("/{employeeId:guid}/stats", GetEmployeeStats);
        group.MapGet("/{employeeId:guid}/recent-inspections", GetEmployeeRecentInspections);
        group.MapPost("/", CreateEmployee);
        group.MapPut("/{employeeId:guid}", UpdateEmployee);
        group.MapPost("/{employeeId:guid}/login-account", GrantLoginAccess);

        return app;
    }

    private static async Task<IResult> GetEmployees(
        ISender sender,
        int page = 1,
        int pageSize = 10,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEmployeesQuery(page, pageSize, search);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GetEmployeeById(
        Guid employeeId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetEmployeeByIdQuery(employeeId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> GetEmployeePermissions(
        Guid employeeId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetEmployeePermissionsQuery(employeeId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> GetEmployeeStats(
        Guid employeeId,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var query = new GetEmployeeStatsQuery(employeeId);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> GetEmployeeRecentInspections(
        Guid employeeId,
        ISender sender,
        int limit = 10,
        CancellationToken cancellationToken = default)
    {
        var query = new GetEmployeeRecentInspectionsQuery(employeeId, limit);
        var result = await sender.Send(query, cancellationToken);

        return result.Match(
            success => Results.Ok(success),
            error => Results.NotFound(error));
    }

    private static async Task<IResult> CreateEmployee(
        CreateEmployeeRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new CreateEmployeeCommand(
            request.FirstName,
            request.LastName,
            request.Email,
            request.Phone,
            request.BranchId);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/employees/{success.EmployeeId}", success),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> UpdateEmployee(
        Guid employeeId,
        UpdateEmployeeRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new UpdateEmployeeCommand(
            employeeId,
            request.FirstName,
            request.LastName,
            request.Phone,
            request.BranchId);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            () => Results.NoContent(),
            error => Results.BadRequest(error));
    }

    private static async Task<IResult> GrantLoginAccess(
        Guid employeeId,
        GrantLoginAccessRequest request,
        ISender sender,
        CancellationToken cancellationToken)
    {
        var command = new GrantEmployeeLoginAccessCommand(employeeId, request.Role);

        var result = await sender.Send(command, cancellationToken);

        return result.Match(
            success => Results.Created($"/api/employees/{employeeId}/login-account", success),
            error => Results.BadRequest(error));
    }
}

public sealed record CreateEmployeeRequest(
    string FirstName,
    string LastName,
    string Email,
    string? Phone,
    Guid? BranchId);

public sealed record UpdateEmployeeRequest(
    string FirstName,
    string LastName,
    string? Phone,
    Guid? BranchId);

public sealed record GrantLoginAccessRequest(string? Role);
