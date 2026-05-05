using SocialGraphLab.Models;
using SocialGraphLab.Services;

var builder = WebApplication.CreateBuilder(args);

// Граф у нас фиксированный, поэтому singleton здесь честный:
// один раз собрали социальную сеть и дальше просто быстро отвечаем UI.
builder.Services.AddSingleton<SocialGraphService>();

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

// Отдаём фронту весь граф, чтобы он мог красиво нарисовать узлы, легенду и подсказки.
app.MapGet("/api/graph", (SocialGraphService graphService) =>
    Results.Ok(graphService.GetGraphSnapshot()));

app.MapPost("/api/paths", (PathRequest request, SocialGraphService graphService) =>
{
    if (string.IsNullOrWhiteSpace(request.Source) || string.IsNullOrWhiteSpace(request.Target))
    {
        return Results.BadRequest(new
        {
            message = "Нужно указать двух пользователей. Иначе алгоритм будет искать дружбу в пустоте."
        });
    }

    try
    {
        var response = graphService.FindPaths(request.Source, request.Target, request.Algorithm);
        return Results.Ok(response);
    }
    catch (ArgumentException exception)
    {
        return Results.BadRequest(new { message = exception.Message });
    }
    catch (InvalidOperationException exception)
    {
        return Results.NotFound(new { message = exception.Message });
    }
});

// Всё остальное отдаём фронтенду, чтобы получился единый аккуратный сайт без лишней возни.
app.MapFallbackToFile("index.html");

app.Run();
