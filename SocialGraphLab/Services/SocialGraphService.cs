using SocialGraphLab.Models;

namespace SocialGraphLab.Services;

public sealed class SocialGraphService
{
    private readonly Dictionary<string, UserProfile> _users;
    private readonly Dictionary<string, HashSet<string>> _adjacency;
    private readonly List<FriendLink> _links;
    private readonly Dictionary<string, string> _lookup;

    public SocialGraphService()
    {
        _users = new Dictionary<string, UserProfile>(StringComparer.OrdinalIgnoreCase)
        {
            ["alina"] = new("alina", "Алина", "дизайн", "#79F0FF", "Собирает людей в одну команду быстрее, чем все успевают открыть чат."),
            ["boris"] = new("boris", "Борис", "backend", "#FF8A5B", "Спокоен до тех пор, пока кто-то не лезет в прод без тестов."),
            ["vika"] = new("vika", "Вика", "frontend", "#D9FF72", "Делает интерфейсы живыми и замечает кривой пиксель за километр."),
            ["gleb"] = new("gleb", "Глеб", "qa", "#A88CFF", "Ломает фичи профессионально, чтобы пользователи потом не страдали."),
            ["dasha"] = new("dasha", "Даша", "product", "#FFC857", "Держит хаос под контролем и превращает идеи в план."),
            ["egor"] = new("egor", "Егор", "data", "#66FFB4", "Ищет закономерности даже там, где остальные видят просто таблицу."),
            ["zhanna"] = new("zhanna", "Жанна", "devops", "#FF82C9", "Если что-то внезапно живо в 3 ночи — это почти точно её заслуга."),
            ["ilya"] = new("ilya", "Илья", "mobile", "#8CA8FF", "Любит стабильные приложения и ненавидит мигающие багрепорты."),
            ["kira"] = new("kira", "Кира", "ml", "#FFB6C8", "Сшивает данные, модели и здравый смысл в одну рабочую систему.")
        };

        _links =
        [
            new("alina", "boris", "учёба"),
            new("alina", "vika", "дизайн-клуб"),
            new("alina", "dasha", "созвоны"),
            new("boris", "gleb", "лабы"),
            new("boris", "egor", "митап"),
            new("vika", "gleb", "хакатон"),
            new("vika", "dasha", "дедлайны"),
            new("gleb", "zhanna", "qa-рейды"),
            new("dasha", "egor", "аналитика"),
            new("dasha", "ilya", "мобилка"),
            new("egor", "zhanna", "инфра"),
            new("egor", "kira", "data-lab"),
            new("ilya", "kira", "стартап"),
            new("zhanna", "kira", "ops-связь")
        ];

        _adjacency = BuildAdjacency();
        _lookup = BuildLookupIndex();
    }

    public GraphSnapshotDto GetGraphSnapshot()
    {
        var nodes = _users.Values
            .OrderBy(user => user.Name, StringComparer.CurrentCulture)
            .Select(user => new GraphNodeDto(user.Id, user.Name, user.Role, user.Accent, user.Description))
            .ToArray();

        var edges = _links
            .Select(link => new GraphEdgeDto(
                $"{link.SourceId}-{link.TargetId}",
                link.SourceId,
                link.TargetId,
                link.Label))
            .ToArray();

        var tips = new[]
        {
            "Кликни по двум людям на графе или введи имена вручную.",
            "BFS покажет кратчайшую цепочку знакомств — это самый быстрый путь от одного человека к другому.",
            "DFS раскроет все возможные простые маршруты без повторов — полезно, когда нужно показать весь набор связей.",
            "После поиска можно нажимать на карточки маршрутов: граф сфокусируется на конкретной цепочке."
        };

        return new GraphSnapshotDto(nodes, edges, "Алина", "Кира", tips);
    }

    public PathSearchResponseDto FindPaths(string sourceInput, string targetInput, string algorithmInput)
    {
        var sourceId = ResolveUserId(sourceInput);
        var targetId = ResolveUserId(targetInput);

        if (sourceId.Equals(targetId, StringComparison.OrdinalIgnoreCase))
        {
            throw new ArgumentException("Выбери двух разных пользователей. Иначе мы просто уткнёмся в одну и ту же вершину.");
        }

        var algorithm = NormalizeAlgorithm(algorithmInput);

        return algorithm switch
        {
            "bfs" => BuildBfsResponse(sourceId, targetId),
            "dfs" => BuildDfsResponse(sourceId, targetId),
            _ => throw new ArgumentException("Алгоритм должен быть либо BFS, либо DFS.")
        };
    }

