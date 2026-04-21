using System.Security.Cryptography;

namespace CarScanner.Application.Common;

public static class TemporaryPasswordGenerator
{
    private const string Lowercase = "abcdefghijkmnopqrstuvwxyz";
    private const string Uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private const string Digits = "23456789";
    private const string Symbols = "!@#$%^&*?";

    public static string Generate(int length = 12)
    {
        if (length < 8)
            length = 8;

        Span<char> buffer = stackalloc char[length];

        buffer[0] = PickRandom(Lowercase);
        buffer[1] = PickRandom(Uppercase);
        buffer[2] = PickRandom(Digits);
        buffer[3] = PickRandom(Symbols);

        var allChars = string.Concat(Lowercase, Uppercase, Digits, Symbols);
        for (var i = 4; i < length; i++)
        {
            buffer[i] = PickRandom(allChars);
        }

        for (var i = buffer.Length - 1; i > 0; i--)
        {
            var j = RandomNumberGenerator.GetInt32(i + 1);
            (buffer[i], buffer[j]) = (buffer[j], buffer[i]);
        }

        return new string(buffer);
    }

    private static char PickRandom(string source) =>
        source[RandomNumberGenerator.GetInt32(source.Length)];
}
