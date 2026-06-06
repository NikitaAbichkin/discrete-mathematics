export const INF = Number.POSITIVE_INFINITY;

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createStep({
  action,
  why,
  pseudoLine = 1,
  resultPreview = "",
  stateSnapshot = {},
}) {
  return {
    action,
    why,
    pseudoLine,
    resultPreview,
    stateSnapshot,
  };
}

export function finalizeSteps(steps) {
  return steps.map((step, index) => ({
    stepNumber: index + 1,
    ...step,
  }));
}

export function coordKey(row, col) {
  return `${row},${col}`;
}

export function fromCoordKey(key) {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

export function formatCoord(row, col) {
  return `(${row}, ${col})`;
}

export function formatPath(path) {
  return path.join(" → ");
}

export function formatMaybeInfinity(value) {
  return Number.isFinite(value) ? String(value) : "∞";
}

export function unique(values) {
  return [...new Set(values)];
}

export function parseCoordText(text) {
  const parts = String(text)
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);

  if (parts.length !== 2 || parts.some(Number.isNaN)) {
    throw new Error("Координаты нужно вводить как row,col");
  }

  return { row: parts[0], col: parts[1] };
}

function tryJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

function sanitizeMatrixText(text) {
  return String(text)
    .replace(/\r/g, "\n")
    .replace(/\],\s*\[/g, "]\n[")
    .trim();
}

export function parseNumericMatrix(text) {
  const sanitized = sanitizeMatrixText(text);
  const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));

  if (Array.isArray(jsonCandidate)) {
    return jsonCandidate.map((row) => row.map((value) => Number(value)));
  }

  const rows = sanitized
    .split("\n")
    .map((line) => line.replace(/[\[\],]/g, " ").trim())
    .filter(Boolean)
    .map((line) =>
      line
        .split(/\s+/)
        .filter(Boolean)
        .map((token) => Number(token))
    );

  if (!rows.length || rows.some((row) => row.some(Number.isNaN))) {
    throw new Error("Не удалось распознать числовую матрицу.");
  }

  const width = rows[0].length;
  if (rows.some((row) => row.length !== width)) {
    throw new Error("У всех строк матрицы должна быть одинаковая длина.");
  }

  return rows;
}

export function parseTokenMatrix(text) {
  const sanitized = sanitizeMatrixText(text);
  const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));

  if (Array.isArray(jsonCandidate)) {
    return jsonCandidate.map((row) => row.map((value) => String(value)));
  }

  const rows = sanitized
    .split("\n")
    .map((line) => line.replace(/[\[\],"]/g, " ").trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/).filter(Boolean));

  if (!rows.length) {
    throw new Error("Не удалось распознать символьную матрицу.");
  }

  const width = rows[0].length;
  if (rows.some((row) => row.length !== width)) {
    throw new Error("У всех строк матрицы должна быть одинаковая длина.");
  }

  return rows;
}

export function parseListText(text, mapper = (value) => value) {
  const sanitized = String(text).trim();
  const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));

  if (Array.isArray(jsonCandidate)) {
    return jsonCandidate.map(mapper);
  }

  return sanitized
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(mapper);
}

export function parseTreeArray(text) {
  const sanitized = String(text).trim();
  const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));
  const raw = Array.isArray(jsonCandidate)
    ? jsonCandidate
    : sanitized
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(",")
        .map((token) => token.trim())
        .filter(Boolean);

  return raw.map((value) => {
    if (value === null) {
      return null;
    }

    const normalized = String(value).trim().toLowerCase();
    if (
      normalized === "null" ||
      normalized === "none" ||
      normalized === "-" ||
      normalized === "x" ||
      normalized === "пусто"
    ) {
      return null;
    }

    const numeric = Number(value);
    return Number.isNaN(numeric) ? String(value) : numeric;
  });
}

export function buildBinaryTree(values) {
  if (!values.length || values[0] === null) {
    return null;
  }

  const nodes = values.map((value, index) =>
    value === null
      ? null
      : {
          id: index,
          value,
          left: null,
          right: null,
        }
  );

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;

    node.left = nodes[leftIndex] ?? null;
    node.right = nodes[rightIndex] ?? null;
  }

  return nodes[0];
}

