namespace CarScanner.Application.Abstraction.Imaging;

public sealed record ProcessedImage(Stream Stream, string ContentType, string Extension);

public interface IImageProcessingService
{
    Task<ProcessedImage> ProcessAsync(Stream input, CancellationToken cancellationToken = default);
}
