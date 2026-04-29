using CarScanner.Application.Abstraction.AI;
using CarScanner.Application.Abstraction.AI.Models;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Errors;
using CarScanner.Domain.Aggregates.DamageReportAggregate.Repository;
using CarScanner.Domain.Aggregates.InspectionAggregate.Repository;
using CarScanner.Domain.Aggregates.VehicleAggregate.Repository;
using CarScanner.Domain.Enums;
using CarScanner.SharedKernel.CQRS;
using CarScanner.SharedKernel.Primitives;
using Microsoft.Extensions.Logging;

namespace CarScanner.Application.Features.DamageReports.Commands.ProcessAnalysis;

public sealed class ProcessDamageAnalysisCommandHandler(
    IDamageReportRepository damageReportRepository,
    IVehicleInspectionRepository inspectionRepository,
    IVehicleRepository vehicleRepository,
    IVehicleDamageAnalyzer damageAnalyzer,
    ILogger<ProcessDamageAnalysisCommandHandler> logger)
    : ICommandHandler<ProcessDamageAnalysisCommand, Result>
{
    public async Task<Result> Handle(
        ProcessDamageAnalysisCommand request,
        CancellationToken cancellationToken)
    {
        var report = await damageReportRepository.GetWithDamageItemsAsync(request.DamageReportId, cancellationToken);
        if (report is null)
            return Result.Failure(DamageReportDomainErrors.NotFound(request.DamageReportId));

        var startResult = report.StartAnalysis();
        if (startResult.IsFailure)
            return startResult;

        var pickupInspection = await inspectionRepository.GetWithPhotosAsync(report.PickupInspectionId, cancellationToken);
        var returnInspection = await inspectionRepository.GetWithPhotosAsync(report.ReturnInspectionId, cancellationToken);

        if (pickupInspection is null || returnInspection is null)
            return Result.Failure(new DomainError("Analysis.InspectionNotFound", "Could not find inspection data."));

        var vehicle = await vehicleRepository.GetByIdAsync(pickupInspection.VehicleId, cancellationToken);
        var vehicleInfo = vehicle is not null
            ? $"{vehicle.Brand} {vehicle.Model} ({vehicle.Year}) - {vehicle.LicensePlate.Value}"
            : "Unknown Vehicle";

        var photoPairs = new List<PhotoPair>();
        foreach (var position in Enum.GetValues<PhotoPosition>())
        {
            var pickupPhoto = pickupInspection.GetPhotoByPosition(position);
            var returnPhoto = returnInspection.GetPhotoByPosition(position);

            if (pickupPhoto is not null && returnPhoto is not null)
            {
                photoPairs.Add(new PhotoPair(position, pickupPhoto.PhotoUrl, returnPhoto.PhotoUrl));
            }
        }

        var analysisRequest = new DamageAnalysisRequest(
            report.RentalId,
            report.PickupInspectionId,
            report.ReturnInspectionId,
            vehicleInfo,
            photoPairs);

        var outcome = await damageAnalyzer.AnalyzeDamageAsync(analysisRequest, cancellationToken);

        if (outcome.Usage is not null)
        {
            logger.LogInformation(
                "AI token usage for damage report {DamageReportId} (tenant {TenantId}, rental {RentalId}): " +
                "model={Model}, prompt_tokens={PromptTokens}, completion_tokens={CompletionTokens}, total_tokens={TotalTokens}",
                report.Id,
                report.TenantId,
                report.RentalId,
                outcome.Usage.Model,
                outcome.Usage.PromptTokens,
                outcome.Usage.CompletionTokens,
                outcome.Usage.TotalTokens);
        }

        var analysisResult = outcome.Result;

        if (!analysisResult.Success)
        {
            report.MarkAsFailed(analysisResult.ErrorMessage ?? "Unknown error occurred during analysis.");
            return Result.Success();
        }

        if (!analysisResult.HasDamages)
        {
            report.CompleteWithNoDamage(analysisResult.RawResponse);
            return Result.Success();
        }

        foreach (var damage in analysisResult.Damages)
        {
            var pickupPhotoUrl = pickupInspection.GetPhotoByPosition(damage.Position)?.PhotoUrl;
            var returnPhotoUrl = returnInspection.GetPhotoByPosition(damage.Position)?.PhotoUrl;

            report.AddDamageItem(
                damage.Position,
                damage.Description,
                damage.Severity,
                damage.EstimatedCost,
                pickupPhotoUrl,
                returnPhotoUrl);
        }

        report.CompleteWithDamages(analysisResult.RawResponse);

        return Result.Success();
    }
}
