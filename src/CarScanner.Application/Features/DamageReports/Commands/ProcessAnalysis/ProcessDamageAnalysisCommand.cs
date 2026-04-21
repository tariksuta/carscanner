using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;

namespace CarScanner.Application.Features.DamageReports.Commands.ProcessAnalysis;

public sealed record ProcessDamageAnalysisCommand(Guid DamageReportId) : ICommand<Result>;
