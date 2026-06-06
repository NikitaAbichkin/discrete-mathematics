import {
  INF,
  buildBinaryTree,
  buildGraphLayout,
  coordKey,
  createStep,
  finalizeSteps,
  formatCoord,
  formatMaybeInfinity,
  formatPath,
  fromCoordKey,
  isInside,
  knightOffsets,
  makeBacktrackingSnapshot,
  makeGraphSnapshot,
  makeMatrixSnapshot,
  makeTraceSnapshot,
  makeTreeSnapshot,
  neighbors4,
  reconstructAllPaths,
  reconstructPath,
  serializeTree,
  treeToLevelOrder,
} from "./helpers.js";

export const PSEUDOCODE = {
  bfsGrid: [
    "queue ← [start], visited ← {start}, distance[start] ← 0",
    "пока queue не пуста:",
    "  current ← queue.pop_front()",
    "  если current — цель: восстановить путь и завершить",
    "  для каждого соседа current:",
    "    если сосед допустим и ещё не посещён:",
    "      visited.add(сосед), parent[сосед] ← current",
    "      distance[сосед] ← distance[current] + 1, queue.push(сосед)",
  ],
  knight: [
    "queue ← [start], visited ← {start}",
    "пока queue не пуста:",
    "  current ← queue.pop_front()",
    "  если current = target: восстановить маршрут",
    "  для каждого хода коня из 8 вариантов:",
    "    если клетка на доске и не посещена: добавить в queue",
  ],
  rottenOranges: [
    "queue ← все гнилые апельсины с временем 0",
    "пока queue не пуста:",
    "  current, minute ← queue.pop_front()",
    "  для каждого соседнего свежего апельсина:",
    "    сделать его гнилым и положить в queue с minute + 1",
    "если свежие апельсины остались: ответ -1, иначе ответ = max(minute)",
  ],
  wordLadder: [
    "queue ← [start], visited ← {start}",
    "пока queue не пуста:",
    "  word ← queue.pop_front()",
    "  если word = target: восстановить цепочку",
    "  перебрать допустимые слова, отличающиеся на 1 символ",
    "  каждое новое слово добавить в queue",
  ],
  nearestExit: [
    "queue ← [start], visited ← {start}",
    "пока queue не пуста:",
    "  current ← queue.pop_front()",
    "  если current — выход на границе и это не старт: завершить",
    "  добавить всех допустимых соседей на следующий слой BFS",
  ],
  wordSearch: [
    "dfs(cell, index):",
    "  если буква в cell не совпала с word[index]: вернуть false",
    "  если index = word.length - 1: вернуть true",
    "  отметить cell как использованную",
    "  рекурсивно проверить 4 соседей",
    "  снять отметку и вернуть результат",
  ],
  islands: [
    "count ← 0",
    "для каждой клетки матрицы:",
    "  если там земля и она ещё не посещена:",
    "    count ← count + 1",
    "    запустить BFS по этой компоненте",
    "после обхода всех компонент вернуть count",
  ],
  shortestBridge: [
    "найти первый остров и пометить все его клетки",
    "queue ← все клетки первого острова",
    "пока queue не пуста:",
    "  взять клетку текущего слоя расширения",
    "  если достигнут второй остров: ответ = длина слоя",
    "  иначе расшириться на соседнюю воду",
  ],
  lock: [
    "queue ← [start], visited ← {start}",
    "пока queue не пуста:",
    "  code ← queue.pop_front()",
    "  если code = target: восстановить путь",
    "  сгенерировать 8 соседних комбинаций (+1/-1 для каждой цифры)",
    "  разрешённые и новые состояния добавить в queue",
  ],
  evacuation: [
    "queue ← все выходы E с расстоянием 0",
    "запустить BFS от всех выходов одновременно",
    "получить расстояние до каждой достижимой клетки",
    "собрать расстояния для всех стартов S",
    "если хотя бы один S недостижим: ответ -1, иначе максимум расстояний",
  ],
  snowball: [
    "queue ← [1], visited ← {1}",
    "пока queue не пуста:",
    "  current ← queue.pop_front()",
    "  если current = N: восстановить путь",
    "  для операций ×2, ×3 и +1 породить новые значения",
    "  если новое значение ≤ N и ещё не посещено: добавить в queue",
  ],
  dfsPreorder: [
    "dfs(node):",
    "  если node = null: return",
    "  добавить node.value в ответ",
    "  dfs(node.left)",
    "  dfs(node.right)",
  ],
  dfsSum: [
    "dfs(node):",
    "  если node = null: return 0",
    "  leftSum ← dfs(node.left)",
    "  rightSum ← dfs(node.right)",
    "  return node.value + leftSum + rightSum",
  ],
  dfsDepth: [
    "dfs(node, depth):",
    "  если node = null: return",
    "  обновить максимальную глубину",
    "  dfs(node.left, depth + 1)",
    "  dfs(node.right, depth + 1)",
  ],
  dfsMirror: [
    "dfs(node):",
    "  если node = null: return",
    "  поменять местами node.left и node.right",
    "  dfs(node.left)",
    "  dfs(node.right)",
  ],
  dfsFind: [
    "dfs(node):",
    "  если node = null: return false",
    "  если node.value = target: return true",
    "  вернуть dfs(node.left) или dfs(node.right)",
  ],
  dfsMaze: [
    "dfs(cell):",
    "  если cell — цель: вернуть true",
    "  отметить cell как посещённую",
    "  рекурсивно проверить допустимых соседей",
    "  если никто не привёл к цели: откатиться",
  ],
  dijkstra: [
    "distance[start] ← 0, остальные ← ∞",
    "пока есть непосещённая вершина с конечной стоимостью:",
    "  current ← вершина с минимальным distance",
    "  для каждого ребра current → neighbor:",
    "    candidate ← distance[current] + weight",
    "    если candidate < distance[neighbor]: обновить distance и parent",
    "после завершения восстановить путь по parent",
  ],
  bellmanFord: [
    "distance[start] ← 0, остальные ← ∞",
    "повторить |V| - 1 раз:",
    "  для каждого ребра u → v с весом w:",
    "    если distance[u] + w < distance[v]: обновить distance[v]",
    "ещё один проход по рёбрам:",
    "  если улучшение всё ещё возможно — найден отрицательный цикл",
  ],
  permutations: [
    "backtrack(path):",
    "  если длина path = длине массива: сохранить перестановку",
    "  перебрать каждое число, которое ещё не использовано",
    "  добавить число в path, уйти глубже, затем откатиться",
  ],
  subsets: [
    "backtrack(index, subset):",
    "  если index = n: сохранить текущее subset",
    "  иначе сначала включить nums[index], потом исключить его",
  ],
  backtrackingMaze: [
    "backtrack(cell):",
    "  если cell — финиш: вернуть true",
    "  отметить cell в текущем пути",
    "  попробовать каждого соседа",
    "  если сосед не привёл к цели: снять cell из пути и откатиться",
  ],
  parentheses: [
    "backtrack(current, open, close):",
    "  если длина строки = 2n: сохранить комбинацию",
    "  если open < n: можно добавить '('",
    "  если close < open: можно добавить ')'",
  ],
  combinationSum: [
    "backtrack(index, current, remain):",
    "  если remain = 0: сохранить комбинацию",
    "  если remain < 0 или index вне массива: откат",
    "  можно взять candidates[index] ещё раз",
    "  или перейти к следующему числу",
  ],
};

const GRID_LEGEND = [
  { label: "Смотрим сейчас", color: "#265df2" },
  { label: "Ждёт дальше", color: "#d78d0f" },
  { label: "Уже были", color: "#8eb4ff" },
  { label: "Готовый путь", color: "#0f9d77" },
];

const GRAPH_LEGEND = [
  { label: "Смотрим сейчас", color: "#265df2" },
  { label: "Уже посмотрели", color: "#8eb4ff" },
  { label: "Готовый путь", color: "#0f9d77" },
];

const TREE_LEGEND = [
  { label: "Смотрим сейчас", color: "#265df2" },
  { label: "Уже посмотрели", color: "#0f9d77" },
  { label: "Важно", color: "#d78d0f" },
];

function panel(label, value) {
  return { label, value };
}

function formatCoordPath(keys) {
  return keys
    .map((key) => {
      const { row, col } = fromCoordKey(key);
      return formatCoord(row, col);
    })
    .join(" → ");
}

function formatQueueCoords(queue) {
  return queue.length
    ? queue.map((item) => formatCoord(item.row, item.col)).join(" → ")
    : "очередь пуста";
}

function formatQueuePlain(queue) {
  return queue.length ? queue.join(" → ") : "очередь пуста";
}

function buildBaseStates(grid, wallPredicate = (value) => value === 1) {
  const states = {};
  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (wallPredicate(grid[row][col], row, col)) {
        states[coordKey(row, col)] = "wall";
      }
    }
  }
  return states;
}

function enrichGridStates(states, { keys = [], state }) {
  for (const key of keys) {
    states[key] = state;
  }
}

function buildMazeSnapshot({
  grid,
  start,
  end,
  current,
  frontier = [],
  visited = [],
  path = [],
  panels = [],
  labels = {},
  wallPredicate,
  title,
}) {
  const states = buildBaseStates(grid, wallPredicate ?? ((value) => value === 1));
  enrichGridStates(states, { keys: visited, state: "visited" });
  enrichGridStates(states, { keys: frontier, state: "frontier" });
  enrichGridStates(states, { keys: path, state: "path" });
  if (start) {
    states[coordKey(start.row, start.col)] = "start";
  }
  if (end) {
    states[coordKey(end.row, end.col)] = "end";
  }
  if (current) {
    states[coordKey(current.row, current.col)] = "current";
  }

  return makeMatrixSnapshot({
    grid,
    states,
    labels,
    panels,
    legend: GRID_LEGEND,
    title,
    formatValue: (value) => String(value),
  });
}

function buildChessSnapshot({
  current,
  start,
  end,
  frontier,
  visited,
  path,
  panels,
}) {
  const board = Array.from({ length: 8 }, (_, row) =>
    Array.from({ length: 8 }, (_, col) => (row + col) % 2)
  );
  const states = {};
  const labels = {};

  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      labels[coordKey(row, col)] = `${row},${col}`;
    }
  }

  enrichGridStates(states, { keys: visited, state: "visited" });
  enrichGridStates(states, { keys: frontier, state: "frontier" });
  enrichGridStates(states, { keys: path, state: "path" });
  states[coordKey(start.row, start.col)] = "start";
  states[coordKey(end.row, end.col)] = "end";
  if (current) {
    states[coordKey(current.row, current.col)] = "current";
  }

  return makeMatrixSnapshot({
    grid: board,
    states,
    labels,
    panels,
    legend: GRID_LEGEND,
    title: "Шахматная доска",
    formatValue: (_, row, col) => `${String.fromCharCode(65 + col)}${8 - row}`,
  });
}

function buildTraceGroups(groups) {
  return groups.map((group) => ({
    label: group.label,
    items: group.items.map((item) => ({
      label: item.label,
      value: item.value,
      state: item.state ?? "",
    })),
  }));
}

function normalizeWords(words) {
  return words.map((word) => String(word).trim()).filter(Boolean);
}

function buildGraphSnapshotFromState({
  nodeIds,
  edges,
  distances,
  parents,
  current,
  processed = new Set(),
  pathNodes = [],
  activeEdge = null,
  failureNodes = [],
  extraPanels = [],
}) {
  const layout = buildGraphLayout(nodeIds);
  const pathNodeSet = new Set(pathNodes);
  const failureNodeSet = new Set(failureNodes);
  const nodes = [...nodeIds].sort().map((nodeId) => {
    const position = layout.get(nodeId);
    let state = "";
    if (processed.has(nodeId)) {
      state = "visited";
    }
    if (pathNodeSet.has(nodeId)) {
      state = "path";
    }
    if (failureNodeSet.has(nodeId)) {
      state = "failure";
    }
    if (nodeId === current) {
      state = "current";
    }

    return {
      id: nodeId,
      label: nodeId,
      state,
      x: position.x,
      y: position.y,
      meta: formatMaybeInfinity(distances[nodeId] ?? INF),
    };
  });

  const renderedEdges = edges.map((edge) => ({
    ...edge,
    state:
      activeEdge &&
      activeEdge.from === edge.from &&
      activeEdge.to === edge.to &&
      activeEdge.weight === edge.weight
        ? "active"
        : pathNodeSet.has(edge.from) && pathNodeSet.has(edge.to)
          ? "path"
          : "",
  }));

  const distSummary = [...nodeIds]
    .sort()
    .map((nodeId) => `${nodeId}:${formatMaybeInfinity(distances[nodeId] ?? INF)}`)
    .join(" | ");

  return makeGraphSnapshot({
    nodes,
    edges: renderedEdges,
    panels: [
      panel("Текущая вершина", current ?? "—"),
      panel(
        "Уже обработано",
        [...processed].sort().join(" → ") || "пока пусто"
      ),
      panel("Таблица расстояний", distSummary),
      ...extraPanels,
    ],
    legend: GRAPH_LEGEND,
  });
}

function buildTreeSnapshotFromDecorators(root, decorators, panels = []) {
  return makeTreeSnapshot({
    tree: serializeTree(root, decorators),
    panels,
    legend: TREE_LEGEND,
  });
}

