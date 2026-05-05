namespace SocialGraphLab.Models;

public sealed record GraphNodeDto(
    string Id,
    string Name,
    string Role,
    string Accent,
    string Description);

public sealed record GraphEdgeDto(
    string Id,
    string SourceId,
    string TargetId,
    string Label);

public sealed record GraphSnapshotDto(
    IReadOnlyCollection<GraphNodeDto> Nodes,
    IReadOnlyCollection<GraphEdgeDto> Edges,
    string DefaultSource,
    string DefaultTarget,
    IReadOnlyList<string> Tips);

public sealed record PathVariantDto(
    string Title,
    IReadOnlyList<string> NodeIds,
    IReadOnlyList<string> Names,
    string Commentary);

public sealed record PathSearchResponseDto(
    string Source,
    string Target,
    string Algorithm,
    string Summary,
    int PathCount,
    int? ShortestDistance,
    IReadOnlyList<string> VisitedOrder,
    IReadOnlyList<string> ExplanationSteps,
    IReadOnlyList<PathVariantDto> Paths);