    private PathSearchResponseDto BuildBfsResponse(string sourceId, string targetId)
    {
        var result = RunBfs(sourceId, targetId);

        if (result.Path.Count == 0)
        {
            throw new InvalidOperationException("Между выбранными пользователями не нашлось цепочки знакомств.");
        }

        var shortestDistance = result.Path.Count - 1;
        var path = BuildPathVariant(
            "Кратчайшая цепочка",
            result.Path,
            "BFS идёт слоями и первым делом выбивает самый короткий маршрут, не распыляясь на длинные обходы.");

        return new PathSearchResponseDto(
            GetUserName(sourceId),
            GetUserName(targetId),
            "BFS",
            $"Кратчайшая цепочка найдена: {FormatPath(result.Path)}. Длина маршрута — {shortestDistance} связи.",
            1,
            shortestDistance,
            result.VisitedOrder.Select(GetUserName).ToArray(),
            result.ExplanationSteps.ToArray(),
            new[] { path });
    }

    private PathSearchResponseDto BuildDfsResponse(string sourceId, string targetId)
    {
        var result = RunDfs(sourceId, targetId);

        if (result.Paths.Count == 0)
        {
            throw new InvalidOperationException("DFS не нашёл ни одного допустимого маршрута между выбранными пользователями.");
        }

        var orderedPaths = result.Paths
            .OrderBy(path => path.Count)
            .ThenBy(FormatPath, StringComparer.CurrentCulture)
            .ToArray();

        var variants = orderedPaths
            .Select((path, index) => BuildPathVariant(
                $"Маршрут #{index + 1}",
                path,
                index == 0
                    ? "Это самый короткий из найденных маршрутов. DFS нашёл его не магией, а полным перебором допустимых веток."
                    : "Ещё одна валидная цепочка знакомств без повторного захода в уже пройденные вершины."))
            .ToArray();

        var shortestDistance = orderedPaths.Min(path => path.Count - 1);

        return new PathSearchResponseDto(
            GetUserName(sourceId),
            GetUserName(targetId),
            "DFS",
            $"DFS нашёл {variants.Length} возможных маршрутов. Самый короткий занимает {shortestDistance} связи, но алгоритм также раскрыл более длинные обходы.",
            variants.Length,
            shortestDistance,
            result.VisitedOrder.Select(GetUserName).ToArray(),
            result.ExplanationSteps.ToArray(),
            variants);
    }

    private BfsResult RunBfs(string sourceId, string targetId)
    {
        var queue = new Queue<string>();
        var visited = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var parent = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        var visitOrder = new List<string>();
        var explanationSteps = new List<string>();

        queue.Enqueue(sourceId);
        visited.Add(sourceId);
        parent[sourceId] = null;

        AddStep(explanationSteps, $"BFS стартует из вершины {GetUserName(sourceId)}. Сначала в очереди только один человек.");
а
        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            visitOrder.Add(current);

            AddStep(explanationSteps,
                $"Из очереди выходит {GetUserName(current)}. Его ближайшие связи: {string.Join(", ", GetNeighbors(current).Select(GetUserName))}.");

            if (current.Equals(targetId, StringComparison.OrdinalIgnoreCase))
            {
                AddStep(explanationSteps, $"Финиш: добрались до {GetUserName(targetId)} и можем восстанавливать кратчайшую цепочку.");
                return new BfsResult(RebuildPath(parent, targetId), visitOrder, explanationSteps);
            }

            foreach (var neighbor in GetNeighbors(current))
            {
                if (!visited.Add(neighbor))
                {
                    AddStep(explanationSteps, $"{GetUserName(neighbor)} уже был замечен раньше, поэтому второй раз в очередь его не тащим.");
                    continue;
                }

                parent[neighbor] = current;
                queue.Enqueue(neighbor);

                // Здесь и живёт магия кратчайшего пути:
                // кто первым попал в очередь на своём слое, тот и зафиксировал кратчайшего родителя.
                AddStep(explanationSteps,
                    $"Добавляем {GetUserName(neighbor)} в очередь и запоминаем, что пришли к нему через {GetUserName(current)}.");
            }
        }