function allGridKeys(queue) {
  return queue.map(({ row, col }) => coordKey(row, col));
}

export function runBfsMazeShortest({ grid, start, end }) {
  if (!isInside(grid, start.row, start.col) || !isInside(grid, end.row, end.col)) {
    throw new Error("Старт и финиш должны лежать внутри матрицы.");
  }
  if (grid[start.row][start.col] === 1 || grid[end.row][end.col] === 1) {
    throw new Error("Старт и финиш не могут находиться в стене.");
  }

  const queue = [{ row: start.row, col: start.col }];
  const visited = new Set([coordKey(start.row, start.col)]);
  const parent = {};
  const distance = { [coordKey(start.row, start.col)]: 0 };
  const steps = [
    createStep({
      action: `Стартуем из клетки ${formatCoord(start.row, start.col)}`,
      why: "В BFS мы начинаем с исходной вершины и строим слои расстояний от неё.",
      pseudoLine: 1,
      resultPreview: `В очередь помещена только стартовая клетка ${formatCoord(
        start.row,
        start.col
      )}.`,
      stateSnapshot: buildMazeSnapshot({
        grid,
        start,
        end,
        frontier: [coordKey(start.row, start.col)],
        visited: [coordKey(start.row, start.col)],
        panels: [
          panel("Очередь", formatQueueCoords(queue)),
          panel("Цель", formatCoord(end.row, end.col)),
        ],
        title: "Стартовый слой BFS",
      }),
    }),
  ];

  let foundKey = null;

  while (queue.length) {
    const current = queue.shift();
    const currentKey = coordKey(current.row, current.col);

    steps.push(
      createStep({
        action: `Извлекаем ${formatCoord(current.row, current.col)} из очереди`,
        why: "Очередь гарантирует обход по слоям: всё, что достаём сейчас, имеет минимальное расстояние среди ещё не обработанных клеток.",
        pseudoLine: 3,
        resultPreview: `До клетки ${formatCoord(
          current.row,
          current.col
        )} уже известно расстояние ${distance[currentKey]}.`,
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          end,
          current,
          frontier: allGridKeys(queue),
          visited: [...visited],
          panels: [
            panel("Расстояние до current", String(distance[currentKey])),
            panel("Очередь", formatQueueCoords(queue)),
          ],
          title: "Текущая клетка слоя",
        }),
      })
    );

    if (current.row === end.row && current.col === end.col) {
      foundKey = currentKey;
      const pathKeys = reconstructPath(parent, foundKey);
      steps.push(
        createStep({
          action: "Цель найдена",
          why: "В BFS первая встреча с финишем уже даёт кратчайший путь, потому что мы дошли до него на минимальном возможном слое.",
          pseudoLine: 4,
          resultPreview: `Кратчайший путь содержит ${
            pathKeys.length - 1
          } шаг(ов): ${formatCoordPath(pathKeys)}.`,
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            end,
            current,
            frontier: [],
            visited: [...visited],
            path: pathKeys,
            panels: [
              panel("Длина пути", String(pathKeys.length - 1)),
              panel("Маршрут", formatCoordPath(pathKeys)),
            ],
            title: "Итоговый маршрут",
          }),
        })
      );
      break;
    }

    for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
      if (!isInside(grid, nextRow, nextCol) || grid[nextRow][nextCol] === 1) {
        continue;
      }

      const nextKey = coordKey(nextRow, nextCol);
      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      parent[nextKey] = currentKey;
      distance[nextKey] = distance[currentKey] + 1;
      queue.push({ row: nextRow, col: nextCol });

      steps.push(
        createStep({
          action: `Добавляем соседа ${formatCoord(nextRow, nextCol)} в очередь`,
          why: "Эта клетка достижима за один дополнительный шаг от current, поэтому мы помещаем её в следующий слой BFS и запоминаем предка для восстановления маршрута.",
          pseudoLine: 7,
          resultPreview: `Теперь расстояние до ${formatCoord(
            nextRow,
            nextCol
          )} равно ${distance[nextKey]}.`,
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            end,
            current,
            frontier: allGridKeys(queue),
            visited: [...visited],
            labels: { [nextKey]: `d=${distance[nextKey]}` },
            panels: [
              panel("Очередь", formatQueueCoords(queue)),
              panel("Предок соседа", formatCoord(current.row, current.col)),
            ],
            title: "Расширение фронта BFS",
          }),
        })
      );
    }
  }

  if (!foundKey) {
    steps.push(
      createStep({
        action: "Путь не найден",
        why: "Очередь опустела, значит все достижимые клетки уже просмотрены, а финиш среди них не встретился.",
        pseudoLine: 2,
        resultPreview: "Ответ: -1, пройти до финиша невозможно.",
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          end,
          frontier: [],
          visited: [...visited],
          panels: [
            panel("Просмотрено клеток", String(visited.size)),
            panel("Ответ", "-1"),
          ],
          title: "Недостижимый финиш",
        }),
      })
    );
  }

  return {
    steps: finalizeSteps(steps),
    answer: foundKey
      ? String(reconstructPath(parent, foundKey).length - 1)
      : "-1",
    conclusion: foundKey
      ? "BFS дал кратчайший путь, потому что клетки обрабатывались по слоям расстояния от старта."
      : "BFS доказал недостижимость: все возможные клетки просмотрены, а финиш так и не встретился.",
  };
}

