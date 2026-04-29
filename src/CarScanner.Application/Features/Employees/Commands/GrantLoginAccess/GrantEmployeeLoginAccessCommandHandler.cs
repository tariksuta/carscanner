using CarScanner.Application.Abstraction.Notifications;
using CarScanner.Application.Common;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Errors;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace CarScanner.Application.Features.Employees.Commands.GrantLoginAccess;

public sealed class GrantEmployeeLoginAccessCommandHandler(
    IEmployeeRepository employeeRepository,
    IApplicationUserRepository applicationUserRepository,
    IPasswordHasher<ApplicationUser> passwordHasher,
    IEmailNotificationService emailNotificationService,
    ILogger<GrantEmployeeLoginAccessCommandHandler> logger)
    : ICommandHandler<GrantEmployeeLoginAccessCommand, Result<GrantEmployeeLoginAccessCommandResult>>
{
    public async Task<Result<GrantEmployeeLoginAccessCommandResult>> Handle(
        GrantEmployeeLoginAccessCommand request,
        CancellationToken cancellationToken)
    {
        var employee = await employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee is null)
            return Result.Failure<GrantEmployeeLoginAccessCommandResult>(EmployeeDomainErrors.NotFound(request.EmployeeId));

        if (employee.ApplicationUserId.HasValue)
            return Result.Failure<GrantEmployeeLoginAccessCommandResult>(EmployeeDomainErrors.AlreadyHasLoginAccess);

        if (!employee.IsActive)
            return Result.Failure<GrantEmployeeLoginAccessCommandResult>(EmployeeDomainErrors.Inactive);

        if (await applicationUserRepository.ExistsByEmailAsync(employee.Email, cancellationToken))
            return Result.Failure<GrantEmployeeLoginAccessCommandResult>(EmployeeDomainErrors.EmailAlreadyExists);

        var temporaryPassword = TemporaryPasswordGenerator.Generate();

        var passwordHash = passwordHasher.HashPassword(null!, temporaryPassword);

        var userResult = ApplicationUser.Create(
            employee.Email,
            passwordHash,
            employee.FirstName,
            employee.LastName,
            request.Role);

        if (userResult.IsFailure)
            return Result.Failure<GrantEmployeeLoginAccessCommandResult>(userResult.Error);

        var user = userResult.Value;
        applicationUserRepository.Add(user);

        var linkResult = employee.LinkApplicationUser(user);
        if (linkResult.IsFailure)
            return Result.Failure<GrantEmployeeLoginAccessCommandResult>(linkResult.Error);

        try
        {
            await emailNotificationService.SendEmployeeWelcomeAsync(
                employee.Email,
                employee.FirstName,
                temporaryPassword,
                cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogWarning(
                ex,
                "Failed to send welcome email to {Email} for employee {EmployeeId}. Login access was still granted.",
                employee.Email,
                employee.Id);
        }

        return new GrantEmployeeLoginAccessCommandResult(user.Id);
    }
}
