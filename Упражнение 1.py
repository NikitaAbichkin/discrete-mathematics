# Упражнение 1 — Алгоритм ближайшего соседа
# Граф рис. 7.11: вершины A, B, C, D
#
# Веса рёбер:
#   A-B = 5
#   A-C = 6
#   A-D = 8
#   B-C = 7
#   B-D = 10
#   C-D = 3

# Представляем граф как словарь:
# ключ = вершина, значение = словарь {сосед: вес}
graph = {
    'A': {'B': 5, 'C': 6, 'D': 8},
    'B': {'A': 5, 'C': 7, 'D': 10},
    'C': {'A': 6, 'B': 7, 'D': 3},
    'D': {'A': 8, 'B': 10, 'C': 3},
}

# Начальная вершина по условию задачи
start = 'D'

# visited — список посещённых вершин в порядке обхода
visited = [start]

# current — вершина где мы сейчас стоим
current = start

# total — накапливаем суммарный вес маршрута
total = 0

print(f"Старт: {start}")
print(f"Посещённые: {visited}\n")

# Повторяем пока не посетим все 4 вершины
while len(visited) < len(graph):

    # Берём всех соседей текущей вершины
    neighbors = graph[current] # type: ignore

    # Ищем ближайшего соседа которого ещё не посещали
    nearest = None
    min_dist = float('inf')  # начинаем с бесконечности

    for neighbor, weight in neighbors.items():
        if neighbor not in visited:          # только непосещённые
            if weight < min_dist:            # если нашли путь короче
                min_dist = weight
                nearest = neighbor

    # Идём в ближайшую вершину
    print(f"Стоим в {current}, смотрим соседей: {neighbors}")
    print(f"  → идём в {nearest} (вес ребра = {min_dist})")

    visited.append(nearest)# type: ignore
    total += min_dist
    current = nearest

    print(f"  Посещённые: {visited}, вес пути = {total}\n")

# Возвращаемся обратно в стартовую вершину
return_weight = graph[current][start] # type: ignore
total += return_weight
visited.append(start)

print(f"Возвращаемся из {current} в {start} (вес ребра = {return_weight})")
print(f"\nИтоговый маршрут: {' → '.join(visited)}")
print(f"Суммарный вес:    {total}")