export function runKnightMoves({ start, end }) {
  const queue = [{ row: start.row, col: start.col }];
  const visited = new Set([coordKey(start.row, start.col)]);
  const parent = {};
  const distance = { [coordKey(start.row, start.col)]: 0 };
  const steps = [
    createStep({
      action: `Конь стартует из клетки ${formatCoord(start.row, start.col)}`,
      why: "Поиск в ширину по клеткам доски хорошо подходит, потому что каждый ход коня имеет одинаковую стоимость: один ход.",
      pseudoLine: 1,
      resultPreview: "Начинаем слой 0 с одной позиции коня.",
      stateSnapshot: buildChessSnapshot({
        start,
        end,
        frontier: [coordKey(start.row, start.col)],
        visited: [coordKey(start.row, start.col)],
        panels: [
          panel("Очередь", formatQueueCoords(queue)),
          panel("Цель", formatCoord(end.row, end.col)),
        ],
      }),
    }),
  ];

  let foundKey = null;

  while (queue.length) {
    const current = queue.shift();
    const currentKey = coordKey(current.row, current.col);

    steps.push(
      createStep({
        action: `Обрабатываем клетку ${formatCoord(current.row, current.col)}`,
        why: "Сейчас рассматриваем все клетки, до которых конь доходит за уже известное минимальное число ходов.",
        pseudoLine: 3,
        resultPreview: `До текущей клетки нужно ${distance[currentKey]} ход(ов).`,
        stateSnapshot: buildChessSnapshot({
          current,
          start,
          end,
          frontier: allGridKeys(queue),
          visited: [...visited],
          panels: [
            panel("Сделано ходов", String(distance[currentKey])),
            panel("Очередь", formatQueueCoords(queue)),
          ],
        }),
      })
    );

    if (current.row === end.row && current.col === end.col) {
      foundKey = currentKey;
      break;
    }

    for (const [dx, dy] of knightOffsets()) {
      const nextRow = current.row + dx;
      const nextCol = current.col + dy;
      if (!isInside(Array.from({ length: 8 }, () => Array(8).fill(0)), nextRow, nextCol)) {
        continue;
      }

      const nextKey = coordKey(nextRow, nextCol);
      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      parent[nextKey] = currentKey;
      distance[nextKey] = distance[currentKey] + 1;
      queue.push({ row: nextRow, col: nextCol });

      steps.push(
        createStep({
          action: `Конь может перейти в ${formatCoord(nextRow, nextCol)}`,
          why: "Эта клетка достижима ровно на один ход позже, чем current, поэтому она попадает в следующий слой BFS.",
          pseudoLine: 6,
          resultPreview: `Новая стоимость: ${distance[nextKey]} ход(ов).`,
          stateSnapshot: buildChessSnapshot({
            current,
            start,
            end,
            frontier: allGridKeys(queue),
            visited: [...visited],
            panels: [
              panel("Последний ход", `${formatCoord(current.row, current.col)} → ${formatCoord(nextRow, nextCol)}`),
              panel("Очередь", formatQueueCoords(queue)),
            ],
          }),
        })
      );
    }
  }

  const path = foundKey ? reconstructPath(parent, foundKey) : [];

  steps.push(
    createStep({
      action: foundKey ? "Минимальный маршрут коня найден" : "Маршрут не найден",
      why: foundKey
        ? "Как и в любой задаче с равными по цене ходами, BFS первым находит именно минимальное количество переходов."
        : "Для стандартной доски конь достижим почти везде, но алгоритм всё равно честно проверяет все уровни.",
      pseudoLine: foundKey ? 4 : 2,
      resultPreview: foundKey
        ? `Нужно ${path.length - 1} ход(ов): ${formatCoordPath(path)}.`
        : "Подходящих ходов не нашлось.",
      stateSnapshot: buildChessSnapshot({
        current: foundKey ? end : null,
        start,
        end,
        frontier: [],
        visited: [...visited],
        path,
        panels: [
          panel("Минимум ходов", foundKey ? String(path.length - 1) : "—"),
          panel("Маршрут", foundKey ? formatCoordPath(path) : "—"),
        ],
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: foundKey ? String(path.length - 1) : "-1",
    conclusion:
      "BFS по клеткам доски удобно превращает задачу коня в обычный поиск кратчайшего пути по неявному графу состояний.",
  };
}

export function runRottingOranges({ grid }) {
  const queue = [];
  let fresh = 0;

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      if (grid[row][col] === 2) {
        queue.push({ row, col, minute: 0 });
      } else if (grid[row][col] === 1) {
        fresh += 1;
      }
    }
  }

  const steps = [
    createStep({
      action: "Собираем все стартовые источники заражения",
      why: "Многовершинный BFS сразу запускается от всех уже гнилых апельсинов, потому что заражение идёт параллельно из каждого из них.",
      pseudoLine: 1,
      resultPreview: `Изначально свежих апельсинов: ${fresh}, источников заражения: ${queue.length}.`,
      stateSnapshot: makeMatrixSnapshot({
        grid,
        states: (() => {
          const states = {};
          for (let row = 0; row < grid.length; row += 1) {
            for (let col = 0; col < grid[row].length; col += 1) {
              const key = coordKey(row, col);
              if (grid[row][col] === 2) {
                states[key] = "source";
              } else if (grid[row][col] === 0) {
                states[key] = "wall";
              }
            }
          }
          return states;
        })(),
        panels: [
          panel(
            "Источники",
            queue.map(({ row, col }) => formatCoord(row, col)).join(" → ") || "нет"
          ),
          panel("Свежих", String(fresh)),
        ],
        legend: GRID_LEGEND,
        title: "Старт многовершинного BFS",
        formatValue: (value) =>
          value === 0 ? "·" : value === 1 ? "F" : "R",
      }),
    }),
  ];

  let maxMinute = 0;
  const infected = new Set(queue.map(({ row, col }) => coordKey(row, col)));

  while (queue.length) {
    const current = queue.shift();
    maxMinute = Math.max(maxMinute, current.minute);

    steps.push(
      createStep({
        action: `Источник ${formatCoord(current.row, current.col)} заражает соседей`,
        why: "Мы извлекаем из очереди один временной слой и переносим волну заражения на минуту дальше.",
        pseudoLine: 3,
        resultPreview: `Сейчас рассматривается момент времени ${current.minute}.`,
        stateSnapshot: makeMatrixSnapshot({
          grid,
          states: (() => {
            const states = {};
            for (let row = 0; row < grid.length; row += 1) {
              for (let col = 0; col < grid[row].length; col += 1) {
                const key = coordKey(row, col);
                if (grid[row][col] === 0) {
                  states[key] = "wall";
                } else if (infected.has(key)) {
                  states[key] = "visited";
                }
              }
            }
            states[coordKey(current.row, current.col)] = "current";
            return states;
          })(),
          panels: [
            panel("Минута", String(current.minute)),
            panel("Осталось свежих", String(fresh)),
          ],
          legend: GRID_LEGEND,
          formatValue: (value) =>
            value === 0 ? "·" : value === 1 ? "F" : "R",
        }),
      })
    );

    for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
      if (!isInside(grid, nextRow, nextCol) || grid[nextRow][nextCol] !== 1) {
        continue;
      }

      grid[nextRow][nextCol] = 2;
      fresh -= 1;
      infected.add(coordKey(nextRow, nextCol));
      queue.push({ row: nextRow, col: nextCol, minute: current.minute + 1 });

      steps.push(
        createStep({
          action: `Свежий апельсин в ${formatCoord(nextRow, nextCol)} стал гнилым`,
          why: "Сосед был свежим и находился на расстоянии одной минуты от уже гнилого апельсина, значит он заражается в следующем слое BFS.",
          pseudoLine: 4,
          resultPreview: `После заражения осталось свежих: ${fresh}.`,
          stateSnapshot: makeMatrixSnapshot({
            grid,
            states: (() => {
              const states = {};
              for (let row = 0; row < grid.length; row += 1) {
                for (let col = 0; col < grid[row].length; col += 1) {
                  const key = coordKey(row, col);
                  if (grid[row][col] === 0) {
                    states[key] = "wall";
                  } else if (infected.has(key)) {
                    states[key] = "visited";
                  }
                }
              }
              states[coordKey(nextRow, nextCol)] = "current";
              return states;
            })(),
            panels: [
              panel("Следующая минута", String(current.minute + 1)),
              panel("Очередь", queue.map((item) => `${formatCoord(item.row, item.col)}@${item.minute}`).join(" → ") || "пуста"),
            ],
            legend: GRID_LEGEND,
            formatValue: (value) =>
              value === 0 ? "·" : value === 1 ? "F" : "R",
          }),
        })
      );
    }
  }

  const impossible = fresh > 0;
  steps.push(
    createStep({
      action: impossible ? "Не все апельсины удалось заразить" : "Заражение завершено",
      why: impossible
        ? "После полного обхода остались изолированные свежие клетки, до которых инфекция не добралась."
        : "Максимальная глубина многовершинного BFS и есть минимальное время, когда вся доступная свежая область заражена.",
      pseudoLine: 6,
      resultPreview: impossible
        ? "Ответ: -1."
        : `Ответ: ${maxMinute} минут(ы).`,
      stateSnapshot: makeMatrixSnapshot({
        grid,
        states: (() => {
          const states = {};
          for (let row = 0; row < grid.length; row += 1) {
            for (let col = 0; col < grid[row].length; col += 1) {
              const key = coordKey(row, col);
              if (grid[row][col] === 0) {
                states[key] = "wall";
              } else if (grid[row][col] === 2) {
                states[key] = "visited";
              } else if (grid[row][col] === 1) {
                states[key] = "failure";
              }
            }
          }
          return states;
        })(),
        panels: [
          panel("Ответ", impossible ? "-1" : String(maxMinute)),
          panel("Свежих осталось", String(fresh)),
        ],
        legend: GRID_LEGEND,
        formatValue: (value) =>
          value === 0 ? "·" : value === 1 ? "F" : "R",
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: impossible ? "-1" : String(maxMinute),
    conclusion:
      "Здесь BFS идёт не от одной клетки, а сразу от всех гнилых апельсинов, поэтому каждый слой очереди соответствует ровно одной минуте.",
  };
}

export function runWordLadder({ start, target, words }) {
  const dictionary = new Set(normalizeWords(words));
  if (start.length !== target.length) {
    throw new Error("Стартовое и конечное слово должны иметь одинаковую длину.");
  }
  if (!dictionary.has(target)) {
    throw new Error("Конечное слово должно присутствовать в списке разрешённых слов.");
  }

  const queue = [start];
  const visited = new Set([start]);
  const parent = {};
  const distance = { [start]: 0 };
  const wordList = [...dictionary];
  const steps = [
    createStep({
      action: `Начинаем цепочку с слова ${start}`,
      why: "BFS перебирает все слова по числу замен, поэтому первая найденная цепочка обязательно будет минимальной по длине.",
      pseudoLine: 1,
      resultPreview: `Цель: ${target}. Разрешённых слов: ${wordList.length}.`,
      stateSnapshot: makeTraceSnapshot({
        groups: buildTraceGroups([
          {
            label: "Очередь",
            items: [{ label: "0", value: start, state: "frontier" }],
          },
          {
            label: "Словарь",
            items: wordList.map((word) => ({
              label: word,
              value: word,
              state: word === target ? "path" : "",
            })),
          },
        ]),
        panels: [
          panel("Старт", start),
          panel("Цель", target),
        ],
      }),
    }),
  ];

  function differsByOne(a, b) {
    let diff = 0;
    for (let index = 0; index < a.length; index += 1) {
      if (a[index] !== b[index]) {
        diff += 1;
      }
      if (diff > 1) {
        return false;
      }
    }
    return diff === 1;
  }

  let found = null;

  while (queue.length) {
    const current = queue.shift();

    steps.push(
      createStep({
        action: `Берём из очереди слово ${current}`,
        why: "Сейчас рассматриваются все слова, достижимые за уже известное минимальное число замен.",
        pseudoLine: 3,
        resultPreview: `До слова ${current} нужно ${distance[current]} преобразований.`,
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "Текущее слово",
              items: [{ label: "current", value: current, state: "current" }],
            },
            {
              label: "Очередь",
              items: queue.map((word, index) => ({
                label: String(index + 1),
                value: word,
                state: "frontier",
              })),
            },
          ]),
          panels: [
            panel("Дистанция", String(distance[current])),
            panel("Посещено слов", String(visited.size)),
          ],
        }),
      })
    );

    if (current === target) {
      found = current;
      break;
    }

    for (const candidate of wordList) {
      if (visited.has(candidate) || !differsByOne(current, candidate)) {
        continue;
      }

      visited.add(candidate);
      parent[candidate] = current;
      distance[candidate] = distance[current] + 1;
      queue.push(candidate);

      steps.push(
        createStep({
          action: `Слово ${candidate} становится следующим состоянием`,
          why: "Оно отличается от current ровно в одном символе, значит является допустимым соседним состоянием графа слов.",
          pseudoLine: 6,
          resultPreview: `Новый путь длины ${distance[candidate]} ведёт к слову ${candidate}.`,
          stateSnapshot: makeTraceSnapshot({
            groups: buildTraceGroups([
              {
                label: "Новый фронт",
                items: queue.map((word, index) => ({
                  label: String(index + 1),
                  value: word,
                  state: word === candidate ? "current" : "frontier",
                })),
              },
              {
                label: "Уже посещено",
                items: [...visited].map((word) => ({
                  label: word,
                  value: word,
                  state: word === candidate ? "path" : "visited",
                })),
              },
            ]),
            panels: [
              panel("Предок", current),
              panel("Расстояние", String(distance[candidate])),
            ],
          }),
        })
      );
    }
  }

  const path = found ? reconstructPath(parent, found) : [];
  steps.push(
    createStep({
      action: found ? "Минимальная цепочка преобразования найдена" : "Преобразование невозможно",
      why: found
        ? "Как только цель извлечена из очереди, мы уверены, что короче цепочки уже не существует."
        : "Если BFS закончился без target, значит ни одна допустимая последовательность замен не соединяет start и target.",
      pseudoLine: found ? 4 : 2,
      resultPreview: found
        ? `Ответ: ${path.length - 1} шаг(ов), цепочка ${formatPath(path)}.`
        : "Ответ: -1.",
      stateSnapshot: makeTraceSnapshot({
        groups: buildTraceGroups([
          {
            label: found ? "Итоговая цепочка" : "Последнее состояние",
            items: (found ? path : [start]).map((word) => ({
              label: word,
              value: word,
              state: found ? "path" : "failure",
            })),
          },
        ]),
        panels: [
          panel("Ответ", found ? String(path.length - 1) : "-1"),
          panel("Цепочка", found ? formatPath(path) : "не найдена"),
        ],
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: found ? String(path.length - 1) : "-1",
    conclusion:
      "Преобразование строки удобно рассматривать как граф слов, где ребро есть между словами, отличающимися ровно в одном символе.",
  };
}

export function runNearestExit({ grid, start }) {
  if (grid[start.row][start.col] === 1) {
    throw new Error("Старт не может находиться в стене.");
  }

  const queue = [{ row: start.row, col: start.col }];
  const visited = new Set([coordKey(start.row, start.col)]);
  const distance = { [coordKey(start.row, start.col)]: 0 };
  const parent = {};
  const steps = [
    createStep({
      action: `Стартуем из ${formatCoord(start.row, start.col)}`,
      why: "Мы ищем не конкретный финиш, а ближайший выход на границе, поэтому BFS идеально подходит для проверки расстояний слой за слоем.",
      pseudoLine: 1,
      resultPreview: "Старт помещён в очередь как слой расстояния 0.",
      stateSnapshot: buildMazeSnapshot({
        grid,
        start,
        frontier: [coordKey(start.row, start.col)],
        visited: [coordKey(start.row, start.col)],
        panels: [
          panel("Очередь", formatQueueCoords(queue)),
          panel("Правило выхода", "любая граничная клетка, кроме старта"),
        ],
        title: "Поиск ближайшего выхода",
      }),
    }),
  ];

  let exitKey = null;

  while (queue.length) {
    const current = queue.shift();
    const currentKey = coordKey(current.row, current.col);

    steps.push(
      createStep({
        action: `Проверяем клетку ${formatCoord(current.row, current.col)}`,
        why: "Сначала смотрим клетки текущего слоя. Если одна из них — выход, то это гарантированно самый близкий выход.",
        pseudoLine: 3,
        resultPreview: `Расстояние до неё равно ${distance[currentKey]}.`,
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          current,
          frontier: allGridKeys(queue),
          visited: [...visited],
          panels: [
            panel("Очередь", formatQueueCoords(queue)),
            panel("Текущий слой", String(distance[currentKey])),
          ],
          title: "Проверка текущей клетки",
        }),
      })
    );

    const isBoundary =
      current.row === 0 ||
      current.col === 0 ||
      current.row === grid.length - 1 ||
      current.col === grid[0].length - 1;

    if (isBoundary && currentKey !== coordKey(start.row, start.col)) {
      exitKey = currentKey;
      break;
    }

    for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
      if (!isInside(grid, nextRow, nextCol) || grid[nextRow][nextCol] === 1) {
        continue;
      }

      const nextKey = coordKey(nextRow, nextCol);
      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      parent[nextKey] = currentKey;
      distance[nextKey] = distance[currentKey] + 1;
      queue.push({ row: nextRow, col: nextCol });

      steps.push(
        createStep({
          action: `Добавляем ${formatCoord(nextRow, nextCol)} как следующий слой`,
          why: "Эта проходная клетка ещё не посещалась, значит через неё потенциально можно дойти до более дальнего выхода.",
          pseudoLine: 5,
          resultPreview: `Её расстояние от старта теперь ${distance[nextKey]}.`,
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            current,
            frontier: allGridKeys(queue),
            visited: [...visited],
            panels: [
              panel("Очередь", formatQueueCoords(queue)),
              panel("Новый слой", String(distance[nextKey])),
            ],
            title: "Расширение поиска к границе",
          }),
        })
      );
    }
  }

  const path = exitKey ? reconstructPath(parent, exitKey) : [];
  steps.push(
    createStep({
      action: exitKey ? "Ближайший выход найден" : "Выхода нет",
      why: exitKey
        ? "Поскольку выход извлечён из очереди первым среди граничных клеток, он и есть ближайший."
        : "Алгоритм проверил все достижимые проходы, но ни один не оказался корректным выходом.",
      pseudoLine: exitKey ? 4 : 2,
      resultPreview: exitKey
        ? `Ответ: ${path.length - 1} шаг(ов), маршрут ${formatCoordPath(path)}.`
        : "Ответ: -1.",
      stateSnapshot: buildMazeSnapshot({
        grid,
        start,
        current: exitKey ? fromCoordKey(exitKey) : null,
        visited: [...visited],
        path,
        panels: [
          panel("Ответ", exitKey ? String(path.length - 1) : "-1"),
          panel("Маршрут", exitKey ? formatCoordPath(path) : "не найден"),
        ],
        title: "Итог поиска выхода",
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: exitKey ? String(path.length - 1) : "-1",
    conclusion:
      "В задаче о ближайшем выходе BFS важен тем, что любая граничная клетка, найденная первой, уже имеет минимальное число шагов.",
  };
}

export function runWordSearch({ grid, word }) {
  const letters = grid.map((row) => row.map((cell) => String(cell).toUpperCase()));
  const target = String(word).trim().toUpperCase();
  const visited = new Set();
  const steps = [];
  let foundPath = null;

  function makeSnapshot(currentPath = [], currentKey = null, failureKey = null) {
    const states = {};
    const labels = {};
    enrichGridStates(states, { keys: [...visited], state: "visited" });
    enrichGridStates(states, { keys: currentPath, state: "path" });
    if (failureKey) {
      states[failureKey] = "failure";
    }
    if (currentKey) {
      states[currentKey] = "current";
    }
    currentPath.forEach((key, index) => {
      labels[key] = `${index + 1}`;
    });
    return makeMatrixSnapshot({
      grid: letters,
      states,
      labels,
      panels: [
        panel("Ищем слово", target),
        panel(
          "Текущий префикс",
          currentPath
            .map((key) => {
              const { row, col } = fromCoordKey(key);
              return letters[row][col];
            })
            .join("") || "—"
        ),
      ],
      legend: GRID_LEGEND,
      formatValue: (value) => value,
      title: "Поиск слова в сетке",
    });
  }

  function dfs(row, col, index, currentPath) {
    if (!isInside(letters, row, col)) {
      return false;
    }

    const key = coordKey(row, col);
    if (visited.has(key)) {
      return false;
    }

    steps.push(
      createStep({
        action: `Пробуем клетку ${formatCoord(row, col)} для буквы ${target[index]}`,
        why: "Чтобы собрать слово без повторного использования клеток, мы идём по сетке рекурсивно и каждый раз проверяем совпадение нужной буквы.",
        pseudoLine: 1,
        resultPreview: `Сравниваем ${letters[row][col]} с ${target[index]}.`,
        stateSnapshot: makeSnapshot(currentPath, key),
      })
    );

    if (letters[row][col] !== target[index]) {
      steps.push(
        createStep({
          action: `Клетка ${formatCoord(row, col)} не подходит`,
          why: "Буква не совпала, значит эта ветка не может дать нужное слово и её нужно сразу отбросить.",
          pseudoLine: 2,
          resultPreview: `Несовпадение: ${letters[row][col]} ≠ ${target[index]}.`,
          stateSnapshot: makeSnapshot(currentPath, null, key),
        })
      );
      return false;
    }

    const nextPath = [...currentPath, key];
    if (index === target.length - 1) {
      foundPath = nextPath;
      steps.push(
        createStep({
          action: "Слово собрано полностью",
          why: "Мы дошли до последней буквы и каждая клетка на пути совпала с нужным символом, значит слово существует в сетке.",
          pseudoLine: 3,
          resultPreview: `Путь: ${formatCoordPath(nextPath)}.`,
          stateSnapshot: makeSnapshot(nextPath, key),
        })
      );
      return true;
    }

    visited.add(key);
    steps.push(
      createStep({
        action: `Фиксируем клетку ${formatCoord(row, col)} в текущем пути`,
        why: "Эту клетку нельзя использовать повторно в рамках одной ветки, поэтому временно отмечаем её как занятую.",
        pseudoLine: 4,
        resultPreview: `Собранный префикс: ${nextPath
          .map((pathKey) => {
            const { row: pathRow, col: pathCol } = fromCoordKey(pathKey);
            return letters[pathRow][pathCol];
          })
          .join("")}.`,
        stateSnapshot: makeSnapshot(nextPath, key),
      })
    );

    for (const [nextRow, nextCol] of neighbors4(row, col)) {
      if (dfs(nextRow, nextCol, index + 1, nextPath)) {
        return true;
      }
    }

    visited.delete(key);
    steps.push(
      createStep({
        action: `Откатываемся из клетки ${formatCoord(row, col)}`,
        why: "Ни один сосед не продолжил слово до конца, поэтому возвращаем клетку в свободное состояние и пробуем другую ветку.",
        pseudoLine: 6,
        resultPreview: "Эта ветка не привела к полному слову.",
        stateSnapshot: makeSnapshot(currentPath, null, key),
      })
    );

    return false;
  }

  let exists = false;
  for (let row = 0; row < letters.length && !exists; row += 1) {
    for (let col = 0; col < letters[row].length && !exists; col += 1) {
      exists = dfs(row, col, 0, []);
    }
  }

  steps.push(
    createStep({
      action: exists ? "Поиск завершён успешно" : "Слово не найдено",
      why: exists
        ? "Одна из веток DFS смогла пройти по всем буквам слова без повторения клеток."
        : "Ни одна ветка рекурсии не собрала слово целиком, значит такого пути в сетке нет.",
      pseudoLine: exists ? 3 : 6,
      resultPreview: exists
        ? `Ответ: true. Путь ${formatCoordPath(foundPath)}.`
        : "Ответ: false.",
      stateSnapshot: makeSnapshot(foundPath ?? []),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: exists ? "true" : "false",
    conclusion:
      "Хотя задача находилась рядом с BFS, запрет на повторное использование клеток делает DFS/backtracking естественным и наглядным выбором.",
  };
}

export function runCountIslands({ grid }) {
  const visited = new Set();
  const steps = [];
  let count = 0;

  const statesBase = buildBaseStates(grid, (value) => value === 0);

  function snapshot(current = null, frontier = [], islandKeys = []) {
    const states = { ...statesBase };
    enrichGridStates(states, { keys: [...visited], state: "visited" });
    enrichGridStates(states, { keys: islandKeys, state: "path" });
    enrichGridStates(states, { keys: frontier, state: "frontier" });
    if (current) {
      states[current] = "current";
    }

    return makeMatrixSnapshot({
      grid,
      states,
      panels: [
        panel("Найдено островов", String(count)),
        panel("Посещено клеток", String(visited.size)),
      ],
      legend: GRID_LEGEND,
      title: "Компоненты связности",
      formatValue: (value) => String(value),
    });
  }

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      const key = coordKey(row, col);
      if (grid[row][col] !== 1 || visited.has(key)) {
        continue;
      }

      count += 1;
      const queue = [{ row, col }];
      const islandKeys = [key];
      visited.add(key);

      steps.push(
        createStep({
          action: `Нашли новый остров, начинающийся в ${formatCoord(row, col)}`,
          why: "Если клетка с землёй ещё не посещена, значит перед нами новая компонента связности, и счётчик островов нужно увеличить.",
          pseudoLine: 3,
          resultPreview: `Остров номер ${count} начинается здесь.`,
          stateSnapshot: snapshot(key, [key], islandKeys),
        })
      );

      while (queue.length) {
        const current = queue.shift();
        const currentKey = coordKey(current.row, current.col);

        steps.push(
          createStep({
            action: `Расширяем текущий остров из ${formatCoord(current.row, current.col)}`,
            why: "BFS обходит все клетки одной компоненты, чтобы больше не считать их как отдельные острова.",
            pseudoLine: 5,
            resultPreview: `Сейчас подтверждаем принадлежность клетки острову ${count}.`,
            stateSnapshot: snapshot(
              currentKey,
              allGridKeys(queue),
              islandKeys
            ),
          })
        );

        for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
          const nextKey = coordKey(nextRow, nextCol);
          if (
            !isInside(grid, nextRow, nextCol) ||
            grid[nextRow][nextCol] !== 1 ||
            visited.has(nextKey)
          ) {
            continue;
          }

          visited.add(nextKey);
          islandKeys.push(nextKey);
          queue.push({ row: nextRow, col: nextCol });

          steps.push(
            createStep({
              action: `Клетка ${formatCoord(nextRow, nextCol)} относится к тому же острову`,
              why: "Она соединена с уже найденной землёй по вертикали или горизонтали, значит входит в эту же компоненту.",
              pseudoLine: 5,
              resultPreview: `Остров ${count} расширился на ещё одну клетку.`,
              stateSnapshot: snapshot(
                nextKey,
                allGridKeys(queue),
                islandKeys
              ),
            })
          );
        }
      }
    }
  }

  steps.push(
    createStep({
      action: "Подсчитываем итоговое число компонент",
      why: "Каждый запуск BFS соответствовал одному новому острову, поэтому финальный счётчик и есть ответ задачи.",
      pseudoLine: 6,
      resultPreview: `Ответ: ${count}.`,
      stateSnapshot: snapshot(),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: String(count),
    conclusion:
      "Количество островов — это просто количество запусков обхода по ещё не посещённой земле.",
  };
}

export function runShortestBridge({ grid }) {
  const visited = new Set();
  const steps = [];
  const firstIsland = [];

  function markIsland(row, col) {
    if (!isInside(grid, row, col) || grid[row][col] !== 1) {
      return;
    }
    const key = coordKey(row, col);
    if (visited.has(key)) {
      return;
    }
    visited.add(key);
    firstIsland.push(key);
    markIsland(row - 1, col);
    markIsland(row + 1, col);
    markIsland(row, col - 1);
    markIsland(row, col + 1);
  }

  let seeded = false;
  for (let row = 0; row < grid.length && !seeded; row += 1) {
    for (let col = 0; col < grid[row].length && !seeded; col += 1) {
      if (grid[row][col] === 1) {
        markIsland(row, col);
        seeded = true;
      }
    }
  }

  const baseStates = buildBaseStates(grid, (value) => value === 0);
  const islandSet = new Set(firstIsland);

  steps.push(
    createStep({
      action: "Сначала помечаем первый остров",
      why: "Чтобы строить мост только от одного острова к другому, нужно чётко отделить стартовую компоненту.",
      pseudoLine: 1,
      resultPreview: `Первый остров содержит ${firstIsland.length} клеток.`,
      stateSnapshot: makeMatrixSnapshot({
        grid,
        states: (() => {
          const states = { ...baseStates };
          enrichGridStates(states, { keys: firstIsland, state: "path" });
          return states;
        })(),
        panels: [
          panel("Клеток в 1-м острове", String(firstIsland.length)),
          panel("Следующий шаг", "расширять воду вокруг него"),
        ],
        legend: GRID_LEGEND,
        title: "Маркировка первого острова",
        formatValue: (value) => String(value),
      }),
    })
  );

  const queue = firstIsland.map((key) => ({
    ...fromCoordKey(key),
    distance: 0,
  }));
  let answer = 0;

  while (queue.length) {
    const current = queue.shift();
    const currentKey = coordKey(current.row, current.col);

    steps.push(
      createStep({
        action: `Расширяем границу моста из ${formatCoord(current.row, current.col)}`,
        why: "Теперь BFS идёт по воде слоями, и номер слоя показывает, сколько нулей мы уже заменили на путь к другому острову.",
        pseudoLine: 4,
        resultPreview: `Текущая длина моста-кандидата: ${current.distance}.`,
        stateSnapshot: makeMatrixSnapshot({
          grid,
          states: (() => {
            const states = { ...baseStates };
            enrichGridStates(states, { keys: [...visited], state: "visited" });
            enrichGridStates(states, { keys: firstIsland, state: "path" });
            states[currentKey] = "current";
            return states;
          })(),
          panels: [
            panel("Слой BFS", String(current.distance)),
            panel("Очередь", queue.map((item) => `${formatCoord(item.row, item.col)}@${item.distance}`).join(" → ") || "пуста"),
          ],
          legend: GRID_LEGEND,
          title: "Расширение моста",
          formatValue: (value) => String(value),
        }),
      })
    );

    for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
      if (!isInside(grid, nextRow, nextCol)) {
        continue;
      }

      const nextKey = coordKey(nextRow, nextCol);
      if (visited.has(nextKey)) {
        continue;
      }

      if (grid[nextRow][nextCol] === 1 && !islandSet.has(nextKey)) {
        answer = current.distance;
        steps.push(
          createStep({
            action: `Достигли второго острова через ${formatCoord(nextRow, nextCol)}`,
            why: "Первое достижение второго острова в BFS означает минимальную длину моста, потому что вода расширялась слоями.",
            pseudoLine: 5,
            resultPreview: `Ответ: ${answer}.`,
            stateSnapshot: makeMatrixSnapshot({
              grid,
              states: (() => {
                const states = { ...baseStates };
                enrichGridStates(states, { keys: firstIsland, state: "path" });
                states[nextKey] = "target";
                states[currentKey] = "current";
                return states;
              })(),
              panels: [
                panel("Минимальный мост", String(answer)),
                panel("Точка касания", formatCoord(nextRow, nextCol)),
              ],
              legend: GRID_LEGEND,
              title: "Минимальный мост найден",
              formatValue: (value) => String(value),
            }),
          })
        );

        return {
          steps: finalizeSteps(steps),
          answer: String(answer),
          conclusion:
            "После маркировки первого острова BFS по воде даёт минимальное количество нулей, которые нужно превратить в единицы.",
        };
      }

      visited.add(nextKey);
      queue.push({
        row: nextRow,
        col: nextCol,
        distance: current.distance + 1,
      });

      steps.push(
        createStep({
          action: `Удлиняем мост через воду ${formatCoord(nextRow, nextCol)}`,
          why: "Эта водная клетка становится частью следующего слоя расширения, то есть мост становится на одну единицу длиннее.",
          pseudoLine: 6,
          resultPreview: `Теперь этот путь имеет длину ${current.distance + 1}.`,
          stateSnapshot: makeMatrixSnapshot({
            grid,
            states: (() => {
              const states = { ...baseStates };
              enrichGridStates(states, { keys: firstIsland, state: "path" });
              enrichGridStates(states, { keys: [...visited], state: "visited" });
              states[nextKey] = "current";
              return states;
            })(),
            panels: [
              panel("Новый слой", String(current.distance + 1)),
              panel("Очередь", queue.map((item) => `${formatCoord(item.row, item.col)}@${item.distance}`).join(" → ")),
            ],
            legend: GRID_LEGEND,
            title: "Пошаговое расширение по воде",
            formatValue: (value) => String(value),
          }),
        })
      );
    }
  }

  return {
    steps: finalizeSteps(steps),
    answer: "0",
    conclusion: "Острова уже соприкасаются.",
  };
}

export function runLock({ start, target, forbidden }) {
  const blocked = new Set(forbidden.map(String));
  if (blocked.has(start)) {
    throw new Error("Стартовая комбинация находится в списке запрещённых.");
  }

  const queue = [start];
  const visited = new Set([start]);
  const parent = {};
  const distance = { [start]: 0 };
  const steps = [
    createStep({
      action: `Стартуем с кода ${start}`,
      why: "Комбинации замка образуют граф состояний, а BFS позволяет найти минимальное число поворотов между ними.",
      pseudoLine: 1,
      resultPreview: `Цель: ${target}. Запрещённых кодов: ${blocked.size}.`,
      stateSnapshot: makeTraceSnapshot({
        groups: buildTraceGroups([
          {
            label: "Старт",
            items: [{ label: "0", value: start, state: "frontier" }],
          },
          {
            label: "Запрещено",
            items: [...blocked].map((code) => ({
              label: code,
              value: code,
              state: "failure",
            })),
          },
        ]),
        panels: [panel("Цель", target)],
      }),
    }),
  ];

  function rotate(code, index, delta) {
    const digits = code.split("").map(Number);
    digits[index] = (digits[index] + delta + 10) % 10;
    return digits.join("");
  }

  let found = null;

  while (queue.length) {
    const current = queue.shift();

    steps.push(
      createStep({
        action: `Проверяем комбинацию ${current}`,
        why: "Все коды, извлечённые из очереди сейчас, достигаются за одинаковое минимальное число поворотов.",
        pseudoLine: 3,
        resultPreview: `До ${current} требуется ${distance[current]} ход(ов).`,
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "Текущий код",
              items: [{ label: "current", value: current, state: "current" }],
            },
            {
              label: "Очередь",
              items: queue.map((code, index) => ({
                label: String(index + 1),
                value: code,
                state: "frontier",
              })),
            },
          ]),
          panels: [
            panel("Сделано ходов", String(distance[current])),
            panel("Посещено", String(visited.size)),
          ],
        }),
      })
    );

    if (current === target) {
      found = current;
      break;
    }

    for (let index = 0; index < 4; index += 1) {
      for (const delta of [-1, 1]) {
        const next = rotate(current, index, delta);
        if (blocked.has(next) || visited.has(next)) {
          continue;
        }

        visited.add(next);
        parent[next] = current;
        distance[next] = distance[current] + 1;
        queue.push(next);

        steps.push(
          createStep({
            action: `Поворот диска ${index + 1} создаёт код ${next}`,
            why: "Это соседнее состояние замка, которое отличается ровно одним разрешённым поворотом, поэтому его можно добавить в следующий слой BFS.",
            pseudoLine: 5,
            resultPreview: `До ${next} нужно ${distance[next]} поворотов.`,
            stateSnapshot: makeTraceSnapshot({
              groups: buildTraceGroups([
                {
                  label: "Новый фронт",
                  items: queue.map((code, idx) => ({
                    label: String(idx + 1),
                    value: code,
                    state: code === next ? "current" : "frontier",
                  })),
                },
              ]),
              panels: [
                panel("Предок", current),
                panel("Новый код", next),
              ],
            }),
          })
        );
      }
    }
  }

  const path = found ? reconstructPath(parent, found) : [];
  steps.push(
    createStep({
      action: found ? "Минимальная последовательность поворотов найдена" : "Замок открыть нельзя",
      why: found
        ? "Цель достигнута на минимальном слое BFS, значит меньшего числа поворотов быть не может."
        : "Все доступные комбинации проверены, но target так и не встретился.",
      pseudoLine: found ? 4 : 2,
      resultPreview: found
        ? `Ответ: ${path.length - 1} ход(ов), путь ${formatPath(path)}.`
        : "Ответ: -1.",
      stateSnapshot: makeTraceSnapshot({
        groups: buildTraceGroups([
          {
            label: found ? "Маршрут" : "Результат",
            items: (found ? path : [target]).map((code) => ({
              label: code,
              value: code,
              state: found ? "path" : "failure",
            })),
          },
        ]),
        panels: [
          panel("Ответ", found ? String(path.length - 1) : "-1"),
          panel("Комбинация", found ? formatPath(path) : "недостижима"),
        ],
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: found ? String(path.length - 1) : "-1",
    conclusion:
      "Комбинации замка образуют граф очень похожий на граф слов: каждое изменение одной цифры порождает соседнее состояние.",
  };
}

export function runEvacuation({ grid }) {
  const queue = [];
  const starts = [];
  const distance = {};

  for (let row = 0; row < grid.length; row += 1) {
    for (let col = 0; col < grid[row].length; col += 1) {
      const value = grid[row][col];
      const key = coordKey(row, col);
      if (value === "E") {
        queue.push({ row, col });
        distance[key] = 0;
      }
      if (value === "S") {
        starts.push({ row, col });
      }
    }
  }

  const visited = new Set(queue.map(({ row, col }) => coordKey(row, col)));
  const steps = [
    createStep({
      action: "Запускаем BFS сразу от всех выходов",
      why: "Так мы сразу получаем кратчайшее расстояние от ближайшего выхода до каждой клетки здания.",
      pseudoLine: 1,
      resultPreview: `Выходов: ${queue.length}, стартов людей: ${starts.length}.`,
      stateSnapshot: makeMatrixSnapshot({
        grid,
        states: (() => {
          const states = {};
          for (let row = 0; row < grid.length; row += 1) {
            for (let col = 0; col < grid[row].length; col += 1) {
              const key = coordKey(row, col);
              if (grid[row][col] === "1") {
                states[key] = "wall";
              } else if (grid[row][col] === "E") {
                states[key] = "source";
              } else if (grid[row][col] === "S") {
                states[key] = "start";
              }
            }
          }
          return states;
        })(),
        panels: [
          panel("Выходы", queue.map(({ row, col }) => formatCoord(row, col)).join(" → ")),
          panel("Люди", starts.map(({ row, col }) => formatCoord(row, col)).join(" → ")),
        ],
        legend: GRID_LEGEND,
        title: "План эвакуации",
        formatValue: (value) => value,
      }),
    }),
  ];

  while (queue.length) {
    const current = queue.shift();
    const currentKey = coordKey(current.row, current.col);

    steps.push(
      createStep({
        action: `Распространяем дистанции из ${formatCoord(current.row, current.col)}`,
        why: "Каждая клетка получает расстояние до ближайшего выхода, потому что многовершинный BFS идёт одновременно от всех E.",
        pseudoLine: 2,
        resultPreview: `Текущее расстояние: ${distance[currentKey]}.`,
        stateSnapshot: makeMatrixSnapshot({
          grid,
          states: (() => {
            const states = {};
            for (let row = 0; row < grid.length; row += 1) {
              for (let col = 0; col < grid[row].length; col += 1) {
                const key = coordKey(row, col);
                if (grid[row][col] === "1") {
                  states[key] = "wall";
                } else if (visited.has(key)) {
                  states[key] = "visited";
                } else if (grid[row][col] === "S") {
                  states[key] = "start";
                }
              }
            }
            states[currentKey] = "current";
            return states;
          })(),
          labels: Object.fromEntries(
            Object.entries(distance).map(([key, value]) => [key, `d=${value}`])
          ),
          panels: [
            panel("Очередь", formatQueueCoords(queue)),
            panel("Дистанций известно", String(Object.keys(distance).length)),
          ],
          legend: GRID_LEGEND,
          title: "Волна расстояний от выходов",
          formatValue: (value) => value,
        }),
      })
    );

    for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
      if (!isInside(grid, nextRow, nextCol)) {
        continue;
      }

      const nextValue = grid[nextRow][nextCol];
      const nextKey = coordKey(nextRow, nextCol);
      if (nextValue === "1" || visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      distance[nextKey] = distance[currentKey] + 1;
      queue.push({ row: nextRow, col: nextCol });
    }
  }

  const startDistances = starts.map(({ row, col }) => distance[coordKey(row, col)]);
  const impossible = startDistances.some((value) => value === undefined);
  const worst = impossible ? -1 : Math.max(...startDistances);

  steps.push(
    createStep({
      action: impossible ? "Не все люди могут выйти" : "Время эвакуации вычислено",
      why: impossible
        ? "Если хотя бы для одной стартовой точки не нашлось расстояния, значит путь до выхода перекрыт стенами."
        : "Общее время эвакуации определяется самым медленным человеком, то есть максимумом среди кратчайших путей от всех стартов.",
      pseudoLine: 5,
      resultPreview: impossible
        ? "Ответ: -1."
        : `Ответ: ${worst}.`,
      stateSnapshot: makeMatrixSnapshot({
        grid,
        states: (() => {
          const states = {};
          for (let row = 0; row < grid.length; row += 1) {
            for (let col = 0; col < grid[row].length; col += 1) {
              const key = coordKey(row, col);
              if (grid[row][col] === "1") {
                states[key] = "wall";
              } else if (grid[row][col] === "E") {
                states[key] = "source";
              } else if (grid[row][col] === "S") {
                states[key] = distance[key] === undefined ? "failure" : "path";
              } else if (distance[key] !== undefined) {
                states[key] = "visited";
              }
            }
          }
          return states;
        })(),
        labels: Object.fromEntries(
          Object.entries(distance).map(([key, value]) => [key, `d=${value}`])
        ),
        panels: [
          panel("Ответ", impossible ? "-1" : String(worst)),
          panel(
            "Стартовые дистанции",
            starts
              .map(({ row, col }) => {
                const key = coordKey(row, col);
                return `${formatCoord(row, col)}:${distance[key] ?? "∞"}`;
              })
              .join(" | ")
          ),
        ],
        legend: GRID_LEGEND,
        title: "Итоговый план эвакуации",
        formatValue: (value) => value,
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: impossible ? "-1" : String(worst),
    conclusion:
      "Здесь выгодно запустить BFS от выходов, а не от каждого человека отдельно: один проход сразу даёт кратчайшие пути ко всем клеткам.",
  };
}

export function runSnowball({ target }) {
  if (target < 1) {
    throw new Error("Число N должно быть не меньше 1.");
  }

  const queue = [1];
  const visited = new Set([1]);
  const parent = {};
  const distance = { 1: 0 };
  const steps = [
    createStep({
      action: "Начинаем с X = 1",
      why: "Каждую операцию считаем за один шаг, поэтому BFS по числам от 1 до N сразу даёт минимальное число операций.",
      pseudoLine: 1,
      resultPreview: `Цель: ${target}.`,
      stateSnapshot: makeTraceSnapshot({
        groups: buildTraceGroups([
          {
            label: "Очередь",
            items: [{ label: "0", value: "1", state: "frontier" }],
          },
        ]),
        panels: [panel("Цель", String(target))],
      }),
    }),
  ];

  let found = null;

  while (queue.length) {
    const current = queue.shift();

    steps.push(
      createStep({
        action: `Обрабатываем число ${current}`,
        why: "Это число уже достигнуто минимальным количеством операций, поэтому можно безопасно порождать из него следующие состояния.",
        pseudoLine: 3,
        resultPreview: `Текущая длина пути: ${distance[current]}.`,
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "Текущее число",
              items: [{ label: "current", value: String(current), state: "current" }],
            },
            {
              label: "Очередь",
              items: queue.map((value, index) => ({
                label: String(index + 1),
                value: String(value),
                state: "frontier",
              })),
            },
          ]),
          panels: [
            panel("Сделано операций", String(distance[current])),
            panel("Посещено чисел", String(visited.size)),
          ],
        }),
      })
    );

    if (current === target) {
      found = current;
      break;
    }

    for (const next of [current * 2, current * 3, current + 1]) {
      if (next > target || visited.has(next)) {
        continue;
      }

      visited.add(next);
      parent[next] = current;
      distance[next] = distance[current] + 1;
      queue.push(next);

      steps.push(
        createStep({
          action: `Получаем число ${next}`,
          why: "Это новый допустимый результат одной из трёх операций, поэтому он попадает в следующий слой BFS.",
          pseudoLine: 5,
          resultPreview: `До ${next} требуется ${distance[next]} операций.`,
          stateSnapshot: makeTraceSnapshot({
            groups: buildTraceGroups([
              {
                label: "Следующий фронт",
                items: queue.map((value, index) => ({
                  label: String(index + 1),
                  value: String(value),
                  state: value === next ? "current" : "frontier",
                })),
              },
            ]),
            panels: [
              panel("Из числа", String(current)),
              panel("Новый результат", String(next)),
            ],
          }),
        })
      );
    }
  }

  const path = found ? reconstructPath(parent, found).map(Number) : [];
  steps.push(
    createStep({
      action: found ? "Минимальная последовательность операций найдена" : "Достичь цели нельзя",
      why: found
        ? "Цель встретилась на минимальном слое BFS, следовательно найден кратчайший набор операций."
        : "Если очередь опустела, все достижимые числа уже были проверены.",
      pseudoLine: found ? 4 : 2,
      resultPreview: found
        ? `Ответ: ${path.length - 1}, путь ${path.join(" → ")}.`
        : "Ответ: -1.",
      stateSnapshot: makeTraceSnapshot({
        groups: buildTraceGroups([
          {
            label: "Итоговый путь",
            items: (found ? path : [1]).map((value) => ({
              label: String(value),
              value: String(value),
              state: found ? "path" : "failure",
            })),
          },
        ]),
        panels: [
          panel("Операций", found ? String(path.length - 1) : "-1"),
          panel("Комментарий", "Оптимальный путь для N=10: 1 → 3 → 9 → 10"),
        ],
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: found ? String(path.length - 1) : "-1",
    conclusion:
      "Даже для числовых преобразований BFS остаётся тем же поиском по графу состояний: вершина — это число, ребро — допустимая операция.",
  };
}

function traverseTree(root, visitor) {
  function dfs(node, depth) {
    if (!node) {
      visitor(null, depth);
      return;
    }
    visitor(node, depth);
    dfs(node.left, depth + 1);
    dfs(node.right, depth + 1);
  }

  dfs(root, 1);
}

export function runDfsPreorder({ values }) {
  const root = buildBinaryTree(values);
  const steps = [];
  const output = [];
  const visited = new Set();

  function dfs(node, stack) {
    if (!node) {
      return;
    }

    output.push(node.value);
    visited.add(node.id);

    steps.push(
      createStep({
        action: `Посещаем узел ${node.value}`,
        why: "В префиксном DFS сначала обрабатываем сам узел, а уже потом уходим в левое и правое поддерево.",
        pseudoLine: 3,
        resultPreview: `Текущий порядок обхода: [${output.join(", ")}].`,
        stateSnapshot: buildTreeSnapshotFromDecorators(
          root,
          Object.fromEntries(
            [...visited].map((id) => [id, { state: "visited" }]).concat([
              [node.id, { state: "current" }],
            ])
          ),
          [
            panel("Стек рекурсии", [...stack, node.value].join(" → ")),
            panel("Ответ", `[${output.join(", ")}]`),
          ]
        ),
      })
    );

    dfs(node.left, [...stack, node.value]);
    dfs(node.right, [...stack, node.value]);
  }

  dfs(root, []);

  steps.push(
    createStep({
      action: "Обход дерева завершён",
      why: "Каждый узел посетили ровно один раз в порядке корень → левый → правый.",
      pseudoLine: 5,
      resultPreview: `Ответ: [${output.join(", ")}].`,
      stateSnapshot: buildTreeSnapshotFromDecorators(
        root,
        Object.fromEntries([...visited].map((id) => [id, { state: "visited" }])),
        [panel("Итоговый обход", `[${output.join(", ")}]`)]
      ),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: `[${output.join(", ")}]`,
    conclusion:
      "Префиксный DFS особенно нагляден на дереве: каждый узел попадает в ответ в момент первого посещения.",
  };
}

export function runDfsTreeSum({ values }) {
  const root = buildBinaryTree(values);
  const steps = [];

  function dfs(node, stack) {
    if (!node) {
      return 0;
    }

    steps.push(
      createStep({
        action: `Входим в узел ${node.value}`,
        why: "Сумма поддерева строится рекурсивно: сначала считаем вклад детей, затем добавляем значение текущего узла.",
        pseudoLine: 2,
        resultPreview: `Сейчас нужно собрать сумму поддерева с корнем ${node.value}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(
          root,
          {
            [node.id]: { state: "current" },
          },
          [panel("Стек", [...stack, node.value].join(" → "))]
        ),
      })
    );

    const leftSum = dfs(node.left, [...stack, node.value]);
    const rightSum = dfs(node.right, [...stack, node.value]);
    const total = node.value + leftSum + rightSum;

    steps.push(
      createStep({
        action: `Собрали сумму для узла ${node.value}`,
        why: "Теперь значения детей уже известны, поэтому можно вернуть сумму всего поддерева наверх по рекурсии.",
        pseudoLine: 4,
        resultPreview: `${node.value} + ${leftSum} + ${rightSum} = ${total}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(
          root,
          {
            [node.id]: { state: "current" },
          },
          [
            panel("Левая сумма", String(leftSum)),
            panel("Правая сумма", String(rightSum)),
            panel("Итого", String(total)),
          ]
        ),
      })
    );

    return total;
  }

  const answer = dfs(root, []);
  steps.push(
    createStep({
      action: "Сумма дерева найдена",
      why: "Корневой вызов получил сумму всех поддеревьев, а значит и всего дерева целиком.",
      pseudoLine: 4,
      resultPreview: `Ответ: ${answer}.`,
      stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
        panel("Финальная сумма", String(answer)),
      ]),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: String(answer),
    conclusion:
      "Рекурсия позволяет естественно агрегировать значения снизу вверх: каждое поддерево возвращает свой вклад родителю.",
  };
}

export function runDfsMaxDepth({ values }) {
  const root = buildBinaryTree(values);
  const steps = [];
  let maxDepth = 0;

  function dfs(node, depth, stack) {
    if (!node) {
      return;
    }

    maxDepth = Math.max(maxDepth, depth);
    steps.push(
      createStep({
        action: `Посетили узел ${node.value} на глубине ${depth}`,
        why: "Каждый раз сравниваем текущую глубину с максимумом: именно так DFS находит самый длинный путь от корня до листа.",
        pseudoLine: 3,
        resultPreview: `Максимум сейчас равен ${maxDepth}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(
          root,
          {
            [node.id]: { state: "current" },
          },
          [
            panel("Глубина current", String(depth)),
            panel("Текущий максимум", String(maxDepth)),
            panel("Стек", [...stack, node.value].join(" → ")),
          ]
        ),
      })
    );

    dfs(node.left, depth + 1, [...stack, node.value]);
    dfs(node.right, depth + 1, [...stack, node.value]);
  }

  dfs(root, 1, []);
  steps.push(
    createStep({
      action: "Максимальная глубина определена",
      why: "DFS просмотрел все пути от корня до листьев, поэтому найденный максимум является настоящей глубиной дерева.",
      pseudoLine: 4,
      resultPreview: `Ответ: ${maxDepth}.`,
      stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
        panel("Максимальная глубина", String(maxDepth)),
      ]),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: String(maxDepth),
    conclusion:
      "DFS естественно проходит дерево по всем веткам, поэтому задача на глубину сводится к поддержанию максимального уровня рекурсии.",
  };
}

export function runMirrorTree({ values }) {
  const root = buildBinaryTree(values);
  const steps = [];

  function dfs(node) {
    if (!node) {
      return;
    }

    steps.push(
      createStep({
        action: `Готовим обмен детей у узла ${node.value}`,
        why: "Зеркальность достигается локально: если поменять левого и правого ребёнка у каждого узла, всё дерево отразится целиком.",
        pseudoLine: 3,
        resultPreview: "Сейчас меняем местами поддеревья этого узла.",
        stateSnapshot: buildTreeSnapshotFromDecorators(root, {
          [node.id]: { state: "current" },
        }),
      })
    );

    const temp = node.left;
    node.left = node.right;
    node.right = temp;

    steps.push(
      createStep({
        action: `Узел ${node.value} отзеркален`,
        why: "После обмена локальная структура уже отражена, осталось повторить ту же операцию рекурсивно в потомках.",
        pseudoLine: 4,
        resultPreview: `Для узла ${node.value} левое и правое поддеревья поменялись местами.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(root, {
          [node.id]: { state: "path" },
        }),
      })
    );

    dfs(node.left);
    dfs(node.right);
  }

  dfs(root);
  const answer = treeToLevelOrder(root);
  const answerText = JSON.stringify(answer);
  steps.push(
    createStep({
      action: "Зеркальное дерево готово",
      why: "Каждый узел был обработан один раз, поэтому отражение выполнено по всему дереву.",
      pseudoLine: 4,
      resultPreview: `Новая level-order форма: ${answerText}.`,
      stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
        panel("Новый обход по уровням", answerText),
      ]),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: answerText,
    conclusion:
      "Отражение дерева делается очень локально: достаточно у каждого узла поменять местами детей и повторить то же действие рекурсивно.",
  };
}

export function runFindInTree({ values, target }) {
  const root = buildBinaryTree(values);
  const steps = [];
  let found = false;

  function dfs(node, stack) {
    if (!node || found) {
      return false;
    }

    steps.push(
      createStep({
        action: `Сравниваем узел ${node.value} с target = ${target}`,
        why: "DFS последовательно проверяет вершины по веткам дерева, пока не найдёт совпадение или не исчерпает все варианты.",
        pseudoLine: 2,
        resultPreview: `${node.value === target ? "Совпадение найдено." : "Пока не совпало."}`,
        stateSnapshot: buildTreeSnapshotFromDecorators(
          root,
          {
            [node.id]: { state: node.value === target ? "found" : "current" },
          },
          [panel("Стек", [...stack, node.value].join(" → "))]
        ),
      })
    );

    if (node.value === target) {
      found = true;
      return true;
    }

    return dfs(node.left, [...stack, node.value]) || dfs(node.right, [...stack, node.value]);
  }

  dfs(root, []);

  steps.push(
    createStep({
      action: found ? "Элемент найден" : "Элемент отсутствует",
      why: found
        ? "Одна из веток DFS дошла до нужного значения и завершила поиск."
        : "Ни один узел дерева не совпал с target, поэтому ответ отрицательный.",
      pseudoLine: found ? 3 : 4,
      resultPreview: `Ответ: ${found ? "True" : "False"}.`,
      stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
        panel("Результат", found ? "True" : "False"),
      ]),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: found ? "True" : "False",
    conclusion:
      "Поиск элемента в дереве — это классический DFS с коротким замыканием: как только значение найдено, остальное дерево можно не обходить.",
  };
}

export function runDfsMaze({ grid, start, end }) {
  if (grid[start.row][start.col] === 1 || grid[end.row][end.col] === 1) {
    throw new Error("Старт и финиш должны быть проходами.");
  }

  const visited = new Set();
  const steps = [];
  let foundPath = null;

  function dfs(row, col, currentPath) {
    if (!isInside(grid, row, col) || grid[row][col] === 1) {
      return false;
    }

    const key = coordKey(row, col);
    if (visited.has(key)) {
      return false;
    }

    const nextPath = [...currentPath, key];
    visited.add(key);

    steps.push(
      createStep({
        action: `DFS заходит в ${formatCoord(row, col)}`,
        why: "В отличие от BFS, DFS идёт глубоко в одну ветку, пока не упрётся в препятствие или не найдёт цель.",
        pseudoLine: 2,
        resultPreview: `Текущая ветка: ${formatCoordPath(nextPath)}.`,
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          end,
          current: { row, col },
          visited: [...visited],
          path: nextPath,
          panels: [
            panel("Глубина ветки", String(nextPath.length)),
            panel("Текущий путь", formatCoordPath(nextPath)),
          ],
          title: "Глубинный обход лабиринта",
        }),
      })
    );

    if (row === end.row && col === end.col) {
      foundPath = nextPath;
      return true;
    }

    for (const [nextRow, nextCol] of neighbors4(row, col)) {
      if (dfs(nextRow, nextCol, nextPath)) {
        return true;
      }
    }

    steps.push(
      createStep({
        action: `Из ${formatCoord(row, col)} приходится откатиться`,
        why: "Эта ветка не привела к финишу, поэтому возвращаемся на шаг назад и пробуем другого соседа.",
        pseudoLine: 6,
        resultPreview: "Идёт backtracking внутри DFS.",
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          end,
          current: { row, col },
          visited: [...visited],
          path: currentPath,
          panels: [
            panel("Откат", formatCoord(row, col)),
            panel("Оставшийся путь", currentPath.length ? formatCoordPath(currentPath) : "пусто"),
          ],
          title: "Откат по неудачной ветке",
        }),
      })
    );

    return false;
  }

  const exists = dfs(start.row, start.col, []);

  steps.push(
    createStep({
      action: exists ? "Путь в лабиринте существует" : "Путь не существует",
      why: exists
        ? "DFS смог дойти до финиша хотя бы одной глубокой веткой."
        : "Даже после обхода всех веток ни одна не дошла до финиша.",
      pseudoLine: exists ? 3 : 6,
      resultPreview: `Ответ: ${exists ? "True" : "False"}.`,
      stateSnapshot: buildMazeSnapshot({
        grid,
        start,
        end,
        visited: [...visited],
        path: foundPath ?? [],
        panels: [panel("Результат", exists ? "True" : "False")],
        title: "Итог DFS по лабиринту",
      }),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: exists ? "True" : "False",
    conclusion:
      "DFS не гарантирует кратчайший путь, но отлично подходит, когда нужно просто выяснить, существует ли какой-нибудь путь.",
  };
}

function runDijkstraCore({
  edges,
  start,
  target = null,
  allowEqualParents = false,
  rejectNegative = true,
}) {
  const nodeIds = new Set([start]);
  for (const edge of edges) {
    nodeIds.add(edge.from);
    nodeIds.add(edge.to);
  }
  if (target) {
    nodeIds.add(target);
  }

  const sortedNodes = [...nodeIds].sort();

  if (rejectNegative && edges.some((edge) => edge.weight < 0)) {
    return {
      steps: finalizeSteps([
        createStep({
          action: "Алгоритм Дейкстры остановлен",
          why: "В графе есть отрицательное ребро. Дейкстра предполагает, что после выбора минимальной вершины её стоимость уже не улучшится, а отрицательные веса ломают это свойство.",
          pseudoLine: 1,
          resultPreview: "Для такого входа нужен Беллман–Форд.",
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances: Object.fromEntries(sortedNodes.map((node) => [node, node === start ? 0 : INF])),
            parents: {},
            current: null,
            processed: new Set(),
            failureNodes: sortedNodes,
            extraPanels: [panel("Причина", "обнаружено отрицательное ребро")],
          }),
        }),
      ]),
      answer: "Нельзя применить",
      conclusion:
        "Дейкстра работает только при неотрицательных весах. Если есть отрицательные рёбра, нужно переключиться на Беллман–Форд.",
    };
  }

  const adjacency = Object.fromEntries(sortedNodes.map((node) => [node, []]));
  for (const edge of edges) {
    adjacency[edge.from].push(edge);
  }

  const distances = Object.fromEntries(
    sortedNodes.map((node) => [node, node === start ? 0 : INF])
  );
  const parents = {};
  const parentSets = Object.fromEntries(sortedNodes.map((node) => [node, new Set()]));
  const processed = new Set();
  const steps = [
    createStep({
      action: `Инициализируем расстояния от вершины ${start}`,
      why: "На старте только исходная вершина имеет стоимость 0, а до всех остальных путь ещё неизвестен.",
      pseudoLine: 1,
      resultPreview: sortedNodes
        .map((node) => `${node}:${formatMaybeInfinity(distances[node])}`)
        .join(" | "),
      stateSnapshot: buildGraphSnapshotFromState({
        nodeIds,
        edges,
        distances,
        parents,
        current: start,
        processed,
        extraPanels: [panel("Старт", start)],
      }),
    }),
  ];

  while (true) {
    const candidates = sortedNodes.filter(
      (node) => !processed.has(node) && Number.isFinite(distances[node])
    );
    if (!candidates.length) {
      break;
    }

    candidates.sort((a, b) => distances[a] - distances[b] || a.localeCompare(b));
    const current = candidates[0];
    processed.add(current);

    steps.push(
      createStep({
        action: `Выбираем вершину ${current} с минимальной стоимостью`,
        why: "Среди необработанных вершин именно у неё сейчас наименьшая оценка пути, поэтому Дейкстра делает её следующей фиксированной вершиной.",
        pseudoLine: 2,
        resultPreview: `distance[${current}] = ${formatMaybeInfinity(distances[current])}.`,
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current,
          processed,
        }),
      })
    );

    for (const edge of adjacency[current]) {
      const candidate = distances[current] + edge.weight;
      if (candidate < distances[edge.to]) {
        distances[edge.to] = candidate;
        parents[edge.to] = current;
        parentSets[edge.to] = new Set([current]);

        steps.push(
          createStep({
            action: `Релаксируем ребро ${edge.from} → ${edge.to}`,
            why: "Через текущую вершину нашёлся более короткий путь к соседу, поэтому пересчитываем его стоимость и запоминаем нового предка.",
            pseudoLine: 4,
            resultPreview: `${edge.to}: новое расстояние ${candidate}, предок ${current}.`,
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances,
              parents,
              current,
              processed,
              activeEdge: edge,
            }),
          })
        );
      } else if (allowEqualParents && candidate === distances[edge.to]) {
        parentSets[edge.to].add(current);
        steps.push(
          createStep({
            action: `Фиксируем альтернативный кратчайший путь к ${edge.to}`,
            why: "Стоимость не улучшилась, но оказалась такой же минимальной, значит существует ещё один кратчайший маршрут той же длины.",
            pseudoLine: 4,
            resultPreview: `У вершины ${edge.to} теперь несколько равноправных предков.`,
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances,
              parents,
              current,
              processed,
              activeEdge: edge,
            }),
          })
        );
      }
    }
  }

  let answer = "";
  let conclusion = "";

  if (target) {
    if (!Number.isFinite(distances[target])) {
      answer = "-1";
      conclusion =
        "Если у вершины после завершения алгоритма осталась бесконечная стоимость, значит из старта она недостижима.";
      steps.push(
        createStep({
          action: `Вершина ${target} недостижима`,
          why: "Алгоритм обработал все доступные вершины, но стоимость для target так и не стала конечной.",
          pseudoLine: 6,
          resultPreview: "Ответ: -1.",
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: null,
            processed,
            failureNodes: [target],
          }),
        })
      );
    } else if (allowEqualParents) {
      const paths = reconstructAllPaths(parentSets, start, target).map((path) =>
        formatPath(path)
      );
      answer = `${formatMaybeInfinity(distances[target])}`;
      conclusion =
        "Если при релаксации получается та же минимальная стоимость, нужно сохранить альтернативного предка, чтобы восстановить все кратчайшие маршруты.";
      steps.push(
        createStep({
          action: `Восстанавливаем все кратчайшие пути до ${target}`,
          why: "Мы хранили несколько предков для вершин с одинаковой стоимостью, поэтому можем перечислить все минимальные маршруты.",
          pseudoLine: 6,
          resultPreview: `Длина ${distances[target]}, пути: ${paths.join(" | ")}.`,
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: target,
            processed,
            pathNodes: uniquePathsNodes(paths),
            extraPanels: [panel("Кратчайшие пути", paths.join(" | "))],
          }),
        })
      );
    } else {
      const path = reconstructPath(parents, target);
      answer = `${formatMaybeInfinity(distances[target])}`;
      conclusion =
        "Дейкстра шаг за шагом фиксирует минимальные стоимости и по таблице предков восстанавливает сам маршрут.";
      steps.push(
        createStep({
          action: `Восстанавливаем путь до ${target}`,
          why: "Когда все стоимости уже посчитаны, достаточно пройти по таблице предков от target назад к start.",
          pseudoLine: 6,
          resultPreview: `Длина ${distances[target]}, путь ${formatPath(path)}.`,
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: target,
            processed,
            pathNodes: path,
            extraPanels: [panel("Маршрут", formatPath(path))],
          }),
        })
      );
    }
  } else {
    answer = sortedNodes
      .map((node) => `${node}:${formatMaybeInfinity(distances[node])}`)
      .join(" | ");
    conclusion =
      "Когда целевая вершина не задана, Дейкстра сразу выдаёт таблицу кратчайших расстояний до всех достижимых вершин.";
    steps.push(
      createStep({
        action: "Получаем итоговую таблицу расстояний",
        why: "После обработки всех доступных вершин каждая конечная стоимость уже является кратчайшей.",
        pseudoLine: 6,
        resultPreview: answer,
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: null,
          processed,
        }),
      })
    );
  }

  return {
    steps: finalizeSteps(steps),
    answer,
    conclusion,
  };
}

