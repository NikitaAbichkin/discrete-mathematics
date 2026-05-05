# Social Graph Lab

Интерактивный сайт для лабораторной по социальному графу.

Что реализовано:

- Backend на C# (`ASP.NET Core`).
- Граф друзей: пользователи — это вершины, связи — рёбра.
- `BFS` для поиска кратчайшей цепочки знакомств.
- `DFS` для поиска всех возможных простых путей между двумя пользователями.
- Frontend на JavaScript c визуализацией через `vis-network` (локальная копия библиотеки лежит в проекте).
- Выбор пользователей через ввод имён или клики по узлам.
- Подсветка найденных путей и пошаговое объяснение работы алгоритмов.

## Быстрый запуск

Из корня рабочей папки:

```bash
./run-social-graph.sh
```

После запуска открыть:

```text
http://localhost:5187
```

## Ручной запуск

Если нужен запуск без скрипта:

```bash
DOTNET_CLI_HOME="/Users/macbookairm313/Documents/Дискретная математика/.dotnet-cli" \
NUGET_PACKAGES="/Users/macbookairm313/Documents/Дискретная математика/.nuget/packages" \
DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 \
DOTNET_NOLOGO=1 \
/Users/macbookairm313/Documents/Дискретная математика/.dotnet/dotnet run \
  --project "/Users/macbookairm313/Documents/Дискретная математика/SocialGraphLab/SocialGraphLab.csproj" \
  --urls http://localhost:5187
```
