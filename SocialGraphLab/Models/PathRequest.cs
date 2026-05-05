namespace SocialGraphLab.Models;

public sealed class PathRequest
{
    public string Source { get; init; } = string.Empty;

    public string Target { get; init; } = string.Empty;

    public string Algorithm { get; init; } = "bfs";
}