function uniquePathsNodes(paths) {
  const set = new Set();
  for (const path of paths) {
    for (const node of path.split(" → ")) {
      set.add(node);
    }
  }
  return [...set];
}

export function runBellmanFordCore({
  edges,
  start,
  target = null,
  noteDijkstra = false,
}) {
  const nodeIds = new Set([start]);
  for (const edge of edges) {
    nodeIds.add(edge.from);
    nodeIds.add(edge.to);
  }
  if (target) {
    nodeIds.add(target);
  }
  const sortedNodes = [...nodeIds].sort();
  const distances = Object.fromEntries(
    sortedNodes.map((node) => [node, node === start ? 0 : INF])
  );
  const parents = {};
  const updateCounts = Object.fromEntries(sortedNodes.map((node) => [node, 0]));
  const steps = [
    createStep({
      action: `Инициализируем Беллман–Форд от вершины ${start}`,
      why: "Как и в Дейкстре, старт получает стоимость 0, но дальше мы не выбираем вершины по минимуму, а многократно перебираем все рёбра.",
      pseudoLine: 1,
      resultPreview: sortedNodes
        .map((node) => `${node}:${formatMaybeInfinity(distances[node])}`)
        .join(" | "),
      stateSnapshot: buildGraphSnapshotFromState({
        nodeIds,
        edges,
        distances,
        parents,
        current: start,
        processed: new Set(),
      }),
    }),
  ];

  for (let iteration = 1; iteration <= sortedNodes.length - 1; iteration += 1) {
    let updated = false;

    for (const edge of edges) {
      if (!Number.isFinite(distances[edge.from])) {
        continue;
      }

      const candidate = distances[edge.from] + edge.weight;
      if (candidate < distances[edge.to]) {
        distances[edge.to] = candidate;
        parents[edge.to] = edge.from;
        updateCounts[edge.to] += 1;
        updated = true;

        steps.push(
          createStep({
            action: `Итерация ${iteration}: улучшаем путь ${edge.from} → ${edge.to}`,
            why: "Беллман–Форд пытается релаксировать каждое ребро. Если путь через edge.from короче, таблица расстояний обновляется.",
            pseudoLine: 3,
            resultPreview: `${edge.to}: ${candidate}, предок ${edge.from}.`,
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances,
              parents,
              current: edge.to,
              processed: new Set(),
              activeEdge: edge,
              extraPanels: [
                panel("Итерация", String(iteration)),
                panel("Обновлений для вершины", `${edge.to}: ${updateCounts[edge.to]}`),
              ],
            }),
          })
        );
      }
    }

    steps.push(
      createStep({
        action: `Завершили проход ${iteration} по рёбрам`,
        why: updated
          ? "После полного прохода часть расстояний стала лучше. Значит, следующий проход ещё может протолкнуть улучшения дальше по графу."
          : "Если ни одно ребро не улучшило расстояния, алгоритм уже может остановиться раньше времени.",
        pseudoLine: 2,
        resultPreview: sortedNodes
          .map((node) => `${node}:${formatMaybeInfinity(distances[node])}`)
          .join(" | "),
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: null,
          processed: new Set(),
          extraPanels: [panel("Итерация", String(iteration))],
        }),
      })
    );

    if (!updated) {
      break;
    }
  }

  let negativeCycleEdge = null;
  for (const edge of edges) {
    if (
      Number.isFinite(distances[edge.from]) &&
      distances[edge.from] + edge.weight < distances[edge.to]
    ) {
      negativeCycleEdge = edge;
      break;
    }
  }

  if (negativeCycleEdge) {
    steps.push(
      createStep({
        action: "Обнаружен достижимый отрицательный цикл",
        why: "После |V|-1 проходов расстояния уже должны были стабилизироваться. Если улучшение всё ещё возможно, значит путь можно уменьшать бесконечно.",
        pseudoLine: 6,
        resultPreview: `Проблемное ребро: ${negativeCycleEdge.from} → ${negativeCycleEdge.to}.`,
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: negativeCycleEdge.to,
          processed: new Set(),
          activeEdge: negativeCycleEdge,
          failureNodes: [negativeCycleEdge.from, negativeCycleEdge.to],
        }),
      })
    );

    return {
      steps: finalizeSteps(steps),
      answer: "Обнаружен отрицательный цикл",
      conclusion:
        "Это ключевое отличие Беллмана–Форда от Дейкстры: алгоритм умеет не только работать с отрицательными весами, но и распознавать отрицательные циклы.",
      distances,
      parents,
      hasNegativeCycle: true,
      updateCounts,
    };
  }

  if (target) {
    const path = Number.isFinite(distances[target]) ? reconstructPath(parents, target) : [];
    steps.push(
      createStep({
        action: Number.isFinite(distances[target])
          ? `Восстанавливаем путь до ${target}`
          : `Вершина ${target} недостижима`,
        why: Number.isFinite(distances[target])
          ? "Когда отрицательного цикла нет, достаточно пройти по предкам назад, чтобы получить кратчайший маршрут."
          : "Если значение осталось бесконечным, значит из старта эта вершина вообще не достигается.",
        pseudoLine: 4,
        resultPreview: Number.isFinite(distances[target])
          ? `Длина ${distances[target]}, путь ${formatPath(path)}.`
          : "Ответ: -1.",
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: target,
          processed: new Set(),
          pathNodes: path,
          failureNodes: Number.isFinite(distances[target]) ? [] : [target],
          extraPanels: [
            panel("Длина", Number.isFinite(distances[target]) ? String(distances[target]) : "-1"),
            panel("Путь", path.length ? formatPath(path) : "не найден"),
          ],
        }),
      })
    );
  } else {
    steps.push(
      createStep({
        action: "Формируем итоговую таблицу расстояний",
        why: "После стабилизации рёбер все конечные расстояния являются кратчайшими от стартовой вершины.",
        pseudoLine: 4,
        resultPreview: sortedNodes
          .map((node) => `${node}:${formatMaybeInfinity(distances[node])}`)
          .join(" | "),
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: null,
          processed: new Set(),
        }),
      })
    );
  }

  if (noteDijkstra) {
    steps.push(
      createStep({
        action: "Сравнение с Дейкстрой",
        why: "Отрицательное ребро может улучшить уже найденный путь позже, поэтому стратегия выбора «локально минимальной» вершины у Дейкстры здесь была бы неверной.",
        pseudoLine: 6,
        resultPreview: "На таких графах корректный ответ гарантирует именно Беллман–Форд.",
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: null,
          processed: new Set(),
          extraPanels: [panel("Важно", "отрицательные рёбра ломают Дейкстру")],
        }),
      })
    );
  }

  return {
    steps: finalizeSteps(steps),
    answer: target
      ? Number.isFinite(distances[target])
        ? String(distances[target])
        : "-1"
      : sortedNodes
          .map((node) => `${node}:${formatMaybeInfinity(distances[node])}`)
          .join(" | "),
    conclusion:
      "Беллман–Форд систематически проталкивает улучшения через все рёбра и потому корректно работает там, где Дейкстра уже не гарантирует ответ.",
    distances,
    parents,
    hasNegativeCycle: false,
    updateCounts,
  };
}