        AddStep(explanationSteps, "Очередь опустела, а цель так и не нашлась. Значит, пути нет.");
        return new BfsResult([], visitOrder, explanationSteps);
    }

    private DfsResult RunDfs(string sourceId, string targetId)
    {
        var branchVisited = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var currentPath = new List<string>();
        var allPaths = new List<List<string>>();
        var visitOrder = new List<string>();
        var explanationSteps = new List<string>();

        AddStep(explanationSteps, $"DFS стартует из {GetUserName(sourceId)} и полезет в глубину до упора, прежде чем откатываться назад.");

        Explore(sourceId);

        return new DfsResult(allPaths, visitOrder, explanationSteps);

        void Explore(string current)
        {
            branchVisited.Add(current);
            currentPath.Add(current);
            visitOrder.Add(current);

            AddStep(explanationSteps, $"Заходим в {GetUserName(current)}. Текущий маршрут: {FormatPath(currentPath)}.");

            if (current.Equals(targetId, StringComparison.OrdinalIgnoreCase))
            {
                allPaths.Add(currentPath.ToList());
                AddStep(explanationSteps, $"Найден маршрут #{allPaths.Count}: {FormatPath(currentPath)}.");
            }
            else
            {
                foreach (var neighbor in GetNeighbors(current))
                {
                    if (branchVisited.Contains(neighbor))
                    {
                        // Если не отсечь повтор, DFS в неориентированном графе начнёт ходить кругами
                        // и быстро превратится в алгоритм «сломай себе вечер».
                        AddStep(explanationSteps,
                            $"Пропускаем {GetUserName(neighbor)} — вершина уже есть в текущем маршруте, иначе словим цикл.");
                        continue;
                    }

                    AddStep(explanationSteps, $"Идём глубже: {GetUserName(current)} -> {GetUserName(neighbor)}.");
                    Explore(neighbor);
                }
            }

            currentPath.RemoveAt(currentPath.Count - 1);
            branchVisited.Remove(current);

            if (currentPath.Count > 0)
            {
                AddStep(explanationSteps, $"Откат к {GetUserName(currentPath[^1])}. DFS любит глубину, но назад возвращаться обязан.");
            }
        }
    }

    private Dictionary<string, HashSet<string>> BuildAdjacency()
    {
        var adjacency = _users.Keys.ToDictionary(
            userId => userId,
            _ => new HashSet<string>(StringComparer.OrdinalIgnoreCase),
            StringComparer.OrdinalIgnoreCase);

        foreach (var link in _links)
        {
            adjacency[link.SourceId].Add(link.TargetId);
            adjacency[link.TargetId].Add(link.SourceId);
        }

        return adjacency;
    }

    private Dictionary<string, string> BuildLookupIndex()
    {
        var lookup = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

        foreach (var user in _users.Values)
        {
            lookup[NormalizeLookupValue(user.Id)] = user.Id;
            lookup[NormalizeLookupValue(user.Name)] = user.Id;
        }

        return lookup;
    }

    private string ResolveUserId(string input)
    {
        var normalizedInput = NormalizeLookupValue(input);

        if (_lookup.TryGetValue(normalizedInput, out var userId))
        {
            return userId;
        }

        throw new ArgumentException($"Пользователь «{input}» не найден. Проверь имя или выбери вершину прямо на графе.");
    }

    private IEnumerable<string> GetNeighbors(string userId) =>
        _adjacency[userId]
            .OrderBy(GetUserName, StringComparer.CurrentCulture);

    private string GetUserName(string userId) => _users[userId].Name;

    private static string NormalizeLookupValue(string value) =>
        value.Trim().ToLowerInvariant().Replace("ё", "е");

    private static string NormalizeAlgorithm(string algorithmInput)
    {
        var normalized = algorithmInput.Trim().ToLowerInvariant();

        return normalized switch
        {
            "" => "bfs",
            "bfs" => "bfs",
            "dfs" => "dfs",
            _ => normalized
        };
    }

    private PathVariantDto BuildPathVariant(string title, IReadOnlyList<string> path, string commentary) =>
        new(
            title,
            path.ToArray(),
            path.Select(GetUserName).ToArray(),
            commentary);

    private string FormatPath(IEnumerable<string> path) =>
        string.Join(" → ", path.Select(GetUserName));

    private static List<string> RebuildPath(Dictionary<string, string?> parent, string targetId)
    {
        var path = new List<string>();
        string? cursor = targetId;

        while (cursor is not null)
        {
            path.Add(cursor);
            cursor = parent[cursor];
        }

        path.Reverse();
        return path;
    }

    private static void AddStep(List<string> steps, string message)
    {
        const int stepLimit = 64;

        if (steps.Count < stepLimit)
        {
            steps.Add(message);
        }
        else if (steps.Count == stepLimit)
        {
            steps.Add("Шагов стало слишком много, поэтому лог аккуратно обрезан, чтобы интерфейс не превратился в бесконечную простыню.");
        }
    }

    private sealed record UserProfile(string Id, string Name, string Role, string Accent, string Description);

    private sealed record FriendLink(string SourceId, string TargetId, string Label);

    private sealed record BfsResult(
        IReadOnlyList<string> Path,
        IReadOnlyList<string> VisitedOrder,
        IReadOnlyList<string> ExplanationSteps);

    private sealed record DfsResult(
        IReadOnlyList<IReadOnlyList<string>> Paths,
        IReadOnlyList<string> VisitedOrder,
        IReadOnlyList<string> ExplanationSteps);
}
