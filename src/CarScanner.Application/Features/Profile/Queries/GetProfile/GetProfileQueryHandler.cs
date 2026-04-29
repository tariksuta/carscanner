using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Errors;
using CarScanner.Domain.Aggregates.ApplicationUserAggregate.Repository;
using CarScanner.Domain.Aggregates.EmployeeAggregate.Repository;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Queries.GetProfile;

public sealed class GetProfileQueryHandler(
    IApplicationUserRepository userRepository,
    IEmployeeRepository employeeRepository)
    : IQueryHandler<GetProfileQuery, Result<GetProfileQueryResult>>
{
    public async Task<Result<GetProfileQueryResult>> Handle(
        GetProfileQuery request,
        CancellationToken cancellationToken)
    {
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);

        if (user is null)
            return Result.Failure<GetProfileQueryResult>(ApplicationUserDomainErrors.NotFound(request.UserId));

        var employee = await employeeRepository.GetByApplicationUserIdAsync(request.UserId, cancellationToken);

        return new GetProfileQueryResult(
            user.Email,
            user.FirstName,
            user.LastName,
            user.Address?.Street,
            user.Address?.City,
            user.Address?.ZipCode,
            user.Address?.Country,
            user.ProfileImageUrl,
            employee?.Id);
    }
}
