using CarScanner.Application.Abstraction.Imaging;
using Microsoft.Extensions.Options;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using ImageProcessingException = CarScanner.Application.Abstraction.Imaging.ImageProcessingException;

namespace CarScanner.Infrastructure.Imaging;

public sealed class ImageSharpImageProcessor : IImageProcessingService
{
    private const string WebpContentType = "image/webp";
    private const string WebpExtension = ".webp";

    private readonly ImageProcessingOptions _options;

    public ImageSharpImageProcessor(IOptions<ImageProcessingOptions> options)
    {
        _options = options.Value;
    }

    public async Task<ProcessedImage> ProcessAsync(Stream input, CancellationToken cancellationToken = default)
    {
        var buffered = await BufferAsync(input, cancellationToken);

        if (buffered.Length > _options.MaxInputBytes)
            throw new ImageProcessingException(
                $"Image exceeds maximum allowed size of {_options.MaxInputBytes / (1024 * 1024)} MB.");

        await EnsureWithinPixelBudgetAsync(buffered, cancellationToken);

        Image<Rgba32> image;
        try
        {
            buffered.Position = 0;
            image = await Image.LoadAsync<Rgba32>(buffered, cancellationToken);
        }
        catch (UnknownImageFormatException ex)
        {
            throw new ImageProcessingException("File is not a recognized image format.", ex);
        }
        catch (InvalidImageContentException ex)
        {
            throw new ImageProcessingException("Image content is invalid or corrupted.", ex);
        }

        using (image)
        {
            while (image.Frames.Count > 1)
            {
                image.Frames.RemoveFrame(1);
            }

            var hasAlpha = ImageHasAlpha(image);

            image.Mutate(ctx =>
            {
                ctx.AutoOrient();

                var longestEdge = Math.Max(image.Width, image.Height);
                if (longestEdge > _options.MaxDimension)
                {
                    ctx.Resize(new ResizeOptions
                    {
                        Mode = ResizeMode.Max,
                        Size = new Size(_options.MaxDimension, _options.MaxDimension),
                        Sampler = KnownResamplers.Lanczos3,
                    });
                }
            });

            var encoder = hasAlpha
                ? new WebpEncoder { FileFormat = WebpFileFormatType.Lossless }
                : new WebpEncoder { Quality = _options.Quality, FileFormat = WebpFileFormatType.Lossy };

            var output = new MemoryStream();
            await image.SaveAsync(output, encoder, cancellationToken);
            output.Position = 0;

            return new ProcessedImage(output, WebpContentType, WebpExtension);
        }
    }

    private static async Task<MemoryStream> BufferAsync(Stream input, CancellationToken ct)
    {
        var buffer = new MemoryStream();
        await input.CopyToAsync(buffer, ct);
        buffer.Position = 0;
        return buffer;
    }

    private async Task EnsureWithinPixelBudgetAsync(Stream buffered, CancellationToken ct)
    {
        buffered.Position = 0;
        ImageInfo info;
        try
        {
            info = await Image.IdentifyAsync(buffered, ct);
        }
        catch (UnknownImageFormatException ex)
        {
            throw new ImageProcessingException("File is not a recognized image format.", ex);
        }
        catch (InvalidImageContentException ex)
        {
            throw new ImageProcessingException("Image content is invalid or corrupted.", ex);
        }

        var pixels = (long)info.Width * info.Height;
        if (pixels > _options.MaxInputPixels)
            throw new ImageProcessingException(
                $"Image resolution {info.Width}x{info.Height} exceeds the allowed pixel budget.");
    }

    private static bool ImageHasAlpha(Image<Rgba32> image)
    {
        var hasAlpha = false;

        image.ProcessPixelRows(accessor =>
        {
            for (var y = 0; y < accessor.Height; y++)
            {
                var row = accessor.GetRowSpan(y);
                for (var x = 0; x < row.Length; x++)
                {
                    if (row[x].A < 255)
                    {
                        hasAlpha = true;
                        return;
                    }
                }
            }
        });

        return hasAlpha;
    }
}
