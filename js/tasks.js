import {
  PSEUDOCODE,
  runBacktrackingMaze,
  runBellmanFord,
  runCombinationSum,
  runCountIslands,
  runDfsFind,
  runDfsMaze,
  runDfsMaxDepth,
  runDfsPreorder,
  runDfsTreeSum,
  runEvacuation,
  runGenerateParentheses,
  runKnightMoves,
  runLock,
  runMirrorTree,
  runNearestExit,
  runPermutations,
  runRottingOranges,
  runShortestBridge,
  runSnowball,
  runSubsets,
  runWordLadder,
  runWordSearch,
  runBfsMazeShortest,
  runDijkstraAllToAll,
  runDijkstraToTarget,
} from "./algorithms.js";
import {
  parseAdjacencyMatrix,
  parseCoordText,
  parseEdgeList,
  parseListText,
  parseNumericMatrix,
  parseTokenMatrix,
  parseTreeArray,
} from "./helpers.js";

function toNumber(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Поле "${label}" должно быть числом.`);
  }
  return parsed;
}

function toIntegerList(text) {
  return parseListText(text, (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error("Список должен содержать только числа.");
    }
    return parsed;
  });
}

function graphTask({
  id,
  topic,
  title,
  shortDescription,
  complexity,
  algorithmFamily,
  pseudoCode,
  description,
  metrics,
  presetCases,
  run,
}) {
  return {
    id,
    topic,
    title,
    shortDescription,
    complexity,
    algorithmFamily,
    pseudoCode,
    description,
    metrics,
    presetCases,
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 7,
        hint: "Каждая строка: от куда вес. Пример: A B 4",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A или Router1",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Можно оставить пустым, если нужен расчёт до всех вершин.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: String(values.target ?? "").trim() || null,
      };
    },
    run,
  };
}

export const TOPICS = [
  {
    id: "bfs-1",
    title: "BFS I",
    subtitle: "Поиск по слоям, матрицы и строки",
  },
  {
    id: "bfs-2",
    title: "BFS II",
    subtitle: "Компоненты, состояния и многовершинный BFS",
  },
  {
    id: "dfs",
    title: "DFS",
    subtitle: "Деревья, глубина и поиск ветками",
  },
  {
    id: "dijkstra",
    title: "Дейкстра",
    subtitle: "Кратчайшие пути с неотрицательными весами",
  },
  {
    id: "bellman-ford",
    title: "Беллман–Форд",
    subtitle: "Отрицательные рёбра и циклы",
  },
  {
    id: "backtracking",
    title: "Backtracking",
    subtitle: "Перебор с откатом",
  },
];

export const TASKS = [
  {
    id: "bfs-maze-shortest",
    topic: "bfs-1",
    title: "Кратчайший путь в лабиринте",
    shortDescription: "Минимальное число шагов между стартом и финишем.",
    complexity: "O(N · M)",
    algorithmFamily: "BFS по матрице",
    pseudoCode: PSEUDOCODE.bfsGrid,
    description:
      "Дана матрица из 0 и 1. Нужно найти минимальное количество шагов между двумя точками. Если пройти нельзя, ответ равен -1.",
    metrics: [
      { label: "Формат", value: "матрица + start/end" },
      { label: "Сильная сторона", value: "гарантия кратчайшего пути" },
    ],
    presetCases: [
      {
        label: "Пример лабиринта",
        values: {
          grid: "0 0 0 1 0\n1 1 0 1 0\n0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0",
          start: "0,0",
          end: "4,4",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Матрица лабиринта",
        type: "textarea",
        rows: 7,
        hint: "0 — проход, 1 — стена. Строки через перенос.",
      },
      {
        key: "start",
        label: "Старт",
        type: "text",
        hint: "Например: 0,0",
      },
      {
        key: "end",
        label: "Финиш",
        type: "text",
        hint: "Например: 4,4",
      },
    ],
    parser(values) {
      return {
        grid: parseNumericMatrix(values.grid),
        start: parseCoordText(values.start),
        end: parseCoordText(values.end),
      };
    },
    run: runBfsMazeShortest,
  },
  {
    id: "bfs-knight",
    topic: "bfs-1",
    title: "Минимальные ходы коня",
    shortDescription: "Кратчайший маршрут коня на доске 8×8.",
    complexity: "O(64)",
    algorithmFamily: "BFS по состояниям",
    pseudoCode: PSEUDOCODE.knight,
    description:
      "На шахматной доске нужно определить минимальное число ходов коня между двумя клетками.",
    metrics: [
      { label: "Поле", value: "доска 8 × 8" },
      { label: "Состояние", value: "позиция коня" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          start: "0,0",
          end: "7,7",
        },
      },
    ],
    inputSchema: [
      {
        key: "start",
        label: "Стартовая клетка",
        type: "text",
        hint: "Формат row,col. Например: 0,0",
      },
      {
        key: "end",
        label: "Целевая клетка",
        type: "text",
        hint: "Формат row,col. Например: 7,7",
      },
    ],
    parser(values) {
      return {
        start: parseCoordText(values.start),
        end: parseCoordText(values.end),
      };
    },
    run: runKnightMoves,
  },
  {
    id: "bfs-rotten-oranges",
    topic: "bfs-1",
    title: "Гнилые апельсины",
    shortDescription: "Сколько минут понадобится, чтобы заразить все доступные клетки.",
    complexity: "O(N · M)",
    algorithmFamily: "Многовершинный BFS",
    pseudoCode: PSEUDOCODE.rottenOranges,
    description:
      "Матрица содержит пустые клетки, свежие и гнилые апельсины. Волна заражения распространяется по соседям за одну минуту.",
    metrics: [
      { label: "Слой BFS", value: "одна минута" },
      { label: "Старт", value: "все гнилые сразу" },
    ],
    presetCases: [
      {
        label: "Классический пример",
        values: {
          grid: "2 1 1\n1 1 0\n0 1 1",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Матрица апельсинов",
        type: "textarea",
        rows: 6,
        hint: "0 — пусто, 1 — свежий, 2 — гнилой.",
      },
    ],
    parser(values) {
      return { grid: parseNumericMatrix(values.grid) };
    },
    run: runRottingOranges,
  },
  {
    id: "bfs-word-ladder",
    topic: "bfs-1",
    title: "Преобразование строки",
    shortDescription: "Минимум замен по словарю от A к B.",
    complexity: "O(W² · L)",
    algorithmFamily: "BFS по словарю слов",
    pseudoCode: PSEUDOCODE.wordLadder,
    description:
      "На каждом шаге можно изменить один символ так, чтобы получить слово из списка. Нужно найти минимальную цепочку преобразования.",
    metrics: [
      { label: "Состояние", value: "текущее слово" },
      { label: "Рёбра графа", value: "разница ровно в 1 символ" },
    ],
    presetCases: [
      {
        label: "Классический hit → cog",
        values: {
          start: "hit",
          target: "cog",
          words: "hot\ndot\ndog\nlot\nlog\ncog",
        },
      },
    ],
    inputSchema: [
      {
        key: "start",
        label: "Стартовое слово",
        type: "text",
        hint: "Например: hit",
      },
      {
        key: "target",
        label: "Целевое слово",
        type: "text",
        hint: "Например: cog",
      },
      {
        key: "words",
        label: "Разрешённые слова",
        type: "textarea",
        rows: 6,
        hint: "Слова построчно или через запятую.",
      },
    ],
    parser(values) {
      return {
        start: String(values.start).trim(),
        target: String(values.target).trim(),
        words: parseListText(values.words, (value) => String(value).trim()),
      };
    },
    run: runWordLadder,
  },
  {
    id: "bfs-nearest-exit",
    topic: "bfs-1",
    title: "Ближайший выход из лабиринта",
    shortDescription: "Находим ближайшую граничную клетку, не равную старту.",
    complexity: "O(N · M)",
    algorithmFamily: "BFS по матрице",
    pseudoCode: PSEUDOCODE.nearestExit,
    description:
      "Старт дан внутри матрицы. Нужно определить кратчайшее расстояние до любой подходящей ячейки на границе.",
    metrics: [
      { label: "Выход", value: "любая граница, кроме старта" },
      { label: "Оптимальность", value: "первый найденный выход" },
    ],
    presetCases: [
      {
        label: "Пример с выходом на границе",
        values: {
          grid: "1 1 1 1\n1 0 0 1\n1 1 0 1\n1 1 0 0",
          start: "1,1",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Матрица лабиринта",
        type: "textarea",
        rows: 6,
        hint: "0 — проход, 1 — стена.",
      },
      {
        key: "start",
        label: "Стартовая клетка",
        type: "text",
        hint: "Например: 1,1",
      },
    ],
    parser(values) {
      return {
        grid: parseNumericMatrix(values.grid),
        start: parseCoordText(values.start),
      };
    },
    run: runNearestExit,
  },
  {
    id: "grid-word-search",
    topic: "bfs-1",
    title: "Поиск слова в сетке",
    shortDescription: "На практике решается DFS/backtracking, хотя лежит в BFS-блоке.",
    complexity: "O(N · M · 4^L)",
    algorithmFamily: "DFS / Backtracking по матрице",
    pseudoCode: PSEUDOCODE.wordSearch,
    description:
      "Нужно понять, можно ли собрать слово, двигаясь по соседним клеткам без повторного использования одной и той же клетки.",
    metrics: [
      { label: "Почему не BFS", value: "важен запрет повторного использования клетки" },
      { label: "Состояние", value: "позиция + индекс символа + занятые клетки" },
    ],
    presetCases: [
      {
        label: "Классический пример",
        values: {
          grid: "A B C E\nS F C S\nA D E E",
          word: "ABCCED",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Сетка букв",
        type: "textarea",
        rows: 5,
        hint: "Буквы через пробел, строки через перенос.",
      },
      {
        key: "word",
        label: "Искомое слово",
        type: "text",
        hint: "Например: ABCCED",
      },
    ],
    parser(values) {
      return {
        grid: parseTokenMatrix(values.grid),
        word: String(values.word).trim(),
      };
    },
    run: runWordSearch,
  },
  {
    id: "bfs-islands",
    topic: "bfs-2",
    title: "Острова",
    shortDescription: "Количество компонент связности в бинарной матрице.",
    complexity: "O(N · M)",
    algorithmFamily: "BFS по компонентам",
    pseudoCode: PSEUDOCODE.islands,
    description:
      "Каждый остров — это отдельная компонента связности по четырём направлениям.",
    metrics: [
      { label: "Что считаем", value: "число запусков обхода" },
      { label: "Соседи", value: "только вверх/вниз/влево/вправо" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          grid: "1 1 0 0\n1 0 0 0\n0 0 1 1\n0 0 1 1",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Бинарная матрица",
        type: "textarea",
        rows: 6,
        hint: "1 — земля, 0 — вода.",
      },
    ],
    parser(values) {
      return { grid: parseNumericMatrix(values.grid) };
    },
    run: runCountIslands,
  },
  {
    id: "bfs-shortest-bridge",
    topic: "bfs-2",
    title: "Минимальный мост",
    shortDescription: "Минимум нулей, которые надо превратить в единицы.",
    complexity: "O(N · M)",
    algorithmFamily: "DFS + BFS по слоям воды",
    pseudoCode: PSEUDOCODE.shortestBridge,
    description:
      "Сначала помечаем первый остров, потом расширяемся от него по воде слоями до встречи со вторым островом.",
    metrics: [
      { label: "Шаг 1", value: "маркировка первого острова" },
      { label: "Шаг 2", value: "BFS по воде" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          grid: "1 1 0 0\n1 0 0 0\n0 0 1 1\n0 0 1 1",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Матрица островов",
        type: "textarea",
        rows: 6,
        hint: "1 — остров, 0 — вода.",
      },
    ],
    parser(values) {
      return { grid: parseNumericMatrix(values.grid) };
    },
    run: runShortestBridge,
  },
  {
    id: "bfs-lock",
    topic: "bfs-2",
    title: "Вращающиеся замки",
    shortDescription: "Минимальное число поворотов в графе 4-значных кодов.",
    complexity: "O(10⁴)",
    algorithmFamily: "BFS по строковым состояниям",
    pseudoCode: PSEUDOCODE.lock,
    description:
      "Каждый код замка — вершина графа, а поворот одной цифры на ±1 образует соседнее состояние.",
    metrics: [
      { label: "Состояние", value: "4-значный код" },
      { label: "Ходы", value: "8 соседей у каждой комбинации" },
    ],
    presetCases: [
      {
        label: "Адаптированный пример на 6 ходов",
        values: {
          start: "0000",
          target: "0202",
          forbidden: "0201\n0101\n0102\n1212\n2002",
        },
      },
    ],
    inputSchema: [
      {
        key: "start",
        label: "Стартовый код",
        type: "text",
        hint: "Например: 0000",
      },
      {
        key: "target",
        label: "Целевой код",
        type: "text",
        hint: "Например: 0202",
      },
      {
        key: "forbidden",
        label: "Запрещённые комбинации",
        type: "textarea",
        rows: 6,
        hint: "По одной комбинации на строку.",
      },
    ],
    parser(values) {
      return {
        start: String(values.start).trim(),
        target: String(values.target).trim(),
        forbidden: parseListText(values.forbidden, (value) => String(value).trim()),
      };
    },
    run: runLock,
  },
  {
    id: "bfs-evacuation",
    topic: "bfs-2",
    title: "Эвакуация из комнат",
    shortDescription: "Минимальное время, чтобы все старты дошли до выхода.",
    complexity: "O(N · M)",
    algorithmFamily: "Многовершинный BFS от выходов",
    pseudoCode: PSEUDOCODE.evacuation,
    description:
      "Чтобы не запускать поиск отдельно для каждого человека, удобнее распространить расстояния сразу от всех выходов.",
    metrics: [
      { label: "Старт BFS", value: "все выходы E" },
      { label: "Ответ", value: "максимум среди дистанций S" },
    ],
    presetCases: [
      {
        label: "Пример эвакуации",
        values: {
          grid: "S 0 0 E\n1 0 1 0\n1 0 0 S",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "План здания",
        type: "textarea",
        rows: 6,
        hint: "Используй E, S, 0 и 1. Символы через пробел.",
      },
    ],
    parser(values) {
      return { grid: parseTokenMatrix(values.grid) };
    },
    run: runEvacuation,
  },
  {
    id: "bfs-snowball",
    topic: "bfs-2",
    title: "Снежный ком",
    shortDescription: "Минимум операций ×2, ×3 и +1 для достижения N.",
    complexity: "O(N)",
    algorithmFamily: "BFS по числам",
    pseudoCode: PSEUDOCODE.snowball,
    description:
      "Число можно рассматривать как состояние. Из него есть три перехода: умножить на 2, умножить на 3 или прибавить 1.",
    metrics: [
      { label: "Начало", value: "X = 1" },
      { label: "Ограничение", value: "перебираем числа до N" },
    ],
    presetCases: [
      {
        label: "Пример N = 10",
        values: {
          target: "10",
        },
      },
    ],
    inputSchema: [
      {
        key: "target",
        label: "Целевое число N",
        type: "text",
        hint: "Например: 10",
      },
    ],
    parser(values) {
      return { target: toNumber(values.target, "Целевое число N") };
    },
    run: runSnowball,
  },
  {
    id: "dfs-preorder",
    topic: "dfs",
    title: "Обход дерева в глубину",
    shortDescription: "Префиксный порядок: корень → левый → правый.",
    complexity: "O(N)",
    algorithmFamily: "DFS по дереву",
    pseudoCode: PSEUDOCODE.dfsPreorder,
    description:
      "Классический префиксный обход дерева. Именно в таком порядке значения должны попасть в ответ.",
    metrics: [
      { label: "Формат", value: "level-order массив" },
      { label: "Порядок", value: "root-left-right" },
    ],
    presetCases: [
      {
        label: "Дерево из PDF",
        values: {
          tree: "[1,2,3,4,5]",
        },
      },
    ],
    inputSchema: [
      {
        key: "tree",
        label: "Дерево",
        type: "textarea",
        rows: 4,
        hint: "Пиши так: [1,2,3,4,5]. Если внутри есть пустое место, пиши -.",
      },
    ],
    parser(values) {
      return { values: parseTreeArray(values.tree) };
    },
    run: runDfsPreorder,
  },
  {
    id: "dfs-sum",
    topic: "dfs",
    title: "Сумма значений всех узлов",
    shortDescription: "Снизу вверх собираем вклад каждого поддерева.",
    complexity: "O(N)",
    algorithmFamily: "DFS с агрегацией",
    pseudoCode: PSEUDOCODE.dfsSum,
    description:
      "Каждый рекурсивный вызов возвращает сумму своего поддерева, а корень получает сумму всего дерева.",
    metrics: [
      { label: "Возврат функции", value: "сумма поддерева" },
      { label: "База", value: "пустое место даёт 0" },
    ],
    presetCases: [
      {
        label: "Дерево из PDF",
        values: {
          tree: "[1,2,3,4,5]",
        },
      },
    ],
    inputSchema: [
      {
        key: "tree",
        label: "Дерево",
        type: "textarea",
        rows: 4,
        hint: "Пиши так: [1,2,3,4,5]. Если внутри есть пустое место, пиши -.",
      },
    ],
    parser(values) {
      return { values: parseTreeArray(values.tree) };
    },
    run: runDfsTreeSum,
  },
  {
    id: "dfs-depth",
    topic: "dfs",
    title: "Максимальная глубина дерева",
    shortDescription: "Отслеживаем самый глубокий уровень рекурсии.",
    complexity: "O(N)",
    algorithmFamily: "DFS с параметром глубины",
    pseudoCode: PSEUDOCODE.dfsDepth,
    description:
      "Глубина дерева — это максимальное расстояние от корня до листа. DFS проходит все ветки и обновляет максимум.",
    metrics: [
      { label: "Параметр", value: "текущая глубина" },
      { label: "Итог", value: "максимум по всем листьям" },
    ],
    presetCases: [
      {
        label: "Дерево из PDF",
        values: {
          tree: "[1,2,3,4,5]",
        },
      },
    ],
    inputSchema: [
      {
        key: "tree",
        label: "Дерево",
        type: "textarea",
        rows: 4,
        hint: "Пиши так: [1,2,3,4,5]. Если внутри есть пустое место, пиши -.",
      },
    ],
    parser(values) {
      return { values: parseTreeArray(values.tree) };
    },
    run: runDfsMaxDepth,
  },
  {
    id: "dfs-mirror",
    topic: "dfs",
    title: "Зеркальное отражение дерева",
    shortDescription: "Меняем местами левые и правые поддеревья у каждого узла.",
    complexity: "O(N)",
    algorithmFamily: "DFS с мутацией структуры",
    pseudoCode: PSEUDOCODE.dfsMirror,
    description:
      "Если у каждого узла поменять местами детей, дерево полностью отразится относительно вертикальной оси.",
    metrics: [
      { label: "Действие", value: "swap(left, right)" },
      { label: "Область", value: "каждый узел ровно один раз" },
    ],
    presetCases: [
      {
        label: "Дерево из PDF",
        values: {
          tree: "[1,2,3,4,5]",
        },
      },
    ],
    inputSchema: [
      {
        key: "tree",
        label: "Дерево",
        type: "textarea",
        rows: 4,
        hint: "Пиши так: [1,2,3,4,5]. Если внутри есть пустое место, пиши -.",
      },
    ],
    parser(values) {
      return { values: parseTreeArray(values.tree) };
    },
    run: runMirrorTree,
  },
  {
    id: "dfs-find",
    topic: "dfs",
    title: "Поиск элемента в дереве",
    shortDescription: "Проверяем, встречается ли target в вершинах дерева.",
    complexity: "O(N)",
    algorithmFamily: "DFS с коротким замыканием",
    pseudoCode: PSEUDOCODE.dfsFind,
    description:
      "Рекурсивно идём по дереву и завершаем обход сразу, как только находим нужное значение.",
    metrics: [
      { label: "Оптимизация", value: "остановка при первом совпадении" },
      { label: "Ответ", value: "True / False" },
    ],
    presetCases: [
      {
        label: "Ищем значение 5",
        values: {
          tree: "[1,2,3,4,5]",
          target: "5",
        },
      },
    ],
    inputSchema: [
      {
        key: "tree",
        label: "Дерево",
        type: "textarea",
        rows: 4,
        hint: "Пиши так: [1,2,3,4,5]. Если внутри есть пустое место, пиши -.",
      },
      {
        key: "target",
        label: "Искомое значение",
        type: "text",
        hint: "Например: 5",
      },
    ],
    parser(values) {
      return {
        values: parseTreeArray(values.tree),
        target: toNumber(values.target, "Искомое значение"),
      };
    },
    run: runDfsFind,
  },
  {
    id: "dfs-maze",
    topic: "dfs",
    title: "Поиск выхода в лабиринте",
    shortDescription: "Определяем, существует ли хоть какой-то путь до финиша.",
    complexity: "O(N · M)",
    algorithmFamily: "DFS по матрице",
    pseudoCode: PSEUDOCODE.dfsMaze,
    description:
      "Задача не требует кратчайшего пути, поэтому DFS просто пробует углубляться по доступным направлениям до тех пор, пока не найдёт цель или не переберёт все ветки.",
    metrics: [
      { label: "Задача", value: "проверка существования пути" },
      { label: "Стратегия", value: "глубина прежде ширины" },
    ],
    presetCases: [
      {
        label: "Лабиринт из практики",
        values: {
          grid: "0 0 0 1\n1 1 0 1\n0 0 0 0\n0 1 1 0",
          start: "0,0",
          end: "3,3",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Матрица лабиринта",
        type: "textarea",
        rows: 6,
        hint: "0 — проход, 1 — стена.",
      },
      {
        key: "start",
        label: "Старт",
        type: "text",
        hint: "Например: 0,0",
      },
      {
        key: "end",
        label: "Финиш",
        type: "text",
        hint: "Например: 3,3",
      },
    ],
    parser(values) {
      return {
        grid: parseNumericMatrix(values.grid),
        start: parseCoordText(values.start),
        end: parseCoordText(values.end),
      };
    },
    run: runDfsMaze,
  },
  graphTask({
    id: "dijkstra-base",
    topic: "dijkstra",
    title: "Разобранный базовый пример",
    shortDescription: "Тот самый пример, где B сначала даёт путь к A, а потом к F.",
    complexity: "O(V² + E)",
    algorithmFamily: "Дейкстра с восстановлением пути",
    pseudoCode: PSEUDOCODE.dijkstra,
    description:
      "Базовый пример показывает, как стоимость вершины A снижается после обработки B, а затем окончательно находится путь до F.",
    metrics: [
      { label: "Старт", value: "S" },
      { label: "Цель", value: "F" },
    ],
    presetCases: [
      {
        label: "Классический учебный граф",
        values: {
          edges: "S A 6\nS B 2\nB A 3\nB F 5\nA F 1",
          start: "S",
          target: "F",
        },
      },
    ],
    run(parsed) {
      return runDijkstraToTarget(parsed);
    },
  }),
  graphTask({
    id: "dijkstra-path",
    topic: "dijkstra",
    title: "Восстановление пути",
    shortDescription: "Считаем длину и тут же восстанавливаем сами вершины маршрута.",
    complexity: "O(V² + E)",
    algorithmFamily: "Дейкстра + таблица предков",
    pseudoCode: PSEUDOCODE.dijkstra,
    description:
      "После расчёта расстояний идём по parent-таблице от цели назад и получаем весь кратчайший маршрут.",
    metrics: [
      { label: "Главная идея", value: "храним предка при каждой релаксации" },
      { label: "Итог", value: "длина + маршрут" },
    ],
    presetCases: [
      {
        label: "Маршрут S → F",
        values: {
          edges: "S A 4\nS B 2\nB C 2\nA C 1\nC F 3\nA F 7",
          start: "S",
          target: "F",
        },
      },
    ],
    run(parsed) {
      return runDijkstraToTarget(parsed);
    },
  }),
  graphTask({
    id: "dijkstra-equal-paths",
    topic: "dijkstra",
    title: "Несколько одинаково коротких путей",
    shortDescription: "Сохраняем несколько предков для одной вершины.",
    complexity: "O(V² + E)",
    algorithmFamily: "Дейкстра с множеством предков",
    pseudoCode: PSEUDOCODE.dijkstra,
    description:
      "Если две разные вершины дают одинаковую минимальную стоимость, нужно сохранить оба варианта и восстановить все кратчайшие маршруты.",
    metrics: [
      { label: "Особенность", value: "равные дистанции не отбрасываем" },
      { label: "Итог", value: "несколько маршрутов" },
    ],
    presetCases: [
      {
        label: "Два кратчайших пути X → Y",
        values: {
          edges: "X A 2\nX B 2\nA Y 3\nB Y 3",
          start: "X",
          target: "Y",
        },
      },
    ],
    run(parsed) {
      return runDijkstraToTarget({
        ...parsed,
        allowEqualParents: true,
      });
    },
  }),
  graphTask({
    id: "dijkstra-unreachable",
    topic: "dijkstra",
    title: "Недостижимые вершины",
    shortDescription: "Если путь не найден, вершина остаётся с бесконечной стоимостью.",
    complexity: "O(V² + E)",
    algorithmFamily: "Дейкстра до всех вершин",
    pseudoCode: PSEUDOCODE.dijkstra,
    description:
      "Алгоритм показывает не только достижимые маршруты, но и честно оставляет недостижимые вершины со значением ∞, которое в интерфейсе переводится в -1.",
    metrics: [
      { label: "Результат", value: "таблица расстояний" },
      { label: "Недостижимость", value: "∞ → -1 в выводе" },
    ],
    presetCases: [
      {
        label: "Граф с изолированной вершиной",
        values: {
          edges: "A B 2\nB C 3\nC D 1\nE F 4",
          start: "A",
          target: "",
        },
      },
    ],
    run(parsed) {
      const result = runDijkstraAllToAll(parsed);
      result.answer = result.answer.replace(/∞/g, "-1");
      return result;
    },
  }),
  graphTask({
    id: "dijkstra-network",
    topic: "dijkstra",
    title: "Маршрутизация в сети",
    shortDescription: "Классический shortest path, но в терминах задержек маршрутизаторов.",
    complexity: "O(V² + E)",
    algorithmFamily: "Дейкстра на сетевом графе",
    pseudoCode: PSEUDOCODE.dijkstra,
    description:
      "Каждое ребро — задержка между роутерами. Задача полностью повторяет общую механику Дейкстры, только смысл веса — миллисекунды.",
    metrics: [
      { label: "Единица веса", value: "миллисекунды" },
      { label: "Цель", value: "минимальная суммарная задержка" },
    ],
    presetCases: [
      {
        label: "Пример сети Router1 → Router5",
        values: {
          edges: "Router1 Router2 7\nRouter1 Router3 2\nRouter3 Router4 3\nRouter4 Router5 2\nRouter2 Router5 9\nRouter3 Router5 8",
          start: "Router1",
          target: "Router5",
        },
      },
    ],
    run(parsed) {
      return runDijkstraToTarget(parsed);
    },
  }),
  {
    id: "backtracking-permutations",
    topic: "backtracking",
    title: "Перестановки чисел",
    shortDescription: "Перебираем все порядки уникальных элементов.",
    complexity: "O(n · n!)",
    algorithmFamily: "Backtracking с массивом used",
    pseudoCode: PSEUDOCODE.permutations,
    description:
      "Каждый шаг выбирает очередное свободное число, а после возврата из рекурсии откатывает выбор.",
    metrics: [
      { label: "Состояние", value: "path + used[]" },
      { label: "Результат", value: "все n! перестановок" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          numbers: "1,2,3",
        },
      },
    ],
    inputSchema: [
      {
        key: "numbers",
        label: "Массив чисел",
        type: "text",
        hint: "Например: 1,2,3",
      },
    ],
    parser(values) {
      return { numbers: toIntegerList(values.numbers) };
    },
    run: runPermutations,
  },
  {
    id: "backtracking-subsets",
    topic: "backtracking",
    title: "Подмножества",
    shortDescription: "Для каждого элемента решаем: взять его или пропустить.",
    complexity: "O(n · 2ⁿ)",
    algorithmFamily: "Backtracking по бинарному выбору",
    pseudoCode: PSEUDOCODE.subsets,
    description:
      "Каждый элемент либо входит в текущее подмножество, либо нет. Это порождает полное дерево решений глубины n.",
    metrics: [
      { label: "Ветки", value: "включить / исключить" },
      { label: "Итог", value: "2ⁿ подмножеств" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          numbers: "1,2,3",
        },
      },
    ],
    inputSchema: [
      {
        key: "numbers",
        label: "Массив чисел",
        type: "text",
        hint: "Например: 1,2,3",
      },
    ],
    parser(values) {
      return { numbers: toIntegerList(values.numbers) };
    },
    run: runSubsets,
  },
  {
    id: "backtracking-maze",
    topic: "backtracking",
    title: "Путь в лабиринте",
    shortDescription: "Пробуем маршруты и откатываемся из тупиков.",
    complexity: "O(N · M) в среднем, экспоненциально в худшем случае",
    algorithmFamily: "Backtracking по матрице",
    pseudoCode: PSEUDOCODE.backtrackingMaze,
    description:
      "В отличие от BFS на кратчайший путь, здесь важен именно сам механизм перебора и отката, когда путь оказался тупиковым.",
    metrics: [
      { label: "Старт", value: "(0,0)" },
      { label: "Цель", value: "(N-1,M-1)" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          grid: "0 0 0\n1 1 0\n0 0 0",
        },
      },
    ],
    inputSchema: [
      {
        key: "grid",
        label: "Матрица лабиринта",
        type: "textarea",
        rows: 5,
        hint: "0 — проход, 1 — стена.",
      },
    ],
    parser(values) {
      return { grid: parseNumericMatrix(values.grid) };
    },
    run: runBacktrackingMaze,
  },
  {
    id: "backtracking-parentheses",
    topic: "backtracking",
    title: "Генерация скобок",
    shortDescription: "Строим только те строки, которые остаются корректными на каждом шаге.",
    complexity: "O(Cn)",
    algorithmFamily: "Backtracking с ограничениями",
    pseudoCode: PSEUDOCODE.parentheses,
    description:
      "Корректность строк обеспечивается прямо во время генерации: если закрывающих станет больше, ветка даже не создаётся.",
    metrics: [
      { label: "Ограничение", value: "close ≤ open ≤ n" },
      { label: "Результат", value: "все корректные комбинации" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          pairs: "3",
        },
      },
    ],
    inputSchema: [
      {
        key: "pairs",
        label: "Количество пар скобок",
        type: "text",
        hint: "Например: 3",
      },
    ],
    parser(values) {
      return { pairs: toNumber(values.pairs, "Количество пар скобок") };
    },
    run: runGenerateParentheses,
  },
  {
    id: "backtracking-combination-sum",
    topic: "backtracking",
    title: "Комбинации сумм",
    shortDescription: "Подбираем комбинации чисел, дающие target.",
    complexity: "экспоненциальная",
    algorithmFamily: "Backtracking с отсечением по остатку",
    pseudoCode: PSEUDOCODE.combinationSum,
    description:
      "Если сумма уже превысила target, продолжать ветку не имеет смысла. Это и есть основная отсечка.",
    metrics: [
      { label: "Отсечка", value: "remain < 0" },
      { label: "Повторы", value: "одно число можно брать многократно" },
    ],
    presetCases: [
      {
        label: "Пример из PDF",
        values: {
          candidates: "2,3,6,7",
          target: "7",
        },
      },
    ],
    inputSchema: [
      {
        key: "candidates",
        label: "Кандидаты",
        type: "text",
        hint: "Например: 2,3,6,7",
      },
      {
        key: "target",
        label: "Целевая сумма",
        type: "text",
        hint: "Например: 7",
      },
    ],
    parser(values) {
      return {
        candidates: toIntegerList(values.candidates),
        target: toNumber(values.target, "Целевая сумма"),
      };
    },
    run: runCombinationSum,
  },
  {
    id: "bellman-basic",
    topic: "bellman-ford",
    title: "Базовый пример с отрицательным весом",
    shortDescription: "Считаем кратчайшие пути от A до всех вершин.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Классический пример, где отрицательное ребро не создаёт цикла, но влияет на итоговые расстояния.",
    metrics: [
      { label: "Сильная сторона", value: "умеет отрицательные рёбра" },
      { label: "Результат", value: "таблица расстояний" },
    ],
    presetCases: [
      {
        label: "Скорректированный пример без противоречия",
        values: {
          edges: "A B 4\nA C 5\nB C -1\nB D 5\nC D 8\nC E 10\nD E 2",
          start: "A",
          target: "",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 8,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Оставь пустым для расчёта до всех вершин.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: String(values.target ?? "").trim() || null,
      };
    },
    run: runBellmanFord,
  },
  {
    id: "bellman-cycle",
    topic: "bellman-ford",
    title: "Обнаружение отрицательного цикла",
    shortDescription: "Проверяем, можно ли ещё улучшить расстояния после |V|-1 проходов.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд + цикл-проверка",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Если после всех основных итераций улучшение всё ещё возможно, в достижимой части графа есть отрицательный цикл.",
    metrics: [
      { label: "Критерий", value: "есть улучшение на дополнительном проходе" },
      { label: "Ответ", value: "True / False" },
    ],
    presetCases: [
      {
        label: "Задача 2 из PDF",
        values: {
          edges: "A B 1\nB C -1\nC A -1",
          start: "A",
          target: "",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 6,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Не требуется для этой задачи.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: null,
      };
    },
    run(parsed) {
      const result = runBellmanFord(parsed);
      result.answer = result.hasNegativeCycle ? "True" : "False";
      return result;
    },
  },
  {
    id: "bellman-negative-path",
    topic: "bellman-ford",
    title: "Кратчайший путь с отрицательными рёбрами",
    shortDescription: "Находим путь S → F, где отрицательное ребро помогает сократить маршрут.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд с восстановлением пути",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Даже если отрицательные рёбра есть, но отрицательного цикла нет, алгоритм корректно находит кратчайший путь.",
    metrics: [
      { label: "Старт", value: "S" },
      { label: "Цель", value: "F" },
    ],
    presetCases: [
      {
        label: "Адаптированный пример без отрицательного цикла",
        values: {
          edges: "S A 4\nS B 3\nA B -2\nB A 3\nB C 2\nC F 1\nA F 5",
          start: "S",
          target: "F",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 8,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: S",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        hint: "Например: F",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: String(values.target).trim(),
      };
    },
    run: runBellmanFord,
  },
  {
    id: "bellman-matrix",
    topic: "bellman-ford",
    title: "Матрица смежности",
    shortDescription: "Конвертируем матрицу в список рёбер и считаем пути от вершины 0.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд по матрице",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Ввод в виде матрицы смежности — это просто другой способ задать граф. Внутри алгоритм всё равно работает со списком рёбер.",
    metrics: [
      { label: "Старт", value: "вершина 0" },
      { label: "Ноль вне диагонали", value: "ребра нет" },
    ],
    presetCases: [
      {
        label: "Задача 4 из PDF",
        values: {
          matrix: "0 5 0 0\n0 0 -3 0\n0 0 0 4\n2 0 0 0",
          start: "0",
        },
      },
    ],
    inputSchema: [
      {
        key: "matrix",
        label: "Матрица смежности",
        type: "textarea",
        rows: 6,
        hint: "Строки через перенос, значения через пробел.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: 0",
      },
    ],
    parser(values) {
      const { edges } = parseAdjacencyMatrix(values.matrix);
      return {
        edges,
        start: String(values.start).trim(),
        target: null,
      };
    },
    run: runBellmanFord,
  },
  {
    id: "bellman-path-restore",
    topic: "bellman-ford",
    title: "Восстановление пути",
    shortDescription: "Нужен не только ответ, но и сам маршрут от A до D.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд + parent-цепочка",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "После релаксации рёбер таблица предков позволяет восстановить фактическую цепочку вершин кратчайшего пути.",
    metrics: [
      { label: "Цель", value: "A → D" },
      { label: "Итог", value: "длина + путь" },
    ],
    presetCases: [
      {
        label: "Задача 5 из PDF",
        values: {
          edges: "A B 3\nA C 5\nB C -2\nB D 1\nC D 4",
          start: "A",
          target: "D",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 7,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        hint: "Например: D",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: String(values.target).trim(),
      };
    },
    run: runBellmanFord,
  },
  {
    id: "bellman-unreachable-cycle",
    topic: "bellman-ford",
    title: "Недостижимый отрицательный цикл",
    shortDescription: "Цикл есть, но он оторван от стартовой вершины и потому не влияет на ответ.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Алгоритм реагирует только на циклы, которые достижимы из старта. Изолированный отрицательный цикл не должен ломать ответ.",
    metrics: [
      { label: "Важный нюанс", value: "цикл существует, но недостижим" },
      { label: "Ответ", value: "расстояния только для компоненты старта" },
    ],
    presetCases: [
      {
        label: "Задача 6 из PDF",
        values: {
          edges: "A B 2\nB C 3\nX Y 1\nY X -5",
          start: "A",
          target: "",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 6,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Не требуется.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: null,
      };
    },
    run: runBellmanFord,
  },
  {
    id: "bellman-vs-dijkstra",
    topic: "bellman-ford",
    title: "Сравнение с Дейкстрой",
    shortDescription: "Показываем, почему отрицательное ребро ломает жадную стратегию Дейкстры.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд + объяснение контраста",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "В этом графе отрицательное ребро делает путь через промежуточную вершину выгоднее позже, чем ожидал бы алгоритм Дейкстры.",
    metrics: [
      { label: "Ключевая причина", value: "отрицательное ребро может улучшить уже выбранный путь" },
      { label: "Правильный выбор", value: "Беллман–Форд" },
    ],
    presetCases: [
      {
        label: "Задача 7 из PDF",
        values: {
          edges: "A B 10\nA C 5\nC B -8",
          start: "A",
          target: "",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 6,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Оставь пустым для таблицы расстояний.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: null,
        noteDijkstra: true,
      };
    },
    run: runBellmanFord,
  },
  {
    id: "bellman-infinite-updates",
    topic: "bellman-ford",
    title: "Многократные обновления",
    shortDescription: "Если цикл отрицательный и достижим, расстояние можно уменьшать бесконечно.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд с детекцией отрицательного цикла",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Задача подчёркивает, что для некоторых вершин число улучшений не ограничено: отрицательный цикл будет уменьшать расстояние снова и снова.",
    metrics: [
      { label: "Правильный ответ", value: "бесконечно" },
      { label: "Причина", value: "достижимый отрицательный цикл" },
    ],
    presetCases: [
      {
        label: "Задача 8 из PDF",
        values: {
          edges: "A B 1\nB C 1\nC D 1\nD A -4",
          start: "A",
          target: "",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 6,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: A",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Не требуется.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: null,
      };
    },
    run(parsed) {
      const result = runBellmanFord(parsed);
      if (result.hasNegativeCycle) {
        result.answer = "Бесконечно";
        result.conclusion =
          "Расстояние до вершин, затронутых достижимым отрицательным циклом, можно улучшать сколько угодно раз.";
      }
      return result;
    },
  },
  {
    id: "bellman-two-negative",
    topic: "bellman-ford",
    title: "Два отрицательных ребра",
    shortDescription: "Ещё один пример на корректный расчёт путей при отрицательных рёбрах.",
    complexity: "O(V · E)",
    algorithmFamily: "Беллман–Форд",
    pseudoCode: PSEUDOCODE.bellmanFord,
    description:
      "Показывает, что алгоритм спокойно работает и с несколькими отрицательными рёбрами, пока отрицательного цикла нет.",
    metrics: [
      { label: "Старт", value: "S" },
      { label: "Результат", value: "все кратчайшие пути" },
    ],
    presetCases: [
      {
        label: "Задача 9 из PDF",
        values: {
          edges: "S A 3\nS B 4\nA B -2\nB C 1\nA C 5",
          start: "S",
          target: "",
        },
      },
    ],
    inputSchema: [
      {
        key: "edges",
        label: "Список рёбер",
        type: "textarea",
        rows: 6,
        hint: "Формат: от куда вес.",
      },
      {
        key: "start",
        label: "Стартовая вершина",
        type: "text",
        hint: "Например: S",
      },
      {
        key: "target",
        label: "Целевая вершина",
        type: "text",
        optional: true,
        hint: "Можно оставить пустым.",
      },
    ],
    parser(values) {
      return {
        edges: parseEdgeList(values.edges),
        start: String(values.start).trim(),
        target: null,
      };
    },
    run: runBellmanFord,
  },
];

export const TASKS_BY_ID = new Map(TASKS.map((task) => [task.id, task]));
export const TASKS_BY_TOPIC = new Map(
  TOPICS.map((topic) => [
    topic.id,
    TASKS.filter((task) => task.topic === topic.id),
  ])
);