export function runPermutations({ numbers }) {
  const steps = [];
  const results = [];
  const used = Array(numbers.length).fill(false);

  function backtrack(path) {
    if (path.length === numbers.length) {
      results.push([...path]);
      steps.push(
        createStep({
          action: `Получили готовую перестановку [${path.join(", ")}]`,
          why: "Когда в пути уже столько же чисел, сколько во входном массиве, перестановка полностью собрана и её можно сохранить.",
          pseudoLine: 2,
          resultPreview: `Найдено перестановок: ${results.length}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: path.map(String),
            choices: numbers.map((value, index) => ({
              label: String(value),
              state: used[index] ? "visited" : "",
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("Текущий путь", `[${path.join(", ")}]`),
              panel("Всего результатов", String(results.length)),
            ],
          }),
        })
      );
      return;
    }

    for (let index = 0; index < numbers.length; index += 1) {
      if (used[index]) {
        continue;
      }

      used[index] = true;
      path.push(numbers[index]);

      steps.push(
        createStep({
          action: `Добавляем число ${numbers[index]} в путь`,
          why: "В перестановке каждое число можно использовать ровно один раз, поэтому отмечаем его как занятое и углубляемся в рекурсию.",
          pseudoLine: 4,
          resultPreview: `Путь сейчас: [${path.join(", ")}].`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: path.map(String),
            choices: numbers.map((value, currentIndex) => ({
              label: String(value),
              state: used[currentIndex]
                ? currentIndex === index
                  ? "current"
                  : "visited"
                : "",
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("Глубина", String(path.length)),
              panel("Свободные числа", numbers.filter((_, i) => !used[i]).join(", ") || "нет"),
            ],
          }),
        })
      );

      backtrack(path);

      path.pop();
      used[index] = false;

      steps.push(
        createStep({
          action: `Откатываем число ${numbers[index]}`,
          why: "После возврата из рекурсии число нужно освободить, чтобы попробовать его на других позициях перестановки.",
          pseudoLine: 4,
          resultPreview: `Возвращаемся к пути [${path.join(", ")}].`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: path.map(String),
            choices: numbers.map((value, currentIndex) => ({
              label: String(value),
              state: used[currentIndex] ? "visited" : "",
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("Результатов", String(results.length)),
              panel("Откат", String(numbers[index])),
            ],
          }),
        })
      );
    }
  }

  backtrack([]);
  return {
    steps: finalizeSteps(steps),
    answer: JSON.stringify(results),
    conclusion:
      "Backtracking для перестановок каждый раз делает выбор следующего свободного числа, а потом откатывает его, чтобы перебрать остальные варианты.",
  };
}

export function runSubsets({ numbers }) {
  const steps = [];
  const results = [];

  function backtrack(index, subset) {
    if (index === numbers.length) {
      results.push([...subset]);
      steps.push(
        createStep({
          action: `Фиксируем подмножество [${subset.join(", ")}]`,
          why: "Когда решения по всем позициям уже приняты, текущее состояние является одним законченным подмножеством.",
          pseudoLine: 2,
          resultPreview: `Найдено подмножеств: ${results.length}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: subset.map(String),
            choices: numbers.map((value, currentIndex) => ({
              label: String(value),
              state: currentIndex < index ? "visited" : "",
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("Текущее подмножество", `[${subset.join(", ")}]`),
              panel("Готово", String(results.length)),
            ],
          }),
        })
      );
      return;
    }

    subset.push(numbers[index]);
    steps.push(
      createStep({
        action: `Включаем ${numbers[index]} в подмножество`,
        why: "Первая ветка рекурсии отвечает за решение «взять текущий элемент».",
        pseudoLine: 4,
        resultPreview: `Подмножество стало [${subset.join(", ")}].`,
        stateSnapshot: makeBacktrackingSnapshot({
          mode: "sequence",
          current: subset.map(String),
          choices: numbers.map((value, currentIndex) => ({
            label: String(value),
            state:
              currentIndex === index
                ? "current"
                : currentIndex < index
                  ? "visited"
                  : "",
          })),
          results: results.map((item) => `[${item.join(", ")}]`),
          panels: [panel("Индекс", String(index))],
        }),
      })
    );
    backtrack(index + 1, subset);

    subset.pop();
    steps.push(
      createStep({
        action: `Исключаем ${numbers[index]} и идём во вторую ветку`,
        why: "После возврата пробуем альтернативное решение: текущий элемент не входит в подмножество.",
        pseudoLine: 5,
        resultPreview: `Возвращаемся к [${subset.join(", ")}].`,
        stateSnapshot: makeBacktrackingSnapshot({
          mode: "sequence",
          current: subset.map(String),
          choices: numbers.map((value, currentIndex) => ({
            label: String(value),
            state: currentIndex < index ? "visited" : "",
          })),
          results: results.map((item) => `[${item.join(", ")}]`),
          panels: [panel("Следующий индекс", String(index + 1))],
        }),
      })
    );
    backtrack(index + 1, subset);
  }

  backtrack(0, []);
  return {
    steps: finalizeSteps(steps),
    answer: JSON.stringify(results),
    conclusion:
      "Генерация подмножеств строится на простом бинарном выборе: взять элемент или не взять его.",
  };
}