export function treeToLevelOrder(root) {
  if (!root) {
    return [];
  }

  const result = [];
  const queue = [root];

  while (queue.length) {
    const node = queue.shift();
    if (!node) {
      result.push(null);
      continue;
    }

    result.push(node.value);
    queue.push(node.left);
    queue.push(node.right);
  }

  while (result.length && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

export function serializeTree(root, decorators = {}) {
  if (!root) {
    return null;
  }

  const decorator = decorators[root.id] ?? {};
  return {
    id: root.id,
    value: root.value,
    state: decorator.state ?? "",
    note: decorator.note ?? "",
    left: serializeTree(root.left, decorators),
    right: serializeTree(root.right, decorators),
  };
}

export function parseEdgeList(text) {
  const lines = String(text)
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    throw new Error("Список рёбер пуст.");
  }

  return lines.map((line) => {
    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length < 3) {
      throw new Error(
        "Каждая строка графа должна содержать: от куда вес. Например: A B 4"
      );
    }

    const weight = Number(parts[2]);
    if (Number.isNaN(weight)) {
      throw new Error(`Не удалось распознать вес ребра в строке: ${line}`);
    }

    return {
      from: parts[0],
      to: parts[1],
      weight,
    };
  });
}

export function parseAdjacencyMatrix(text) {
  const matrix = parseNumericMatrix(text);
  const edges = [];

  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      const weight = matrix[row][col];
      if (row !== col && weight !== 0) {
        edges.push({
          from: String(row),
          to: String(col),
          weight,
        });
      }
    }
  }

  return { matrix, edges };
}

export function reconstructPath(parentMap, endKey) {
  const path = [];
  let current = endKey;

  while (current !== undefined && current !== null) {
    path.push(current);
    current = parentMap[current];
  }

  return path.reverse();
}

export function reconstructAllPaths(parentSets, start, end, limit = 10) {
  const paths = [];

  function dfs(current, suffix) {
    if (paths.length >= limit) {
      return;
    }

    if (current === start) {
      paths.push([start, ...suffix]);
      return;
    }

    const parents = [...(parentSets[current] ?? [])];
    for (const parent of parents) {
      dfs(parent, [current, ...suffix]);
    }
  }

  dfs(end, []);
  return paths;
}

export function buildGraphLayout(nodeIds) {
  const nodes = [...nodeIds].sort();
  const total = nodes.length || 1;
  const centerX = 340;
  const centerY = 190;
  const radius = Math.max(88, 120 + total * 6);

  return new Map(
    nodes.map((nodeId, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / total;
      return [
        nodeId,
        {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        },
      ];
    })
  );
}

export function isInside(grid, row, col) {
  return row >= 0 && col >= 0 && row < grid.length && col < grid[0].length;
}

export function neighbors4(row, col) {
  return [
    [row - 1, col],
    [row + 1, col],
    [row, col - 1],
    [row, col + 1],
  ];
}

export function knightOffsets() {
  return [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
}

export function toMatrixCells(grid, options = {}) {
  const {
    states = {},
    labels = {},
    formatValue = (value) => String(value),
  } = options;

  return grid.map((row, rowIndex) =>
    row.map((value, colIndex) => {
      const key = coordKey(rowIndex, colIndex);
      return {
        key,
        value: formatValue(value, rowIndex, colIndex),
        label: labels[key] ?? "",
        state: states[key] ?? "",
      };
    })
  );
}

export function makeMatrixSnapshot({
  grid,
  states,
  labels,
  panels = [],
  legend = [],
  formatValue,
  title = "",
}) {
  return {
    kind: "matrix",
    title,
    cells: toMatrixCells(grid, { states, labels, formatValue }),
    panels,
    legend,
  };
}

export function makeTraceSnapshot({ groups, panels = [], legend = [] }) {
  return {
    kind: "trace",
    groups,
    panels,
    legend,
  };
}

export function makeBacktrackingSnapshot({
  mode,
  current = [],
  choices = [],
  results = [],
  panels = [],
  board = null,
  legend = [],
}) {
  return {
    kind: "backtracking",
    mode,
    current,
    choices,
    results,
    panels,
    board,
    legend,
  };
}

export function makeGraphSnapshot({
  nodes,
  edges,
  panels = [],
  legend = [],
}) {
  return {
    kind: "graph",
    nodes,
    edges,
    panels,
    legend,
  };
}

export function makeTreeSnapshot({ tree, panels = [], legend = [] }) {
  return {
    kind: "tree",
    tree,
    panels,
    legend,
  };
}
