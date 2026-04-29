using CarScanner.Application.Features.Branches.Queries.GetBranches;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Branches.Queries.GetBranchById;

public sealed record GetBranchByIdQuery(Guid BranchId) : IQuery<Result<BranchDto>>;