export function runBacktrackingMaze({ grid }) {
  const start = { row: 0, col: 0 };
  const end = { row: grid.length - 1, col: grid[0].length - 1 };
  const visited = new Set();
  const steps = [];
  let found = false;
  let answerPath = [];

  function snapshot(currentPath = [], currentKey = null) {
    return makeBacktrackingSnapshot({
      mode: "maze",
      current: currentPath.map((key) => formatCoord(fromCoordKey(key).row, fromCoordKey(key).col)),
      choices: [],
      results: found ? [formatCoordPath(answerPath)] : [],
      panels: [
        panel("Длина пути", String(currentPath.length)),
        panel("Цель", formatCoord(end.row, end.col)),
      ],
      board: buildMazeSnapshot({
        grid,
        start,
        end,
        current: currentKey ? fromCoordKey(currentKey) : null,
        visited: [...visited],
        path: currentPath,
        title: "Лабиринт для backtracking",
      }),
    });
  }

  function backtrack(row, col, currentPath) {
    if (!isInside(grid, row, col) || grid[row][col] === 1) {
      return false;
    }

    const key = coordKey(row, col);
    if (visited.has(key)) {
      return false;
    }

    visited.add(key);
    const nextPath = [...currentPath, key];

    steps.push(
      createStep({
        action: `Входим в клетку ${formatCoord(row, col)}`,
        why: "Backtracking пробует один путь до упора, а затем откатывается, если дальше пройти не удаётся.",
        pseudoLine: 2,
        resultPreview: `Текущий маршрут: ${formatCoordPath(nextPath)}.`,
        stateSnapshot: snapshot(nextPath, key),
      })
    );

    if (row === end.row && col === end.col) {
      found = true;
      answerPath = nextPath;
      return true;
    }

    for (const [nextRow, nextCol] of neighbors4(row, col)) {
      if (backtrack(nextRow, nextCol, nextPath)) {
        return true;
      }
    }

    visited.delete(key);
    steps.push(
      createStep({
        action: `Откат из ${formatCoord(row, col)}`,
        why: "Ни один сосед не привёл к финишу, поэтому эта клетка исключается из текущего маршрута.",
        pseudoLine: 5,
        resultPreview: "Ветка не сработала, ищем альтернативу.",
        stateSnapshot: snapshot(currentPath, key),
      })
    );

    return false;
  }

  backtrack(start.row, start.col, []);

  steps.push(
    createStep({
      action: found ? "Путь найден" : "Путь не найден",
      why: found
        ? "Одна из веток backtracking дошла до конечной клетки."
        : "Все допустимые ветки перебраны, и ни одна не достигла финиша.",
      pseudoLine: found ? 3 : 5,
      resultPreview: `Ответ: ${found ? "Да" : "Нет"}.`,
      stateSnapshot: snapshot(answerPath),
    })
  );

  return {
    steps: finalizeSteps(steps),
    answer: found ? "Да" : "Нет",
    conclusion:
      "В лабиринте backtracking полезен, когда нужно именно пробовать и откатывать варианты, а не обязательно искать кратчайший путь.",
  };
}

