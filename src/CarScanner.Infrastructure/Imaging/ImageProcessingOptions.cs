namespace CarScanner.Infrastructure.Imaging;

public sealed class ImageProcessingOptions
{
    public const string SectionName = "ImageProcessing";

    public int MaxDimension { get; set; } = 1920;

    public int Quality { get; set; } = 80;

    public long MaxInputBytes { get; set; } = 15 * 1024 * 1024;

    public long MaxInputPixels { get; set; } = 80_000_000;
}
