using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CarScanner.Application.Abstraction.Storage;

namespace CarScanner.Infrastructure.Storage;

public sealed class AzureBlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;

    public AzureBlobStorageService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task<string> UploadFileAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        string containerName,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: cancellationToken);

        var blobClient = containerClient.GetBlobClient(fileName);

        await blobClient.UploadAsync(
            fileStream,
            new BlobHttpHeaders { ContentType = contentType },
            cancellationToken: cancellationToken);

        return blobClient.Uri.ToString();
    }

    public async Task<Stream?> DownloadFileAsync(
        string fileUrl,
        CancellationToken cancellationToken = default)
    {
        var blobClient = GetBlobClientFromUrl(fileUrl);
        if (blobClient is null)
            return null;

        var exists = await blobClient.ExistsAsync(cancellationToken);
        if (!exists.Value)
            return null;

        var response = await blobClient.DownloadStreamingAsync(cancellationToken: cancellationToken);
        return response.Value.Content;
    }

    public async Task<bool> DeleteFileAsync(
        string fileUrl,
        CancellationToken cancellationToken = default)
    {
        var blobClient = GetBlobClientFromUrl(fileUrl);
        if (blobClient is null)
            return false;

        var response = await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
        return response.Value;
    }

    public Task<string> GetFileUrlAsync(
        string fileName,
        string containerName,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(containerName);
        var blobClient = containerClient.GetBlobClient(fileName);

        return Task.FromResult(blobClient.Uri.ToString());
    }

    private BlobClient? GetBlobClientFromUrl(string fileUrl)
    {
        if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
            return null;

        var blobUriBuilder = new BlobUriBuilder(uri);
        var containerClient = _blobServiceClient.GetBlobContainerClient(blobUriBuilder.BlobContainerName);

        return containerClient.GetBlobClient(blobUriBuilder.BlobName);
    }
}
