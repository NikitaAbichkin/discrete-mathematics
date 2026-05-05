# Все дороги между деревнями (откуда, куда, расстояние)
edges = [
    ('A', 'B', 13),
    ('A', 'C', 3),
    ('A', 'D', 9),
    ('A', 'E', 9),
    ('B', 'C', 11),
    ('B', 'D', 11),
    ('B', 'E', 13),
    ('C', 'D', 9),
    ('C', 'E', 7),
    ('D', 'E', 2),
]

# Сортируем по расстоянию — от короткой к длинной
edges = sorted(edges, key=lambda e: e[2])

# Каждая деревня сама себе группа
group = {'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E'}

# Находим корень группы для вершины v
def find_group(v):
    while group[v] != v:
        v = group[v]
    return v

# Объединяем группы двух вершин
def merge(u, v):
    group[find_group(u)] = find_group(v)

# Сюда собираем выбранные дороги
result = []
total = 0

for u, v, dist in edges:
    # Если вершины в разных группах — дорога не создаст цикл
    if find_group(u) != find_group(v):
        merge(u, v)
        result.append((u, v, dist))
        total += dist
        print(f"  ✓ Берём {u}-{v} (dist={dist}) | группы: {group}")
    else:
        print(f"  ✗ Пропускаем {u}-{v} (dist={dist}) — уже в одной группе, цикл!")

    # Все деревни соединены когда рёбер = кол-во вершин - 1
    if len(result) == 4:
        break

print(f"\nИтог: {result}")
print(f"Суммарное расстояние: {total}")
