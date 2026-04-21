using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.Profile.Commands.DeleteProfileImage;

public sealed record DeleteProfileImageCommand(Guid UserId) : ICommand<Result>;