export function runGenerateParentheses({ pairs }) {
  const steps = [];
  const results = [];

  function backtrack(current, open, close) {
    if (current.length === pairs * 2) {
      results.push(current);
      steps.push(
        createStep({
          action: `Получили корректную скобочную последовательность ${current}`,
          why: "Длина строки достигла 2n, а ограничения на открывающие и закрывающие скобки на каждом шаге уже гарантировали корректность.",
          pseudoLine: 2,
          resultPreview: `Найдено последовательностей: ${results.length}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "parentheses",
            current: current.split(""),
            choices: [
              { label: "(", state: open < pairs ? "visited" : "" },
              { label: ")", state: close < open ? "visited" : "" },
            ],
            results,
            panels: [
              panel("open", String(open)),
              panel("close", String(close)),
            ],
          }),
        })
      );
      return;
    }

    if (open < pairs) {
      steps.push(
        createStep({
          action: `Добавляем "(" к строке ${current}`,
          why: "Открывающую скобку можно ставить, пока их число меньше n.",
          pseudoLine: 3,
          resultPreview: `Новая строка: ${current}(`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "parentheses",
            current: `${current}(`.split(""),
            choices: [
              { label: "(", state: "current" },
              { label: ")", state: close < open ? "visited" : "" },
            ],
            results,
            panels: [
              panel("open", String(open + 1)),
              panel("close", String(close)),
            ],
          }),
        })
      );
      backtrack(`${current}(`, open + 1, close);
    }

    if (close < open) {
      steps.push(
        createStep({
          action: `Добавляем ")" к строке ${current}`,
          why: "Закрывающая скобка допустима только тогда, когда незакрытых открывающих больше нуля.",
          pseudoLine: 4,
          resultPreview: `Новая строка: ${current})`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "parentheses",
            current: `${current})`.split(""),
            choices: [
              { label: "(", state: open < pairs ? "visited" : "" },
              { label: ")", state: "current" },
            ],
            results,
            panels: [
              panel("open", String(open)),
              panel("close", String(close + 1)),
            ],
          }),
        })
      );
      backtrack(`${current})`, open, close + 1);
    }
  }

  backtrack("", 0, 0);
  return {
    steps: finalizeSteps(steps),
    answer: JSON.stringify(results),
    conclusion:
      "Backtracking отсеивает неправильные скобочные строки заранее: как только закрывающих стало бы больше, ветка вообще не порождается.",
  };
}

export function runCombinationSum({ candidates, target }) {
  const steps = [];
  const results = [];
  const sorted = [...candidates].sort((a, b) => a - b);

  function backtrack(index, current, remain) {
    if (remain === 0) {
      results.push([...current]);
      steps.push(
        createStep({
          action: `Нашли комбинацию [${current.join(", ")}]`,
          why: "Остаток стал равен нулю, значит выбранные числа точно дают целевую сумму.",
          pseudoLine: 2,
          resultPreview: `Всего найдено комбинаций: ${results.length}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: current.map(String),
            choices: sorted.map((value, currentIndex) => ({
              label: String(value),
              state: currentIndex === index ? "current" : "",
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("Остаток", String(remain)),
              panel("Цель", String(target)),
            ],
          }),
        })
      );
      return;
    }

    if (remain < 0 || index >= sorted.length) {
      steps.push(
        createStep({
          action: "Ветка отсечена",
          why: remain < 0
            ? "Сумма уже превысила цель, поэтому продолжать эту ветку бессмысленно."
            : "Числа закончились, а нужная сумма так и не собрана.",
          pseudoLine: 3,
          resultPreview: `Остаток: ${remain}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: current.map(String),
            choices: sorted.map((value) => ({
              label: String(value),
              state: "",
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("Остаток", String(remain)),
              panel("Текущая комбинация", `[${current.join(", ")}]`),
            ],
          }),
        })
      );
      return;
    }

    current.push(sorted[index]);
    steps.push(
      createStep({
        action: `Берём число ${sorted[index]}`,
        why: "Эта ветка пытается использовать текущее число ещё раз, потому что в задаче допускаются повторные взятия одного кандидата.",
        pseudoLine: 4,
        resultPreview: `Новый остаток будет ${remain - sorted[index]}.`,
        stateSnapshot: makeBacktrackingSnapshot({
          mode: "sequence",
          current: current.map(String),
          choices: sorted.map((value, currentIndex) => ({
            label: String(value),
            state: currentIndex === index ? "current" : "",
          })),
          results: results.map((item) => `[${item.join(", ")}]`),
          panels: [
            panel("Остаток", String(remain)),
            panel("После выбора", String(remain - sorted[index])),
          ],
        }),
      })
    );
    backtrack(index, current, remain - sorted[index]);
    current.pop();

    steps.push(
      createStep({
        action: `Пропускаем число ${sorted[index]} и идём дальше`,
        why: "После возврата нужно попробовать альтернативу: больше не брать это число и переключиться на следующий кандидат.",
        pseudoLine: 5,
        resultPreview: `Переходим к следующему индексу ${index + 1}.`,
        stateSnapshot: makeBacktrackingSnapshot({
          mode: "sequence",
          current: current.map(String),
          choices: sorted.map((value, currentIndex) => ({
            label: String(value),
            state: currentIndex < index ? "visited" : "",
          })),
          results: results.map((item) => `[${item.join(", ")}]`),
          panels: [
            panel("Остаток", String(remain)),
            panel("Следующий кандидат", String(sorted[index + 1] ?? "нет")),
          ],
        }),
      })
    );
    backtrack(index + 1, current, remain);
  }

  backtrack(0, [], target);
  return {
    steps: finalizeSteps(steps),
    answer: JSON.stringify(results),
    conclusion:
      "Комбинации суммы строятся backtracking-ом с отсечением: если остаток стал отрицательным, ветку можно немедленно закрывать.",
  };
}

export function runDijkstraAllToAll(config) {
  return runDijkstraCore(config);
}

export function runDijkstraToTarget(config) {
  return runDijkstraCore(config);
}

export function runBellmanFord(config) {
  return runBellmanFordCore(config);
}

export const runDfsFind = runFindInTree;
