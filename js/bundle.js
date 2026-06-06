(() => {
  // js/helpers.js
  var INF = Number.POSITIVE_INFINITY;
  function createStep({
    action,
    why,
    pseudoLine = 1,
    resultPreview = "",
    stateSnapshot = {}
  }) {
    return {
      action,
      why,
      pseudoLine,
      resultPreview,
      stateSnapshot
    };
  }
  function finalizeSteps(steps) {
    return steps.map((step, index) => ({
      stepNumber: index + 1,
      ...step
    }));
  }
  function coordKey(row, col) {
    return `${row},${col}`;
  }
  function fromCoordKey(key) {
    const [row, col] = key.split(",").map(Number);
    return { row, col };
  }
  function formatCoord(row, col) {
    return `(${row}, ${col})`;
  }
  function formatPath(path) {
    return path.join(" \u2192 ");
  }
  function formatMaybeInfinity(value) {
    return Number.isFinite(value) ? String(value) : "\u221E";
  }
  function parseCoordText(text) {
    const parts = String(text).trim().split(/[,\s]+/).filter(Boolean).map(Number);
    if (parts.length !== 2 || parts.some(Number.isNaN)) {
      throw new Error("\u041A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u044B \u043D\u0443\u0436\u043D\u043E \u0432\u0432\u043E\u0434\u0438\u0442\u044C \u043A\u0430\u043A row,col");
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
    return String(text).replace(/\r/g, "\n").replace(/\],\s*\[/g, "]\n[").trim();
  }
  function parseNumericMatrix(text) {
    const sanitized = sanitizeMatrixText(text);
    const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));
    if (Array.isArray(jsonCandidate)) {
      return jsonCandidate.map((row) => row.map((value) => Number(value)));
    }
    const rows = sanitized.split("\n").map((line) => line.replace(/[\[\],]/g, " ").trim()).filter(Boolean).map(
      (line) => line.split(/\s+/).filter(Boolean).map((token) => Number(token))
    );
    if (!rows.length || rows.some((row) => row.some(Number.isNaN))) {
      throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u0447\u0438\u0441\u043B\u043E\u0432\u0443\u044E \u043C\u0430\u0442\u0440\u0438\u0446\u0443.");
    }
    const width = rows[0].length;
    if (rows.some((row) => row.length !== width)) {
      throw new Error("\u0423 \u0432\u0441\u0435\u0445 \u0441\u0442\u0440\u043E\u043A \u043C\u0430\u0442\u0440\u0438\u0446\u044B \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0430\u044F \u0434\u043B\u0438\u043D\u0430.");
    }
    return rows;
  }
  function parseTokenMatrix(text) {
    const sanitized = sanitizeMatrixText(text);
    const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));
    if (Array.isArray(jsonCandidate)) {
      return jsonCandidate.map((row) => row.map((value) => String(value)));
    }
    const rows = sanitized.split("\n").map((line) => line.replace(/[\[\],"]/g, " ").trim()).filter(Boolean).map((line) => line.split(/\s+/).filter(Boolean));
    if (!rows.length) {
      throw new Error("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u0441\u0438\u043C\u0432\u043E\u043B\u044C\u043D\u0443\u044E \u043C\u0430\u0442\u0440\u0438\u0446\u0443.");
    }
    const width = rows[0].length;
    if (rows.some((row) => row.length !== width)) {
      throw new Error("\u0423 \u0432\u0441\u0435\u0445 \u0441\u0442\u0440\u043E\u043A \u043C\u0430\u0442\u0440\u0438\u0446\u044B \u0434\u043E\u043B\u0436\u043D\u0430 \u0431\u044B\u0442\u044C \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0430\u044F \u0434\u043B\u0438\u043D\u0430.");
    }
    return rows;
  }
  function parseListText(text, mapper = (value) => value) {
    const sanitized = String(text).trim();
    const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));
    if (Array.isArray(jsonCandidate)) {
      return jsonCandidate.map(mapper);
    }
    return sanitized.split(/[\s,;]+/).filter(Boolean).map(mapper);
  }
  function parseTreeArray(text) {
    const sanitized = String(text).trim();
    const jsonCandidate = tryJsonParse(sanitized.replace(/'/g, '"'));
    const raw = Array.isArray(jsonCandidate) ? jsonCandidate : sanitized.replace(/^\[/, "").replace(/\]$/, "").split(",").map((token) => token.trim()).filter(Boolean);
    return raw.map((value) => {
      if (value === null) {
        return null;
      }
      const normalized = String(value).trim().toLowerCase();
      if (normalized === "null" || normalized === "none" || normalized === "-" || normalized === "x" || normalized === "\u043F\u0443\u0441\u0442\u043E") {
        return null;
      }
      const numeric = Number(value);
      return Number.isNaN(numeric) ? String(value) : numeric;
    });
  }
  function buildBinaryTree(values) {
    var _a, _b;
    if (!values.length || values[0] === null) {
      return null;
    }
    const nodes = values.map(
      (value, index) => value === null ? null : {
        id: index,
        value,
        left: null,
        right: null
      }
    );
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      if (!node) {
        continue;
      }
      const leftIndex = index * 2 + 1;
      const rightIndex = index * 2 + 2;
      node.left = (_a = nodes[leftIndex]) != null ? _a : null;
      node.right = (_b = nodes[rightIndex]) != null ? _b : null;
    }
    return nodes[0];
  }
  function treeToLevelOrder(root) {
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
  function serializeTree(root, decorators = {}) {
    var _a, _b, _c;
    if (!root) {
      return null;
    }
    const decorator = (_a = decorators[root.id]) != null ? _a : {};
    return {
      id: root.id,
      value: root.value,
      state: (_b = decorator.state) != null ? _b : "",
      note: (_c = decorator.note) != null ? _c : "",
      left: serializeTree(root.left, decorators),
      right: serializeTree(root.right, decorators)
    };
  }
  function parseEdgeList(text) {
    const lines = String(text).replace(/\r/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) {
      throw new Error("\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440 \u043F\u0443\u0441\u0442.");
    }
    return lines.map((line) => {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length < 3) {
        throw new Error(
          "\u041A\u0430\u0436\u0434\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430 \u0433\u0440\u0430\u0444\u0430 \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441. \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A B 4"
        );
      }
      const weight = Number(parts[2]);
      if (Number.isNaN(weight)) {
        throw new Error(`\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0442\u044C \u0432\u0435\u0441 \u0440\u0435\u0431\u0440\u0430 \u0432 \u0441\u0442\u0440\u043E\u043A\u0435: ${line}`);
      }
      return {
        from: parts[0],
        to: parts[1],
        weight
      };
    });
  }
  function parseAdjacencyMatrix(text) {
    const matrix = parseNumericMatrix(text);
    const edges = [];
    for (let row = 0; row < matrix.length; row += 1) {
      for (let col = 0; col < matrix[row].length; col += 1) {
        const weight = matrix[row][col];
        if (row !== col && weight !== 0) {
          edges.push({
            from: String(row),
            to: String(col),
            weight
          });
        }
      }
    }
    return { matrix, edges };
  }
  function reconstructPath(parentMap, endKey) {
    const path = [];
    let current = endKey;
    while (current !== void 0 && current !== null) {
      path.push(current);
      current = parentMap[current];
    }
    return path.reverse();
  }
  function reconstructAllPaths(parentSets, start, end, limit = 10) {
    const paths = [];
    function dfs(current, suffix) {
      var _a;
      if (paths.length >= limit) {
        return;
      }
      if (current === start) {
        paths.push([start, ...suffix]);
        return;
      }
      const parents = [...(_a = parentSets[current]) != null ? _a : []];
      for (const parent of parents) {
        dfs(parent, [current, ...suffix]);
      }
    }
    dfs(end, []);
    return paths;
  }
  function buildGraphLayout(nodeIds) {
    const nodes = [...nodeIds].sort();
    const total = nodes.length || 1;
    const centerX = 340;
    const centerY = 190;
    const radius = Math.max(88, 120 + total * 6);
    return new Map(
      nodes.map((nodeId, index) => {
        const angle = -Math.PI / 2 + Math.PI * 2 * index / total;
        return [
          nodeId,
          {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          }
        ];
      })
    );
  }
  function isInside(grid, row, col) {
    return row >= 0 && col >= 0 && row < grid.length && col < grid[0].length;
  }
  function neighbors4(row, col) {
    return [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ];
  }
  function knightOffsets() {
    return [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1]
    ];
  }
  function toMatrixCells(grid, options = {}) {
    const {
      states = {},
      labels = {},
      formatValue = (value) => String(value)
    } = options;
    return grid.map(
      (row, rowIndex) => row.map((value, colIndex) => {
        var _a, _b;
        const key = coordKey(rowIndex, colIndex);
        return {
          key,
          value: formatValue(value, rowIndex, colIndex),
          label: (_a = labels[key]) != null ? _a : "",
          state: (_b = states[key]) != null ? _b : ""
        };
      })
    );
  }
  function makeMatrixSnapshot({
    grid,
    states,
    labels,
    panels = [],
    legend = [],
    formatValue,
    title = ""
  }) {
    return {
      kind: "matrix",
      title,
      cells: toMatrixCells(grid, { states, labels, formatValue }),
      panels,
      legend
    };
  }
  function makeTraceSnapshot({ groups, panels = [], legend = [] }) {
    return {
      kind: "trace",
      groups,
      panels,
      legend
    };
  }
  function makeBacktrackingSnapshot({
    mode,
    current = [],
    choices = [],
    results = [],
    panels = [],
    board = null,
    legend = []
  }) {
    return {
      kind: "backtracking",
      mode,
      current,
      choices,
      results,
      panels,
      board,
      legend
    };
  }
  function makeGraphSnapshot({
    nodes,
    edges,
    panels = [],
    legend = []
  }) {
    return {
      kind: "graph",
      nodes,
      edges,
      panels,
      legend
    };
  }
  function makeTreeSnapshot({ tree, panels = [], legend = [] }) {
    return {
      kind: "tree",
      tree,
      panels,
      legend
    };
  }

  // js/algorithms.js
  var PSEUDOCODE = {
    bfsGrid: [
      "queue \u2190 [start], visited \u2190 {start}, distance[start] \u2190 0",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  current \u2190 queue.pop_front()",
      "  \u0435\u0441\u043B\u0438 current \u2014 \u0446\u0435\u043B\u044C: \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u0443\u0442\u044C \u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C",
      "  \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0441\u043E\u0441\u0435\u0434\u0430 current:",
      "    \u0435\u0441\u043B\u0438 \u0441\u043E\u0441\u0435\u0434 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C \u0438 \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0451\u043D:",
      "      visited.add(\u0441\u043E\u0441\u0435\u0434), parent[\u0441\u043E\u0441\u0435\u0434] \u2190 current",
      "      distance[\u0441\u043E\u0441\u0435\u0434] \u2190 distance[current] + 1, queue.push(\u0441\u043E\u0441\u0435\u0434)"
    ],
    knight: [
      "queue \u2190 [start], visited \u2190 {start}",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  current \u2190 queue.pop_front()",
      "  \u0435\u0441\u043B\u0438 current = target: \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u0430\u0440\u0448\u0440\u0443\u0442",
      "  \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0445\u043E\u0434\u0430 \u043A\u043E\u043D\u044F \u0438\u0437 8 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u043E\u0432:",
      "    \u0435\u0441\u043B\u0438 \u043A\u043B\u0435\u0442\u043A\u0430 \u043D\u0430 \u0434\u043E\u0441\u043A\u0435 \u0438 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0430: \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 queue"
    ],
    rottenOranges: [
      "queue \u2190 \u0432\u0441\u0435 \u0433\u043D\u0438\u043B\u044B\u0435 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u044B \u0441 \u0432\u0440\u0435\u043C\u0435\u043D\u0435\u043C 0",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  current, minute \u2190 queue.pop_front()",
      "  \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0433\u043E \u0441\u0432\u0435\u0436\u0435\u0433\u043E \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430:",
      "    \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0435\u0433\u043E \u0433\u043D\u0438\u043B\u044B\u043C \u0438 \u043F\u043E\u043B\u043E\u0436\u0438\u0442\u044C \u0432 queue \u0441 minute + 1",
      "\u0435\u0441\u043B\u0438 \u0441\u0432\u0435\u0436\u0438\u0435 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u044B \u043E\u0441\u0442\u0430\u043B\u0438\u0441\u044C: \u043E\u0442\u0432\u0435\u0442 -1, \u0438\u043D\u0430\u0447\u0435 \u043E\u0442\u0432\u0435\u0442 = max(minute)"
    ],
    wordLadder: [
      "queue \u2190 [start], visited \u2190 {start}",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  word \u2190 queue.pop_front()",
      "  \u0435\u0441\u043B\u0438 word = target: \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0446\u0435\u043F\u043E\u0447\u043A\u0443",
      "  \u043F\u0435\u0440\u0435\u0431\u0440\u0430\u0442\u044C \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0441\u043B\u043E\u0432\u0430, \u043E\u0442\u043B\u0438\u0447\u0430\u044E\u0449\u0438\u0435\u0441\u044F \u043D\u0430 1 \u0441\u0438\u043C\u0432\u043E\u043B",
      "  \u043A\u0430\u0436\u0434\u043E\u0435 \u043D\u043E\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 queue"
    ],
    nearestExit: [
      "queue \u2190 [start], visited \u2190 {start}",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  current \u2190 queue.pop_front()",
      "  \u0435\u0441\u043B\u0438 current \u2014 \u0432\u044B\u0445\u043E\u0434 \u043D\u0430 \u0433\u0440\u0430\u043D\u0438\u0446\u0435 \u0438 \u044D\u0442\u043E \u043D\u0435 \u0441\u0442\u0430\u0440\u0442: \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C",
      "  \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432\u0441\u0435\u0445 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0445 \u0441\u043E\u0441\u0435\u0434\u0435\u0439 \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 BFS"
    ],
    wordSearch: [
      "dfs(cell, index):",
      "  \u0435\u0441\u043B\u0438 \u0431\u0443\u043A\u0432\u0430 \u0432 cell \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u043B\u0430 \u0441 word[index]: \u0432\u0435\u0440\u043D\u0443\u0442\u044C false",
      "  \u0435\u0441\u043B\u0438 index = word.length - 1: \u0432\u0435\u0440\u043D\u0443\u0442\u044C true",
      "  \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C cell \u043A\u0430\u043A \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u043D\u0443\u044E",
      "  \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C 4 \u0441\u043E\u0441\u0435\u0434\u0435\u0439",
      "  \u0441\u043D\u044F\u0442\u044C \u043E\u0442\u043C\u0435\u0442\u043A\u0443 \u0438 \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442"
    ],
    islands: [
      "count \u2190 0",
      "\u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0439 \u043A\u043B\u0435\u0442\u043A\u0438 \u043C\u0430\u0442\u0440\u0438\u0446\u044B:",
      "  \u0435\u0441\u043B\u0438 \u0442\u0430\u043C \u0437\u0435\u043C\u043B\u044F \u0438 \u043E\u043D\u0430 \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0430:",
      "    count \u2190 count + 1",
      "    \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C BFS \u043F\u043E \u044D\u0442\u043E\u0439 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0435",
      "\u043F\u043E\u0441\u043B\u0435 \u043E\u0431\u0445\u043E\u0434\u0430 \u0432\u0441\u0435\u0445 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0432\u0435\u0440\u043D\u0443\u0442\u044C count"
    ],
    shortestBridge: [
      "\u043D\u0430\u0439\u0442\u0438 \u043F\u0435\u0440\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432 \u0438 \u043F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u0432\u0441\u0435 \u0435\u0433\u043E \u043A\u043B\u0435\u0442\u043A\u0438",
      "queue \u2190 \u0432\u0441\u0435 \u043A\u043B\u0435\u0442\u043A\u0438 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  \u0432\u0437\u044F\u0442\u044C \u043A\u043B\u0435\u0442\u043A\u0443 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0441\u043B\u043E\u044F \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F",
      "  \u0435\u0441\u043B\u0438 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442 \u0432\u0442\u043E\u0440\u043E\u0439 \u043E\u0441\u0442\u0440\u043E\u0432: \u043E\u0442\u0432\u0435\u0442 = \u0434\u043B\u0438\u043D\u0430 \u0441\u043B\u043E\u044F",
      "  \u0438\u043D\u0430\u0447\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0438\u0442\u044C\u0441\u044F \u043D\u0430 \u0441\u043E\u0441\u0435\u0434\u043D\u044E\u044E \u0432\u043E\u0434\u0443"
    ],
    lock: [
      "queue \u2190 [start], visited \u2190 {start}",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  code \u2190 queue.pop_front()",
      "  \u0435\u0441\u043B\u0438 code = target: \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u0443\u0442\u044C",
      "  \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C 8 \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u0445 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0439 (+1/-1 \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0439 \u0446\u0438\u0444\u0440\u044B)",
      "  \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u0435 \u0438 \u043D\u043E\u0432\u044B\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 queue"
    ],
    evacuation: [
      "queue \u2190 \u0432\u0441\u0435 \u0432\u044B\u0445\u043E\u0434\u044B E \u0441 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C 0",
      "\u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C BFS \u043E\u0442 \u0432\u0441\u0435\u0445 \u0432\u044B\u0445\u043E\u0434\u043E\u0432 \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E",
      "\u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u043A\u0430\u0436\u0434\u043E\u0439 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u043E\u0439 \u043A\u043B\u0435\u0442\u043A\u0438",
      "\u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0434\u043B\u044F \u0432\u0441\u0435\u0445 \u0441\u0442\u0430\u0440\u0442\u043E\u0432 S",
      "\u0435\u0441\u043B\u0438 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u0438\u043D S \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C: \u043E\u0442\u0432\u0435\u0442 -1, \u0438\u043D\u0430\u0447\u0435 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439"
    ],
    snowball: [
      "queue \u2190 [1], visited \u2190 {1}",
      "\u043F\u043E\u043A\u0430 queue \u043D\u0435 \u043F\u0443\u0441\u0442\u0430:",
      "  current \u2190 queue.pop_front()",
      "  \u0435\u0441\u043B\u0438 current = N: \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u0443\u0442\u044C",
      "  \u0434\u043B\u044F \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \xD72, \xD73 \u0438 +1 \u043F\u043E\u0440\u043E\u0434\u0438\u0442\u044C \u043D\u043E\u0432\u044B\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F",
      "  \u0435\u0441\u043B\u0438 \u043D\u043E\u0432\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u2264 N \u0438 \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u043E: \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 queue"
    ],
    dfsPreorder: [
      "dfs(node):",
      "  \u0435\u0441\u043B\u0438 node = null: return",
      "  \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C node.value \u0432 \u043E\u0442\u0432\u0435\u0442",
      "  dfs(node.left)",
      "  dfs(node.right)"
    ],
    dfsSum: [
      "dfs(node):",
      "  \u0435\u0441\u043B\u0438 node = null: return 0",
      "  leftSum \u2190 dfs(node.left)",
      "  rightSum \u2190 dfs(node.right)",
      "  return node.value + leftSum + rightSum"
    ],
    dfsDepth: [
      "dfs(node, depth):",
      "  \u0435\u0441\u043B\u0438 node = null: return",
      "  \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0433\u043B\u0443\u0431\u0438\u043D\u0443",
      "  dfs(node.left, depth + 1)",
      "  dfs(node.right, depth + 1)"
    ],
    dfsMirror: [
      "dfs(node):",
      "  \u0435\u0441\u043B\u0438 node = null: return",
      "  \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C \u043C\u0435\u0441\u0442\u0430\u043C\u0438 node.left \u0438 node.right",
      "  dfs(node.left)",
      "  dfs(node.right)"
    ],
    dfsFind: [
      "dfs(node):",
      "  \u0435\u0441\u043B\u0438 node = null: return false",
      "  \u0435\u0441\u043B\u0438 node.value = target: return true",
      "  \u0432\u0435\u0440\u043D\u0443\u0442\u044C dfs(node.left) \u0438\u043B\u0438 dfs(node.right)"
    ],
    dfsMaze: [
      "dfs(cell):",
      "  \u0435\u0441\u043B\u0438 cell \u2014 \u0446\u0435\u043B\u044C: \u0432\u0435\u0440\u043D\u0443\u0442\u044C true",
      "  \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C cell \u043A\u0430\u043A \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u0443\u044E",
      "  \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0445 \u0441\u043E\u0441\u0435\u0434\u0435\u0439",
      "  \u0435\u0441\u043B\u0438 \u043D\u0438\u043A\u0442\u043E \u043D\u0435 \u043F\u0440\u0438\u0432\u0451\u043B \u043A \u0446\u0435\u043B\u0438: \u043E\u0442\u043A\u0430\u0442\u0438\u0442\u044C\u0441\u044F"
    ],
    dijkstra: [
      "distance[start] \u2190 0, \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u2190 \u221E",
      "\u043F\u043E\u043A\u0430 \u0435\u0441\u0442\u044C \u043D\u0435\u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u0441 \u043A\u043E\u043D\u0435\u0447\u043D\u043E\u0439 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C\u044E:",
      "  current \u2190 \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u0441 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u043C distance",
      "  \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0440\u0435\u0431\u0440\u0430 current \u2192 neighbor:",
      "    candidate \u2190 distance[current] + weight",
      "    \u0435\u0441\u043B\u0438 candidate < distance[neighbor]: \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C distance \u0438 parent",
      "\u043F\u043E\u0441\u043B\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u0443\u0442\u044C \u043F\u043E parent"
    ],
    bellmanFord: [
      "distance[start] \u2190 0, \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u2190 \u221E",
      "\u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C |V| - 1 \u0440\u0430\u0437:",
      "  \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0440\u0435\u0431\u0440\u0430 u \u2192 v \u0441 \u0432\u0435\u0441\u043E\u043C w:",
      "    \u0435\u0441\u043B\u0438 distance[u] + w < distance[v]: \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C distance[v]",
      "\u0435\u0449\u0451 \u043E\u0434\u0438\u043D \u043F\u0440\u043E\u0445\u043E\u0434 \u043F\u043E \u0440\u0451\u0431\u0440\u0430\u043C:",
      "  \u0435\u0441\u043B\u0438 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u2014 \u043D\u0430\u0439\u0434\u0435\u043D \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B"
    ],
    permutations: [
      "backtrack(path):",
      "  \u0435\u0441\u043B\u0438 \u0434\u043B\u0438\u043D\u0430 path = \u0434\u043B\u0438\u043D\u0435 \u043C\u0430\u0441\u0441\u0438\u0432\u0430: \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443",
      "  \u043F\u0435\u0440\u0435\u0431\u0440\u0430\u0442\u044C \u043A\u0430\u0436\u0434\u043E\u0435 \u0447\u0438\u0441\u043B\u043E, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0435\u0449\u0451 \u043D\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u043E",
      "  \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0447\u0438\u0441\u043B\u043E \u0432 path, \u0443\u0439\u0442\u0438 \u0433\u043B\u0443\u0431\u0436\u0435, \u0437\u0430\u0442\u0435\u043C \u043E\u0442\u043A\u0430\u0442\u0438\u0442\u044C\u0441\u044F"
    ],
    subsets: [
      "backtrack(index, subset):",
      "  \u0435\u0441\u043B\u0438 index = n: \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0435\u0435 subset",
      "  \u0438\u043D\u0430\u0447\u0435 \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C nums[index], \u043F\u043E\u0442\u043E\u043C \u0438\u0441\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0435\u0433\u043E"
    ],
    backtrackingMaze: [
      "backtrack(cell):",
      "  \u0435\u0441\u043B\u0438 cell \u2014 \u0444\u0438\u043D\u0438\u0448: \u0432\u0435\u0440\u043D\u0443\u0442\u044C true",
      "  \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C cell \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u043F\u0443\u0442\u0438",
      "  \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0441\u043E\u0441\u0435\u0434\u0430",
      "  \u0435\u0441\u043B\u0438 \u0441\u043E\u0441\u0435\u0434 \u043D\u0435 \u043F\u0440\u0438\u0432\u0451\u043B \u043A \u0446\u0435\u043B\u0438: \u0441\u043D\u044F\u0442\u044C cell \u0438\u0437 \u043F\u0443\u0442\u0438 \u0438 \u043E\u0442\u043A\u0430\u0442\u0438\u0442\u044C\u0441\u044F"
    ],
    parentheses: [
      "backtrack(current, open, close):",
      "  \u0435\u0441\u043B\u0438 \u0434\u043B\u0438\u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0438 = 2n: \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044E",
      "  \u0435\u0441\u043B\u0438 open < n: \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C '('",
      "  \u0435\u0441\u043B\u0438 close < open: \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C ')'"
    ],
    combinationSum: [
      "backtrack(index, current, remain):",
      "  \u0435\u0441\u043B\u0438 remain = 0: \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044E",
      "  \u0435\u0441\u043B\u0438 remain < 0 \u0438\u043B\u0438 index \u0432\u043D\u0435 \u043C\u0430\u0441\u0441\u0438\u0432\u0430: \u043E\u0442\u043A\u0430\u0442",
      "  \u043C\u043E\u0436\u043D\u043E \u0432\u0437\u044F\u0442\u044C candidates[index] \u0435\u0449\u0451 \u0440\u0430\u0437",
      "  \u0438\u043B\u0438 \u043F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C\u0443 \u0447\u0438\u0441\u043B\u0443"
    ]
  };
  var GRID_LEGEND = [
    { label: "\u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0441\u0435\u0439\u0447\u0430\u0441", color: "#265df2" },
    { label: "\u0416\u0434\u0451\u0442 \u0434\u0430\u043B\u044C\u0448\u0435", color: "#d78d0f" },
    { label: "\u0423\u0436\u0435 \u0431\u044B\u043B\u0438", color: "#8eb4ff" },
    { label: "\u0413\u043E\u0442\u043E\u0432\u044B\u0439 \u043F\u0443\u0442\u044C", color: "#0f9d77" }
  ];
  var GRAPH_LEGEND = [
    { label: "\u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0441\u0435\u0439\u0447\u0430\u0441", color: "#265df2" },
    { label: "\u0423\u0436\u0435 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0438", color: "#8eb4ff" },
    { label: "\u0413\u043E\u0442\u043E\u0432\u044B\u0439 \u043F\u0443\u0442\u044C", color: "#0f9d77" }
  ];
  var TREE_LEGEND = [
    { label: "\u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0441\u0435\u0439\u0447\u0430\u0441", color: "#265df2" },
    { label: "\u0423\u0436\u0435 \u043F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0438", color: "#0f9d77" },
    { label: "\u0412\u0430\u0436\u043D\u043E", color: "#d78d0f" }
  ];
  function panel(label, value) {
    return { label, value };
  }
  function formatCoordPath(keys) {
    return keys.map((key) => {
      const { row, col } = fromCoordKey(key);
      return formatCoord(row, col);
    }).join(" \u2192 ");
  }
  function formatQueueCoords(queue) {
    return queue.length ? queue.map((item) => formatCoord(item.row, item.col)).join(" \u2192 ") : "\u043E\u0447\u0435\u0440\u0435\u0434\u044C \u043F\u0443\u0441\u0442\u0430";
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
  function enrichGridStates(states, { keys = [], state: state2 }) {
    for (const key of keys) {
      states[key] = state2;
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
    title
  }) {
    const states = buildBaseStates(grid, wallPredicate != null ? wallPredicate : ((value) => value === 1));
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
      formatValue: (value) => String(value)
    });
  }
  function buildChessSnapshot({
    current,
    start,
    end,
    frontier,
    visited,
    path,
    panels
  }) {
    const board = Array.from(
      { length: 8 },
      (_, row) => Array.from({ length: 8 }, (_2, col) => (row + col) % 2)
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
      title: "\u0428\u0430\u0445\u043C\u0430\u0442\u043D\u0430\u044F \u0434\u043E\u0441\u043A\u0430",
      formatValue: (_, row, col) => `${String.fromCharCode(65 + col)}${8 - row}`
    });
  }
  function buildTraceGroups(groups) {
    return groups.map((group) => ({
      label: group.label,
      items: group.items.map((item) => {
        var _a;
        return {
          label: item.label,
          value: item.value,
          state: (_a = item.state) != null ? _a : ""
        };
      })
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
    processed = /* @__PURE__ */ new Set(),
    pathNodes = [],
    activeEdge = null,
    failureNodes = [],
    extraPanels = []
  }) {
    const layout = buildGraphLayout(nodeIds);
    const pathNodeSet = new Set(pathNodes);
    const failureNodeSet = new Set(failureNodes);
    const nodes = [...nodeIds].sort().map((nodeId) => {
      var _a;
      const position = layout.get(nodeId);
      let state2 = "";
      if (processed.has(nodeId)) {
        state2 = "visited";
      }
      if (pathNodeSet.has(nodeId)) {
        state2 = "path";
      }
      if (failureNodeSet.has(nodeId)) {
        state2 = "failure";
      }
      if (nodeId === current) {
        state2 = "current";
      }
      return {
        id: nodeId,
        label: nodeId,
        state: state2,
        x: position.x,
        y: position.y,
        meta: formatMaybeInfinity((_a = distances[nodeId]) != null ? _a : INF)
      };
    });
    const renderedEdges = edges.map((edge) => ({
      ...edge,
      state: activeEdge && activeEdge.from === edge.from && activeEdge.to === edge.to && activeEdge.weight === edge.weight ? "active" : pathNodeSet.has(edge.from) && pathNodeSet.has(edge.to) ? "path" : ""
    }));
    const distSummary = [...nodeIds].sort().map((nodeId) => {
      var _a;
      return `${nodeId}:${formatMaybeInfinity((_a = distances[nodeId]) != null ? _a : INF)}`;
    }).join(" | ");
    return makeGraphSnapshot({
      nodes,
      edges: renderedEdges,
      panels: [
        panel("\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430", current != null ? current : "\u2014"),
        panel(
          "\u0423\u0436\u0435 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E",
          [...processed].sort().join(" \u2192 ") || "\u043F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E"
        ),
        panel("\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439", distSummary),
        ...extraPanels
      ],
      legend: GRAPH_LEGEND
    });
  }
  function buildTreeSnapshotFromDecorators(root, decorators, panels = []) {
    return makeTreeSnapshot({
      tree: serializeTree(root, decorators),
      panels,
      legend: TREE_LEGEND
    });
  }
  function allGridKeys(queue) {
    return queue.map(({ row, col }) => coordKey(row, col));
  }
  function runBfsMazeShortest({ grid, start, end }) {
    if (!isInside(grid, start.row, start.col) || !isInside(grid, end.row, end.col)) {
      throw new Error("\u0421\u0442\u0430\u0440\u0442 \u0438 \u0444\u0438\u043D\u0438\u0448 \u0434\u043E\u043B\u0436\u043D\u044B \u043B\u0435\u0436\u0430\u0442\u044C \u0432\u043D\u0443\u0442\u0440\u0438 \u043C\u0430\u0442\u0440\u0438\u0446\u044B.");
    }
    if (grid[start.row][start.col] === 1 || grid[end.row][end.col] === 1) {
      throw new Error("\u0421\u0442\u0430\u0440\u0442 \u0438 \u0444\u0438\u043D\u0438\u0448 \u043D\u0435 \u043C\u043E\u0433\u0443\u0442 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u044C\u0441\u044F \u0432 \u0441\u0442\u0435\u043D\u0435.");
    }
    const queue = [{ row: start.row, col: start.col }];
    const visited = /* @__PURE__ */ new Set([coordKey(start.row, start.col)]);
    const parent = {};
    const distance = { [coordKey(start.row, start.col)]: 0 };
    const steps = [
      createStep({
        action: `\u0421\u0442\u0430\u0440\u0442\u0443\u0435\u043C \u0438\u0437 \u043A\u043B\u0435\u0442\u043A\u0438 ${formatCoord(start.row, start.col)}`,
        why: "\u0412 BFS \u043C\u044B \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0441 \u0438\u0441\u0445\u043E\u0434\u043D\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u0438 \u0441\u0442\u0440\u043E\u0438\u043C \u0441\u043B\u043E\u0438 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u043E\u0442 \u043D\u0435\u0451.",
        pseudoLine: 1,
        resultPreview: `\u0412 \u043E\u0447\u0435\u0440\u0435\u0434\u044C \u043F\u043E\u043C\u0435\u0449\u0435\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 ${formatCoord(
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
            panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
            panel("\u0426\u0435\u043B\u044C", formatCoord(end.row, end.col))
          ],
          title: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u0441\u043B\u043E\u0439 BFS"
        })
      })
    ];
    let foundKey = null;
    while (queue.length) {
      const current = queue.shift();
      const currentKey = coordKey(current.row, current.col);
      steps.push(
        createStep({
          action: `\u0418\u0437\u0432\u043B\u0435\u043A\u0430\u0435\u043C ${formatCoord(current.row, current.col)} \u0438\u0437 \u043E\u0447\u0435\u0440\u0435\u0434\u0438`,
          why: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u0443\u0435\u0442 \u043E\u0431\u0445\u043E\u0434 \u043F\u043E \u0441\u043B\u043E\u044F\u043C: \u0432\u0441\u0451, \u0447\u0442\u043E \u0434\u043E\u0441\u0442\u0430\u0451\u043C \u0441\u0435\u0439\u0447\u0430\u0441, \u0438\u043C\u0435\u0435\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0441\u0440\u0435\u0434\u0438 \u0435\u0449\u0451 \u043D\u0435 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0445 \u043A\u043B\u0435\u0442\u043E\u043A.",
          pseudoLine: 3,
          resultPreview: `\u0414\u043E \u043A\u043B\u0435\u0442\u043A\u0438 ${formatCoord(
            current.row,
            current.col
          )} \u0443\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 ${distance[currentKey]}.`,
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            end,
            current,
            frontier: allGridKeys(queue),
            visited: [...visited],
            panels: [
              panel("\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E current", String(distance[currentKey])),
              panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue))
            ],
            title: "\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 \u0441\u043B\u043E\u044F"
          })
        })
      );
      if (current.row === end.row && current.col === end.col) {
        foundKey = currentKey;
        const pathKeys = reconstructPath(parent, foundKey);
        steps.push(
          createStep({
            action: "\u0426\u0435\u043B\u044C \u043D\u0430\u0439\u0434\u0435\u043D\u0430",
            why: "\u0412 BFS \u043F\u0435\u0440\u0432\u0430\u044F \u0432\u0441\u0442\u0440\u0435\u0447\u0430 \u0441 \u0444\u0438\u043D\u0438\u0448\u0435\u043C \u0443\u0436\u0435 \u0434\u0430\u0451\u0442 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u043C\u044B \u0434\u043E\u0448\u043B\u0438 \u0434\u043E \u043D\u0435\u0433\u043E \u043D\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u043C \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u043C \u0441\u043B\u043E\u0435.",
            pseudoLine: 4,
            resultPreview: `\u041A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 ${pathKeys.length - 1} \u0448\u0430\u0433(\u043E\u0432): ${formatCoordPath(pathKeys)}.`,
            stateSnapshot: buildMazeSnapshot({
              grid,
              start,
              end,
              current,
              frontier: [],
              visited: [...visited],
              path: pathKeys,
              panels: [
                panel("\u0414\u043B\u0438\u043D\u0430 \u043F\u0443\u0442\u0438", String(pathKeys.length - 1)),
                panel("\u041C\u0430\u0440\u0448\u0440\u0443\u0442", formatCoordPath(pathKeys))
              ],
              title: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442"
            })
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
            action: `\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C \u0441\u043E\u0441\u0435\u0434\u0430 ${formatCoord(nextRow, nextCol)} \u0432 \u043E\u0447\u0435\u0440\u0435\u0434\u044C`,
            why: "\u042D\u0442\u0430 \u043A\u043B\u0435\u0442\u043A\u0430 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u0430 \u0437\u0430 \u043E\u0434\u0438\u043D \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0448\u0430\u0433 \u043E\u0442 current, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043C\u044B \u043F\u043E\u043C\u0435\u0449\u0430\u0435\u043C \u0435\u0451 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 BFS \u0438 \u0437\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043F\u0440\u0435\u0434\u043A\u0430 \u0434\u043B\u044F \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430.",
            pseudoLine: 7,
            resultPreview: `\u0422\u0435\u043F\u0435\u0440\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E ${formatCoord(
              nextRow,
              nextCol
            )} \u0440\u0430\u0432\u043D\u043E ${distance[nextKey]}.`,
            stateSnapshot: buildMazeSnapshot({
              grid,
              start,
              end,
              current,
              frontier: allGridKeys(queue),
              visited: [...visited],
              labels: { [nextKey]: `d=${distance[nextKey]}` },
              panels: [
                panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
                panel("\u041F\u0440\u0435\u0434\u043E\u043A \u0441\u043E\u0441\u0435\u0434\u0430", formatCoord(current.row, current.col))
              ],
              title: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u0444\u0440\u043E\u043D\u0442\u0430 BFS"
            })
          })
        );
      }
    }
    if (!foundKey) {
      steps.push(
        createStep({
          action: "\u041F\u0443\u0442\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D",
          why: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C \u043E\u043F\u0443\u0441\u0442\u0435\u043B\u0430, \u0437\u043D\u0430\u0447\u0438\u0442 \u0432\u0441\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438 \u0443\u0436\u0435 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u044B, \u0430 \u0444\u0438\u043D\u0438\u0448 \u0441\u0440\u0435\u0434\u0438 \u043D\u0438\u0445 \u043D\u0435 \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u043B\u0441\u044F.",
          pseudoLine: 2,
          resultPreview: "\u041E\u0442\u0432\u0435\u0442: -1, \u043F\u0440\u043E\u0439\u0442\u0438 \u0434\u043E \u0444\u0438\u043D\u0438\u0448\u0430 \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E.",
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            end,
            frontier: [],
            visited: [...visited],
            panels: [
              panel("\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u043E \u043A\u043B\u0435\u0442\u043E\u043A", String(visited.size)),
              panel("\u041E\u0442\u0432\u0435\u0442", "-1")
            ],
            title: "\u041D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0439 \u0444\u0438\u043D\u0438\u0448"
          })
        })
      );
    }
    return {
      steps: finalizeSteps(steps),
      answer: foundKey ? String(reconstructPath(parent, foundKey).length - 1) : "-1",
      conclusion: foundKey ? "BFS \u0434\u0430\u043B \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u043A\u043B\u0435\u0442\u043A\u0438 \u043E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u043B\u0438\u0441\u044C \u043F\u043E \u0441\u043B\u043E\u044F\u043C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u043E\u0442 \u0441\u0442\u0430\u0440\u0442\u0430." : "BFS \u0434\u043E\u043A\u0430\u0437\u0430\u043B \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C: \u0432\u0441\u0435 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438 \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u044B, \u0430 \u0444\u0438\u043D\u0438\u0448 \u0442\u0430\u043A \u0438 \u043D\u0435 \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u043B\u0441\u044F."
    };
  }
  function runKnightMoves({ start, end }) {
    const queue = [{ row: start.row, col: start.col }];
    const visited = /* @__PURE__ */ new Set([coordKey(start.row, start.col)]);
    const parent = {};
    const distance = { [coordKey(start.row, start.col)]: 0 };
    const steps = [
      createStep({
        action: `\u041A\u043E\u043D\u044C \u0441\u0442\u0430\u0440\u0442\u0443\u0435\u0442 \u0438\u0437 \u043A\u043B\u0435\u0442\u043A\u0438 ${formatCoord(start.row, start.col)}`,
        why: "\u041F\u043E\u0438\u0441\u043A \u0432 \u0448\u0438\u0440\u0438\u043D\u0443 \u043F\u043E \u043A\u043B\u0435\u0442\u043A\u0430\u043C \u0434\u043E\u0441\u043A\u0438 \u0445\u043E\u0440\u043E\u0448\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u043A\u0430\u0436\u0434\u044B\u0439 \u0445\u043E\u0434 \u043A\u043E\u043D\u044F \u0438\u043C\u0435\u0435\u0442 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0443\u044E \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C: \u043E\u0434\u0438\u043D \u0445\u043E\u0434.",
        pseudoLine: 1,
        resultPreview: "\u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0441\u043B\u043E\u0439 0 \u0441 \u043E\u0434\u043D\u043E\u0439 \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u043A\u043E\u043D\u044F.",
        stateSnapshot: buildChessSnapshot({
          start,
          end,
          frontier: [coordKey(start.row, start.col)],
          visited: [coordKey(start.row, start.col)],
          panels: [
            panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
            panel("\u0426\u0435\u043B\u044C", formatCoord(end.row, end.col))
          ]
        })
      })
    ];
    let foundKey = null;
    while (queue.length) {
      const current = queue.shift();
      const currentKey = coordKey(current.row, current.col);
      steps.push(
        createStep({
          action: `\u041E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 ${formatCoord(current.row, current.col)}`,
          why: "\u0421\u0435\u0439\u0447\u0430\u0441 \u0440\u0430\u0441\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0435\u043C \u0432\u0441\u0435 \u043A\u043B\u0435\u0442\u043A\u0438, \u0434\u043E \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u043A\u043E\u043D\u044C \u0434\u043E\u0445\u043E\u0434\u0438\u0442 \u0437\u0430 \u0443\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u0445\u043E\u0434\u043E\u0432.",
          pseudoLine: 3,
          resultPreview: `\u0414\u043E \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043A\u043B\u0435\u0442\u043A\u0438 \u043D\u0443\u0436\u043D\u043E ${distance[currentKey]} \u0445\u043E\u0434(\u043E\u0432).`,
          stateSnapshot: buildChessSnapshot({
            current,
            start,
            end,
            frontier: allGridKeys(queue),
            visited: [...visited],
            panels: [
              panel("\u0421\u0434\u0435\u043B\u0430\u043D\u043E \u0445\u043E\u0434\u043E\u0432", String(distance[currentKey])),
              panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue))
            ]
          })
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
            action: `\u041A\u043E\u043D\u044C \u043C\u043E\u0436\u0435\u0442 \u043F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 ${formatCoord(nextRow, nextCol)}`,
            why: "\u042D\u0442\u0430 \u043A\u043B\u0435\u0442\u043A\u0430 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u0430 \u0440\u043E\u0432\u043D\u043E \u043D\u0430 \u043E\u0434\u0438\u043D \u0445\u043E\u0434 \u043F\u043E\u0437\u0436\u0435, \u0447\u0435\u043C current, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u043D\u0430 \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 BFS.",
            pseudoLine: 6,
            resultPreview: `\u041D\u043E\u0432\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C: ${distance[nextKey]} \u0445\u043E\u0434(\u043E\u0432).`,
            stateSnapshot: buildChessSnapshot({
              current,
              start,
              end,
              frontier: allGridKeys(queue),
              visited: [...visited],
              panels: [
                panel("\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0445\u043E\u0434", `${formatCoord(current.row, current.col)} \u2192 ${formatCoord(nextRow, nextCol)}`),
                panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue))
              ]
            })
          })
        );
      }
    }
    const path = foundKey ? reconstructPath(parent, foundKey) : [];
    steps.push(
      createStep({
        action: foundKey ? "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u043A\u043E\u043D\u044F \u043D\u0430\u0439\u0434\u0435\u043D" : "\u041C\u0430\u0440\u0448\u0440\u0443\u0442 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D",
        why: foundKey ? "\u041A\u0430\u043A \u0438 \u0432 \u043B\u044E\u0431\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0435 \u0441 \u0440\u0430\u0432\u043D\u044B\u043C\u0438 \u043F\u043E \u0446\u0435\u043D\u0435 \u0445\u043E\u0434\u0430\u043C\u0438, BFS \u043F\u0435\u0440\u0432\u044B\u043C \u043D\u0430\u0445\u043E\u0434\u0438\u0442 \u0438\u043C\u0435\u043D\u043D\u043E \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u043E\u0432." : "\u0414\u043B\u044F \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u043E\u0439 \u0434\u043E\u0441\u043A\u0438 \u043A\u043E\u043D\u044C \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C \u043F\u043E\u0447\u0442\u0438 \u0432\u0435\u0437\u0434\u0435, \u043D\u043E \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0432\u0441\u0451 \u0440\u0430\u0432\u043D\u043E \u0447\u0435\u0441\u0442\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 \u0432\u0441\u0435 \u0443\u0440\u043E\u0432\u043D\u0438.",
        pseudoLine: foundKey ? 4 : 2,
        resultPreview: foundKey ? `\u041D\u0443\u0436\u043D\u043E ${path.length - 1} \u0445\u043E\u0434(\u043E\u0432): ${formatCoordPath(path)}.` : "\u041F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u0445\u043E\u0434\u043E\u0432 \u043D\u0435 \u043D\u0430\u0448\u043B\u043E\u0441\u044C.",
        stateSnapshot: buildChessSnapshot({
          current: foundKey ? end : null,
          start,
          end,
          frontier: [],
          visited: [...visited],
          path,
          panels: [
            panel("\u041C\u0438\u043D\u0438\u043C\u0443\u043C \u0445\u043E\u0434\u043E\u0432", foundKey ? String(path.length - 1) : "\u2014"),
            panel("\u041C\u0430\u0440\u0448\u0440\u0443\u0442", foundKey ? formatCoordPath(path) : "\u2014")
          ]
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: foundKey ? String(path.length - 1) : "-1",
      conclusion: "BFS \u043F\u043E \u043A\u043B\u0435\u0442\u043A\u0430\u043C \u0434\u043E\u0441\u043A\u0438 \u0443\u0434\u043E\u0431\u043D\u043E \u043F\u0440\u0435\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0437\u0430\u0434\u0430\u0447\u0443 \u043A\u043E\u043D\u044F \u0432 \u043E\u0431\u044B\u0447\u043D\u044B\u0439 \u043F\u043E\u0438\u0441\u043A \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0433\u043E \u043F\u0443\u0442\u0438 \u043F\u043E \u043D\u0435\u044F\u0432\u043D\u043E\u043C\u0443 \u0433\u0440\u0430\u0444\u0443 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439."
    };
  }
  function runRottingOranges({ grid }) {
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
        action: "\u0421\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u0441\u0435 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0435 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438 \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u044F",
        why: "\u041C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u044B\u0439 BFS \u0441\u0440\u0430\u0437\u0443 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F \u043E\u0442 \u0432\u0441\u0435\u0445 \u0443\u0436\u0435 \u0433\u043D\u0438\u043B\u044B\u0445 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0438\u0434\u0451\u0442 \u043F\u0430\u0440\u0430\u043B\u043B\u0435\u043B\u044C\u043D\u043E \u0438\u0437 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0438\u0437 \u043D\u0438\u0445.",
        pseudoLine: 1,
        resultPreview: `\u0418\u0437\u043D\u0430\u0447\u0430\u043B\u044C\u043D\u043E \u0441\u0432\u0435\u0436\u0438\u0445 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432: ${fresh}, \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u044F: ${queue.length}.`,
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
              "\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u0438",
              queue.map(({ row, col }) => formatCoord(row, col)).join(" \u2192 ") || "\u043D\u0435\u0442"
            ),
            panel("\u0421\u0432\u0435\u0436\u0438\u0445", String(fresh))
          ],
          legend: GRID_LEGEND,
          title: "\u0421\u0442\u0430\u0440\u0442 \u043C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u043E\u0433\u043E BFS",
          formatValue: (value) => value === 0 ? "\xB7" : value === 1 ? "F" : "R"
        })
      })
    ];
    let maxMinute = 0;
    const infected = new Set(queue.map(({ row, col }) => coordKey(row, col)));
    while (queue.length) {
      const current = queue.shift();
      maxMinute = Math.max(maxMinute, current.minute);
      steps.push(
        createStep({
          action: `\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A ${formatCoord(current.row, current.col)} \u0437\u0430\u0440\u0430\u0436\u0430\u0435\u0442 \u0441\u043E\u0441\u0435\u0434\u0435\u0439`,
          why: "\u041C\u044B \u0438\u0437\u0432\u043B\u0435\u043A\u0430\u0435\u043C \u0438\u0437 \u043E\u0447\u0435\u0440\u0435\u0434\u0438 \u043E\u0434\u0438\u043D \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E\u0439 \u0441\u043B\u043E\u0439 \u0438 \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u043C \u0432\u043E\u043B\u043D\u0443 \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043D\u0430 \u043C\u0438\u043D\u0443\u0442\u0443 \u0434\u0430\u043B\u044C\u0448\u0435.",
          pseudoLine: 3,
          resultPreview: `\u0421\u0435\u0439\u0447\u0430\u0441 \u0440\u0430\u0441\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043C\u043E\u043C\u0435\u043D\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 ${current.minute}.`,
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
              panel("\u041C\u0438\u043D\u0443\u0442\u0430", String(current.minute)),
              panel("\u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0441\u0432\u0435\u0436\u0438\u0445", String(fresh))
            ],
            legend: GRID_LEGEND,
            formatValue: (value) => value === 0 ? "\xB7" : value === 1 ? "F" : "R"
          })
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
            action: `\u0421\u0432\u0435\u0436\u0438\u0439 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D \u0432 ${formatCoord(nextRow, nextCol)} \u0441\u0442\u0430\u043B \u0433\u043D\u0438\u043B\u044B\u043C`,
            why: "\u0421\u043E\u0441\u0435\u0434 \u0431\u044B\u043B \u0441\u0432\u0435\u0436\u0438\u043C \u0438 \u043D\u0430\u0445\u043E\u0434\u0438\u043B\u0441\u044F \u043D\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0438 \u043E\u0434\u043D\u043E\u0439 \u043C\u0438\u043D\u0443\u0442\u044B \u043E\u0442 \u0443\u0436\u0435 \u0433\u043D\u0438\u043B\u043E\u0433\u043E \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u0430, \u0437\u043D\u0430\u0447\u0438\u0442 \u043E\u043D \u0437\u0430\u0440\u0430\u0436\u0430\u0435\u0442\u0441\u044F \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u0441\u043B\u043E\u0435 BFS.",
            pseudoLine: 4,
            resultPreview: `\u041F\u043E\u0441\u043B\u0435 \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0441\u0432\u0435\u0436\u0438\u0445: ${fresh}.`,
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
                panel("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043C\u0438\u043D\u0443\u0442\u0430", String(current.minute + 1)),
                panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", queue.map((item) => `${formatCoord(item.row, item.col)}@${item.minute}`).join(" \u2192 ") || "\u043F\u0443\u0441\u0442\u0430")
              ],
              legend: GRID_LEGEND,
              formatValue: (value) => value === 0 ? "\xB7" : value === 1 ? "F" : "R"
            })
          })
        );
      }
    }
    const impossible = fresh > 0;
    steps.push(
      createStep({
        action: impossible ? "\u041D\u0435 \u0432\u0441\u0435 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u044B \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0440\u0430\u0437\u0438\u0442\u044C" : "\u0417\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E",
        why: impossible ? "\u041F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u043E\u0431\u0445\u043E\u0434\u0430 \u043E\u0441\u0442\u0430\u043B\u0438\u0441\u044C \u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0441\u0432\u0435\u0436\u0438\u0435 \u043A\u043B\u0435\u0442\u043A\u0438, \u0434\u043E \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0438\u043D\u0444\u0435\u043A\u0446\u0438\u044F \u043D\u0435 \u0434\u043E\u0431\u0440\u0430\u043B\u0430\u0441\u044C." : "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u043C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u043E\u0433\u043E BFS \u0438 \u0435\u0441\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F, \u043A\u043E\u0433\u0434\u0430 \u0432\u0441\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430\u044F \u0441\u0432\u0435\u0436\u0430\u044F \u043E\u0431\u043B\u0430\u0441\u0442\u044C \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0430.",
        pseudoLine: 6,
        resultPreview: impossible ? "\u041E\u0442\u0432\u0435\u0442: -1." : `\u041E\u0442\u0432\u0435\u0442: ${maxMinute} \u043C\u0438\u043D\u0443\u0442(\u044B).`,
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
            panel("\u041E\u0442\u0432\u0435\u0442", impossible ? "-1" : String(maxMinute)),
            panel("\u0421\u0432\u0435\u0436\u0438\u0445 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C", String(fresh))
          ],
          legend: GRID_LEGEND,
          formatValue: (value) => value === 0 ? "\xB7" : value === 1 ? "F" : "R"
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: impossible ? "-1" : String(maxMinute),
      conclusion: "\u0417\u0434\u0435\u0441\u044C BFS \u0438\u0434\u0451\u0442 \u043D\u0435 \u043E\u0442 \u043E\u0434\u043D\u043E\u0439 \u043A\u043B\u0435\u0442\u043A\u0438, \u0430 \u0441\u0440\u0430\u0437\u0443 \u043E\u0442 \u0432\u0441\u0435\u0445 \u0433\u043D\u0438\u043B\u044B\u0445 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043A\u0430\u0436\u0434\u044B\u0439 \u0441\u043B\u043E\u0439 \u043E\u0447\u0435\u0440\u0435\u0434\u0438 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u043D\u043E\u0439 \u043C\u0438\u043D\u0443\u0442\u0435."
    };
  }
  function runWordLadder({ start, target, words }) {
    const dictionary = new Set(normalizeWords(words));
    if (start.length !== target.length) {
      throw new Error("\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0435 \u0438 \u043A\u043E\u043D\u0435\u0447\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0434\u043E\u043B\u0436\u043D\u044B \u0438\u043C\u0435\u0442\u044C \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0443\u044E \u0434\u043B\u0438\u043D\u0443.");
    }
    if (!dictionary.has(target)) {
      throw new Error("\u041A\u043E\u043D\u0435\u0447\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0434\u043E\u043B\u0436\u043D\u043E \u043F\u0440\u0438\u0441\u0443\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u0445 \u0441\u043B\u043E\u0432.");
    }
    const queue = [start];
    const visited = /* @__PURE__ */ new Set([start]);
    const parent = {};
    const distance = { [start]: 0 };
    const wordList = [...dictionary];
    const steps = [
      createStep({
        action: `\u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0446\u0435\u043F\u043E\u0447\u043A\u0443 \u0441 \u0441\u043B\u043E\u0432\u0430 ${start}`,
        why: "BFS \u043F\u0435\u0440\u0435\u0431\u0438\u0440\u0430\u0435\u0442 \u0432\u0441\u0435 \u0441\u043B\u043E\u0432\u0430 \u043F\u043E \u0447\u0438\u0441\u043B\u0443 \u0437\u0430\u043C\u0435\u043D, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043F\u0435\u0440\u0432\u0430\u044F \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u0430\u044F \u0446\u0435\u043F\u043E\u0447\u043A\u0430 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0431\u0443\u0434\u0435\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043E \u0434\u043B\u0438\u043D\u0435.",
        pseudoLine: 1,
        resultPreview: `\u0426\u0435\u043B\u044C: ${target}. \u0420\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u0445 \u0441\u043B\u043E\u0432: ${wordList.length}.`,
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C",
              items: [{ label: "0", value: start, state: "frontier" }]
            },
            {
              label: "\u0421\u043B\u043E\u0432\u0430\u0440\u044C",
              items: wordList.map((word) => ({
                label: word,
                value: word,
                state: word === target ? "path" : ""
              }))
            }
          ]),
          panels: [
            panel("\u0421\u0442\u0430\u0440\u0442", start),
            panel("\u0426\u0435\u043B\u044C", target)
          ]
        })
      })
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
          action: `\u0411\u0435\u0440\u0451\u043C \u0438\u0437 \u043E\u0447\u0435\u0440\u0435\u0434\u0438 \u0441\u043B\u043E\u0432\u043E ${current}`,
          why: "\u0421\u0435\u0439\u0447\u0430\u0441 \u0440\u0430\u0441\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0432\u0441\u0435 \u0441\u043B\u043E\u0432\u0430, \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u0437\u0430 \u0443\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u0437\u0430\u043C\u0435\u043D.",
          pseudoLine: 3,
          resultPreview: `\u0414\u043E \u0441\u043B\u043E\u0432\u0430 ${current} \u043D\u0443\u0436\u043D\u043E ${distance[current]} \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0439.`,
          stateSnapshot: makeTraceSnapshot({
            groups: buildTraceGroups([
              {
                label: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0441\u043B\u043E\u0432\u043E",
                items: [{ label: "current", value: current, state: "current" }]
              },
              {
                label: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C",
                items: queue.map((word, index) => ({
                  label: String(index + 1),
                  value: word,
                  state: "frontier"
                }))
              }
            ]),
            panels: [
              panel("\u0414\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u044F", String(distance[current])),
              panel("\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u043E \u0441\u043B\u043E\u0432", String(visited.size))
            ]
          })
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
            action: `\u0421\u043B\u043E\u0432\u043E ${candidate} \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C`,
            why: "\u041E\u043D\u043E \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u043E\u0442 current \u0440\u043E\u0432\u043D\u043E \u0432 \u043E\u0434\u043D\u043E\u043C \u0441\u0438\u043C\u0432\u043E\u043B\u0435, \u0437\u043D\u0430\u0447\u0438\u0442 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u043C \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435\u043C \u0433\u0440\u0430\u0444\u0430 \u0441\u043B\u043E\u0432.",
            pseudoLine: 6,
            resultPreview: `\u041D\u043E\u0432\u044B\u0439 \u043F\u0443\u0442\u044C \u0434\u043B\u0438\u043D\u044B ${distance[candidate]} \u0432\u0435\u0434\u0451\u0442 \u043A \u0441\u043B\u043E\u0432\u0443 ${candidate}.`,
            stateSnapshot: makeTraceSnapshot({
              groups: buildTraceGroups([
                {
                  label: "\u041D\u043E\u0432\u044B\u0439 \u0444\u0440\u043E\u043D\u0442",
                  items: queue.map((word, index) => ({
                    label: String(index + 1),
                    value: word,
                    state: word === candidate ? "current" : "frontier"
                  }))
                },
                {
                  label: "\u0423\u0436\u0435 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u043E",
                  items: [...visited].map((word) => ({
                    label: word,
                    value: word,
                    state: word === candidate ? "path" : "visited"
                  }))
                }
              ]),
              panels: [
                panel("\u041F\u0440\u0435\u0434\u043E\u043A", current),
                panel("\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435", String(distance[candidate]))
              ]
            })
          })
        );
      }
    }
    const path = found ? reconstructPath(parent, found) : [];
    steps.push(
      createStep({
        action: found ? "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0446\u0435\u043F\u043E\u0447\u043A\u0430 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u043D\u0430\u0439\u0434\u0435\u043D\u0430" : "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E",
        why: found ? "\u041A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E \u0446\u0435\u043B\u044C \u0438\u0437\u0432\u043B\u0435\u0447\u0435\u043D\u0430 \u0438\u0437 \u043E\u0447\u0435\u0440\u0435\u0434\u0438, \u043C\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u043A\u043E\u0440\u043E\u0447\u0435 \u0446\u0435\u043F\u043E\u0447\u043A\u0438 \u0443\u0436\u0435 \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442." : "\u0415\u0441\u043B\u0438 BFS \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0441\u044F \u0431\u0435\u0437 target, \u0437\u043D\u0430\u0447\u0438\u0442 \u043D\u0438 \u043E\u0434\u043D\u0430 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u0430\u044F \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0437\u0430\u043C\u0435\u043D \u043D\u0435 \u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0435\u0442 start \u0438 target.",
        pseudoLine: found ? 4 : 2,
        resultPreview: found ? `\u041E\u0442\u0432\u0435\u0442: ${path.length - 1} \u0448\u0430\u0433(\u043E\u0432), \u0446\u0435\u043F\u043E\u0447\u043A\u0430 ${formatPath(path)}.` : "\u041E\u0442\u0432\u0435\u0442: -1.",
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: found ? "\u0418\u0442\u043E\u0433\u043E\u0432\u0430\u044F \u0446\u0435\u043F\u043E\u0447\u043A\u0430" : "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435",
              items: (found ? path : [start]).map((word) => ({
                label: word,
                value: word,
                state: found ? "path" : "failure"
              }))
            }
          ]),
          panels: [
            panel("\u041E\u0442\u0432\u0435\u0442", found ? String(path.length - 1) : "-1"),
            panel("\u0426\u0435\u043F\u043E\u0447\u043A\u0430", found ? formatPath(path) : "\u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430")
          ]
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: found ? String(path.length - 1) : "-1",
      conclusion: "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u0443\u0434\u043E\u0431\u043D\u043E \u0440\u0430\u0441\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C \u043A\u0430\u043A \u0433\u0440\u0430\u0444 \u0441\u043B\u043E\u0432, \u0433\u0434\u0435 \u0440\u0435\u0431\u0440\u043E \u0435\u0441\u0442\u044C \u043C\u0435\u0436\u0434\u0443 \u0441\u043B\u043E\u0432\u0430\u043C\u0438, \u043E\u0442\u043B\u0438\u0447\u0430\u044E\u0449\u0438\u043C\u0438\u0441\u044F \u0440\u043E\u0432\u043D\u043E \u0432 \u043E\u0434\u043D\u043E\u043C \u0441\u0438\u043C\u0432\u043E\u043B\u0435."
    };
  }
  function runNearestExit({ grid, start }) {
    if (grid[start.row][start.col] === 1) {
      throw new Error("\u0421\u0442\u0430\u0440\u0442 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u044C\u0441\u044F \u0432 \u0441\u0442\u0435\u043D\u0435.");
    }
    const queue = [{ row: start.row, col: start.col }];
    const visited = /* @__PURE__ */ new Set([coordKey(start.row, start.col)]);
    const distance = { [coordKey(start.row, start.col)]: 0 };
    const parent = {};
    const steps = [
      createStep({
        action: `\u0421\u0442\u0430\u0440\u0442\u0443\u0435\u043C \u0438\u0437 ${formatCoord(start.row, start.col)}`,
        why: "\u041C\u044B \u0438\u0449\u0435\u043C \u043D\u0435 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0439 \u0444\u0438\u043D\u0438\u0448, \u0430 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0439 \u0432\u044B\u0445\u043E\u0434 \u043D\u0430 \u0433\u0440\u0430\u043D\u0438\u0446\u0435, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 BFS \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u0434\u043B\u044F \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u0441\u043B\u043E\u0439 \u0437\u0430 \u0441\u043B\u043E\u0435\u043C.",
        pseudoLine: 1,
        resultPreview: "\u0421\u0442\u0430\u0440\u0442 \u043F\u043E\u043C\u0435\u0449\u0451\u043D \u0432 \u043E\u0447\u0435\u0440\u0435\u0434\u044C \u043A\u0430\u043A \u0441\u043B\u043E\u0439 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F 0.",
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          frontier: [coordKey(start.row, start.col)],
          visited: [coordKey(start.row, start.col)],
          panels: [
            panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
            panel("\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u0432\u044B\u0445\u043E\u0434\u0430", "\u043B\u044E\u0431\u0430\u044F \u0433\u0440\u0430\u043D\u0438\u0447\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430, \u043A\u0440\u043E\u043C\u0435 \u0441\u0442\u0430\u0440\u0442\u0430")
          ],
          title: "\u041F\u043E\u0438\u0441\u043A \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430"
        })
      })
    ];
    let exitKey = null;
    while (queue.length) {
      const current = queue.shift();
      const currentKey = coordKey(current.row, current.col);
      steps.push(
        createStep({
          action: `\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 ${formatCoord(current.row, current.col)}`,
          why: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043C\u043E\u0442\u0440\u0438\u043C \u043A\u043B\u0435\u0442\u043A\u0438 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0441\u043B\u043E\u044F. \u0415\u0441\u043B\u0438 \u043E\u0434\u043D\u0430 \u0438\u0437 \u043D\u0438\u0445 \u2014 \u0432\u044B\u0445\u043E\u0434, \u0442\u043E \u044D\u0442\u043E \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E \u0441\u0430\u043C\u044B\u0439 \u0431\u043B\u0438\u0437\u043A\u0438\u0439 \u0432\u044B\u0445\u043E\u0434.",
          pseudoLine: 3,
          resultPreview: `\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u043D\u0435\u0451 \u0440\u0430\u0432\u043D\u043E ${distance[currentKey]}.`,
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            current,
            frontier: allGridKeys(queue),
            visited: [...visited],
            panels: [
              panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
              panel("\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u043B\u043E\u0439", String(distance[currentKey]))
            ],
            title: "\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043A\u043B\u0435\u0442\u043A\u0438"
          })
        })
      );
      const isBoundary = current.row === 0 || current.col === 0 || current.row === grid.length - 1 || current.col === grid[0].length - 1;
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
            action: `\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C ${formatCoord(nextRow, nextCol)} \u043A\u0430\u043A \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u043E\u0439`,
            why: "\u042D\u0442\u0430 \u043F\u0440\u043E\u0445\u043E\u0434\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0430\u043B\u0430\u0441\u044C, \u0437\u043D\u0430\u0447\u0438\u0442 \u0447\u0435\u0440\u0435\u0437 \u043D\u0435\u0451 \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0439\u0442\u0438 \u0434\u043E \u0431\u043E\u043B\u0435\u0435 \u0434\u0430\u043B\u044C\u043D\u0435\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430.",
            pseudoLine: 5,
            resultPreview: `\u0415\u0451 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043E\u0442 \u0441\u0442\u0430\u0440\u0442\u0430 \u0442\u0435\u043F\u0435\u0440\u044C ${distance[nextKey]}.`,
            stateSnapshot: buildMazeSnapshot({
              grid,
              start,
              current,
              frontier: allGridKeys(queue),
              visited: [...visited],
              panels: [
                panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
                panel("\u041D\u043E\u0432\u044B\u0439 \u0441\u043B\u043E\u0439", String(distance[nextKey]))
              ],
              title: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043F\u043E\u0438\u0441\u043A\u0430 \u043A \u0433\u0440\u0430\u043D\u0438\u0446\u0435"
            })
          })
        );
      }
    }
    const path = exitKey ? reconstructPath(parent, exitKey) : [];
    steps.push(
      createStep({
        action: exitKey ? "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0439 \u0432\u044B\u0445\u043E\u0434 \u043D\u0430\u0439\u0434\u0435\u043D" : "\u0412\u044B\u0445\u043E\u0434\u0430 \u043D\u0435\u0442",
        why: exitKey ? "\u041F\u043E\u0441\u043A\u043E\u043B\u044C\u043A\u0443 \u0432\u044B\u0445\u043E\u0434 \u0438\u0437\u0432\u043B\u0435\u0447\u0451\u043D \u0438\u0437 \u043E\u0447\u0435\u0440\u0435\u0434\u0438 \u043F\u0435\u0440\u0432\u044B\u043C \u0441\u0440\u0435\u0434\u0438 \u0433\u0440\u0430\u043D\u0438\u0447\u043D\u044B\u0445 \u043A\u043B\u0435\u0442\u043E\u043A, \u043E\u043D \u0438 \u0435\u0441\u0442\u044C \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0439." : "\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u043F\u0440\u043E\u0432\u0435\u0440\u0438\u043B \u0432\u0441\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u043F\u0440\u043E\u0445\u043E\u0434\u044B, \u043D\u043E \u043D\u0438 \u043E\u0434\u0438\u043D \u043D\u0435 \u043E\u043A\u0430\u0437\u0430\u043B\u0441\u044F \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u043C \u0432\u044B\u0445\u043E\u0434\u043E\u043C.",
        pseudoLine: exitKey ? 4 : 2,
        resultPreview: exitKey ? `\u041E\u0442\u0432\u0435\u0442: ${path.length - 1} \u0448\u0430\u0433(\u043E\u0432), \u043C\u0430\u0440\u0448\u0440\u0443\u0442 ${formatCoordPath(path)}.` : "\u041E\u0442\u0432\u0435\u0442: -1.",
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          current: exitKey ? fromCoordKey(exitKey) : null,
          visited: [...visited],
          path,
          panels: [
            panel("\u041E\u0442\u0432\u0435\u0442", exitKey ? String(path.length - 1) : "-1"),
            panel("\u041C\u0430\u0440\u0448\u0440\u0443\u0442", exitKey ? formatCoordPath(path) : "\u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D")
          ],
          title: "\u0418\u0442\u043E\u0433 \u043F\u043E\u0438\u0441\u043A\u0430 \u0432\u044B\u0445\u043E\u0434\u0430"
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: exitKey ? String(path.length - 1) : "-1",
      conclusion: "\u0412 \u0437\u0430\u0434\u0430\u0447\u0435 \u043E \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u043C \u0432\u044B\u0445\u043E\u0434\u0435 BFS \u0432\u0430\u0436\u0435\u043D \u0442\u0435\u043C, \u0447\u0442\u043E \u043B\u044E\u0431\u0430\u044F \u0433\u0440\u0430\u043D\u0438\u0447\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430, \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u0430\u044F \u043F\u0435\u0440\u0432\u043E\u0439, \u0443\u0436\u0435 \u0438\u043C\u0435\u0435\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u0448\u0430\u0433\u043E\u0432."
    };
  }
  function runWordSearch({ grid, word }) {
    const letters = grid.map((row) => row.map((cell) => String(cell).toUpperCase()));
    const target = String(word).trim().toUpperCase();
    const visited = /* @__PURE__ */ new Set();
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
          panel("\u0418\u0449\u0435\u043C \u0441\u043B\u043E\u0432\u043E", target),
          panel(
            "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0440\u0435\u0444\u0438\u043A\u0441",
            currentPath.map((key) => {
              const { row, col } = fromCoordKey(key);
              return letters[row][col];
            }).join("") || "\u2014"
          )
        ],
        legend: GRID_LEGEND,
        formatValue: (value) => value,
        title: "\u041F\u043E\u0438\u0441\u043A \u0441\u043B\u043E\u0432\u0430 \u0432 \u0441\u0435\u0442\u043A\u0435"
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
          action: `\u041F\u0440\u043E\u0431\u0443\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 ${formatCoord(row, col)} \u0434\u043B\u044F \u0431\u0443\u043A\u0432\u044B ${target[index]}`,
          why: "\u0427\u0442\u043E\u0431\u044B \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u043B\u043E\u0432\u043E \u0431\u0435\u0437 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u043A\u043B\u0435\u0442\u043E\u043A, \u043C\u044B \u0438\u0434\u0451\u043C \u043F\u043E \u0441\u0435\u0442\u043A\u0435 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E \u0438 \u043A\u0430\u0436\u0434\u044B\u0439 \u0440\u0430\u0437 \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u043D\u0443\u0436\u043D\u043E\u0439 \u0431\u0443\u043A\u0432\u044B.",
          pseudoLine: 1,
          resultPreview: `\u0421\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u043C ${letters[row][col]} \u0441 ${target[index]}.`,
          stateSnapshot: makeSnapshot(currentPath, key)
        })
      );
      if (letters[row][col] !== target[index]) {
        steps.push(
          createStep({
            action: `\u041A\u043B\u0435\u0442\u043A\u0430 ${formatCoord(row, col)} \u043D\u0435 \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442`,
            why: "\u0411\u0443\u043A\u0432\u0430 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u043B\u0430, \u0437\u043D\u0430\u0447\u0438\u0442 \u044D\u0442\u0430 \u0432\u0435\u0442\u043A\u0430 \u043D\u0435 \u043C\u043E\u0436\u0435\u0442 \u0434\u0430\u0442\u044C \u043D\u0443\u0436\u043D\u043E\u0435 \u0441\u043B\u043E\u0432\u043E \u0438 \u0435\u0451 \u043D\u0443\u0436\u043D\u043E \u0441\u0440\u0430\u0437\u0443 \u043E\u0442\u0431\u0440\u043E\u0441\u0438\u0442\u044C.",
            pseudoLine: 2,
            resultPreview: `\u041D\u0435\u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435: ${letters[row][col]} \u2260 ${target[index]}.`,
            stateSnapshot: makeSnapshot(currentPath, null, key)
          })
        );
        return false;
      }
      const nextPath = [...currentPath, key];
      if (index === target.length - 1) {
        foundPath = nextPath;
        steps.push(
          createStep({
            action: "\u0421\u043B\u043E\u0432\u043E \u0441\u043E\u0431\u0440\u0430\u043D\u043E \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E",
            why: "\u041C\u044B \u0434\u043E\u0448\u043B\u0438 \u0434\u043E \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0439 \u0431\u0443\u043A\u0432\u044B \u0438 \u043A\u0430\u0436\u0434\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 \u043D\u0430 \u043F\u0443\u0442\u0438 \u0441\u043E\u0432\u043F\u0430\u043B\u0430 \u0441 \u043D\u0443\u0436\u043D\u044B\u043C \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u043C, \u0437\u043D\u0430\u0447\u0438\u0442 \u0441\u043B\u043E\u0432\u043E \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0432 \u0441\u0435\u0442\u043A\u0435.",
            pseudoLine: 3,
            resultPreview: `\u041F\u0443\u0442\u044C: ${formatCoordPath(nextPath)}.`,
            stateSnapshot: makeSnapshot(nextPath, key)
          })
        );
        return true;
      }
      visited.add(key);
      steps.push(
        createStep({
          action: `\u0424\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 ${formatCoord(row, col)} \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u043F\u0443\u0442\u0438`,
          why: "\u042D\u0442\u0443 \u043A\u043B\u0435\u0442\u043A\u0443 \u043D\u0435\u043B\u044C\u0437\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E \u0432 \u0440\u0430\u043C\u043A\u0430\u0445 \u043E\u0434\u043D\u043E\u0439 \u0432\u0435\u0442\u043A\u0438, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043E\u0442\u043C\u0435\u0447\u0430\u0435\u043C \u0435\u0451 \u043A\u0430\u043A \u0437\u0430\u043D\u044F\u0442\u0443\u044E.",
          pseudoLine: 4,
          resultPreview: `\u0421\u043E\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0435\u0444\u0438\u043A\u0441: ${nextPath.map((pathKey) => {
            const { row: pathRow, col: pathCol } = fromCoordKey(pathKey);
            return letters[pathRow][pathCol];
          }).join("")}.`,
          stateSnapshot: makeSnapshot(nextPath, key)
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
          action: `\u041E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0435\u043C\u0441\u044F \u0438\u0437 \u043A\u043B\u0435\u0442\u043A\u0438 ${formatCoord(row, col)}`,
          why: "\u041D\u0438 \u043E\u0434\u0438\u043D \u0441\u043E\u0441\u0435\u0434 \u043D\u0435 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u043B \u0441\u043B\u043E\u0432\u043E \u0434\u043E \u043A\u043E\u043D\u0446\u0430, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0443 \u0432 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0438 \u043F\u0440\u043E\u0431\u0443\u0435\u043C \u0434\u0440\u0443\u0433\u0443\u044E \u0432\u0435\u0442\u043A\u0443.",
          pseudoLine: 6,
          resultPreview: "\u042D\u0442\u0430 \u0432\u0435\u0442\u043A\u0430 \u043D\u0435 \u043F\u0440\u0438\u0432\u0435\u043B\u0430 \u043A \u043F\u043E\u043B\u043D\u043E\u043C\u0443 \u0441\u043B\u043E\u0432\u0443.",
          stateSnapshot: makeSnapshot(currentPath, null, key)
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
        action: exists ? "\u041F\u043E\u0438\u0441\u043A \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E" : "\u0421\u043B\u043E\u0432\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E",
        why: exists ? "\u041E\u0434\u043D\u0430 \u0438\u0437 \u0432\u0435\u0442\u043E\u043A DFS \u0441\u043C\u043E\u0433\u043B\u0430 \u043F\u0440\u043E\u0439\u0442\u0438 \u043F\u043E \u0432\u0441\u0435\u043C \u0431\u0443\u043A\u0432\u0430\u043C \u0441\u043B\u043E\u0432\u0430 \u0431\u0435\u0437 \u043F\u043E\u0432\u0442\u043E\u0440\u0435\u043D\u0438\u044F \u043A\u043B\u0435\u0442\u043E\u043A." : "\u041D\u0438 \u043E\u0434\u043D\u0430 \u0432\u0435\u0442\u043A\u0430 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438 \u043D\u0435 \u0441\u043E\u0431\u0440\u0430\u043B\u0430 \u0441\u043B\u043E\u0432\u043E \u0446\u0435\u043B\u0438\u043A\u043E\u043C, \u0437\u043D\u0430\u0447\u0438\u0442 \u0442\u0430\u043A\u043E\u0433\u043E \u043F\u0443\u0442\u0438 \u0432 \u0441\u0435\u0442\u043A\u0435 \u043D\u0435\u0442.",
        pseudoLine: exists ? 3 : 6,
        resultPreview: exists ? `\u041E\u0442\u0432\u0435\u0442: true. \u041F\u0443\u0442\u044C ${formatCoordPath(foundPath)}.` : "\u041E\u0442\u0432\u0435\u0442: false.",
        stateSnapshot: makeSnapshot(foundPath != null ? foundPath : [])
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: exists ? "true" : "false",
      conclusion: "\u0425\u043E\u0442\u044F \u0437\u0430\u0434\u0430\u0447\u0430 \u043D\u0430\u0445\u043E\u0434\u0438\u043B\u0430\u0441\u044C \u0440\u044F\u0434\u043E\u043C \u0441 BFS, \u0437\u0430\u043F\u0440\u0435\u0442 \u043D\u0430 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u043B\u0435\u0442\u043E\u043A \u0434\u0435\u043B\u0430\u0435\u0442 DFS/backtracking \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u0438 \u043D\u0430\u0433\u043B\u044F\u0434\u043D\u044B\u043C \u0432\u044B\u0431\u043E\u0440\u043E\u043C."
    };
  }
  function runCountIslands({ grid }) {
    const visited = /* @__PURE__ */ new Set();
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
          panel("\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u043E\u0432", String(count)),
          panel("\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u043E \u043A\u043B\u0435\u0442\u043E\u043A", String(visited.size))
        ],
        legend: GRID_LEGEND,
        title: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B \u0441\u0432\u044F\u0437\u043D\u043E\u0441\u0442\u0438",
        formatValue: (value) => String(value)
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
            action: `\u041D\u0430\u0448\u043B\u0438 \u043D\u043E\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432, \u043D\u0430\u0447\u0438\u043D\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0432 ${formatCoord(row, col)}`,
            why: "\u0415\u0441\u043B\u0438 \u043A\u043B\u0435\u0442\u043A\u0430 \u0441 \u0437\u0435\u043C\u043B\u0451\u0439 \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0430, \u0437\u043D\u0430\u0447\u0438\u0442 \u043F\u0435\u0440\u0435\u0434 \u043D\u0430\u043C\u0438 \u043D\u043E\u0432\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u0441\u0432\u044F\u0437\u043D\u043E\u0441\u0442\u0438, \u0438 \u0441\u0447\u0451\u0442\u0447\u0438\u043A \u043E\u0441\u0442\u0440\u043E\u0432\u043E\u0432 \u043D\u0443\u0436\u043D\u043E \u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C.",
            pseudoLine: 3,
            resultPreview: `\u041E\u0441\u0442\u0440\u043E\u0432 \u043D\u043E\u043C\u0435\u0440 ${count} \u043D\u0430\u0447\u0438\u043D\u0430\u0435\u0442\u0441\u044F \u0437\u0434\u0435\u0441\u044C.`,
            stateSnapshot: snapshot(key, [key], islandKeys)
          })
        );
        while (queue.length) {
          const current = queue.shift();
          const currentKey = coordKey(current.row, current.col);
          steps.push(
            createStep({
              action: `\u0420\u0430\u0441\u0448\u0438\u0440\u044F\u0435\u043C \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043E\u0441\u0442\u0440\u043E\u0432 \u0438\u0437 ${formatCoord(current.row, current.col)}`,
              why: "BFS \u043E\u0431\u0445\u043E\u0434\u0438\u0442 \u0432\u0441\u0435 \u043A\u043B\u0435\u0442\u043A\u0438 \u043E\u0434\u043D\u043E\u0439 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B, \u0447\u0442\u043E\u0431\u044B \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0438\u0445 \u043A\u0430\u043A \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u0441\u0442\u0440\u043E\u0432\u0430.",
              pseudoLine: 5,
              resultPreview: `\u0421\u0435\u0439\u0447\u0430\u0441 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u043C \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u043D\u043E\u0441\u0442\u044C \u043A\u043B\u0435\u0442\u043A\u0438 \u043E\u0441\u0442\u0440\u043E\u0432\u0443 ${count}.`,
              stateSnapshot: snapshot(
                currentKey,
                allGridKeys(queue),
                islandKeys
              )
            })
          );
          for (const [nextRow, nextCol] of neighbors4(current.row, current.col)) {
            const nextKey = coordKey(nextRow, nextCol);
            if (!isInside(grid, nextRow, nextCol) || grid[nextRow][nextCol] !== 1 || visited.has(nextKey)) {
              continue;
            }
            visited.add(nextKey);
            islandKeys.push(nextKey);
            queue.push({ row: nextRow, col: nextCol });
            steps.push(
              createStep({
                action: `\u041A\u043B\u0435\u0442\u043A\u0430 ${formatCoord(nextRow, nextCol)} \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0441\u044F \u043A \u0442\u043E\u043C\u0443 \u0436\u0435 \u043E\u0441\u0442\u0440\u043E\u0432\u0443`,
                why: "\u041E\u043D\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0430 \u0441 \u0443\u0436\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u043E\u0439 \u0437\u0435\u043C\u043B\u0451\u0439 \u043F\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u0438 \u0438\u043B\u0438 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430\u043B\u0438, \u0437\u043D\u0430\u0447\u0438\u0442 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u044D\u0442\u0443 \u0436\u0435 \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0443.",
                pseudoLine: 5,
                resultPreview: `\u041E\u0441\u0442\u0440\u043E\u0432 ${count} \u0440\u0430\u0441\u0448\u0438\u0440\u0438\u043B\u0441\u044F \u043D\u0430 \u0435\u0449\u0451 \u043E\u0434\u043D\u0443 \u043A\u043B\u0435\u0442\u043A\u0443.`,
                stateSnapshot: snapshot(
                  nextKey,
                  allGridKeys(queue),
                  islandKeys
                )
              })
            );
          }
        }
      }
    }
    steps.push(
      createStep({
        action: "\u041F\u043E\u0434\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u043C \u0438\u0442\u043E\u0433\u043E\u0432\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442",
        why: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0437\u0430\u043F\u0443\u0441\u043A BFS \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u043B \u043E\u0434\u043D\u043E\u043C\u0443 \u043D\u043E\u0432\u043E\u043C\u0443 \u043E\u0441\u0442\u0440\u043E\u0432\u0443, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0444\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0447\u0451\u0442\u0447\u0438\u043A \u0438 \u0435\u0441\u0442\u044C \u043E\u0442\u0432\u0435\u0442 \u0437\u0430\u0434\u0430\u0447\u0438.",
        pseudoLine: 6,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${count}.`,
        stateSnapshot: snapshot()
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: String(count),
      conclusion: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u043E\u0432 \u2014 \u044D\u0442\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u043E\u0432 \u043E\u0431\u0445\u043E\u0434\u0430 \u043F\u043E \u0435\u0449\u0451 \u043D\u0435 \u043F\u043E\u0441\u0435\u0449\u0451\u043D\u043D\u043E\u0439 \u0437\u0435\u043C\u043B\u0435."
    };
  }
  function runShortestBridge({ grid }) {
    const visited = /* @__PURE__ */ new Set();
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
        action: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u043C\u0435\u0447\u0430\u0435\u043C \u043F\u0435\u0440\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432",
        why: "\u0427\u0442\u043E\u0431\u044B \u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043C\u043E\u0441\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0442 \u043E\u0434\u043D\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430 \u043A \u0434\u0440\u0443\u0433\u043E\u043C\u0443, \u043D\u0443\u0436\u043D\u043E \u0447\u0451\u0442\u043A\u043E \u043E\u0442\u0434\u0435\u043B\u0438\u0442\u044C \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u0443\u044E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0443.",
        pseudoLine: 1,
        resultPreview: `\u041F\u0435\u0440\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 ${firstIsland.length} \u043A\u043B\u0435\u0442\u043E\u043A.`,
        stateSnapshot: makeMatrixSnapshot({
          grid,
          states: (() => {
            const states = { ...baseStates };
            enrichGridStates(states, { keys: firstIsland, state: "path" });
            return states;
          })(),
          panels: [
            panel("\u041A\u043B\u0435\u0442\u043E\u043A \u0432 1-\u043C \u043E\u0441\u0442\u0440\u043E\u0432\u0435", String(firstIsland.length)),
            panel("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0448\u0430\u0433", "\u0440\u0430\u0441\u0448\u0438\u0440\u044F\u0442\u044C \u0432\u043E\u0434\u0443 \u0432\u043E\u043A\u0440\u0443\u0433 \u043D\u0435\u0433\u043E")
          ],
          legend: GRID_LEGEND,
          title: "\u041C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430",
          formatValue: (value) => String(value)
        })
      })
    );
    const queue = firstIsland.map((key) => ({
      ...fromCoordKey(key),
      distance: 0
    }));
    let answer = 0;
    while (queue.length) {
      const current = queue.shift();
      const currentKey = coordKey(current.row, current.col);
      steps.push(
        createStep({
          action: `\u0420\u0430\u0441\u0448\u0438\u0440\u044F\u0435\u043C \u0433\u0440\u0430\u043D\u0438\u0446\u0443 \u043C\u043E\u0441\u0442\u0430 \u0438\u0437 ${formatCoord(current.row, current.col)}`,
          why: "\u0422\u0435\u043F\u0435\u0440\u044C BFS \u0438\u0434\u0451\u0442 \u043F\u043E \u0432\u043E\u0434\u0435 \u0441\u043B\u043E\u044F\u043C\u0438, \u0438 \u043D\u043E\u043C\u0435\u0440 \u0441\u043B\u043E\u044F \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043D\u0443\u043B\u0435\u0439 \u043C\u044B \u0443\u0436\u0435 \u0437\u0430\u043C\u0435\u043D\u0438\u043B\u0438 \u043D\u0430 \u043F\u0443\u0442\u044C \u043A \u0434\u0440\u0443\u0433\u043E\u043C\u0443 \u043E\u0441\u0442\u0440\u043E\u0432\u0443.",
          pseudoLine: 4,
          resultPreview: `\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0434\u043B\u0438\u043D\u0430 \u043C\u043E\u0441\u0442\u0430-\u043A\u0430\u043D\u0434\u0438\u0434\u0430\u0442\u0430: ${current.distance}.`,
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
              panel("\u0421\u043B\u043E\u0439 BFS", String(current.distance)),
              panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", queue.map((item) => `${formatCoord(item.row, item.col)}@${item.distance}`).join(" \u2192 ") || "\u043F\u0443\u0441\u0442\u0430")
            ],
            legend: GRID_LEGEND,
            title: "\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043C\u043E\u0441\u0442\u0430",
            formatValue: (value) => String(value)
          })
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
              action: `\u0414\u043E\u0441\u0442\u0438\u0433\u043B\u0438 \u0432\u0442\u043E\u0440\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430 \u0447\u0435\u0440\u0435\u0437 ${formatCoord(nextRow, nextCol)}`,
              why: "\u041F\u0435\u0440\u0432\u043E\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u0442\u043E\u0440\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430 \u0432 BFS \u043E\u0437\u043D\u0430\u0447\u0430\u0435\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0434\u043B\u0438\u043D\u0443 \u043C\u043E\u0441\u0442\u0430, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u0432\u043E\u0434\u0430 \u0440\u0430\u0441\u0448\u0438\u0440\u044F\u043B\u0430\u0441\u044C \u0441\u043B\u043E\u044F\u043C\u0438.",
              pseudoLine: 5,
              resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${answer}.`,
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
                  panel("\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442", String(answer)),
                  panel("\u0422\u043E\u0447\u043A\u0430 \u043A\u0430\u0441\u0430\u043D\u0438\u044F", formatCoord(nextRow, nextCol))
                ],
                legend: GRID_LEGEND,
                title: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 \u043D\u0430\u0439\u0434\u0435\u043D",
                formatValue: (value) => String(value)
              })
            })
          );
          return {
            steps: finalizeSteps(steps),
            answer: String(answer),
            conclusion: "\u041F\u043E\u0441\u043B\u0435 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u0438 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430 BFS \u043F\u043E \u0432\u043E\u0434\u0435 \u0434\u0430\u0451\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043D\u0443\u043B\u0435\u0439, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043D\u0443\u0436\u043D\u043E \u043F\u0440\u0435\u0432\u0440\u0430\u0442\u0438\u0442\u044C \u0432 \u0435\u0434\u0438\u043D\u0438\u0446\u044B."
          };
        }
        visited.add(nextKey);
        queue.push({
          row: nextRow,
          col: nextCol,
          distance: current.distance + 1
        });
        steps.push(
          createStep({
            action: `\u0423\u0434\u043B\u0438\u043D\u044F\u0435\u043C \u043C\u043E\u0441\u0442 \u0447\u0435\u0440\u0435\u0437 \u0432\u043E\u0434\u0443 ${formatCoord(nextRow, nextCol)}`,
            why: "\u042D\u0442\u0430 \u0432\u043E\u0434\u043D\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0447\u0430\u0441\u0442\u044C\u044E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0441\u043B\u043E\u044F \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u044F, \u0442\u043E \u0435\u0441\u0442\u044C \u043C\u043E\u0441\u0442 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u043D\u0430 \u043E\u0434\u043D\u0443 \u0435\u0434\u0438\u043D\u0438\u0446\u0443 \u0434\u043B\u0438\u043D\u043D\u0435\u0435.",
            pseudoLine: 6,
            resultPreview: `\u0422\u0435\u043F\u0435\u0440\u044C \u044D\u0442\u043E\u0442 \u043F\u0443\u0442\u044C \u0438\u043C\u0435\u0435\u0442 \u0434\u043B\u0438\u043D\u0443 ${current.distance + 1}.`,
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
                panel("\u041D\u043E\u0432\u044B\u0439 \u0441\u043B\u043E\u0439", String(current.distance + 1)),
                panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", queue.map((item) => `${formatCoord(item.row, item.col)}@${item.distance}`).join(" \u2192 "))
              ],
              legend: GRID_LEGEND,
              title: "\u041F\u043E\u0448\u0430\u0433\u043E\u0432\u043E\u0435 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043F\u043E \u0432\u043E\u0434\u0435",
              formatValue: (value) => String(value)
            })
          })
        );
      }
    }
    return {
      steps: finalizeSteps(steps),
      answer: "0",
      conclusion: "\u041E\u0441\u0442\u0440\u043E\u0432\u0430 \u0443\u0436\u0435 \u0441\u043E\u043F\u0440\u0438\u043A\u0430\u0441\u0430\u044E\u0442\u0441\u044F."
    };
  }
  function runLock({ start, target, forbidden }) {
    const blocked = new Set(forbidden.map(String));
    if (blocked.has(start)) {
      throw new Error("\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0437\u0430\u043F\u0440\u0435\u0449\u0451\u043D\u043D\u044B\u0445.");
    }
    const queue = [start];
    const visited = /* @__PURE__ */ new Set([start]);
    const parent = {};
    const distance = { [start]: 0 };
    const steps = [
      createStep({
        action: `\u0421\u0442\u0430\u0440\u0442\u0443\u0435\u043C \u0441 \u043A\u043E\u0434\u0430 ${start}`,
        why: "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u0437\u0430\u043C\u043A\u0430 \u043E\u0431\u0440\u0430\u0437\u0443\u044E\u0442 \u0433\u0440\u0430\u0444 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439, \u0430 BFS \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u043D\u0430\u0439\u0442\u0438 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432 \u043C\u0435\u0436\u0434\u0443 \u043D\u0438\u043C\u0438.",
        pseudoLine: 1,
        resultPreview: `\u0426\u0435\u043B\u044C: ${target}. \u0417\u0430\u043F\u0440\u0435\u0449\u0451\u043D\u043D\u044B\u0445 \u043A\u043E\u0434\u043E\u0432: ${blocked.size}.`,
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "\u0421\u0442\u0430\u0440\u0442",
              items: [{ label: "0", value: start, state: "frontier" }]
            },
            {
              label: "\u0417\u0430\u043F\u0440\u0435\u0449\u0435\u043D\u043E",
              items: [...blocked].map((code) => ({
                label: code,
                value: code,
                state: "failure"
              }))
            }
          ]),
          panels: [panel("\u0426\u0435\u043B\u044C", target)]
        })
      })
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
          action: `\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044E ${current}`,
          why: "\u0412\u0441\u0435 \u043A\u043E\u0434\u044B, \u0438\u0437\u0432\u043B\u0435\u0447\u0451\u043D\u043D\u044B\u0435 \u0438\u0437 \u043E\u0447\u0435\u0440\u0435\u0434\u0438 \u0441\u0435\u0439\u0447\u0430\u0441, \u0434\u043E\u0441\u0442\u0438\u0433\u0430\u044E\u0442\u0441\u044F \u0437\u0430 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432.",
          pseudoLine: 3,
          resultPreview: `\u0414\u043E ${current} \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F ${distance[current]} \u0445\u043E\u0434(\u043E\u0432).`,
          stateSnapshot: makeTraceSnapshot({
            groups: buildTraceGroups([
              {
                label: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043A\u043E\u0434",
                items: [{ label: "current", value: current, state: "current" }]
              },
              {
                label: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C",
                items: queue.map((code, index) => ({
                  label: String(index + 1),
                  value: code,
                  state: "frontier"
                }))
              }
            ]),
            panels: [
              panel("\u0421\u0434\u0435\u043B\u0430\u043D\u043E \u0445\u043E\u0434\u043E\u0432", String(distance[current])),
              panel("\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u043E", String(visited.size))
            ]
          })
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
              action: `\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0434\u0438\u0441\u043A\u0430 ${index + 1} \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u043A\u043E\u0434 ${next}`,
              why: "\u042D\u0442\u043E \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0437\u0430\u043C\u043A\u0430, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u043E\u0442\u043B\u0438\u0447\u0430\u0435\u0442\u0441\u044F \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u043D\u0438\u043C \u0440\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u043C \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u043C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0435\u0433\u043E \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 BFS.",
              pseudoLine: 5,
              resultPreview: `\u0414\u043E ${next} \u043D\u0443\u0436\u043D\u043E ${distance[next]} \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432.`,
              stateSnapshot: makeTraceSnapshot({
                groups: buildTraceGroups([
                  {
                    label: "\u041D\u043E\u0432\u044B\u0439 \u0444\u0440\u043E\u043D\u0442",
                    items: queue.map((code, idx) => ({
                      label: String(idx + 1),
                      value: code,
                      state: code === next ? "current" : "frontier"
                    }))
                  }
                ]),
                panels: [
                  panel("\u041F\u0440\u0435\u0434\u043E\u043A", current),
                  panel("\u041D\u043E\u0432\u044B\u0439 \u043A\u043E\u0434", next)
                ]
              })
            })
          );
        }
      }
    }
    const path = found ? reconstructPath(parent, found) : [];
    steps.push(
      createStep({
        action: found ? "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432 \u043D\u0430\u0439\u0434\u0435\u043D\u0430" : "\u0417\u0430\u043C\u043E\u043A \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u043D\u0435\u043B\u044C\u0437\u044F",
        why: found ? "\u0426\u0435\u043B\u044C \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442\u0430 \u043D\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u043C \u0441\u043B\u043E\u0435 BFS, \u0437\u043D\u0430\u0447\u0438\u0442 \u043C\u0435\u043D\u044C\u0448\u0435\u0433\u043E \u0447\u0438\u0441\u043B\u0430 \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432 \u0431\u044B\u0442\u044C \u043D\u0435 \u043C\u043E\u0436\u0435\u0442." : "\u0412\u0441\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u044B, \u043D\u043E target \u0442\u0430\u043A \u0438 \u043D\u0435 \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u043B\u0441\u044F.",
        pseudoLine: found ? 4 : 2,
        resultPreview: found ? `\u041E\u0442\u0432\u0435\u0442: ${path.length - 1} \u0445\u043E\u0434(\u043E\u0432), \u043F\u0443\u0442\u044C ${formatPath(path)}.` : "\u041E\u0442\u0432\u0435\u0442: -1.",
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: found ? "\u041C\u0430\u0440\u0448\u0440\u0443\u0442" : "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442",
              items: (found ? path : [target]).map((code) => ({
                label: code,
                value: code,
                state: found ? "path" : "failure"
              }))
            }
          ]),
          panels: [
            panel("\u041E\u0442\u0432\u0435\u0442", found ? String(path.length - 1) : "-1"),
            panel("\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F", found ? formatPath(path) : "\u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u0430")
          ]
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: found ? String(path.length - 1) : "-1",
      conclusion: "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u0437\u0430\u043C\u043A\u0430 \u043E\u0431\u0440\u0430\u0437\u0443\u044E\u0442 \u0433\u0440\u0430\u0444 \u043E\u0447\u0435\u043D\u044C \u043F\u043E\u0445\u043E\u0436\u0438\u0439 \u043D\u0430 \u0433\u0440\u0430\u0444 \u0441\u043B\u043E\u0432: \u043A\u0430\u0436\u0434\u043E\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043E\u0434\u043D\u043E\u0439 \u0446\u0438\u0444\u0440\u044B \u043F\u043E\u0440\u043E\u0436\u0434\u0430\u0435\u0442 \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435."
    };
  }
  function runEvacuation({ grid }) {
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
        action: "\u0417\u0430\u043F\u0443\u0441\u043A\u0430\u0435\u043C BFS \u0441\u0440\u0430\u0437\u0443 \u043E\u0442 \u0432\u0441\u0435\u0445 \u0432\u044B\u0445\u043E\u0434\u043E\u0432",
        why: "\u0422\u0430\u043A \u043C\u044B \u0441\u0440\u0430\u0437\u0443 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u043C \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043E\u0442 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430 \u0434\u043E \u043A\u0430\u0436\u0434\u043E\u0439 \u043A\u043B\u0435\u0442\u043A\u0438 \u0437\u0434\u0430\u043D\u0438\u044F.",
        pseudoLine: 1,
        resultPreview: `\u0412\u044B\u0445\u043E\u0434\u043E\u0432: ${queue.length}, \u0441\u0442\u0430\u0440\u0442\u043E\u0432 \u043B\u044E\u0434\u0435\u0439: ${starts.length}.`,
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
            panel("\u0412\u044B\u0445\u043E\u0434\u044B", queue.map(({ row, col }) => formatCoord(row, col)).join(" \u2192 ")),
            panel("\u041B\u044E\u0434\u0438", starts.map(({ row, col }) => formatCoord(row, col)).join(" \u2192 "))
          ],
          legend: GRID_LEGEND,
          title: "\u041F\u043B\u0430\u043D \u044D\u0432\u0430\u043A\u0443\u0430\u0446\u0438\u0438",
          formatValue: (value) => value
        })
      })
    ];
    while (queue.length) {
      const current = queue.shift();
      const currentKey = coordKey(current.row, current.col);
      steps.push(
        createStep({
          action: `\u0420\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u044F\u0435\u043C \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u0438\u0437 ${formatCoord(current.row, current.col)}`,
          why: "\u041A\u0430\u0436\u0434\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0433\u043E \u0432\u044B\u0445\u043E\u0434\u0430, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u043C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u044B\u0439 BFS \u0438\u0434\u0451\u0442 \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043E\u0442 \u0432\u0441\u0435\u0445 E.",
          pseudoLine: 2,
          resultPreview: `\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435: ${distance[currentKey]}.`,
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
              panel("\u041E\u0447\u0435\u0440\u0435\u0434\u044C", formatQueueCoords(queue)),
              panel("\u0414\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u0439 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E", String(Object.keys(distance).length))
            ],
            legend: GRID_LEGEND,
            title: "\u0412\u043E\u043B\u043D\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u043E\u0442 \u0432\u044B\u0445\u043E\u0434\u043E\u0432",
            formatValue: (value) => value
          })
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
    const impossible = startDistances.some((value) => value === void 0);
    const worst = impossible ? -1 : Math.max(...startDistances);
    steps.push(
      createStep({
        action: impossible ? "\u041D\u0435 \u0432\u0441\u0435 \u043B\u044E\u0434\u0438 \u043C\u043E\u0433\u0443\u0442 \u0432\u044B\u0439\u0442\u0438" : "\u0412\u0440\u0435\u043C\u044F \u044D\u0432\u0430\u043A\u0443\u0430\u0446\u0438\u0438 \u0432\u044B\u0447\u0438\u0441\u043B\u0435\u043D\u043E",
        why: impossible ? "\u0415\u0441\u043B\u0438 \u0445\u043E\u0442\u044F \u0431\u044B \u0434\u043B\u044F \u043E\u0434\u043D\u043E\u0439 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u0442\u043E\u0447\u043A\u0438 \u043D\u0435 \u043D\u0430\u0448\u043B\u043E\u0441\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F, \u0437\u043D\u0430\u0447\u0438\u0442 \u043F\u0443\u0442\u044C \u0434\u043E \u0432\u044B\u0445\u043E\u0434\u0430 \u043F\u0435\u0440\u0435\u043A\u0440\u044B\u0442 \u0441\u0442\u0435\u043D\u0430\u043C\u0438." : "\u041E\u0431\u0449\u0435\u0435 \u0432\u0440\u0435\u043C\u044F \u044D\u0432\u0430\u043A\u0443\u0430\u0446\u0438\u0438 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u0442\u0441\u044F \u0441\u0430\u043C\u044B\u043C \u043C\u0435\u0434\u043B\u0435\u043D\u043D\u044B\u043C \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u043E\u043C, \u0442\u043E \u0435\u0441\u0442\u044C \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C\u043E\u043C \u0441\u0440\u0435\u0434\u0438 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0445 \u043F\u0443\u0442\u0435\u0439 \u043E\u0442 \u0432\u0441\u0435\u0445 \u0441\u0442\u0430\u0440\u0442\u043E\u0432.",
        pseudoLine: 5,
        resultPreview: impossible ? "\u041E\u0442\u0432\u0435\u0442: -1." : `\u041E\u0442\u0432\u0435\u0442: ${worst}.`,
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
                  states[key] = distance[key] === void 0 ? "failure" : "path";
                } else if (distance[key] !== void 0) {
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
            panel("\u041E\u0442\u0432\u0435\u0442", impossible ? "-1" : String(worst)),
            panel(
              "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0435 \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u0438",
              starts.map(({ row, col }) => {
                var _a;
                const key = coordKey(row, col);
                return `${formatCoord(row, col)}:${(_a = distance[key]) != null ? _a : "\u221E"}`;
              }).join(" | ")
            )
          ],
          legend: GRID_LEGEND,
          title: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043F\u043B\u0430\u043D \u044D\u0432\u0430\u043A\u0443\u0430\u0446\u0438\u0438",
          formatValue: (value) => value
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: impossible ? "-1" : String(worst),
      conclusion: "\u0417\u0434\u0435\u0441\u044C \u0432\u044B\u0433\u043E\u0434\u043D\u043E \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C BFS \u043E\u0442 \u0432\u044B\u0445\u043E\u0434\u043E\u0432, \u0430 \u043D\u0435 \u043E\u0442 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430 \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E: \u043E\u0434\u0438\u043D \u043F\u0440\u043E\u0445\u043E\u0434 \u0441\u0440\u0430\u0437\u0443 \u0434\u0430\u0451\u0442 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043F\u0443\u0442\u0438 \u043A\u043E \u0432\u0441\u0435\u043C \u043A\u043B\u0435\u0442\u043A\u0430\u043C."
    };
  }
  function runSnowball({ target }) {
    if (target < 1) {
      throw new Error("\u0427\u0438\u0441\u043B\u043E N \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043D\u0435 \u043C\u0435\u043D\u044C\u0448\u0435 1.");
    }
    const queue = [1];
    const visited = /* @__PURE__ */ new Set([1]);
    const parent = {};
    const distance = { 1: 0 };
    const steps = [
      createStep({
        action: "\u041D\u0430\u0447\u0438\u043D\u0430\u0435\u043C \u0441 X = 1",
        why: "\u041A\u0430\u0436\u0434\u0443\u044E \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044E \u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0437\u0430 \u043E\u0434\u0438\u043D \u0448\u0430\u0433, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 BFS \u043F\u043E \u0447\u0438\u0441\u043B\u0430\u043C \u043E\u0442 1 \u0434\u043E N \u0441\u0440\u0430\u0437\u0443 \u0434\u0430\u0451\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439.",
        pseudoLine: 1,
        resultPreview: `\u0426\u0435\u043B\u044C: ${target}.`,
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C",
              items: [{ label: "0", value: "1", state: "frontier" }]
            }
          ]),
          panels: [panel("\u0426\u0435\u043B\u044C", String(target))]
        })
      })
    ];
    let found = null;
    while (queue.length) {
      const current = queue.shift();
      steps.push(
        createStep({
          action: `\u041E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u043C \u0447\u0438\u0441\u043B\u043E ${current}`,
          why: "\u042D\u0442\u043E \u0447\u0438\u0441\u043B\u043E \u0443\u0436\u0435 \u0434\u043E\u0441\u0442\u0438\u0433\u043D\u0443\u0442\u043E \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u043C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u0436\u043D\u043E \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E \u043F\u043E\u0440\u043E\u0436\u0434\u0430\u0442\u044C \u0438\u0437 \u043D\u0435\u0433\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F.",
          pseudoLine: 3,
          resultPreview: `\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0434\u043B\u0438\u043D\u0430 \u043F\u0443\u0442\u0438: ${distance[current]}.`,
          stateSnapshot: makeTraceSnapshot({
            groups: buildTraceGroups([
              {
                label: "\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u0447\u0438\u0441\u043B\u043E",
                items: [{ label: "current", value: String(current), state: "current" }]
              },
              {
                label: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C",
                items: queue.map((value, index) => ({
                  label: String(index + 1),
                  value: String(value),
                  state: "frontier"
                }))
              }
            ]),
            panels: [
              panel("\u0421\u0434\u0435\u043B\u0430\u043D\u043E \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439", String(distance[current])),
              panel("\u041F\u043E\u0441\u0435\u0449\u0435\u043D\u043E \u0447\u0438\u0441\u0435\u043B", String(visited.size))
            ]
          })
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
            action: `\u041F\u043E\u043B\u0443\u0447\u0430\u0435\u043C \u0447\u0438\u0441\u043B\u043E ${next}`,
            why: "\u042D\u0442\u043E \u043D\u043E\u0432\u044B\u0439 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043E\u0434\u043D\u043E\u0439 \u0438\u0437 \u0442\u0440\u0451\u0445 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u043D \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0441\u043B\u043E\u0439 BFS.",
            pseudoLine: 5,
            resultPreview: `\u0414\u043E ${next} \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F ${distance[next]} \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439.`,
            stateSnapshot: makeTraceSnapshot({
              groups: buildTraceGroups([
                {
                  label: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0444\u0440\u043E\u043D\u0442",
                  items: queue.map((value, index) => ({
                    label: String(index + 1),
                    value: String(value),
                    state: value === next ? "current" : "frontier"
                  }))
                }
              ]),
              panels: [
                panel("\u0418\u0437 \u0447\u0438\u0441\u043B\u0430", String(current)),
                panel("\u041D\u043E\u0432\u044B\u0439 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", String(next))
              ]
            })
          })
        );
      }
    }
    const path = found ? reconstructPath(parent, found).map(Number) : [];
    steps.push(
      createStep({
        action: found ? "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \u043D\u0430\u0439\u0434\u0435\u043D\u0430" : "\u0414\u043E\u0441\u0442\u0438\u0447\u044C \u0446\u0435\u043B\u0438 \u043D\u0435\u043B\u044C\u0437\u044F",
        why: found ? "\u0426\u0435\u043B\u044C \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u043B\u0430\u0441\u044C \u043D\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u043C \u0441\u043B\u043E\u0435 BFS, \u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043D\u0430\u0439\u0434\u0435\u043D \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043D\u0430\u0431\u043E\u0440 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439." : "\u0415\u0441\u043B\u0438 \u043E\u0447\u0435\u0440\u0435\u0434\u044C \u043E\u043F\u0443\u0441\u0442\u0435\u043B\u0430, \u0432\u0441\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u0447\u0438\u0441\u043B\u0430 \u0443\u0436\u0435 \u0431\u044B\u043B\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u0435\u043D\u044B.",
        pseudoLine: found ? 4 : 2,
        resultPreview: found ? `\u041E\u0442\u0432\u0435\u0442: ${path.length - 1}, \u043F\u0443\u0442\u044C ${path.join(" \u2192 ")}.` : "\u041E\u0442\u0432\u0435\u0442: -1.",
        stateSnapshot: makeTraceSnapshot({
          groups: buildTraceGroups([
            {
              label: "\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043F\u0443\u0442\u044C",
              items: (found ? path : [1]).map((value) => ({
                label: String(value),
                value: String(value),
                state: found ? "path" : "failure"
              }))
            }
          ]),
          panels: [
            panel("\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0439", found ? String(path.length - 1) : "-1"),
            panel("\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439", "\u041E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u0434\u043B\u044F N=10: 1 \u2192 3 \u2192 9 \u2192 10")
          ]
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: found ? String(path.length - 1) : "-1",
      conclusion: "\u0414\u0430\u0436\u0435 \u0434\u043B\u044F \u0447\u0438\u0441\u043B\u043E\u0432\u044B\u0445 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0439 BFS \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0442\u0435\u043C \u0436\u0435 \u043F\u043E\u0438\u0441\u043A\u043E\u043C \u043F\u043E \u0433\u0440\u0430\u0444\u0443 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0439: \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u2014 \u044D\u0442\u043E \u0447\u0438\u0441\u043B\u043E, \u0440\u0435\u0431\u0440\u043E \u2014 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u0430\u044F \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044F."
    };
  }
  function runDfsPreorder({ values }) {
    const root = buildBinaryTree(values);
    const steps = [];
    const output = [];
    const visited = /* @__PURE__ */ new Set();
    function dfs(node, stack) {
      if (!node) {
        return;
      }
      output.push(node.value);
      visited.add(node.id);
      steps.push(
        createStep({
          action: `\u041F\u043E\u0441\u0435\u0449\u0430\u0435\u043C \u0443\u0437\u0435\u043B ${node.value}`,
          why: "\u0412 \u043F\u0440\u0435\u0444\u0438\u043A\u0441\u043D\u043E\u043C DFS \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u043E\u0431\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u043C \u0441\u0430\u043C \u0443\u0437\u0435\u043B, \u0430 \u0443\u0436\u0435 \u043F\u043E\u0442\u043E\u043C \u0443\u0445\u043E\u0434\u0438\u043C \u0432 \u043B\u0435\u0432\u043E\u0435 \u0438 \u043F\u0440\u0430\u0432\u043E\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u043E.",
          pseudoLine: 3,
          resultPreview: `\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u043E\u0440\u044F\u0434\u043E\u043A \u043E\u0431\u0445\u043E\u0434\u0430: [${output.join(", ")}].`,
          stateSnapshot: buildTreeSnapshotFromDecorators(
            root,
            Object.fromEntries(
              [...visited].map((id) => [id, { state: "visited" }]).concat([
                [node.id, { state: "current" }]
              ])
            ),
            [
              panel("\u0421\u0442\u0435\u043A \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438", [...stack, node.value].join(" \u2192 ")),
              panel("\u041E\u0442\u0432\u0435\u0442", `[${output.join(", ")}]`)
            ]
          )
        })
      );
      dfs(node.left, [...stack, node.value]);
      dfs(node.right, [...stack, node.value]);
    }
    dfs(root, []);
    steps.push(
      createStep({
        action: "\u041E\u0431\u0445\u043E\u0434 \u0434\u0435\u0440\u0435\u0432\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0451\u043D",
        why: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0443\u0437\u0435\u043B \u043F\u043E\u0441\u0435\u0442\u0438\u043B\u0438 \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u0438\u043D \u0440\u0430\u0437 \u0432 \u043F\u043E\u0440\u044F\u0434\u043A\u0435 \u043A\u043E\u0440\u0435\u043D\u044C \u2192 \u043B\u0435\u0432\u044B\u0439 \u2192 \u043F\u0440\u0430\u0432\u044B\u0439.",
        pseudoLine: 5,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: [${output.join(", ")}].`,
        stateSnapshot: buildTreeSnapshotFromDecorators(
          root,
          Object.fromEntries([...visited].map((id) => [id, { state: "visited" }])),
          [panel("\u0418\u0442\u043E\u0433\u043E\u0432\u044B\u0439 \u043E\u0431\u0445\u043E\u0434", `[${output.join(", ")}]`)]
        )
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: `[${output.join(", ")}]`,
      conclusion: "\u041F\u0440\u0435\u0444\u0438\u043A\u0441\u043D\u044B\u0439 DFS \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E \u043D\u0430\u0433\u043B\u044F\u0434\u0435\u043D \u043D\u0430 \u0434\u0435\u0440\u0435\u0432\u0435: \u043A\u0430\u0436\u0434\u044B\u0439 \u0443\u0437\u0435\u043B \u043F\u043E\u043F\u0430\u0434\u0430\u0435\u0442 \u0432 \u043E\u0442\u0432\u0435\u0442 \u0432 \u043C\u043E\u043C\u0435\u043D\u0442 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u043F\u043E\u0441\u0435\u0449\u0435\u043D\u0438\u044F."
    };
  }
  function runDfsTreeSum({ values }) {
    const root = buildBinaryTree(values);
    const steps = [];
    function dfs(node, stack) {
      if (!node) {
        return 0;
      }
      steps.push(
        createStep({
          action: `\u0412\u0445\u043E\u0434\u0438\u043C \u0432 \u0443\u0437\u0435\u043B ${node.value}`,
          why: "\u0421\u0443\u043C\u043C\u0430 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0441\u044F \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E: \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u0447\u0438\u0442\u0430\u0435\u043C \u0432\u043A\u043B\u0430\u0434 \u0434\u0435\u0442\u0435\u0439, \u0437\u0430\u0442\u0435\u043C \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0443\u0437\u043B\u0430.",
          pseudoLine: 2,
          resultPreview: `\u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u0443\u043C\u043C\u0443 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u0430 \u0441 \u043A\u043E\u0440\u043D\u0435\u043C ${node.value}.`,
          stateSnapshot: buildTreeSnapshotFromDecorators(
            root,
            {
              [node.id]: { state: "current" }
            },
            [panel("\u0421\u0442\u0435\u043A", [...stack, node.value].join(" \u2192 "))]
          )
        })
      );
      const leftSum = dfs(node.left, [...stack, node.value]);
      const rightSum = dfs(node.right, [...stack, node.value]);
      const total = node.value + leftSum + rightSum;
      steps.push(
        createStep({
          action: `\u0421\u043E\u0431\u0440\u0430\u043B\u0438 \u0441\u0443\u043C\u043C\u0443 \u0434\u043B\u044F \u0443\u0437\u043B\u0430 ${node.value}`,
          why: "\u0422\u0435\u043F\u0435\u0440\u044C \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0434\u0435\u0442\u0435\u0439 \u0443\u0436\u0435 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C \u0441\u0443\u043C\u043C\u0443 \u0432\u0441\u0435\u0433\u043E \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u0430 \u043D\u0430\u0432\u0435\u0440\u0445 \u043F\u043E \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438.",
          pseudoLine: 4,
          resultPreview: `${node.value} + ${leftSum} + ${rightSum} = ${total}.`,
          stateSnapshot: buildTreeSnapshotFromDecorators(
            root,
            {
              [node.id]: { state: "current" }
            },
            [
              panel("\u041B\u0435\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430", String(leftSum)),
              panel("\u041F\u0440\u0430\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430", String(rightSum)),
              panel("\u0418\u0442\u043E\u0433\u043E", String(total))
            ]
          )
        })
      );
      return total;
    }
    const answer = dfs(root, []);
    steps.push(
      createStep({
        action: "\u0421\u0443\u043C\u043C\u0430 \u0434\u0435\u0440\u0435\u0432\u0430 \u043D\u0430\u0439\u0434\u0435\u043D\u0430",
        why: "\u041A\u043E\u0440\u043D\u0435\u0432\u043E\u0439 \u0432\u044B\u0437\u043E\u0432 \u043F\u043E\u043B\u0443\u0447\u0438\u043B \u0441\u0443\u043C\u043C\u0443 \u0432\u0441\u0435\u0445 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u044C\u0435\u0432, \u0430 \u0437\u043D\u0430\u0447\u0438\u0442 \u0438 \u0432\u0441\u0435\u0433\u043E \u0434\u0435\u0440\u0435\u0432\u0430 \u0446\u0435\u043B\u0438\u043A\u043E\u043C.",
        pseudoLine: 4,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${answer}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
          panel("\u0424\u0438\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430", String(answer))
        ])
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: String(answer),
      conclusion: "\u0420\u0435\u043A\u0443\u0440\u0441\u0438\u044F \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u0430\u0433\u0440\u0435\u0433\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0441\u043D\u0438\u0437\u0443 \u0432\u0432\u0435\u0440\u0445: \u043A\u0430\u0436\u0434\u043E\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u043E \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u0432\u043E\u0439 \u0432\u043A\u043B\u0430\u0434 \u0440\u043E\u0434\u0438\u0442\u0435\u043B\u044E."
    };
  }
  function runDfsMaxDepth({ values }) {
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
          action: `\u041F\u043E\u0441\u0435\u0442\u0438\u043B\u0438 \u0443\u0437\u0435\u043B ${node.value} \u043D\u0430 \u0433\u043B\u0443\u0431\u0438\u043D\u0435 ${depth}`,
          why: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0440\u0430\u0437 \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u043C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u0433\u043B\u0443\u0431\u0438\u043D\u0443 \u0441 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C\u043E\u043C: \u0438\u043C\u0435\u043D\u043D\u043E \u0442\u0430\u043A DFS \u043D\u0430\u0445\u043E\u0434\u0438\u0442 \u0441\u0430\u043C\u044B\u0439 \u0434\u043B\u0438\u043D\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043E\u0442 \u043A\u043E\u0440\u043D\u044F \u0434\u043E \u043B\u0438\u0441\u0442\u0430.",
          pseudoLine: 3,
          resultPreview: `\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0441\u0435\u0439\u0447\u0430\u0441 \u0440\u0430\u0432\u0435\u043D ${maxDepth}.`,
          stateSnapshot: buildTreeSnapshotFromDecorators(
            root,
            {
              [node.id]: { state: "current" }
            },
            [
              panel("\u0413\u043B\u0443\u0431\u0438\u043D\u0430 current", String(depth)),
              panel("\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C", String(maxDepth)),
              panel("\u0421\u0442\u0435\u043A", [...stack, node.value].join(" \u2192 "))
            ]
          )
        })
      );
      dfs(node.left, depth + 1, [...stack, node.value]);
      dfs(node.right, depth + 1, [...stack, node.value]);
    }
    dfs(root, 1, []);
    steps.push(
      createStep({
        action: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0435\u043D\u0430",
        why: "DFS \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043B \u0432\u0441\u0435 \u043F\u0443\u0442\u0438 \u043E\u0442 \u043A\u043E\u0440\u043D\u044F \u0434\u043E \u043B\u0438\u0441\u0442\u044C\u0435\u0432, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0439 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u0439 \u0433\u043B\u0443\u0431\u0438\u043D\u043E\u0439 \u0434\u0435\u0440\u0435\u0432\u0430.",
        pseudoLine: 4,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${maxDepth}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
          panel("\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u0430", String(maxDepth))
        ])
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: String(maxDepth),
      conclusion: "DFS \u0435\u0441\u0442\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442 \u0434\u0435\u0440\u0435\u0432\u043E \u043F\u043E \u0432\u0441\u0435\u043C \u0432\u0435\u0442\u043A\u0430\u043C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0437\u0430\u0434\u0430\u0447\u0430 \u043D\u0430 \u0433\u043B\u0443\u0431\u0438\u043D\u0443 \u0441\u0432\u043E\u0434\u0438\u0442\u0441\u044F \u043A \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u0430\u043D\u0438\u044E \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438."
    };
  }
  function runMirrorTree({ values }) {
    const root = buildBinaryTree(values);
    const steps = [];
    function dfs(node) {
      if (!node) {
        return;
      }
      steps.push(
        createStep({
          action: `\u0413\u043E\u0442\u043E\u0432\u0438\u043C \u043E\u0431\u043C\u0435\u043D \u0434\u0435\u0442\u0435\u0439 \u0443 \u0443\u0437\u043B\u0430 ${node.value}`,
          why: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u0434\u043E\u0441\u0442\u0438\u0433\u0430\u0435\u0442\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E: \u0435\u0441\u043B\u0438 \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C \u043B\u0435\u0432\u043E\u0433\u043E \u0438 \u043F\u0440\u0430\u0432\u043E\u0433\u043E \u0440\u0435\u0431\u0451\u043D\u043A\u0430 \u0443 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0443\u0437\u043B\u0430, \u0432\u0441\u0451 \u0434\u0435\u0440\u0435\u0432\u043E \u043E\u0442\u0440\u0430\u0437\u0438\u0442\u0441\u044F \u0446\u0435\u043B\u0438\u043A\u043E\u043C.",
          pseudoLine: 3,
          resultPreview: "\u0421\u0435\u0439\u0447\u0430\u0441 \u043C\u0435\u043D\u044F\u0435\u043C \u043C\u0435\u0441\u0442\u0430\u043C\u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u044C\u044F \u044D\u0442\u043E\u0433\u043E \u0443\u0437\u043B\u0430.",
          stateSnapshot: buildTreeSnapshotFromDecorators(root, {
            [node.id]: { state: "current" }
          })
        })
      );
      const temp = node.left;
      node.left = node.right;
      node.right = temp;
      steps.push(
        createStep({
          action: `\u0423\u0437\u0435\u043B ${node.value} \u043E\u0442\u0437\u0435\u0440\u043A\u0430\u043B\u0435\u043D`,
          why: "\u041F\u043E\u0441\u043B\u0435 \u043E\u0431\u043C\u0435\u043D\u0430 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0430 \u0443\u0436\u0435 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0430, \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0442\u0443 \u0436\u0435 \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u044E \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E \u0432 \u043F\u043E\u0442\u043E\u043C\u043A\u0430\u0445.",
          pseudoLine: 4,
          resultPreview: `\u0414\u043B\u044F \u0443\u0437\u043B\u0430 ${node.value} \u043B\u0435\u0432\u043E\u0435 \u0438 \u043F\u0440\u0430\u0432\u043E\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u044C\u044F \u043F\u043E\u043C\u0435\u043D\u044F\u043B\u0438\u0441\u044C \u043C\u0435\u0441\u0442\u0430\u043C\u0438.`,
          stateSnapshot: buildTreeSnapshotFromDecorators(root, {
            [node.id]: { state: "path" }
          })
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
        action: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E \u0433\u043E\u0442\u043E\u0432\u043E",
        why: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0443\u0437\u0435\u043B \u0431\u044B\u043B \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D \u043E\u0434\u0438\u043D \u0440\u0430\u0437, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u043E \u043F\u043E \u0432\u0441\u0435\u043C\u0443 \u0434\u0435\u0440\u0435\u0432\u0443.",
        pseudoLine: 4,
        resultPreview: `\u041D\u043E\u0432\u0430\u044F level-order \u0444\u043E\u0440\u043C\u0430: ${answerText}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
          panel("\u041D\u043E\u0432\u044B\u0439 \u043E\u0431\u0445\u043E\u0434 \u043F\u043E \u0443\u0440\u043E\u0432\u043D\u044F\u043C", answerText)
        ])
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: answerText,
      conclusion: "\u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u0435\u0440\u0435\u0432\u0430 \u0434\u0435\u043B\u0430\u0435\u0442\u0441\u044F \u043E\u0447\u0435\u043D\u044C \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E: \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0443 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0443\u0437\u043B\u0430 \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C \u043C\u0435\u0441\u0442\u0430\u043C\u0438 \u0434\u0435\u0442\u0435\u0439 \u0438 \u043F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0442\u043E \u0436\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E."
    };
  }
  function runFindInTree({ values, target }) {
    const root = buildBinaryTree(values);
    const steps = [];
    let found = false;
    function dfs(node, stack) {
      if (!node || found) {
        return false;
      }
      steps.push(
        createStep({
          action: `\u0421\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0435\u043C \u0443\u0437\u0435\u043B ${node.value} \u0441 target = ${target}`,
          why: "DFS \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u0442 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043F\u043E \u0432\u0435\u0442\u043A\u0430\u043C \u0434\u0435\u0440\u0435\u0432\u0430, \u043F\u043E\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0451\u0442 \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043D\u0435 \u0438\u0441\u0447\u0435\u0440\u043F\u0430\u0435\u0442 \u0432\u0441\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B.",
          pseudoLine: 2,
          resultPreview: `${node.value === target ? "\u0421\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E." : "\u041F\u043E\u043A\u0430 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u043B\u043E."}`,
          stateSnapshot: buildTreeSnapshotFromDecorators(
            root,
            {
              [node.id]: { state: node.value === target ? "found" : "current" }
            },
            [panel("\u0421\u0442\u0435\u043A", [...stack, node.value].join(" \u2192 "))]
          )
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
        action: found ? "\u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u043D\u0430\u0439\u0434\u0435\u043D" : "\u042D\u043B\u0435\u043C\u0435\u043D\u0442 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442",
        why: found ? "\u041E\u0434\u043D\u0430 \u0438\u0437 \u0432\u0435\u0442\u043E\u043A DFS \u0434\u043E\u0448\u043B\u0430 \u0434\u043E \u043D\u0443\u0436\u043D\u043E\u0433\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u043B\u0430 \u043F\u043E\u0438\u0441\u043A." : "\u041D\u0438 \u043E\u0434\u0438\u043D \u0443\u0437\u0435\u043B \u0434\u0435\u0440\u0435\u0432\u0430 \u043D\u0435 \u0441\u043E\u0432\u043F\u0430\u043B \u0441 target, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u0442\u0432\u0435\u0442 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439.",
        pseudoLine: found ? 3 : 4,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${found ? "True" : "False"}.`,
        stateSnapshot: buildTreeSnapshotFromDecorators(root, {}, [
          panel("\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", found ? "True" : "False")
        ])
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: found ? "True" : "False",
      conclusion: "\u041F\u043E\u0438\u0441\u043A \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430 \u0432 \u0434\u0435\u0440\u0435\u0432\u0435 \u2014 \u044D\u0442\u043E \u043A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 DFS \u0441 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u043C \u0437\u0430\u043C\u044B\u043A\u0430\u043D\u0438\u0435\u043C: \u043A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E, \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E \u043C\u043E\u0436\u043D\u043E \u043D\u0435 \u043E\u0431\u0445\u043E\u0434\u0438\u0442\u044C."
    };
  }
  function runDfsMaze({ grid, start, end }) {
    if (grid[start.row][start.col] === 1 || grid[end.row][end.col] === 1) {
      throw new Error("\u0421\u0442\u0430\u0440\u0442 \u0438 \u0444\u0438\u043D\u0438\u0448 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u0442\u044C \u043F\u0440\u043E\u0445\u043E\u0434\u0430\u043C\u0438.");
    }
    const visited = /* @__PURE__ */ new Set();
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
          action: `DFS \u0437\u0430\u0445\u043E\u0434\u0438\u0442 \u0432 ${formatCoord(row, col)}`,
          why: "\u0412 \u043E\u0442\u043B\u0438\u0447\u0438\u0435 \u043E\u0442 BFS, DFS \u0438\u0434\u0451\u0442 \u0433\u043B\u0443\u0431\u043E\u043A\u043E \u0432 \u043E\u0434\u043D\u0443 \u0432\u0435\u0442\u043A\u0443, \u043F\u043E\u043A\u0430 \u043D\u0435 \u0443\u043F\u0440\u0451\u0442\u0441\u044F \u0432 \u043F\u0440\u0435\u043F\u044F\u0442\u0441\u0442\u0432\u0438\u0435 \u0438\u043B\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0451\u0442 \u0446\u0435\u043B\u044C.",
          pseudoLine: 2,
          resultPreview: `\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0432\u0435\u0442\u043A\u0430: ${formatCoordPath(nextPath)}.`,
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            end,
            current: { row, col },
            visited: [...visited],
            path: nextPath,
            panels: [
              panel("\u0413\u043B\u0443\u0431\u0438\u043D\u0430 \u0432\u0435\u0442\u043A\u0438", String(nextPath.length)),
              panel("\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0443\u0442\u044C", formatCoordPath(nextPath))
            ],
            title: "\u0413\u043B\u0443\u0431\u0438\u043D\u043D\u044B\u0439 \u043E\u0431\u0445\u043E\u0434 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430"
          })
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
          action: `\u0418\u0437 ${formatCoord(row, col)} \u043F\u0440\u0438\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043E\u0442\u043A\u0430\u0442\u0438\u0442\u044C\u0441\u044F`,
          why: "\u042D\u0442\u0430 \u0432\u0435\u0442\u043A\u0430 \u043D\u0435 \u043F\u0440\u0438\u0432\u0435\u043B\u0430 \u043A \u0444\u0438\u043D\u0438\u0448\u0443, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C\u0441\u044F \u043D\u0430 \u0448\u0430\u0433 \u043D\u0430\u0437\u0430\u0434 \u0438 \u043F\u0440\u043E\u0431\u0443\u0435\u043C \u0434\u0440\u0443\u0433\u043E\u0433\u043E \u0441\u043E\u0441\u0435\u0434\u0430.",
          pseudoLine: 6,
          resultPreview: "\u0418\u0434\u0451\u0442 backtracking \u0432\u043D\u0443\u0442\u0440\u0438 DFS.",
          stateSnapshot: buildMazeSnapshot({
            grid,
            start,
            end,
            current: { row, col },
            visited: [...visited],
            path: currentPath,
            panels: [
              panel("\u041E\u0442\u043A\u0430\u0442", formatCoord(row, col)),
              panel("\u041E\u0441\u0442\u0430\u0432\u0448\u0438\u0439\u0441\u044F \u043F\u0443\u0442\u044C", currentPath.length ? formatCoordPath(currentPath) : "\u043F\u0443\u0441\u0442\u043E")
            ],
            title: "\u041E\u0442\u043A\u0430\u0442 \u043F\u043E \u043D\u0435\u0443\u0434\u0430\u0447\u043D\u043E\u0439 \u0432\u0435\u0442\u043A\u0435"
          })
        })
      );
      return false;
    }
    const exists = dfs(start.row, start.col, []);
    steps.push(
      createStep({
        action: exists ? "\u041F\u0443\u0442\u044C \u0432 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442" : "\u041F\u0443\u0442\u044C \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442",
        why: exists ? "DFS \u0441\u043C\u043E\u0433 \u0434\u043E\u0439\u0442\u0438 \u0434\u043E \u0444\u0438\u043D\u0438\u0448\u0430 \u0445\u043E\u0442\u044F \u0431\u044B \u043E\u0434\u043D\u043E\u0439 \u0433\u043B\u0443\u0431\u043E\u043A\u043E\u0439 \u0432\u0435\u0442\u043A\u043E\u0439." : "\u0414\u0430\u0436\u0435 \u043F\u043E\u0441\u043B\u0435 \u043E\u0431\u0445\u043E\u0434\u0430 \u0432\u0441\u0435\u0445 \u0432\u0435\u0442\u043E\u043A \u043D\u0438 \u043E\u0434\u043D\u0430 \u043D\u0435 \u0434\u043E\u0448\u043B\u0430 \u0434\u043E \u0444\u0438\u043D\u0438\u0448\u0430.",
        pseudoLine: exists ? 3 : 6,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${exists ? "True" : "False"}.`,
        stateSnapshot: buildMazeSnapshot({
          grid,
          start,
          end,
          visited: [...visited],
          path: foundPath != null ? foundPath : [],
          panels: [panel("\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", exists ? "True" : "False")],
          title: "\u0418\u0442\u043E\u0433 DFS \u043F\u043E \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0443"
        })
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: exists ? "True" : "False",
      conclusion: "DFS \u043D\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u0443\u0435\u0442 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C, \u043D\u043E \u043E\u0442\u043B\u0438\u0447\u043D\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442, \u043A\u043E\u0433\u0434\u0430 \u043D\u0443\u0436\u043D\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u0432\u044B\u044F\u0441\u043D\u0438\u0442\u044C, \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u043B\u0438 \u043A\u0430\u043A\u043E\u0439-\u043D\u0438\u0431\u0443\u0434\u044C \u043F\u0443\u0442\u044C."
    };
  }
  function runDijkstraCore({
    edges,
    start,
    target = null,
    allowEqualParents = false,
    rejectNegative = true
  }) {
    const nodeIds = /* @__PURE__ */ new Set([start]);
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
            action: "\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u044B \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D",
            why: "\u0412 \u0433\u0440\u0430\u0444\u0435 \u0435\u0441\u0442\u044C \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E. \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u043F\u0440\u0435\u0434\u043F\u043E\u043B\u0430\u0433\u0430\u0435\u0442, \u0447\u0442\u043E \u043F\u043E\u0441\u043B\u0435 \u0432\u044B\u0431\u043E\u0440\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u0435\u0451 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0443\u0436\u0435 \u043D\u0435 \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u0441\u044F, \u0430 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0432\u0435\u0441\u0430 \u043B\u043E\u043C\u0430\u044E\u0442 \u044D\u0442\u043E \u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E.",
            pseudoLine: 1,
            resultPreview: "\u0414\u043B\u044F \u0442\u0430\u043A\u043E\u0433\u043E \u0432\u0445\u043E\u0434\u0430 \u043D\u0443\u0436\u0435\u043D \u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434.",
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances: Object.fromEntries(sortedNodes.map((node) => [node, node === start ? 0 : INF])),
              parents: {},
              current: null,
              processed: /* @__PURE__ */ new Set(),
              failureNodes: sortedNodes,
              extraPanels: [panel("\u041F\u0440\u0438\u0447\u0438\u043D\u0430", "\u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u043E \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E")]
            })
          })
        ]),
        answer: "\u041D\u0435\u043B\u044C\u0437\u044F \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C",
        conclusion: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0438 \u043D\u0435\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0432\u0435\u0441\u0430\u0445. \u0415\u0441\u043B\u0438 \u0435\u0441\u0442\u044C \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0451\u0431\u0440\u0430, \u043D\u0443\u0436\u043D\u043E \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F \u043D\u0430 \u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434."
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
    const parentSets = Object.fromEntries(sortedNodes.map((node) => [node, /* @__PURE__ */ new Set()]));
    const processed = /* @__PURE__ */ new Set();
    const steps = [
      createStep({
        action: `\u0418\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u043C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u043E\u0442 \u0432\u0435\u0440\u0448\u0438\u043D\u044B ${start}`,
        why: "\u041D\u0430 \u0441\u0442\u0430\u0440\u0442\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0441\u0445\u043E\u0434\u043D\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u0438\u043C\u0435\u0435\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 0, \u0430 \u0434\u043E \u0432\u0441\u0435\u0445 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u043F\u0443\u0442\u044C \u0435\u0449\u0451 \u043D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u0435\u043D.",
        pseudoLine: 1,
        resultPreview: sortedNodes.map((node) => `${node}:${formatMaybeInfinity(distances[node])}`).join(" | "),
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: start,
          processed,
          extraPanels: [panel("\u0421\u0442\u0430\u0440\u0442", start)]
        })
      })
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
          action: `\u0412\u044B\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u0435\u0440\u0448\u0438\u043D\u0443 ${current} \u0441 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C\u044E`,
          why: "\u0421\u0440\u0435\u0434\u0438 \u043D\u0435\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043D\u044B\u0445 \u0432\u0435\u0440\u0448\u0438\u043D \u0438\u043C\u0435\u043D\u043D\u043E \u0443 \u043D\u0435\u0451 \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0430\u0438\u043C\u0435\u043D\u044C\u0448\u0430\u044F \u043E\u0446\u0435\u043D\u043A\u0430 \u043F\u0443\u0442\u0438, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0434\u0435\u043B\u0430\u0435\u0442 \u0435\u0451 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0439 \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u043E\u0439.",
          pseudoLine: 2,
          resultPreview: `distance[${current}] = ${formatMaybeInfinity(distances[current])}.`,
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current,
            processed
          })
        })
      );
      for (const edge of adjacency[current]) {
        const candidate = distances[current] + edge.weight;
        if (candidate < distances[edge.to]) {
          distances[edge.to] = candidate;
          parents[edge.to] = current;
          parentSets[edge.to] = /* @__PURE__ */ new Set([current]);
          steps.push(
            createStep({
              action: `\u0420\u0435\u043B\u0430\u043A\u0441\u0438\u0440\u0443\u0435\u043C \u0440\u0435\u0431\u0440\u043E ${edge.from} \u2192 ${edge.to}`,
              why: "\u0427\u0435\u0440\u0435\u0437 \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u0432\u0435\u0440\u0448\u0438\u043D\u0443 \u043D\u0430\u0448\u0451\u043B\u0441\u044F \u0431\u043E\u043B\u0435\u0435 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u043F\u0443\u0442\u044C \u043A \u0441\u043E\u0441\u0435\u0434\u0443, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u044B\u0432\u0430\u0435\u043C \u0435\u0433\u043E \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0438 \u0437\u0430\u043F\u043E\u043C\u0438\u043D\u0430\u0435\u043C \u043D\u043E\u0432\u043E\u0433\u043E \u043F\u0440\u0435\u0434\u043A\u0430.",
              pseudoLine: 4,
              resultPreview: `${edge.to}: \u043D\u043E\u0432\u043E\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 ${candidate}, \u043F\u0440\u0435\u0434\u043E\u043A ${current}.`,
              stateSnapshot: buildGraphSnapshotFromState({
                nodeIds,
                edges,
                distances,
                parents,
                current,
                processed,
                activeEdge: edge
              })
            })
          );
        } else if (allowEqualParents && candidate === distances[edge.to]) {
          parentSets[edge.to].add(current);
          steps.push(
            createStep({
              action: `\u0424\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u043C \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u043D\u044B\u0439 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C \u043A ${edge.to}`,
              why: "\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043D\u0435 \u0443\u043B\u0443\u0447\u0448\u0438\u043B\u0430\u0441\u044C, \u043D\u043E \u043E\u043A\u0430\u0437\u0430\u043B\u0430\u0441\u044C \u0442\u0430\u043A\u043E\u0439 \u0436\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439, \u0437\u043D\u0430\u0447\u0438\u0442 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u0435\u0449\u0451 \u043E\u0434\u0438\u043D \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u0442\u043E\u0439 \u0436\u0435 \u0434\u043B\u0438\u043D\u044B.",
              pseudoLine: 4,
              resultPreview: `\u0423 \u0432\u0435\u0440\u0448\u0438\u043D\u044B ${edge.to} \u0442\u0435\u043F\u0435\u0440\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0440\u0430\u0432\u043D\u043E\u043F\u0440\u0430\u0432\u043D\u044B\u0445 \u043F\u0440\u0435\u0434\u043A\u043E\u0432.`,
              stateSnapshot: buildGraphSnapshotFromState({
                nodeIds,
                edges,
                distances,
                parents,
                current,
                processed,
                activeEdge: edge
              })
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
        conclusion = "\u0415\u0441\u043B\u0438 \u0443 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043F\u043E\u0441\u043B\u0435 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u044F \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C\u0430 \u043E\u0441\u0442\u0430\u043B\u0430\u0441\u044C \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C, \u0437\u043D\u0430\u0447\u0438\u0442 \u0438\u0437 \u0441\u0442\u0430\u0440\u0442\u0430 \u043E\u043D\u0430 \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u0430.";
        steps.push(
          createStep({
            action: `\u0412\u0435\u0440\u0448\u0438\u043D\u0430 ${target} \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u0430`,
            why: "\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043B \u0432\u0441\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B, \u043D\u043E \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0434\u043B\u044F target \u0442\u0430\u043A \u0438 \u043D\u0435 \u0441\u0442\u0430\u043B\u0430 \u043A\u043E\u043D\u0435\u0447\u043D\u043E\u0439.",
            pseudoLine: 6,
            resultPreview: "\u041E\u0442\u0432\u0435\u0442: -1.",
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances,
              parents,
              current: null,
              processed,
              failureNodes: [target]
            })
          })
        );
      } else if (allowEqualParents) {
        const paths = reconstructAllPaths(parentSets, start, target).map(
          (path) => formatPath(path)
        );
        answer = `${formatMaybeInfinity(distances[target])}`;
        conclusion = "\u0415\u0441\u043B\u0438 \u043F\u0440\u0438 \u0440\u0435\u043B\u0430\u043A\u0441\u0430\u0446\u0438\u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0441\u044F \u0442\u0430 \u0436\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C, \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u043F\u0440\u0435\u0434\u043A\u0430, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0432\u0441\u0435 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u044B.";
        steps.push(
          createStep({
            action: `\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u0432\u0441\u0435 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043F\u0443\u0442\u0438 \u0434\u043E ${target}`,
            why: "\u041C\u044B \u0445\u0440\u0430\u043D\u0438\u043B\u0438 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0435\u0434\u043A\u043E\u0432 \u0434\u043B\u044F \u0432\u0435\u0440\u0448\u0438\u043D \u0441 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E\u0439 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C\u044E, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043C\u043E\u0436\u0435\u043C \u043F\u0435\u0440\u0435\u0447\u0438\u0441\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0435 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u044B.",
            pseudoLine: 6,
            resultPreview: `\u0414\u043B\u0438\u043D\u0430 ${distances[target]}, \u043F\u0443\u0442\u0438: ${paths.join(" | ")}.`,
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances,
              parents,
              current: target,
              processed,
              pathNodes: uniquePathsNodes(paths),
              extraPanels: [panel("\u041A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043F\u0443\u0442\u0438", paths.join(" | "))]
            })
          })
        );
      } else {
        const path = reconstructPath(parents, target);
        answer = `${formatMaybeInfinity(distances[target])}`;
        conclusion = "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0448\u0430\u0433 \u0437\u0430 \u0448\u0430\u0433\u043E\u043C \u0444\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u0442 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0438 \u043F\u043E \u0442\u0430\u0431\u043B\u0438\u0446\u0435 \u043F\u0440\u0435\u0434\u043A\u043E\u0432 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0441\u0430\u043C \u043C\u0430\u0440\u0448\u0440\u0443\u0442.";
        steps.push(
          createStep({
            action: `\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u043F\u0443\u0442\u044C \u0434\u043E ${target}`,
            why: "\u041A\u043E\u0433\u0434\u0430 \u0432\u0441\u0435 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u0438 \u0443\u0436\u0435 \u043F\u043E\u0441\u0447\u0438\u0442\u0430\u043D\u044B, \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043F\u0440\u043E\u0439\u0442\u0438 \u043F\u043E \u0442\u0430\u0431\u043B\u0438\u0446\u0435 \u043F\u0440\u0435\u0434\u043A\u043E\u0432 \u043E\u0442 target \u043D\u0430\u0437\u0430\u0434 \u043A start.",
            pseudoLine: 6,
            resultPreview: `\u0414\u043B\u0438\u043D\u0430 ${distances[target]}, \u043F\u0443\u0442\u044C ${formatPath(path)}.`,
            stateSnapshot: buildGraphSnapshotFromState({
              nodeIds,
              edges,
              distances,
              parents,
              current: target,
              processed,
              pathNodes: path,
              extraPanels: [panel("\u041C\u0430\u0440\u0448\u0440\u0443\u0442", formatPath(path))]
            })
          })
        );
      }
    } else {
      answer = sortedNodes.map((node) => `${node}:${formatMaybeInfinity(distances[node])}`).join(" | ");
      conclusion = "\u041A\u043E\u0433\u0434\u0430 \u0446\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u0430, \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0441\u0440\u0430\u0437\u0443 \u0432\u044B\u0434\u0430\u0451\u0442 \u0442\u0430\u0431\u043B\u0438\u0446\u0443 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0445 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u0434\u043E \u0432\u0441\u0435\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0445 \u0432\u0435\u0440\u0448\u0438\u043D.";
      steps.push(
        createStep({
          action: "\u041F\u043E\u043B\u0443\u0447\u0430\u0435\u043C \u0438\u0442\u043E\u0433\u043E\u0432\u0443\u044E \u0442\u0430\u0431\u043B\u0438\u0446\u0443 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439",
          why: "\u041F\u043E\u0441\u043B\u0435 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0432\u0441\u0435\u0445 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u0432\u0435\u0440\u0448\u0438\u043D \u043A\u0430\u0436\u0434\u0430\u044F \u043A\u043E\u043D\u0435\u0447\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0443\u0436\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0439.",
          pseudoLine: 6,
          resultPreview: answer,
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: null,
            processed
          })
        })
      );
    }
    return {
      steps: finalizeSteps(steps),
      answer,
      conclusion
    };
  }
  function uniquePathsNodes(paths) {
    const set = /* @__PURE__ */ new Set();
    for (const path of paths) {
      for (const node of path.split(" \u2192 ")) {
        set.add(node);
      }
    }
    return [...set];
  }
  function runBellmanFordCore({
    edges,
    start,
    target = null,
    noteDijkstra = false
  }) {
    const nodeIds = /* @__PURE__ */ new Set([start]);
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
        action: `\u0418\u043D\u0438\u0446\u0438\u0430\u043B\u0438\u0437\u0438\u0440\u0443\u0435\u043C \u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 \u043E\u0442 \u0432\u0435\u0440\u0448\u0438\u043D\u044B ${start}`,
        why: "\u041A\u0430\u043A \u0438 \u0432 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0435, \u0441\u0442\u0430\u0440\u0442 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C 0, \u043D\u043E \u0434\u0430\u043B\u044C\u0448\u0435 \u043C\u044B \u043D\u0435 \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043F\u043E \u043C\u0438\u043D\u0438\u043C\u0443\u043C\u0443, \u0430 \u043C\u043D\u043E\u0433\u043E\u043A\u0440\u0430\u0442\u043D\u043E \u043F\u0435\u0440\u0435\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u0441\u0435 \u0440\u0451\u0431\u0440\u0430.",
        pseudoLine: 1,
        resultPreview: sortedNodes.map((node) => `${node}:${formatMaybeInfinity(distances[node])}`).join(" | "),
        stateSnapshot: buildGraphSnapshotFromState({
          nodeIds,
          edges,
          distances,
          parents,
          current: start,
          processed: /* @__PURE__ */ new Set()
        })
      })
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
              action: `\u0418\u0442\u0435\u0440\u0430\u0446\u0438\u044F ${iteration}: \u0443\u043B\u0443\u0447\u0448\u0430\u0435\u043C \u043F\u0443\u0442\u044C ${edge.from} \u2192 ${edge.to}`,
              why: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 \u043F\u044B\u0442\u0430\u0435\u0442\u0441\u044F \u0440\u0435\u043B\u0430\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0436\u0434\u043E\u0435 \u0440\u0435\u0431\u0440\u043E. \u0415\u0441\u043B\u0438 \u043F\u0443\u0442\u044C \u0447\u0435\u0440\u0435\u0437 edge.from \u043A\u043E\u0440\u043E\u0447\u0435, \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F.",
              pseudoLine: 3,
              resultPreview: `${edge.to}: ${candidate}, \u043F\u0440\u0435\u0434\u043E\u043A ${edge.from}.`,
              stateSnapshot: buildGraphSnapshotFromState({
                nodeIds,
                edges,
                distances,
                parents,
                current: edge.to,
                processed: /* @__PURE__ */ new Set(),
                activeEdge: edge,
                extraPanels: [
                  panel("\u0418\u0442\u0435\u0440\u0430\u0446\u0438\u044F", String(iteration)),
                  panel("\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439 \u0434\u043B\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u044B", `${edge.to}: ${updateCounts[edge.to]}`)
                ]
              })
            })
          );
        }
      }
      steps.push(
        createStep({
          action: `\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u043B\u0438 \u043F\u0440\u043E\u0445\u043E\u0434 ${iteration} \u043F\u043E \u0440\u0451\u0431\u0440\u0430\u043C`,
          why: updated ? "\u041F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0445\u043E\u0434\u0430 \u0447\u0430\u0441\u0442\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u0441\u0442\u0430\u043B\u0430 \u043B\u0443\u0447\u0448\u0435. \u0417\u043D\u0430\u0447\u0438\u0442, \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u043F\u0440\u043E\u0445\u043E\u0434 \u0435\u0449\u0451 \u043C\u043E\u0436\u0435\u0442 \u043F\u0440\u043E\u0442\u043E\u043B\u043A\u043D\u0443\u0442\u044C \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F \u0434\u0430\u043B\u044C\u0448\u0435 \u043F\u043E \u0433\u0440\u0430\u0444\u0443." : "\u0415\u0441\u043B\u0438 \u043D\u0438 \u043E\u0434\u043D\u043E \u0440\u0435\u0431\u0440\u043E \u043D\u0435 \u0443\u043B\u0443\u0447\u0448\u0438\u043B\u043E \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F, \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0443\u0436\u0435 \u043C\u043E\u0436\u0435\u0442 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C\u0441\u044F \u0440\u0430\u043D\u044C\u0448\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0438.",
          pseudoLine: 2,
          resultPreview: sortedNodes.map((node) => `${node}:${formatMaybeInfinity(distances[node])}`).join(" | "),
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: null,
            processed: /* @__PURE__ */ new Set(),
            extraPanels: [panel("\u0418\u0442\u0435\u0440\u0430\u0446\u0438\u044F", String(iteration))]
          })
        })
      );
      if (!updated) {
        break;
      }
    }
    let negativeCycleEdge = null;
    for (const edge of edges) {
      if (Number.isFinite(distances[edge.from]) && distances[edge.from] + edge.weight < distances[edge.to]) {
        negativeCycleEdge = edge;
        break;
      }
    }
    if (negativeCycleEdge) {
      steps.push(
        createStep({
          action: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0439 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B",
          why: "\u041F\u043E\u0441\u043B\u0435 |V|-1 \u043F\u0440\u043E\u0445\u043E\u0434\u043E\u0432 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0443\u0436\u0435 \u0434\u043E\u043B\u0436\u043D\u044B \u0431\u044B\u043B\u0438 \u0441\u0442\u0430\u0431\u0438\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F. \u0415\u0441\u043B\u0438 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u0437\u043D\u0430\u0447\u0438\u0442 \u043F\u0443\u0442\u044C \u043C\u043E\u0436\u043D\u043E \u0443\u043C\u0435\u043D\u044C\u0448\u0430\u0442\u044C \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E.",
          pseudoLine: 6,
          resultPreview: `\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E: ${negativeCycleEdge.from} \u2192 ${negativeCycleEdge.to}.`,
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: negativeCycleEdge.to,
            processed: /* @__PURE__ */ new Set(),
            activeEdge: negativeCycleEdge,
            failureNodes: [negativeCycleEdge.from, negativeCycleEdge.to]
          })
        })
      );
      return {
        steps: finalizeSteps(steps),
        answer: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B",
        conclusion: "\u042D\u0442\u043E \u043A\u043B\u044E\u0447\u0435\u0432\u043E\u0435 \u043E\u0442\u043B\u0438\u0447\u0438\u0435 \u0411\u0435\u043B\u043B\u043C\u0430\u043D\u0430\u2013\u0424\u043E\u0440\u0434\u0430 \u043E\u0442 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u044B: \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0443\u043C\u0435\u0435\u0442 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0441 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u0432\u0435\u0441\u0430\u043C\u0438, \u043D\u043E \u0438 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0432\u0430\u0442\u044C \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0446\u0438\u043A\u043B\u044B.",
        distances,
        parents,
        hasNegativeCycle: true,
        updateCounts
      };
    }
    if (target) {
      const path = Number.isFinite(distances[target]) ? reconstructPath(parents, target) : [];
      steps.push(
        createStep({
          action: Number.isFinite(distances[target]) ? `\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u043F\u0443\u0442\u044C \u0434\u043E ${target}` : `\u0412\u0435\u0440\u0448\u0438\u043D\u0430 ${target} \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u0430`,
          why: Number.isFinite(distances[target]) ? "\u041A\u043E\u0433\u0434\u0430 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430 \u043D\u0435\u0442, \u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043F\u0440\u043E\u0439\u0442\u0438 \u043F\u043E \u043F\u0440\u0435\u0434\u043A\u0430\u043C \u043D\u0430\u0437\u0430\u0434, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442." : "\u0415\u0441\u043B\u0438 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u044B\u043C, \u0437\u043D\u0430\u0447\u0438\u0442 \u0438\u0437 \u0441\u0442\u0430\u0440\u0442\u0430 \u044D\u0442\u0430 \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u0432\u043E\u043E\u0431\u0449\u0435 \u043D\u0435 \u0434\u043E\u0441\u0442\u0438\u0433\u0430\u0435\u0442\u0441\u044F.",
          pseudoLine: 4,
          resultPreview: Number.isFinite(distances[target]) ? `\u0414\u043B\u0438\u043D\u0430 ${distances[target]}, \u043F\u0443\u0442\u044C ${formatPath(path)}.` : "\u041E\u0442\u0432\u0435\u0442: -1.",
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: target,
            processed: /* @__PURE__ */ new Set(),
            pathNodes: path,
            failureNodes: Number.isFinite(distances[target]) ? [] : [target],
            extraPanels: [
              panel("\u0414\u043B\u0438\u043D\u0430", Number.isFinite(distances[target]) ? String(distances[target]) : "-1"),
              panel("\u041F\u0443\u0442\u044C", path.length ? formatPath(path) : "\u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D")
            ]
          })
        })
      );
    } else {
      steps.push(
        createStep({
          action: "\u0424\u043E\u0440\u043C\u0438\u0440\u0443\u0435\u043C \u0438\u0442\u043E\u0433\u043E\u0432\u0443\u044E \u0442\u0430\u0431\u043B\u0438\u0446\u0443 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439",
          why: "\u041F\u043E\u0441\u043B\u0435 \u0441\u0442\u0430\u0431\u0438\u043B\u0438\u0437\u0430\u0446\u0438\u0438 \u0440\u0451\u0431\u0435\u0440 \u0432\u0441\u0435 \u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u044F\u0432\u043B\u044F\u044E\u0442\u0441\u044F \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u043C\u0438 \u043E\u0442 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u044B.",
          pseudoLine: 4,
          resultPreview: sortedNodes.map((node) => `${node}:${formatMaybeInfinity(distances[node])}`).join(" | "),
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: null,
            processed: /* @__PURE__ */ new Set()
          })
        })
      );
    }
    if (noteDijkstra) {
      steps.push(
        createStep({
          action: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u043E\u0439",
          why: "\u041E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u043C\u043E\u0436\u0435\u0442 \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0443\u0436\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0439 \u043F\u0443\u0442\u044C \u043F\u043E\u0437\u0436\u0435, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044F \u0432\u044B\u0431\u043E\u0440\u0430 \xAB\u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0439\xBB \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u0443 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u044B \u0437\u0434\u0435\u0441\u044C \u0431\u044B\u043B\u0430 \u0431\u044B \u043D\u0435\u0432\u0435\u0440\u043D\u043E\u0439.",
          pseudoLine: 6,
          resultPreview: "\u041D\u0430 \u0442\u0430\u043A\u0438\u0445 \u0433\u0440\u0430\u0444\u0430\u0445 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u0443\u0435\u0442 \u0438\u043C\u0435\u043D\u043D\u043E \u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434.",
          stateSnapshot: buildGraphSnapshotFromState({
            nodeIds,
            edges,
            distances,
            parents,
            current: null,
            processed: /* @__PURE__ */ new Set(),
            extraPanels: [panel("\u0412\u0430\u0436\u043D\u043E", "\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0451\u0431\u0440\u0430 \u043B\u043E\u043C\u0430\u044E\u0442 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0443")]
          })
        })
      );
    }
    return {
      steps: finalizeSteps(steps),
      answer: target ? Number.isFinite(distances[target]) ? String(distances[target]) : "-1" : sortedNodes.map((node) => `${node}:${formatMaybeInfinity(distances[node])}`).join(" | "),
      conclusion: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 \u0441\u0438\u0441\u0442\u0435\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043F\u0440\u043E\u0442\u0430\u043B\u043A\u0438\u0432\u0430\u0435\u0442 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u044F \u0447\u0435\u0440\u0435\u0437 \u0432\u0441\u0435 \u0440\u0451\u0431\u0440\u0430 \u0438 \u043F\u043E\u0442\u043E\u043C\u0443 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0442\u0430\u043C, \u0433\u0434\u0435 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0443\u0436\u0435 \u043D\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u0443\u0435\u0442 \u043E\u0442\u0432\u0435\u0442.",
      distances,
      parents,
      hasNegativeCycle: false,
      updateCounts
    };
  }
  function runPermutations({ numbers }) {
    const steps = [];
    const results = [];
    const used = Array(numbers.length).fill(false);
    function backtrack(path) {
      if (path.length === numbers.length) {
        results.push([...path]);
        steps.push(
          createStep({
            action: `\u041F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u0433\u043E\u0442\u043E\u0432\u0443\u044E \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443 [${path.join(", ")}]`,
            why: "\u041A\u043E\u0433\u0434\u0430 \u0432 \u043F\u0443\u0442\u0438 \u0443\u0436\u0435 \u0441\u0442\u043E\u043B\u044C\u043A\u043E \u0436\u0435 \u0447\u0438\u0441\u0435\u043B, \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0432\u043E \u0432\u0445\u043E\u0434\u043D\u043E\u043C \u043C\u0430\u0441\u0441\u0438\u0432\u0435, \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0441\u043E\u0431\u0440\u0430\u043D\u0430 \u0438 \u0435\u0451 \u043C\u043E\u0436\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C.",
            pseudoLine: 2,
            resultPreview: `\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A: ${results.length}.`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "sequence",
              current: path.map(String),
              choices: numbers.map((value, index) => ({
                label: String(value),
                state: used[index] ? "visited" : ""
              })),
              results: results.map((item) => `[${item.join(", ")}]`),
              panels: [
                panel("\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0443\u0442\u044C", `[${path.join(", ")}]`),
                panel("\u0412\u0441\u0435\u0433\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432", String(results.length))
              ]
            })
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
            action: `\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C \u0447\u0438\u0441\u043B\u043E ${numbers[index]} \u0432 \u043F\u0443\u0442\u044C`,
            why: "\u0412 \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0435 \u043A\u0430\u0436\u0434\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u043C\u043E\u0436\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u0438\u043D \u0440\u0430\u0437, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043E\u0442\u043C\u0435\u0447\u0430\u0435\u043C \u0435\u0433\u043E \u043A\u0430\u043A \u0437\u0430\u043D\u044F\u0442\u043E\u0435 \u0438 \u0443\u0433\u043B\u0443\u0431\u043B\u044F\u0435\u043C\u0441\u044F \u0432 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u044E.",
            pseudoLine: 4,
            resultPreview: `\u041F\u0443\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441: [${path.join(", ")}].`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "sequence",
              current: path.map(String),
              choices: numbers.map((value, currentIndex) => ({
                label: String(value),
                state: used[currentIndex] ? currentIndex === index ? "current" : "visited" : ""
              })),
              results: results.map((item) => `[${item.join(", ")}]`),
              panels: [
                panel("\u0413\u043B\u0443\u0431\u0438\u043D\u0430", String(path.length)),
                panel("\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435 \u0447\u0438\u0441\u043B\u0430", numbers.filter((_, i) => !used[i]).join(", ") || "\u043D\u0435\u0442")
              ]
            })
          })
        );
        backtrack(path);
        path.pop();
        used[index] = false;
        steps.push(
          createStep({
            action: `\u041E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0435\u043C \u0447\u0438\u0441\u043B\u043E ${numbers[index]}`,
            why: "\u041F\u043E\u0441\u043B\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0438\u0437 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438 \u0447\u0438\u0441\u043B\u043E \u043D\u0443\u0436\u043D\u043E \u043E\u0441\u0432\u043E\u0431\u043E\u0434\u0438\u0442\u044C, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0435\u0433\u043E \u043D\u0430 \u0434\u0440\u0443\u0433\u0438\u0445 \u043F\u043E\u0437\u0438\u0446\u0438\u044F\u0445 \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438.",
            pseudoLine: 4,
            resultPreview: `\u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C\u0441\u044F \u043A \u043F\u0443\u0442\u0438 [${path.join(", ")}].`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "sequence",
              current: path.map(String),
              choices: numbers.map((value, currentIndex) => ({
                label: String(value),
                state: used[currentIndex] ? "visited" : ""
              })),
              results: results.map((item) => `[${item.join(", ")}]`),
              panels: [
                panel("\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u043E\u0432", String(results.length)),
                panel("\u041E\u0442\u043A\u0430\u0442", String(numbers[index]))
              ]
            })
          })
        );
      }
    }
    backtrack([]);
    return {
      steps: finalizeSteps(steps),
      answer: JSON.stringify(results),
      conclusion: "Backtracking \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A \u043A\u0430\u0436\u0434\u044B\u0439 \u0440\u0430\u0437 \u0434\u0435\u043B\u0430\u0435\u0442 \u0432\u044B\u0431\u043E\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0433\u043E \u0447\u0438\u0441\u043B\u0430, \u0430 \u043F\u043E\u0442\u043E\u043C \u043E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0435\u0442 \u0435\u0433\u043E, \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u0431\u0440\u0430\u0442\u044C \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B."
    };
  }
  function runSubsets({ numbers }) {
    const steps = [];
    const results = [];
    function backtrack(index, subset) {
      if (index === numbers.length) {
        results.push([...subset]);
        steps.push(
          createStep({
            action: `\u0424\u0438\u043A\u0441\u0438\u0440\u0443\u0435\u043C \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E [${subset.join(", ")}]`,
            why: "\u041A\u043E\u0433\u0434\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u043F\u043E \u0432\u0441\u0435\u043C \u043F\u043E\u0437\u0438\u0446\u0438\u044F\u043C \u0443\u0436\u0435 \u043F\u0440\u0438\u043D\u044F\u0442\u044B, \u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043E\u0434\u043D\u0438\u043C \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D\u043D\u044B\u043C \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E\u043C.",
            pseudoLine: 2,
            resultPreview: `\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432: ${results.length}.`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "sequence",
              current: subset.map(String),
              choices: numbers.map((value, currentIndex) => ({
                label: String(value),
                state: currentIndex < index ? "visited" : ""
              })),
              results: results.map((item) => `[${item.join(", ")}]`),
              panels: [
                panel("\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E", `[${subset.join(", ")}]`),
                panel("\u0413\u043E\u0442\u043E\u0432\u043E", String(results.length))
              ]
            })
          })
        );
        return;
      }
      subset.push(numbers[index]);
      steps.push(
        createStep({
          action: `\u0412\u043A\u043B\u044E\u0447\u0430\u0435\u043C ${numbers[index]} \u0432 \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E`,
          why: "\u041F\u0435\u0440\u0432\u0430\u044F \u0432\u0435\u0442\u043A\u0430 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438 \u043E\u0442\u0432\u0435\u0447\u0430\u0435\u0442 \u0437\u0430 \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \xAB\u0432\u0437\u044F\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\xBB.",
          pseudoLine: 4,
          resultPreview: `\u041F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E \u0441\u0442\u0430\u043B\u043E [${subset.join(", ")}].`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: subset.map(String),
            choices: numbers.map((value, currentIndex) => ({
              label: String(value),
              state: currentIndex === index ? "current" : currentIndex < index ? "visited" : ""
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [panel("\u0418\u043D\u0434\u0435\u043A\u0441", String(index))]
          })
        })
      );
      backtrack(index + 1, subset);
      subset.pop();
      steps.push(
        createStep({
          action: `\u0418\u0441\u043A\u043B\u044E\u0447\u0430\u0435\u043C ${numbers[index]} \u0438 \u0438\u0434\u0451\u043C \u0432\u043E \u0432\u0442\u043E\u0440\u0443\u044E \u0432\u0435\u0442\u043A\u0443`,
          why: "\u041F\u043E\u0441\u043B\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u043F\u0440\u043E\u0431\u0443\u0435\u043C \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u043D\u043E\u0435 \u0440\u0435\u0448\u0435\u043D\u0438\u0435: \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u043D\u0435 \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E.",
          pseudoLine: 5,
          resultPreview: `\u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u043C\u0441\u044F \u043A [${subset.join(", ")}].`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: subset.map(String),
            choices: numbers.map((value, currentIndex) => ({
              label: String(value),
              state: currentIndex < index ? "visited" : ""
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [panel("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0438\u043D\u0434\u0435\u043A\u0441", String(index + 1))]
          })
        })
      );
      backtrack(index + 1, subset);
    }
    backtrack(0, []);
    return {
      steps: finalizeSteps(steps),
      answer: JSON.stringify(results),
      conclusion: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432 \u0441\u0442\u0440\u043E\u0438\u0442\u0441\u044F \u043D\u0430 \u043F\u0440\u043E\u0441\u0442\u043E\u043C \u0431\u0438\u043D\u0430\u0440\u043D\u043E\u043C \u0432\u044B\u0431\u043E\u0440\u0435: \u0432\u0437\u044F\u0442\u044C \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u0438\u043B\u0438 \u043D\u0435 \u0432\u0437\u044F\u0442\u044C \u0435\u0433\u043E."
    };
  }
  function runBacktrackingMaze({ grid }) {
    const start = { row: 0, col: 0 };
    const end = { row: grid.length - 1, col: grid[0].length - 1 };
    const visited = /* @__PURE__ */ new Set();
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
          panel("\u0414\u043B\u0438\u043D\u0430 \u043F\u0443\u0442\u0438", String(currentPath.length)),
          panel("\u0426\u0435\u043B\u044C", formatCoord(end.row, end.col))
        ],
        board: buildMazeSnapshot({
          grid,
          start,
          end,
          current: currentKey ? fromCoordKey(currentKey) : null,
          visited: [...visited],
          path: currentPath,
          title: "\u041B\u0430\u0431\u0438\u0440\u0438\u043D\u0442 \u0434\u043B\u044F backtracking"
        })
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
          action: `\u0412\u0445\u043E\u0434\u0438\u043C \u0432 \u043A\u043B\u0435\u0442\u043A\u0443 ${formatCoord(row, col)}`,
          why: "Backtracking \u043F\u0440\u043E\u0431\u0443\u0435\u0442 \u043E\u0434\u0438\u043D \u043F\u0443\u0442\u044C \u0434\u043E \u0443\u043F\u043E\u0440\u0430, \u0430 \u0437\u0430\u0442\u0435\u043C \u043E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0434\u0430\u043B\u044C\u0448\u0435 \u043F\u0440\u043E\u0439\u0442\u0438 \u043D\u0435 \u0443\u0434\u0430\u0451\u0442\u0441\u044F.",
          pseudoLine: 2,
          resultPreview: `\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442: ${formatCoordPath(nextPath)}.`,
          stateSnapshot: snapshot(nextPath, key)
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
          action: `\u041E\u0442\u043A\u0430\u0442 \u0438\u0437 ${formatCoord(row, col)}`,
          why: "\u041D\u0438 \u043E\u0434\u0438\u043D \u0441\u043E\u0441\u0435\u0434 \u043D\u0435 \u043F\u0440\u0438\u0432\u0451\u043B \u043A \u0444\u0438\u043D\u0438\u0448\u0443, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u044D\u0442\u0430 \u043A\u043B\u0435\u0442\u043A\u0430 \u0438\u0441\u043A\u043B\u044E\u0447\u0430\u0435\u0442\u0441\u044F \u0438\u0437 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430.",
          pseudoLine: 5,
          resultPreview: "\u0412\u0435\u0442\u043A\u0430 \u043D\u0435 \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0430, \u0438\u0449\u0435\u043C \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u0443.",
          stateSnapshot: snapshot(currentPath, key)
        })
      );
      return false;
    }
    backtrack(start.row, start.col, []);
    steps.push(
      createStep({
        action: found ? "\u041F\u0443\u0442\u044C \u043D\u0430\u0439\u0434\u0435\u043D" : "\u041F\u0443\u0442\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D",
        why: found ? "\u041E\u0434\u043D\u0430 \u0438\u0437 \u0432\u0435\u0442\u043E\u043A backtracking \u0434\u043E\u0448\u043B\u0430 \u0434\u043E \u043A\u043E\u043D\u0435\u0447\u043D\u043E\u0439 \u043A\u043B\u0435\u0442\u043A\u0438." : "\u0412\u0441\u0435 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0435 \u0432\u0435\u0442\u043A\u0438 \u043F\u0435\u0440\u0435\u0431\u0440\u0430\u043D\u044B, \u0438 \u043D\u0438 \u043E\u0434\u043D\u0430 \u043D\u0435 \u0434\u043E\u0441\u0442\u0438\u0433\u043B\u0430 \u0444\u0438\u043D\u0438\u0448\u0430.",
        pseudoLine: found ? 3 : 5,
        resultPreview: `\u041E\u0442\u0432\u0435\u0442: ${found ? "\u0414\u0430" : "\u041D\u0435\u0442"}.`,
        stateSnapshot: snapshot(answerPath)
      })
    );
    return {
      steps: finalizeSteps(steps),
      answer: found ? "\u0414\u0430" : "\u041D\u0435\u0442",
      conclusion: "\u0412 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0435 backtracking \u043F\u043E\u043B\u0435\u0437\u0435\u043D, \u043A\u043E\u0433\u0434\u0430 \u043D\u0443\u0436\u043D\u043E \u0438\u043C\u0435\u043D\u043D\u043E \u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0438 \u043E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0442\u044C \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B, \u0430 \u043D\u0435 \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u0438\u0441\u043A\u0430\u0442\u044C \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C."
    };
  }
  function runGenerateParentheses({ pairs }) {
    const steps = [];
    const results = [];
    function backtrack(current, open, close) {
      if (current.length === pairs * 2) {
        results.push(current);
        steps.push(
          createStep({
            action: `\u041F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0443\u044E \u0441\u043A\u043E\u0431\u043E\u0447\u043D\u0443\u044E \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C ${current}`,
            why: "\u0414\u043B\u0438\u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0438 \u0434\u043E\u0441\u0442\u0438\u0433\u043B\u0430 2n, \u0430 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F \u043D\u0430 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u0438 \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0435 \u0441\u043A\u043E\u0431\u043A\u0438 \u043D\u0430 \u043A\u0430\u0436\u0434\u043E\u043C \u0448\u0430\u0433\u0435 \u0443\u0436\u0435 \u0433\u0430\u0440\u0430\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043B\u0438 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C.",
            pseudoLine: 2,
            resultPreview: `\u041D\u0430\u0439\u0434\u0435\u043D\u043E \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0435\u0439: ${results.length}.`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "parentheses",
              current: current.split(""),
              choices: [
                { label: "(", state: open < pairs ? "visited" : "" },
                { label: ")", state: close < open ? "visited" : "" }
              ],
              results,
              panels: [
                panel("open", String(open)),
                panel("close", String(close))
              ]
            })
          })
        );
        return;
      }
      if (open < pairs) {
        steps.push(
          createStep({
            action: `\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C "(" \u043A \u0441\u0442\u0440\u043E\u043A\u0435 ${current}`,
            why: "\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0443\u044E \u0441\u043A\u043E\u0431\u043A\u0443 \u043C\u043E\u0436\u043D\u043E \u0441\u0442\u0430\u0432\u0438\u0442\u044C, \u043F\u043E\u043A\u0430 \u0438\u0445 \u0447\u0438\u0441\u043B\u043E \u043C\u0435\u043D\u044C\u0448\u0435 n.",
            pseudoLine: 3,
            resultPreview: `\u041D\u043E\u0432\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: ${current}(`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "parentheses",
              current: `${current}(`.split(""),
              choices: [
                { label: "(", state: "current" },
                { label: ")", state: close < open ? "visited" : "" }
              ],
              results,
              panels: [
                panel("open", String(open + 1)),
                panel("close", String(close))
              ]
            })
          })
        );
        backtrack(`${current}(`, open + 1, close);
      }
      if (close < open) {
        steps.push(
          createStep({
            action: `\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C ")" \u043A \u0441\u0442\u0440\u043E\u043A\u0435 ${current}`,
            why: "\u0417\u0430\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0430\u044F \u0441\u043A\u043E\u0431\u043A\u0430 \u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E\u0433\u0434\u0430, \u043A\u043E\u0433\u0434\u0430 \u043D\u0435\u0437\u0430\u043A\u0440\u044B\u0442\u044B\u0445 \u043E\u0442\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0445 \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0443\u043B\u044F.",
            pseudoLine: 4,
            resultPreview: `\u041D\u043E\u0432\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: ${current})`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "parentheses",
              current: `${current})`.split(""),
              choices: [
                { label: "(", state: open < pairs ? "visited" : "" },
                { label: ")", state: "current" }
              ],
              results,
              panels: [
                panel("open", String(open)),
                panel("close", String(close + 1))
              ]
            })
          })
        );
        backtrack(`${current})`, open, close + 1);
      }
    }
    backtrack("", 0, 0);
    return {
      steps: finalizeSteps(steps),
      answer: JSON.stringify(results),
      conclusion: "Backtracking \u043E\u0442\u0441\u0435\u0438\u0432\u0430\u0435\u0442 \u043D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u043A\u043E\u0431\u043E\u0447\u043D\u044B\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u0437\u0430\u0440\u0430\u043D\u0435\u0435: \u043A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0445 \u0441\u0442\u0430\u043B\u043E \u0431\u044B \u0431\u043E\u043B\u044C\u0448\u0435, \u0432\u0435\u0442\u043A\u0430 \u0432\u043E\u043E\u0431\u0449\u0435 \u043D\u0435 \u043F\u043E\u0440\u043E\u0436\u0434\u0430\u0435\u0442\u0441\u044F."
    };
  }
  function runCombinationSum({ candidates, target }) {
    const steps = [];
    const results = [];
    const sorted = [...candidates].sort((a, b) => a - b);
    function backtrack(index, current, remain) {
      var _a;
      if (remain === 0) {
        results.push([...current]);
        steps.push(
          createStep({
            action: `\u041D\u0430\u0448\u043B\u0438 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044E [${current.join(", ")}]`,
            why: "\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u0441\u0442\u0430\u043B \u0440\u0430\u0432\u0435\u043D \u043D\u0443\u043B\u044E, \u0437\u043D\u0430\u0447\u0438\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0435 \u0447\u0438\u0441\u043B\u0430 \u0442\u043E\u0447\u043D\u043E \u0434\u0430\u044E\u0442 \u0446\u0435\u043B\u0435\u0432\u0443\u044E \u0441\u0443\u043C\u043C\u0443.",
            pseudoLine: 2,
            resultPreview: `\u0412\u0441\u0435\u0433\u043E \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0439: ${results.length}.`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "sequence",
              current: current.map(String),
              choices: sorted.map((value, currentIndex) => ({
                label: String(value),
                state: currentIndex === index ? "current" : ""
              })),
              results: results.map((item) => `[${item.join(", ")}]`),
              panels: [
                panel("\u041E\u0441\u0442\u0430\u0442\u043E\u043A", String(remain)),
                panel("\u0426\u0435\u043B\u044C", String(target))
              ]
            })
          })
        );
        return;
      }
      if (remain < 0 || index >= sorted.length) {
        steps.push(
          createStep({
            action: "\u0412\u0435\u0442\u043A\u0430 \u043E\u0442\u0441\u0435\u0447\u0435\u043D\u0430",
            why: remain < 0 ? "\u0421\u0443\u043C\u043C\u0430 \u0443\u0436\u0435 \u043F\u0440\u0435\u0432\u044B\u0441\u0438\u043B\u0430 \u0446\u0435\u043B\u044C, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C \u044D\u0442\u0443 \u0432\u0435\u0442\u043A\u0443 \u0431\u0435\u0441\u0441\u043C\u044B\u0441\u043B\u0435\u043D\u043D\u043E." : "\u0427\u0438\u0441\u043B\u0430 \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0438\u0441\u044C, \u0430 \u043D\u0443\u0436\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u0442\u0430\u043A \u0438 \u043D\u0435 \u0441\u043E\u0431\u0440\u0430\u043D\u0430.",
            pseudoLine: 3,
            resultPreview: `\u041E\u0441\u0442\u0430\u0442\u043E\u043A: ${remain}.`,
            stateSnapshot: makeBacktrackingSnapshot({
              mode: "sequence",
              current: current.map(String),
              choices: sorted.map((value) => ({
                label: String(value),
                state: ""
              })),
              results: results.map((item) => `[${item.join(", ")}]`),
              panels: [
                panel("\u041E\u0441\u0442\u0430\u0442\u043E\u043A", String(remain)),
                panel("\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u044F", `[${current.join(", ")}]`)
              ]
            })
          })
        );
        return;
      }
      current.push(sorted[index]);
      steps.push(
        createStep({
          action: `\u0411\u0435\u0440\u0451\u043C \u0447\u0438\u0441\u043B\u043E ${sorted[index]}`,
          why: "\u042D\u0442\u0430 \u0432\u0435\u0442\u043A\u0430 \u043F\u044B\u0442\u0430\u0435\u0442\u0441\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u0447\u0438\u0441\u043B\u043E \u0435\u0449\u0451 \u0440\u0430\u0437, \u043F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E \u0432 \u0437\u0430\u0434\u0430\u0447\u0435 \u0434\u043E\u043F\u0443\u0441\u043A\u0430\u044E\u0442\u0441\u044F \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0435 \u0432\u0437\u044F\u0442\u0438\u044F \u043E\u0434\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0434\u0438\u0434\u0430\u0442\u0430.",
          pseudoLine: 4,
          resultPreview: `\u041D\u043E\u0432\u044B\u0439 \u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0431\u0443\u0434\u0435\u0442 ${remain - sorted[index]}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: current.map(String),
            choices: sorted.map((value, currentIndex) => ({
              label: String(value),
              state: currentIndex === index ? "current" : ""
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("\u041E\u0441\u0442\u0430\u0442\u043E\u043A", String(remain)),
              panel("\u041F\u043E\u0441\u043B\u0435 \u0432\u044B\u0431\u043E\u0440\u0430", String(remain - sorted[index]))
            ]
          })
        })
      );
      backtrack(index, current, remain - sorted[index]);
      current.pop();
      steps.push(
        createStep({
          action: `\u041F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u043C \u0447\u0438\u0441\u043B\u043E ${sorted[index]} \u0438 \u0438\u0434\u0451\u043C \u0434\u0430\u043B\u044C\u0448\u0435`,
          why: "\u041F\u043E\u0441\u043B\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u043D\u0443\u0436\u043D\u043E \u043F\u043E\u043F\u0440\u043E\u0431\u043E\u0432\u0430\u0442\u044C \u0430\u043B\u044C\u0442\u0435\u0440\u043D\u0430\u0442\u0438\u0432\u0443: \u0431\u043E\u043B\u044C\u0448\u0435 \u043D\u0435 \u0431\u0440\u0430\u0442\u044C \u044D\u0442\u043E \u0447\u0438\u0441\u043B\u043E \u0438 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0438\u0442\u044C\u0441\u044F \u043D\u0430 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u043A\u0430\u043D\u0434\u0438\u0434\u0430\u0442.",
          pseudoLine: 5,
          resultPreview: `\u041F\u0435\u0440\u0435\u0445\u043E\u0434\u0438\u043C \u043A \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C\u0443 \u0438\u043D\u0434\u0435\u043A\u0441\u0443 ${index + 1}.`,
          stateSnapshot: makeBacktrackingSnapshot({
            mode: "sequence",
            current: current.map(String),
            choices: sorted.map((value, currentIndex) => ({
              label: String(value),
              state: currentIndex < index ? "visited" : ""
            })),
            results: results.map((item) => `[${item.join(", ")}]`),
            panels: [
              panel("\u041E\u0441\u0442\u0430\u0442\u043E\u043A", String(remain)),
              panel("\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u043A\u0430\u043D\u0434\u0438\u0434\u0430\u0442", String((_a = sorted[index + 1]) != null ? _a : "\u043D\u0435\u0442"))
            ]
          })
        })
      );
      backtrack(index + 1, current, remain);
    }
    backtrack(0, [], target);
    return {
      steps: finalizeSteps(steps),
      answer: JSON.stringify(results),
      conclusion: "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u0441\u0443\u043C\u043C\u044B \u0441\u0442\u0440\u043E\u044F\u0442\u0441\u044F backtracking-\u043E\u043C \u0441 \u043E\u0442\u0441\u0435\u0447\u0435\u043D\u0438\u0435\u043C: \u0435\u0441\u043B\u0438 \u043E\u0441\u0442\u0430\u0442\u043E\u043A \u0441\u0442\u0430\u043B \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C, \u0432\u0435\u0442\u043A\u0443 \u043C\u043E\u0436\u043D\u043E \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u0442\u044C."
    };
  }
  function runDijkstraAllToAll(config) {
    return runDijkstraCore(config);
  }
  function runDijkstraToTarget(config) {
    return runDijkstraCore(config);
  }
  function runBellmanFord(config) {
    return runBellmanFordCore(config);
  }
  var runDfsFind = runFindInTree;

  // js/tasks.js
  function toNumber(value, label) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      throw new Error(`\u041F\u043E\u043B\u0435 "${label}" \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u0447\u0438\u0441\u043B\u043E\u043C.`);
    }
    return parsed;
  }
  function toIntegerList(text) {
    return parseListText(text, (value) => {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) {
        throw new Error("\u0421\u043F\u0438\u0441\u043E\u043A \u0434\u043E\u043B\u0436\u0435\u043D \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0447\u0438\u0441\u043B\u0430.");
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
    run
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
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 7,
          hint: "\u041A\u0430\u0436\u0434\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441. \u041F\u0440\u0438\u043C\u0435\u0440: A B 4"
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A \u0438\u043B\u0438 Router1"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041C\u043E\u0436\u043D\u043E \u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C, \u0435\u0441\u043B\u0438 \u043D\u0443\u0436\u0435\u043D \u0440\u0430\u0441\u0447\u0451\u0442 \u0434\u043E \u0432\u0441\u0435\u0445 \u0432\u0435\u0440\u0448\u0438\u043D."
        }
      ],
      parser(values) {
        var _a;
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: String((_a = values.target) != null ? _a : "").trim() || null
        };
      },
      run
    };
  }
  var TOPICS = [
    {
      id: "bfs-1",
      title: "BFS I",
      subtitle: "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0441\u043B\u043E\u044F\u043C, \u043C\u0430\u0442\u0440\u0438\u0446\u044B \u0438 \u0441\u0442\u0440\u043E\u043A\u0438"
    },
    {
      id: "bfs-2",
      title: "BFS II",
      subtitle: "\u041A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B, \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0438 \u043C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u044B\u0439 BFS"
    },
    {
      id: "dfs",
      title: "DFS",
      subtitle: "\u0414\u0435\u0440\u0435\u0432\u044C\u044F, \u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u0438 \u043F\u043E\u0438\u0441\u043A \u0432\u0435\u0442\u043A\u0430\u043C\u0438"
    },
    {
      id: "dijkstra",
      title: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430",
      subtitle: "\u041A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043F\u0443\u0442\u0438 \u0441 \u043D\u0435\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u0432\u0435\u0441\u0430\u043C\u0438"
    },
    {
      id: "bellman-ford",
      title: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434",
      subtitle: "\u041E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0451\u0431\u0440\u0430 \u0438 \u0446\u0438\u043A\u043B\u044B"
    },
    {
      id: "backtracking",
      title: "Backtracking",
      subtitle: "\u041F\u0435\u0440\u0435\u0431\u043E\u0440 \u0441 \u043E\u0442\u043A\u0430\u0442\u043E\u043C"
    }
  ];
  var TASKS = [
    {
      id: "bfs-maze-shortest",
      topic: "bfs-1",
      title: "\u041A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C \u0432 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0435",
      shortDescription: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u0448\u0430\u0433\u043E\u0432 \u043C\u0435\u0436\u0434\u0443 \u0441\u0442\u0430\u0440\u0442\u043E\u043C \u0438 \u0444\u0438\u043D\u0438\u0448\u0435\u043C.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "BFS \u043F\u043E \u043C\u0430\u0442\u0440\u0438\u0446\u0435",
      pseudoCode: PSEUDOCODE.bfsGrid,
      description: "\u0414\u0430\u043D\u0430 \u043C\u0430\u0442\u0440\u0438\u0446\u0430 \u0438\u0437 0 \u0438 1. \u041D\u0443\u0436\u043D\u043E \u043D\u0430\u0439\u0442\u0438 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0448\u0430\u0433\u043E\u0432 \u043C\u0435\u0436\u0434\u0443 \u0434\u0432\u0443\u043C\u044F \u0442\u043E\u0447\u043A\u0430\u043C\u0438. \u0415\u0441\u043B\u0438 \u043F\u0440\u043E\u0439\u0442\u0438 \u043D\u0435\u043B\u044C\u0437\u044F, \u043E\u0442\u0432\u0435\u0442 \u0440\u0430\u0432\u0435\u043D -1.",
      metrics: [
        { label: "\u0424\u043E\u0440\u043C\u0430\u0442", value: "\u043C\u0430\u0442\u0440\u0438\u0446\u0430 + start/end" },
        { label: "\u0421\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430", value: "\u0433\u0430\u0440\u0430\u043D\u0442\u0438\u044F \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0433\u043E \u043F\u0443\u0442\u0438" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430",
          values: {
            grid: "0 0 0 1 0\n1 1 0 1 0\n0 0 0 0 0\n0 1 1 1 0\n0 0 0 0 0",
            start: "0,0",
            end: "4,4"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430",
          type: "textarea",
          rows: 7,
          hint: "0 \u2014 \u043F\u0440\u043E\u0445\u043E\u0434, 1 \u2014 \u0441\u0442\u0435\u043D\u0430. \u0421\u0442\u0440\u043E\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u0435\u0440\u0435\u043D\u043E\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0,0"
        },
        {
          key: "end",
          label: "\u0424\u0438\u043D\u0438\u0448",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 4,4"
        }
      ],
      parser(values) {
        return {
          grid: parseNumericMatrix(values.grid),
          start: parseCoordText(values.start),
          end: parseCoordText(values.end)
        };
      },
      run: runBfsMazeShortest
    },
    {
      id: "bfs-knight",
      topic: "bfs-1",
      title: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0435 \u0445\u043E\u0434\u044B \u043A\u043E\u043D\u044F",
      shortDescription: "\u041A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u043A\u043E\u043D\u044F \u043D\u0430 \u0434\u043E\u0441\u043A\u0435 8\xD78.",
      complexity: "O(64)",
      algorithmFamily: "BFS \u043F\u043E \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F\u043C",
      pseudoCode: PSEUDOCODE.knight,
      description: "\u041D\u0430 \u0448\u0430\u0445\u043C\u0430\u0442\u043D\u043E\u0439 \u0434\u043E\u0441\u043A\u0435 \u043D\u0443\u0436\u043D\u043E \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u0445\u043E\u0434\u043E\u0432 \u043A\u043E\u043D\u044F \u043C\u0435\u0436\u0434\u0443 \u0434\u0432\u0443\u043C\u044F \u043A\u043B\u0435\u0442\u043A\u0430\u043C\u0438.",
      metrics: [
        { label: "\u041F\u043E\u043B\u0435", value: "\u0434\u043E\u0441\u043A\u0430 8 \xD7 8" },
        { label: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435", value: "\u043F\u043E\u0437\u0438\u0446\u0438\u044F \u043A\u043E\u043D\u044F" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            start: "0,0",
            end: "7,7"
          }
        }
      ],
      inputSchema: [
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430",
          type: "text",
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442 row,col. \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0,0"
        },
        {
          key: "end",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430",
          type: "text",
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442 row,col. \u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 7,7"
        }
      ],
      parser(values) {
        return {
          start: parseCoordText(values.start),
          end: parseCoordText(values.end)
        };
      },
      run: runKnightMoves
    },
    {
      id: "bfs-rotten-oranges",
      topic: "bfs-1",
      title: "\u0413\u043D\u0438\u043B\u044B\u0435 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u044B",
      shortDescription: "\u0421\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0438\u043D\u0443\u0442 \u043F\u043E\u043D\u0430\u0434\u043E\u0431\u0438\u0442\u0441\u044F, \u0447\u0442\u043E\u0431\u044B \u0437\u0430\u0440\u0430\u0437\u0438\u0442\u044C \u0432\u0441\u0435 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "\u041C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u044B\u0439 BFS",
      pseudoCode: PSEUDOCODE.rottenOranges,
      description: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0438\u0442 \u043F\u0443\u0441\u0442\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438, \u0441\u0432\u0435\u0436\u0438\u0435 \u0438 \u0433\u043D\u0438\u043B\u044B\u0435 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u044B. \u0412\u043E\u043B\u043D\u0430 \u0437\u0430\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u043E \u0441\u043E\u0441\u0435\u0434\u044F\u043C \u0437\u0430 \u043E\u0434\u043D\u0443 \u043C\u0438\u043D\u0443\u0442\u0443.",
      metrics: [
        { label: "\u0421\u043B\u043E\u0439 BFS", value: "\u043E\u0434\u043D\u0430 \u043C\u0438\u043D\u0443\u0442\u0430" },
        { label: "\u0421\u0442\u0430\u0440\u0442", value: "\u0432\u0441\u0435 \u0433\u043D\u0438\u043B\u044B\u0435 \u0441\u0440\u0430\u0437\u0443" }
      ],
      presetCases: [
        {
          label: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0440\u0438\u043C\u0435\u0440",
          values: {
            grid: "2 1 1\n1 1 0\n0 1 1"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u0430\u043F\u0435\u043B\u044C\u0441\u0438\u043D\u043E\u0432",
          type: "textarea",
          rows: 6,
          hint: "0 \u2014 \u043F\u0443\u0441\u0442\u043E, 1 \u2014 \u0441\u0432\u0435\u0436\u0438\u0439, 2 \u2014 \u0433\u043D\u0438\u043B\u043E\u0439."
        }
      ],
      parser(values) {
        return { grid: parseNumericMatrix(values.grid) };
      },
      run: runRottingOranges
    },
    {
      id: "bfs-word-ladder",
      topic: "bfs-1",
      title: "\u041F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0441\u0442\u0440\u043E\u043A\u0438",
      shortDescription: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C \u0437\u0430\u043C\u0435\u043D \u043F\u043E \u0441\u043B\u043E\u0432\u0430\u0440\u044E \u043E\u0442 A \u043A B.",
      complexity: "O(W\xB2 \xB7 L)",
      algorithmFamily: "BFS \u043F\u043E \u0441\u043B\u043E\u0432\u0430\u0440\u044E \u0441\u043B\u043E\u0432",
      pseudoCode: PSEUDOCODE.wordLadder,
      description: "\u041D\u0430 \u043A\u0430\u0436\u0434\u043E\u043C \u0448\u0430\u0433\u0435 \u043C\u043E\u0436\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043E\u0434\u0438\u043D \u0441\u0438\u043C\u0432\u043E\u043B \u0442\u0430\u043A, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0438\u0442\u044C \u0441\u043B\u043E\u0432\u043E \u0438\u0437 \u0441\u043F\u0438\u0441\u043A\u0430. \u041D\u0443\u0436\u043D\u043E \u043D\u0430\u0439\u0442\u0438 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043F\u043E\u0447\u043A\u0443 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u044F.",
      metrics: [
        { label: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435", value: "\u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u0441\u043B\u043E\u0432\u043E" },
        { label: "\u0420\u0451\u0431\u0440\u0430 \u0433\u0440\u0430\u0444\u0430", value: "\u0440\u0430\u0437\u043D\u0438\u0446\u0430 \u0440\u043E\u0432\u043D\u043E \u0432 1 \u0441\u0438\u043C\u0432\u043E\u043B" }
      ],
      presetCases: [
        {
          label: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 hit \u2192 cog",
          values: {
            start: "hit",
            target: "cog",
            words: "hot\ndot\ndog\nlot\nlog\ncog"
          }
        }
      ],
      inputSchema: [
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: hit"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u043E\u0435 \u0441\u043B\u043E\u0432\u043E",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: cog"
        },
        {
          key: "words",
          label: "\u0420\u0430\u0437\u0440\u0435\u0448\u0451\u043D\u043D\u044B\u0435 \u0441\u043B\u043E\u0432\u0430",
          type: "textarea",
          rows: 6,
          hint: "\u0421\u043B\u043E\u0432\u0430 \u043F\u043E\u0441\u0442\u0440\u043E\u0447\u043D\u043E \u0438\u043B\u0438 \u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043F\u044F\u0442\u0443\u044E."
        }
      ],
      parser(values) {
        return {
          start: String(values.start).trim(),
          target: String(values.target).trim(),
          words: parseListText(values.words, (value) => String(value).trim())
        };
      },
      run: runWordLadder
    },
    {
      id: "bfs-nearest-exit",
      topic: "bfs-1",
      title: "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0439 \u0432\u044B\u0445\u043E\u0434 \u0438\u0437 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430",
      shortDescription: "\u041D\u0430\u0445\u043E\u0434\u0438\u043C \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0443\u044E \u0433\u0440\u0430\u043D\u0438\u0447\u043D\u0443\u044E \u043A\u043B\u0435\u0442\u043A\u0443, \u043D\u0435 \u0440\u0430\u0432\u043D\u0443\u044E \u0441\u0442\u0430\u0440\u0442\u0443.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "BFS \u043F\u043E \u043C\u0430\u0442\u0440\u0438\u0446\u0435",
      pseudoCode: PSEUDOCODE.nearestExit,
      description: "\u0421\u0442\u0430\u0440\u0442 \u0434\u0430\u043D \u0432\u043D\u0443\u0442\u0440\u0438 \u043C\u0430\u0442\u0440\u0438\u0446\u044B. \u041D\u0443\u0436\u043D\u043E \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442\u044C \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u043B\u044E\u0431\u043E\u0439 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0435\u0439 \u044F\u0447\u0435\u0439\u043A\u0438 \u043D\u0430 \u0433\u0440\u0430\u043D\u0438\u0446\u0435.",
      metrics: [
        { label: "\u0412\u044B\u0445\u043E\u0434", value: "\u043B\u044E\u0431\u0430\u044F \u0433\u0440\u0430\u043D\u0438\u0446\u0430, \u043A\u0440\u043E\u043C\u0435 \u0441\u0442\u0430\u0440\u0442\u0430" },
        { label: "\u041E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C", value: "\u043F\u0435\u0440\u0432\u044B\u0439 \u043D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0439 \u0432\u044B\u0445\u043E\u0434" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0441 \u0432\u044B\u0445\u043E\u0434\u043E\u043C \u043D\u0430 \u0433\u0440\u0430\u043D\u0438\u0446\u0435",
          values: {
            grid: "1 1 1 1\n1 0 0 1\n1 1 0 1\n1 1 0 0",
            start: "1,1"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430",
          type: "textarea",
          rows: 6,
          hint: "0 \u2014 \u043F\u0440\u043E\u0445\u043E\u0434, 1 \u2014 \u0441\u0442\u0435\u043D\u0430."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u043A\u043B\u0435\u0442\u043A\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 1,1"
        }
      ],
      parser(values) {
        return {
          grid: parseNumericMatrix(values.grid),
          start: parseCoordText(values.start)
        };
      },
      run: runNearestExit
    },
    {
      id: "grid-word-search",
      topic: "bfs-1",
      title: "\u041F\u043E\u0438\u0441\u043A \u0441\u043B\u043E\u0432\u0430 \u0432 \u0441\u0435\u0442\u043A\u0435",
      shortDescription: "\u041D\u0430 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0435 \u0440\u0435\u0448\u0430\u0435\u0442\u0441\u044F DFS/backtracking, \u0445\u043E\u0442\u044F \u043B\u0435\u0436\u0438\u0442 \u0432 BFS-\u0431\u043B\u043E\u043A\u0435.",
      complexity: "O(N \xB7 M \xB7 4^L)",
      algorithmFamily: "DFS / Backtracking \u043F\u043E \u043C\u0430\u0442\u0440\u0438\u0446\u0435",
      pseudoCode: PSEUDOCODE.wordSearch,
      description: "\u041D\u0443\u0436\u043D\u043E \u043F\u043E\u043D\u044F\u0442\u044C, \u043C\u043E\u0436\u043D\u043E \u043B\u0438 \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u043B\u043E\u0432\u043E, \u0434\u0432\u0438\u0433\u0430\u044F\u0441\u044C \u043F\u043E \u0441\u043E\u0441\u0435\u0434\u043D\u0438\u043C \u043A\u043B\u0435\u0442\u043A\u0430\u043C \u0431\u0435\u0437 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u043E\u0434\u043D\u043E\u0439 \u0438 \u0442\u043E\u0439 \u0436\u0435 \u043A\u043B\u0435\u0442\u043A\u0438.",
      metrics: [
        { label: "\u041F\u043E\u0447\u0435\u043C\u0443 \u043D\u0435 BFS", value: "\u0432\u0430\u0436\u0435\u043D \u0437\u0430\u043F\u0440\u0435\u0442 \u043F\u043E\u0432\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u043A\u043B\u0435\u0442\u043A\u0438" },
        { label: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435", value: "\u043F\u043E\u0437\u0438\u0446\u0438\u044F + \u0438\u043D\u0434\u0435\u043A\u0441 \u0441\u0438\u043C\u0432\u043E\u043B\u0430 + \u0437\u0430\u043D\u044F\u0442\u044B\u0435 \u043A\u043B\u0435\u0442\u043A\u0438" }
      ],
      presetCases: [
        {
          label: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0440\u0438\u043C\u0435\u0440",
          values: {
            grid: "A B C E\nS F C S\nA D E E",
            word: "ABCCED"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u0421\u0435\u0442\u043A\u0430 \u0431\u0443\u043A\u0432",
          type: "textarea",
          rows: 5,
          hint: "\u0411\u0443\u043A\u0432\u044B \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B, \u0441\u0442\u0440\u043E\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u0435\u0440\u0435\u043D\u043E\u0441."
        },
        {
          key: "word",
          label: "\u0418\u0441\u043A\u043E\u043C\u043E\u0435 \u0441\u043B\u043E\u0432\u043E",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: ABCCED"
        }
      ],
      parser(values) {
        return {
          grid: parseTokenMatrix(values.grid),
          word: String(values.word).trim()
        };
      },
      run: runWordSearch
    },
    {
      id: "bfs-islands",
      topic: "bfs-2",
      title: "\u041E\u0441\u0442\u0440\u043E\u0432\u0430",
      shortDescription: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442 \u0441\u0432\u044F\u0437\u043D\u043E\u0441\u0442\u0438 \u0432 \u0431\u0438\u043D\u0430\u0440\u043D\u043E\u0439 \u043C\u0430\u0442\u0440\u0438\u0446\u0435.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "BFS \u043F\u043E \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430\u043C",
      pseudoCode: PSEUDOCODE.islands,
      description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432 \u2014 \u044D\u0442\u043E \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u0430\u044F \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u0430 \u0441\u0432\u044F\u0437\u043D\u043E\u0441\u0442\u0438 \u043F\u043E \u0447\u0435\u0442\u044B\u0440\u0451\u043C \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C.",
      metrics: [
        { label: "\u0427\u0442\u043E \u0441\u0447\u0438\u0442\u0430\u0435\u043C", value: "\u0447\u0438\u0441\u043B\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u043E\u0432 \u043E\u0431\u0445\u043E\u0434\u0430" },
        { label: "\u0421\u043E\u0441\u0435\u0434\u0438", value: "\u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0432\u0435\u0440\u0445/\u0432\u043D\u0438\u0437/\u0432\u043B\u0435\u0432\u043E/\u0432\u043F\u0440\u0430\u0432\u043E" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            grid: "1 1 0 0\n1 0 0 0\n0 0 1 1\n0 0 1 1"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u0411\u0438\u043D\u0430\u0440\u043D\u0430\u044F \u043C\u0430\u0442\u0440\u0438\u0446\u0430",
          type: "textarea",
          rows: 6,
          hint: "1 \u2014 \u0437\u0435\u043C\u043B\u044F, 0 \u2014 \u0432\u043E\u0434\u0430."
        }
      ],
      parser(values) {
        return { grid: parseNumericMatrix(values.grid) };
      },
      run: runCountIslands
    },
    {
      id: "bfs-shortest-bridge",
      topic: "bfs-2",
      title: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442",
      shortDescription: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C \u043D\u0443\u043B\u0435\u0439, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043D\u0430\u0434\u043E \u043F\u0440\u0435\u0432\u0440\u0430\u0442\u0438\u0442\u044C \u0432 \u0435\u0434\u0438\u043D\u0438\u0446\u044B.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "DFS + BFS \u043F\u043E \u0441\u043B\u043E\u044F\u043C \u0432\u043E\u0434\u044B",
      pseudoCode: PSEUDOCODE.shortestBridge,
      description: "\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043F\u043E\u043C\u0435\u0447\u0430\u0435\u043C \u043F\u0435\u0440\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432, \u043F\u043E\u0442\u043E\u043C \u0440\u0430\u0441\u0448\u0438\u0440\u044F\u0435\u043C\u0441\u044F \u043E\u0442 \u043D\u0435\u0433\u043E \u043F\u043E \u0432\u043E\u0434\u0435 \u0441\u043B\u043E\u044F\u043C\u0438 \u0434\u043E \u0432\u0441\u0442\u0440\u0435\u0447\u0438 \u0441\u043E \u0432\u0442\u043E\u0440\u044B\u043C \u043E\u0441\u0442\u0440\u043E\u0432\u043E\u043C.",
      metrics: [
        { label: "\u0428\u0430\u0433 1", value: "\u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u043E\u0441\u0442\u0440\u043E\u0432\u0430" },
        { label: "\u0428\u0430\u0433 2", value: "BFS \u043F\u043E \u0432\u043E\u0434\u0435" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            grid: "1 1 0 0\n1 0 0 0\n0 0 1 1\n0 0 1 1"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u043E\u0441\u0442\u0440\u043E\u0432\u043E\u0432",
          type: "textarea",
          rows: 6,
          hint: "1 \u2014 \u043E\u0441\u0442\u0440\u043E\u0432, 0 \u2014 \u0432\u043E\u0434\u0430."
        }
      ],
      parser(values) {
        return { grid: parseNumericMatrix(values.grid) };
      },
      run: runShortestBridge
    },
    {
      id: "bfs-lock",
      topic: "bfs-2",
      title: "\u0412\u0440\u0430\u0449\u0430\u044E\u0449\u0438\u0435\u0441\u044F \u0437\u0430\u043C\u043A\u0438",
      shortDescription: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432 \u0432 \u0433\u0440\u0430\u0444\u0435 4-\u0437\u043D\u0430\u0447\u043D\u044B\u0445 \u043A\u043E\u0434\u043E\u0432.",
      complexity: "O(10\u2074)",
      algorithmFamily: "BFS \u043F\u043E \u0441\u0442\u0440\u043E\u043A\u043E\u0432\u044B\u043C \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u044F\u043C",
      pseudoCode: PSEUDOCODE.lock,
      description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u043A\u043E\u0434 \u0437\u0430\u043C\u043A\u0430 \u2014 \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u0433\u0440\u0430\u0444\u0430, \u0430 \u043F\u043E\u0432\u043E\u0440\u043E\u0442 \u043E\u0434\u043D\u043E\u0439 \u0446\u0438\u0444\u0440\u044B \u043D\u0430 \xB11 \u043E\u0431\u0440\u0430\u0437\u0443\u0435\u0442 \u0441\u043E\u0441\u0435\u0434\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435.",
      metrics: [
        { label: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435", value: "4-\u0437\u043D\u0430\u0447\u043D\u044B\u0439 \u043A\u043E\u0434" },
        { label: "\u0425\u043E\u0434\u044B", value: "8 \u0441\u043E\u0441\u0435\u0434\u0435\u0439 \u0443 \u043A\u0430\u0436\u0434\u043E\u0439 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438" }
      ],
      presetCases: [
        {
          label: "\u0410\u0434\u0430\u043F\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440 \u043D\u0430 6 \u0445\u043E\u0434\u043E\u0432",
          values: {
            start: "0000",
            target: "0202",
            forbidden: "0201\n0101\n0102\n1212\n2002"
          }
        }
      ],
      inputSchema: [
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u043A\u043E\u0434",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0000"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u043E\u0439 \u043A\u043E\u0434",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0202"
        },
        {
          key: "forbidden",
          label: "\u0417\u0430\u043F\u0440\u0435\u0449\u0451\u043D\u043D\u044B\u0435 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438",
          type: "textarea",
          rows: 6,
          hint: "\u041F\u043E \u043E\u0434\u043D\u043E\u0439 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u043D\u0430 \u0441\u0442\u0440\u043E\u043A\u0443."
        }
      ],
      parser(values) {
        return {
          start: String(values.start).trim(),
          target: String(values.target).trim(),
          forbidden: parseListText(values.forbidden, (value) => String(value).trim())
        };
      },
      run: runLock
    },
    {
      id: "bfs-evacuation",
      topic: "bfs-2",
      title: "\u042D\u0432\u0430\u043A\u0443\u0430\u0446\u0438\u044F \u0438\u0437 \u043A\u043E\u043C\u043D\u0430\u0442",
      shortDescription: "\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F, \u0447\u0442\u043E\u0431\u044B \u0432\u0441\u0435 \u0441\u0442\u0430\u0440\u0442\u044B \u0434\u043E\u0448\u043B\u0438 \u0434\u043E \u0432\u044B\u0445\u043E\u0434\u0430.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "\u041C\u043D\u043E\u0433\u043E\u0432\u0435\u0440\u0448\u0438\u043D\u043D\u044B\u0439 BFS \u043E\u0442 \u0432\u044B\u0445\u043E\u0434\u043E\u0432",
      pseudoCode: PSEUDOCODE.evacuation,
      description: "\u0427\u0442\u043E\u0431\u044B \u043D\u0435 \u0437\u0430\u043F\u0443\u0441\u043A\u0430\u0442\u044C \u043F\u043E\u0438\u0441\u043A \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0447\u0435\u043B\u043E\u0432\u0435\u043A\u0430, \u0443\u0434\u043E\u0431\u043D\u0435\u0435 \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0438\u0442\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0441\u0440\u0430\u0437\u0443 \u043E\u0442 \u0432\u0441\u0435\u0445 \u0432\u044B\u0445\u043E\u0434\u043E\u0432.",
      metrics: [
        { label: "\u0421\u0442\u0430\u0440\u0442 BFS", value: "\u0432\u0441\u0435 \u0432\u044B\u0445\u043E\u0434\u044B E" },
        { label: "\u041E\u0442\u0432\u0435\u0442", value: "\u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u0441\u0440\u0435\u0434\u0438 \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u0439 S" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u044D\u0432\u0430\u043A\u0443\u0430\u0446\u0438\u0438",
          values: {
            grid: "S 0 0 E\n1 0 1 0\n1 0 0 S"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041F\u043B\u0430\u043D \u0437\u0434\u0430\u043D\u0438\u044F",
          type: "textarea",
          rows: 6,
          hint: "\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439 E, S, 0 \u0438 1. \u0421\u0438\u043C\u0432\u043E\u043B\u044B \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B."
        }
      ],
      parser(values) {
        return { grid: parseTokenMatrix(values.grid) };
      },
      run: runEvacuation
    },
    {
      id: "bfs-snowball",
      topic: "bfs-2",
      title: "\u0421\u043D\u0435\u0436\u043D\u044B\u0439 \u043A\u043E\u043C",
      shortDescription: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C \u043E\u043F\u0435\u0440\u0430\u0446\u0438\u0439 \xD72, \xD73 \u0438 +1 \u0434\u043B\u044F \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F N.",
      complexity: "O(N)",
      algorithmFamily: "BFS \u043F\u043E \u0447\u0438\u0441\u043B\u0430\u043C",
      pseudoCode: PSEUDOCODE.snowball,
      description: "\u0427\u0438\u0441\u043B\u043E \u043C\u043E\u0436\u043D\u043E \u0440\u0430\u0441\u0441\u043C\u0430\u0442\u0440\u0438\u0432\u0430\u0442\u044C \u043A\u0430\u043A \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435. \u0418\u0437 \u043D\u0435\u0433\u043E \u0435\u0441\u0442\u044C \u0442\u0440\u0438 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430: \u0443\u043C\u043D\u043E\u0436\u0438\u0442\u044C \u043D\u0430 2, \u0443\u043C\u043D\u043E\u0436\u0438\u0442\u044C \u043D\u0430 3 \u0438\u043B\u0438 \u043F\u0440\u0438\u0431\u0430\u0432\u0438\u0442\u044C 1.",
      metrics: [
        { label: "\u041D\u0430\u0447\u0430\u043B\u043E", value: "X = 1" },
        { label: "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435", value: "\u043F\u0435\u0440\u0435\u0431\u0438\u0440\u0430\u0435\u043C \u0447\u0438\u0441\u043B\u0430 \u0434\u043E N" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 N = 10",
          values: {
            target: "10"
          }
        }
      ],
      inputSchema: [
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u043E\u0435 \u0447\u0438\u0441\u043B\u043E N",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 10"
        }
      ],
      parser(values) {
        return { target: toNumber(values.target, "\u0426\u0435\u043B\u0435\u0432\u043E\u0435 \u0447\u0438\u0441\u043B\u043E N") };
      },
      run: runSnowball
    },
    {
      id: "dfs-preorder",
      topic: "dfs",
      title: "\u041E\u0431\u0445\u043E\u0434 \u0434\u0435\u0440\u0435\u0432\u0430 \u0432 \u0433\u043B\u0443\u0431\u0438\u043D\u0443",
      shortDescription: "\u041F\u0440\u0435\u0444\u0438\u043A\u0441\u043D\u044B\u0439 \u043F\u043E\u0440\u044F\u0434\u043E\u043A: \u043A\u043E\u0440\u0435\u043D\u044C \u2192 \u043B\u0435\u0432\u044B\u0439 \u2192 \u043F\u0440\u0430\u0432\u044B\u0439.",
      complexity: "O(N)",
      algorithmFamily: "DFS \u043F\u043E \u0434\u0435\u0440\u0435\u0432\u0443",
      pseudoCode: PSEUDOCODE.dfsPreorder,
      description: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0440\u0435\u0444\u0438\u043A\u0441\u043D\u044B\u0439 \u043E\u0431\u0445\u043E\u0434 \u0434\u0435\u0440\u0435\u0432\u0430. \u0418\u043C\u0435\u043D\u043D\u043E \u0432 \u0442\u0430\u043A\u043E\u043C \u043F\u043E\u0440\u044F\u0434\u043A\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0434\u043E\u043B\u0436\u043D\u044B \u043F\u043E\u043F\u0430\u0441\u0442\u044C \u0432 \u043E\u0442\u0432\u0435\u0442.",
      metrics: [
        { label: "\u0424\u043E\u0440\u043C\u0430\u0442", value: "level-order \u043C\u0430\u0441\u0441\u0438\u0432" },
        { label: "\u041F\u043E\u0440\u044F\u0434\u043E\u043A", value: "root-left-right" }
      ],
      presetCases: [
        {
          label: "\u0414\u0435\u0440\u0435\u0432\u043E \u0438\u0437 PDF",
          values: {
            tree: "[1,2,3,4,5]"
          }
        }
      ],
      inputSchema: [
        {
          key: "tree",
          label: "\u0414\u0435\u0440\u0435\u0432\u043E",
          type: "textarea",
          rows: 4,
          hint: "\u041F\u0438\u0448\u0438 \u0442\u0430\u043A: [1,2,3,4,5]. \u0415\u0441\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u0435\u0441\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E, \u043F\u0438\u0448\u0438 -."
        }
      ],
      parser(values) {
        return { values: parseTreeArray(values.tree) };
      },
      run: runDfsPreorder
    },
    {
      id: "dfs-sum",
      topic: "dfs",
      title: "\u0421\u0443\u043C\u043C\u0430 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0439 \u0432\u0441\u0435\u0445 \u0443\u0437\u043B\u043E\u0432",
      shortDescription: "\u0421\u043D\u0438\u0437\u0443 \u0432\u0432\u0435\u0440\u0445 \u0441\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u043A\u043B\u0430\u0434 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u0430.",
      complexity: "O(N)",
      algorithmFamily: "DFS \u0441 \u0430\u0433\u0440\u0435\u0433\u0430\u0446\u0438\u0435\u0439",
      pseudoCode: PSEUDOCODE.dfsSum,
      description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0435\u0442 \u0441\u0443\u043C\u043C\u0443 \u0441\u0432\u043E\u0435\u0433\u043E \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u0430, \u0430 \u043A\u043E\u0440\u0435\u043D\u044C \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442 \u0441\u0443\u043C\u043C\u0443 \u0432\u0441\u0435\u0433\u043E \u0434\u0435\u0440\u0435\u0432\u0430.",
      metrics: [
        { label: "\u0412\u043E\u0437\u0432\u0440\u0430\u0442 \u0444\u0443\u043D\u043A\u0446\u0438\u0438", value: "\u0441\u0443\u043C\u043C\u0430 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u0430" },
        { label: "\u0411\u0430\u0437\u0430", value: "\u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E \u0434\u0430\u0451\u0442 0" }
      ],
      presetCases: [
        {
          label: "\u0414\u0435\u0440\u0435\u0432\u043E \u0438\u0437 PDF",
          values: {
            tree: "[1,2,3,4,5]"
          }
        }
      ],
      inputSchema: [
        {
          key: "tree",
          label: "\u0414\u0435\u0440\u0435\u0432\u043E",
          type: "textarea",
          rows: 4,
          hint: "\u041F\u0438\u0448\u0438 \u0442\u0430\u043A: [1,2,3,4,5]. \u0415\u0441\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u0435\u0441\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E, \u043F\u0438\u0448\u0438 -."
        }
      ],
      parser(values) {
        return { values: parseTreeArray(values.tree) };
      },
      run: runDfsTreeSum
    },
    {
      id: "dfs-depth",
      topic: "dfs",
      title: "\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u0434\u0435\u0440\u0435\u0432\u0430",
      shortDescription: "\u041E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0435\u043C \u0441\u0430\u043C\u044B\u0439 \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438.",
      complexity: "O(N)",
      algorithmFamily: "DFS \u0441 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u043E\u043C \u0433\u043B\u0443\u0431\u0438\u043D\u044B",
      pseudoCode: PSEUDOCODE.dfsDepth,
      description: "\u0413\u043B\u0443\u0431\u0438\u043D\u0430 \u0434\u0435\u0440\u0435\u0432\u0430 \u2014 \u044D\u0442\u043E \u043C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043E\u0442 \u043A\u043E\u0440\u043D\u044F \u0434\u043E \u043B\u0438\u0441\u0442\u0430. DFS \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442 \u0432\u0441\u0435 \u0432\u0435\u0442\u043A\u0438 \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442 \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C.",
      metrics: [
        { label: "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440", value: "\u0442\u0435\u043A\u0443\u0449\u0430\u044F \u0433\u043B\u0443\u0431\u0438\u043D\u0430" },
        { label: "\u0418\u0442\u043E\u0433", value: "\u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u043F\u043E \u0432\u0441\u0435\u043C \u043B\u0438\u0441\u0442\u044C\u044F\u043C" }
      ],
      presetCases: [
        {
          label: "\u0414\u0435\u0440\u0435\u0432\u043E \u0438\u0437 PDF",
          values: {
            tree: "[1,2,3,4,5]"
          }
        }
      ],
      inputSchema: [
        {
          key: "tree",
          label: "\u0414\u0435\u0440\u0435\u0432\u043E",
          type: "textarea",
          rows: 4,
          hint: "\u041F\u0438\u0448\u0438 \u0442\u0430\u043A: [1,2,3,4,5]. \u0415\u0441\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u0435\u0441\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E, \u043F\u0438\u0448\u0438 -."
        }
      ],
      parser(values) {
        return { values: parseTreeArray(values.tree) };
      },
      run: runDfsMaxDepth
    },
    {
      id: "dfs-mirror",
      topic: "dfs",
      title: "\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0434\u0435\u0440\u0435\u0432\u0430",
      shortDescription: "\u041C\u0435\u043D\u044F\u0435\u043C \u043C\u0435\u0441\u0442\u0430\u043C\u0438 \u043B\u0435\u0432\u044B\u0435 \u0438 \u043F\u0440\u0430\u0432\u044B\u0435 \u043F\u043E\u0434\u0434\u0435\u0440\u0435\u0432\u044C\u044F \u0443 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0443\u0437\u043B\u0430.",
      complexity: "O(N)",
      algorithmFamily: "DFS \u0441 \u043C\u0443\u0442\u0430\u0446\u0438\u0435\u0439 \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u044B",
      pseudoCode: PSEUDOCODE.dfsMirror,
      description: "\u0415\u0441\u043B\u0438 \u0443 \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u0443\u0437\u043B\u0430 \u043F\u043E\u043C\u0435\u043D\u044F\u0442\u044C \u043C\u0435\u0441\u0442\u0430\u043C\u0438 \u0434\u0435\u0442\u0435\u0439, \u0434\u0435\u0440\u0435\u0432\u043E \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u043E\u0442\u0440\u0430\u0437\u0438\u0442\u0441\u044F \u043E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u043E\u0439 \u043E\u0441\u0438.",
      metrics: [
        { label: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u0435", value: "swap(left, right)" },
        { label: "\u041E\u0431\u043B\u0430\u0441\u0442\u044C", value: "\u043A\u0430\u0436\u0434\u044B\u0439 \u0443\u0437\u0435\u043B \u0440\u043E\u0432\u043D\u043E \u043E\u0434\u0438\u043D \u0440\u0430\u0437" }
      ],
      presetCases: [
        {
          label: "\u0414\u0435\u0440\u0435\u0432\u043E \u0438\u0437 PDF",
          values: {
            tree: "[1,2,3,4,5]"
          }
        }
      ],
      inputSchema: [
        {
          key: "tree",
          label: "\u0414\u0435\u0440\u0435\u0432\u043E",
          type: "textarea",
          rows: 4,
          hint: "\u041F\u0438\u0448\u0438 \u0442\u0430\u043A: [1,2,3,4,5]. \u0415\u0441\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u0435\u0441\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E, \u043F\u0438\u0448\u0438 -."
        }
      ],
      parser(values) {
        return { values: parseTreeArray(values.tree) };
      },
      run: runMirrorTree
    },
    {
      id: "dfs-find",
      topic: "dfs",
      title: "\u041F\u043E\u0438\u0441\u043A \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430 \u0432 \u0434\u0435\u0440\u0435\u0432\u0435",
      shortDescription: "\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C, \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u0442\u0441\u044F \u043B\u0438 target \u0432 \u0432\u0435\u0440\u0448\u0438\u043D\u0430\u0445 \u0434\u0435\u0440\u0435\u0432\u0430.",
      complexity: "O(N)",
      algorithmFamily: "DFS \u0441 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u043C \u0437\u0430\u043C\u044B\u043A\u0430\u043D\u0438\u0435\u043C",
      pseudoCode: PSEUDOCODE.dfsFind,
      description: "\u0420\u0435\u043A\u0443\u0440\u0441\u0438\u0432\u043D\u043E \u0438\u0434\u0451\u043C \u043F\u043E \u0434\u0435\u0440\u0435\u0432\u0443 \u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0430\u0435\u043C \u043E\u0431\u0445\u043E\u0434 \u0441\u0440\u0430\u0437\u0443, \u043A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430\u0445\u043E\u0434\u0438\u043C \u043D\u0443\u0436\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435.",
      metrics: [
        { label: "\u041E\u043F\u0442\u0438\u043C\u0438\u0437\u0430\u0446\u0438\u044F", value: "\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u043F\u0440\u0438 \u043F\u0435\u0440\u0432\u043E\u043C \u0441\u043E\u0432\u043F\u0430\u0434\u0435\u043D\u0438\u0438" },
        { label: "\u041E\u0442\u0432\u0435\u0442", value: "True / False" }
      ],
      presetCases: [
        {
          label: "\u0418\u0449\u0435\u043C \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 5",
          values: {
            tree: "[1,2,3,4,5]",
            target: "5"
          }
        }
      ],
      inputSchema: [
        {
          key: "tree",
          label: "\u0414\u0435\u0440\u0435\u0432\u043E",
          type: "textarea",
          rows: 4,
          hint: "\u041F\u0438\u0448\u0438 \u0442\u0430\u043A: [1,2,3,4,5]. \u0415\u0441\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u0435\u0441\u0442\u044C \u043F\u0443\u0441\u0442\u043E\u0435 \u043C\u0435\u0441\u0442\u043E, \u043F\u0438\u0448\u0438 -."
        },
        {
          key: "target",
          label: "\u0418\u0441\u043A\u043E\u043C\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 5"
        }
      ],
      parser(values) {
        return {
          values: parseTreeArray(values.tree),
          target: toNumber(values.target, "\u0418\u0441\u043A\u043E\u043C\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435")
        };
      },
      run: runDfsFind
    },
    {
      id: "dfs-maze",
      topic: "dfs",
      title: "\u041F\u043E\u0438\u0441\u043A \u0432\u044B\u0445\u043E\u0434\u0430 \u0432 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0435",
      shortDescription: "\u041E\u043F\u0440\u0435\u0434\u0435\u043B\u044F\u0435\u043C, \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442 \u043B\u0438 \u0445\u043E\u0442\u044C \u043A\u0430\u043A\u043E\u0439-\u0442\u043E \u043F\u0443\u0442\u044C \u0434\u043E \u0444\u0438\u043D\u0438\u0448\u0430.",
      complexity: "O(N \xB7 M)",
      algorithmFamily: "DFS \u043F\u043E \u043C\u0430\u0442\u0440\u0438\u0446\u0435",
      pseudoCode: PSEUDOCODE.dfsMaze,
      description: "\u0417\u0430\u0434\u0430\u0447\u0430 \u043D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0433\u043E \u043F\u0443\u0442\u0438, \u043F\u043E\u044D\u0442\u043E\u043C\u0443 DFS \u043F\u0440\u043E\u0441\u0442\u043E \u043F\u0440\u043E\u0431\u0443\u0435\u0442 \u0443\u0433\u043B\u0443\u0431\u043B\u044F\u0442\u044C\u0441\u044F \u043F\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u043C \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F\u043C \u0434\u043E \u0442\u0435\u0445 \u043F\u043E\u0440, \u043F\u043E\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0451\u0442 \u0446\u0435\u043B\u044C \u0438\u043B\u0438 \u043D\u0435 \u043F\u0435\u0440\u0435\u0431\u0435\u0440\u0451\u0442 \u0432\u0441\u0435 \u0432\u0435\u0442\u043A\u0438.",
      metrics: [
        { label: "\u0417\u0430\u0434\u0430\u0447\u0430", value: "\u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u043E\u0432\u0430\u043D\u0438\u044F \u043F\u0443\u0442\u0438" },
        { label: "\u0421\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044F", value: "\u0433\u043B\u0443\u0431\u0438\u043D\u0430 \u043F\u0440\u0435\u0436\u0434\u0435 \u0448\u0438\u0440\u0438\u043D\u044B" }
      ],
      presetCases: [
        {
          label: "\u041B\u0430\u0431\u0438\u0440\u0438\u043D\u0442 \u0438\u0437 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438",
          values: {
            grid: "0 0 0 1\n1 1 0 1\n0 0 0 0\n0 1 1 0",
            start: "0,0",
            end: "3,3"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430",
          type: "textarea",
          rows: 6,
          hint: "0 \u2014 \u043F\u0440\u043E\u0445\u043E\u0434, 1 \u2014 \u0441\u0442\u0435\u043D\u0430."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0,0"
        },
        {
          key: "end",
          label: "\u0424\u0438\u043D\u0438\u0448",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 3,3"
        }
      ],
      parser(values) {
        return {
          grid: parseNumericMatrix(values.grid),
          start: parseCoordText(values.start),
          end: parseCoordText(values.end)
        };
      },
      run: runDfsMaze
    },
    graphTask({
      id: "dijkstra-base",
      topic: "dijkstra",
      title: "\u0420\u0430\u0437\u043E\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0431\u0430\u0437\u043E\u0432\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440",
      shortDescription: "\u0422\u043E\u0442 \u0441\u0430\u043C\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440, \u0433\u0434\u0435 B \u0441\u043D\u0430\u0447\u0430\u043B\u0430 \u0434\u0430\u0451\u0442 \u043F\u0443\u0442\u044C \u043A A, \u0430 \u043F\u043E\u0442\u043E\u043C \u043A F.",
      complexity: "O(V\xB2 + E)",
      algorithmFamily: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0441 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435\u043C \u043F\u0443\u0442\u0438",
      pseudoCode: PSEUDOCODE.dijkstra,
      description: "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u043A\u0430\u043A \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0432\u0435\u0440\u0448\u0438\u043D\u044B A \u0441\u043D\u0438\u0436\u0430\u0435\u0442\u0441\u044F \u043F\u043E\u0441\u043B\u0435 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 B, \u0430 \u0437\u0430\u0442\u0435\u043C \u043E\u043A\u043E\u043D\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u043E \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043F\u0443\u0442\u044C \u0434\u043E F.",
      metrics: [
        { label: "\u0421\u0442\u0430\u0440\u0442", value: "S" },
        { label: "\u0426\u0435\u043B\u044C", value: "F" }
      ],
      presetCases: [
        {
          label: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0443\u0447\u0435\u0431\u043D\u044B\u0439 \u0433\u0440\u0430\u0444",
          values: {
            edges: "S A 6\nS B 2\nB A 3\nB F 5\nA F 1",
            start: "S",
            target: "F"
          }
        }
      ],
      run(parsed) {
        return runDijkstraToTarget(parsed);
      }
    }),
    graphTask({
      id: "dijkstra-path",
      topic: "dijkstra",
      title: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0443\u0442\u0438",
      shortDescription: "\u0421\u0447\u0438\u0442\u0430\u0435\u043C \u0434\u043B\u0438\u043D\u0443 \u0438 \u0442\u0443\u0442 \u0436\u0435 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u0441\u0430\u043C\u0438 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430.",
      complexity: "O(V\xB2 + E)",
      algorithmFamily: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 + \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u0440\u0435\u0434\u043A\u043E\u0432",
      pseudoCode: PSEUDOCODE.dijkstra,
      description: "\u041F\u043E\u0441\u043B\u0435 \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439 \u0438\u0434\u0451\u043C \u043F\u043E parent-\u0442\u0430\u0431\u043B\u0438\u0446\u0435 \u043E\u0442 \u0446\u0435\u043B\u0438 \u043D\u0430\u0437\u0430\u0434 \u0438 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u043C \u0432\u0435\u0441\u044C \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442.",
      metrics: [
        { label: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F \u0438\u0434\u0435\u044F", value: "\u0445\u0440\u0430\u043D\u0438\u043C \u043F\u0440\u0435\u0434\u043A\u0430 \u043F\u0440\u0438 \u043A\u0430\u0436\u0434\u043E\u0439 \u0440\u0435\u043B\u0430\u043A\u0441\u0430\u0446\u0438\u0438" },
        { label: "\u0418\u0442\u043E\u0433", value: "\u0434\u043B\u0438\u043D\u0430 + \u043C\u0430\u0440\u0448\u0440\u0443\u0442" }
      ],
      presetCases: [
        {
          label: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442 S \u2192 F",
          values: {
            edges: "S A 4\nS B 2\nB C 2\nA C 1\nC F 3\nA F 7",
            start: "S",
            target: "F"
          }
        }
      ],
      run(parsed) {
        return runDijkstraToTarget(parsed);
      }
    }),
    graphTask({
      id: "dijkstra-equal-paths",
      topic: "dijkstra",
      title: "\u041D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u043E \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0445 \u043F\u0443\u0442\u0435\u0439",
      shortDescription: "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u043C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u0435\u0434\u043A\u043E\u0432 \u0434\u043B\u044F \u043E\u0434\u043D\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u044B.",
      complexity: "O(V\xB2 + E)",
      algorithmFamily: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0441 \u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E\u043C \u043F\u0440\u0435\u0434\u043A\u043E\u0432",
      pseudoCode: PSEUDOCODE.dijkstra,
      description: "\u0415\u0441\u043B\u0438 \u0434\u0432\u0435 \u0440\u0430\u0437\u043D\u044B\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u0434\u0430\u044E\u0442 \u043E\u0434\u0438\u043D\u0430\u043A\u043E\u0432\u0443\u044E \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0443\u044E \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C, \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043E\u0431\u0430 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u0430 \u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0432\u0441\u0435 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u044B.",
      metrics: [
        { label: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u044C", value: "\u0440\u0430\u0432\u043D\u044B\u0435 \u0434\u0438\u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0435 \u043E\u0442\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u043C" },
        { label: "\u0418\u0442\u043E\u0433", value: "\u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u043E\u0432" }
      ],
      presetCases: [
        {
          label: "\u0414\u0432\u0430 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0445 \u043F\u0443\u0442\u0438 X \u2192 Y",
          values: {
            edges: "X A 2\nX B 2\nA Y 3\nB Y 3",
            start: "X",
            target: "Y"
          }
        }
      ],
      run(parsed) {
        return runDijkstraToTarget({
          ...parsed,
          allowEqualParents: true
        });
      }
    }),
    graphTask({
      id: "dijkstra-unreachable",
      topic: "dijkstra",
      title: "\u041D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B",
      shortDescription: "\u0415\u0441\u043B\u0438 \u043F\u0443\u0442\u044C \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D, \u0432\u0435\u0440\u0448\u0438\u043D\u0430 \u043E\u0441\u0442\u0430\u0451\u0442\u0441\u044F \u0441 \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E\u0439 \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C\u044E.",
      complexity: "O(V\xB2 + E)",
      algorithmFamily: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u0434\u043E \u0432\u0441\u0435\u0445 \u0432\u0435\u0440\u0448\u0438\u043D",
      pseudoCode: PSEUDOCODE.dijkstra,
      description: "\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u044B, \u043D\u043E \u0438 \u0447\u0435\u0441\u0442\u043D\u043E \u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u0441\u043E \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435\u043C \u221E, \u043A\u043E\u0442\u043E\u0440\u043E\u0435 \u0432 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0435 \u043F\u0435\u0440\u0435\u0432\u043E\u0434\u0438\u0442\u0441\u044F \u0432 -1.",
      metrics: [
        { label: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", value: "\u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439" },
        { label: "\u041D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u043E\u0441\u0442\u044C", value: "\u221E \u2192 -1 \u0432 \u0432\u044B\u0432\u043E\u0434\u0435" }
      ],
      presetCases: [
        {
          label: "\u0413\u0440\u0430\u0444 \u0441 \u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u043E\u0439",
          values: {
            edges: "A B 2\nB C 3\nC D 1\nE F 4",
            start: "A",
            target: ""
          }
        }
      ],
      run(parsed) {
        const result = runDijkstraAllToAll(parsed);
        result.answer = result.answer.replace(/∞/g, "-1");
        return result;
      }
    }),
    graphTask({
      id: "dijkstra-network",
      topic: "dijkstra",
      title: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0446\u0438\u044F \u0432 \u0441\u0435\u0442\u0438",
      shortDescription: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 shortest path, \u043D\u043E \u0432 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u0445 \u0437\u0430\u0434\u0435\u0440\u0436\u0435\u043A \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0438\u0437\u0430\u0442\u043E\u0440\u043E\u0432.",
      complexity: "O(V\xB2 + E)",
      algorithmFamily: "\u0414\u0435\u0439\u043A\u0441\u0442\u0440\u0430 \u043D\u0430 \u0441\u0435\u0442\u0435\u0432\u043E\u043C \u0433\u0440\u0430\u0444\u0435",
      pseudoCode: PSEUDOCODE.dijkstra,
      description: "\u041A\u0430\u0436\u0434\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u2014 \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430 \u043C\u0435\u0436\u0434\u0443 \u0440\u043E\u0443\u0442\u0435\u0440\u0430\u043C\u0438. \u0417\u0430\u0434\u0430\u0447\u0430 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u043F\u043E\u0432\u0442\u043E\u0440\u044F\u0435\u0442 \u043E\u0431\u0449\u0443\u044E \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0443 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u044B, \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043C\u044B\u0441\u043B \u0432\u0435\u0441\u0430 \u2014 \u043C\u0438\u043B\u043B\u0438\u0441\u0435\u043A\u0443\u043D\u0434\u044B.",
      metrics: [
        { label: "\u0415\u0434\u0438\u043D\u0438\u0446\u0430 \u0432\u0435\u0441\u0430", value: "\u043C\u0438\u043B\u043B\u0438\u0441\u0435\u043A\u0443\u043D\u0434\u044B" },
        { label: "\u0426\u0435\u043B\u044C", value: "\u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430\u0440\u043D\u0430\u044F \u0437\u0430\u0434\u0435\u0440\u0436\u043A\u0430" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0441\u0435\u0442\u0438 Router1 \u2192 Router5",
          values: {
            edges: "Router1 Router2 7\nRouter1 Router3 2\nRouter3 Router4 3\nRouter4 Router5 2\nRouter2 Router5 9\nRouter3 Router5 8",
            start: "Router1",
            target: "Router5"
          }
        }
      ],
      run(parsed) {
        return runDijkstraToTarget(parsed);
      }
    }),
    {
      id: "backtracking-permutations",
      topic: "backtracking",
      title: "\u041F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438 \u0447\u0438\u0441\u0435\u043B",
      shortDescription: "\u041F\u0435\u0440\u0435\u0431\u0438\u0440\u0430\u0435\u043C \u0432\u0441\u0435 \u043F\u043E\u0440\u044F\u0434\u043A\u0438 \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432.",
      complexity: "O(n \xB7 n!)",
      algorithmFamily: "Backtracking \u0441 \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C used",
      pseudoCode: PSEUDOCODE.permutations,
      description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u0448\u0430\u0433 \u0432\u044B\u0431\u0438\u0440\u0430\u0435\u0442 \u043E\u0447\u0435\u0440\u0435\u0434\u043D\u043E\u0435 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E, \u0430 \u043F\u043E\u0441\u043B\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u0430 \u0438\u0437 \u0440\u0435\u043A\u0443\u0440\u0441\u0438\u0438 \u043E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0435\u0442 \u0432\u044B\u0431\u043E\u0440.",
      metrics: [
        { label: "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435", value: "path + used[]" },
        { label: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", value: "\u0432\u0441\u0435 n! \u043F\u0435\u0440\u0435\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            numbers: "1,2,3"
          }
        }
      ],
      inputSchema: [
        {
          key: "numbers",
          label: "\u041C\u0430\u0441\u0441\u0438\u0432 \u0447\u0438\u0441\u0435\u043B",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 1,2,3"
        }
      ],
      parser(values) {
        return { numbers: toIntegerList(values.numbers) };
      },
      run: runPermutations
    },
    {
      id: "backtracking-subsets",
      topic: "backtracking",
      title: "\u041F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u0430",
      shortDescription: "\u0414\u043B\u044F \u043A\u0430\u0436\u0434\u043E\u0433\u043E \u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430 \u0440\u0435\u0448\u0430\u0435\u043C: \u0432\u0437\u044F\u0442\u044C \u0435\u0433\u043E \u0438\u043B\u0438 \u043F\u0440\u043E\u043F\u0443\u0441\u0442\u0438\u0442\u044C.",
      complexity: "O(n \xB7 2\u207F)",
      algorithmFamily: "Backtracking \u043F\u043E \u0431\u0438\u043D\u0430\u0440\u043D\u043E\u043C\u0443 \u0432\u044B\u0431\u043E\u0440\u0443",
      pseudoCode: PSEUDOCODE.subsets,
      description: "\u041A\u0430\u0436\u0434\u044B\u0439 \u044D\u043B\u0435\u043C\u0435\u043D\u0442 \u043B\u0438\u0431\u043E \u0432\u0445\u043E\u0434\u0438\u0442 \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0435 \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432\u043E, \u043B\u0438\u0431\u043E \u043D\u0435\u0442. \u042D\u0442\u043E \u043F\u043E\u0440\u043E\u0436\u0434\u0430\u0435\u0442 \u043F\u043E\u043B\u043D\u043E\u0435 \u0434\u0435\u0440\u0435\u0432\u043E \u0440\u0435\u0448\u0435\u043D\u0438\u0439 \u0433\u043B\u0443\u0431\u0438\u043D\u044B n.",
      metrics: [
        { label: "\u0412\u0435\u0442\u043A\u0438", value: "\u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C / \u0438\u0441\u043A\u043B\u044E\u0447\u0438\u0442\u044C" },
        { label: "\u0418\u0442\u043E\u0433", value: "2\u207F \u043F\u043E\u0434\u043C\u043D\u043E\u0436\u0435\u0441\u0442\u0432" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            numbers: "1,2,3"
          }
        }
      ],
      inputSchema: [
        {
          key: "numbers",
          label: "\u041C\u0430\u0441\u0441\u0438\u0432 \u0447\u0438\u0441\u0435\u043B",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 1,2,3"
        }
      ],
      parser(values) {
        return { numbers: toIntegerList(values.numbers) };
      },
      run: runSubsets
    },
    {
      id: "backtracking-maze",
      topic: "backtracking",
      title: "\u041F\u0443\u0442\u044C \u0432 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0435",
      shortDescription: "\u041F\u0440\u043E\u0431\u0443\u0435\u043C \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u044B \u0438 \u043E\u0442\u043A\u0430\u0442\u044B\u0432\u0430\u0435\u043C\u0441\u044F \u0438\u0437 \u0442\u0443\u043F\u0438\u043A\u043E\u0432.",
      complexity: "O(N \xB7 M) \u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u043C, \u044D\u043A\u0441\u043F\u043E\u043D\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E \u0432 \u0445\u0443\u0434\u0448\u0435\u043C \u0441\u043B\u0443\u0447\u0430\u0435",
      algorithmFamily: "Backtracking \u043F\u043E \u043C\u0430\u0442\u0440\u0438\u0446\u0435",
      pseudoCode: PSEUDOCODE.backtrackingMaze,
      description: "\u0412 \u043E\u0442\u043B\u0438\u0447\u0438\u0435 \u043E\u0442 BFS \u043D\u0430 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C, \u0437\u0434\u0435\u0441\u044C \u0432\u0430\u0436\u0435\u043D \u0438\u043C\u0435\u043D\u043D\u043E \u0441\u0430\u043C \u043C\u0435\u0445\u0430\u043D\u0438\u0437\u043C \u043F\u0435\u0440\u0435\u0431\u043E\u0440\u0430 \u0438 \u043E\u0442\u043A\u0430\u0442\u0430, \u043A\u043E\u0433\u0434\u0430 \u043F\u0443\u0442\u044C \u043E\u043A\u0430\u0437\u0430\u043B\u0441\u044F \u0442\u0443\u043F\u0438\u043A\u043E\u0432\u044B\u043C.",
      metrics: [
        { label: "\u0421\u0442\u0430\u0440\u0442", value: "(0,0)" },
        { label: "\u0426\u0435\u043B\u044C", value: "(N-1,M-1)" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            grid: "0 0 0\n1 1 0\n0 0 0"
          }
        }
      ],
      inputSchema: [
        {
          key: "grid",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u043B\u0430\u0431\u0438\u0440\u0438\u043D\u0442\u0430",
          type: "textarea",
          rows: 5,
          hint: "0 \u2014 \u043F\u0440\u043E\u0445\u043E\u0434, 1 \u2014 \u0441\u0442\u0435\u043D\u0430."
        }
      ],
      parser(values) {
        return { grid: parseNumericMatrix(values.grid) };
      },
      run: runBacktrackingMaze
    },
    {
      id: "backtracking-parentheses",
      topic: "backtracking",
      title: "\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0441\u043A\u043E\u0431\u043E\u043A",
      shortDescription: "\u0421\u0442\u0440\u043E\u0438\u043C \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u0435 \u0441\u0442\u0440\u043E\u043A\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u043C\u0438 \u043D\u0430 \u043A\u0430\u0436\u0434\u043E\u043C \u0448\u0430\u0433\u0435.",
      complexity: "O(Cn)",
      algorithmFamily: "Backtracking \u0441 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u044F\u043C\u0438",
      pseudoCode: PSEUDOCODE.parentheses,
      description: "\u041A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E\u0441\u0442\u044C \u0441\u0442\u0440\u043E\u043A \u043E\u0431\u0435\u0441\u043F\u0435\u0447\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u044F\u043C\u043E \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438: \u0435\u0441\u043B\u0438 \u0437\u0430\u043A\u0440\u044B\u0432\u0430\u044E\u0449\u0438\u0445 \u0441\u0442\u0430\u043D\u0435\u0442 \u0431\u043E\u043B\u044C\u0448\u0435, \u0432\u0435\u0442\u043A\u0430 \u0434\u0430\u0436\u0435 \u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u0451\u0442\u0441\u044F.",
      metrics: [
        { label: "\u041E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0435", value: "close \u2264 open \u2264 n" },
        { label: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", value: "\u0432\u0441\u0435 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            pairs: "3"
          }
        }
      ],
      inputSchema: [
        {
          key: "pairs",
          label: "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u0430\u0440 \u0441\u043A\u043E\u0431\u043E\u043A",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 3"
        }
      ],
      parser(values) {
        return { pairs: toNumber(values.pairs, "\u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u0430\u0440 \u0441\u043A\u043E\u0431\u043E\u043A") };
      },
      run: runGenerateParentheses
    },
    {
      id: "backtracking-combination-sum",
      topic: "backtracking",
      title: "\u041A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u0441\u0443\u043C\u043C",
      shortDescription: "\u041F\u043E\u0434\u0431\u0438\u0440\u0430\u0435\u043C \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0446\u0438\u0438 \u0447\u0438\u0441\u0435\u043B, \u0434\u0430\u044E\u0449\u0438\u0435 target.",
      complexity: "\u044D\u043A\u0441\u043F\u043E\u043D\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u0430\u044F",
      algorithmFamily: "Backtracking \u0441 \u043E\u0442\u0441\u0435\u0447\u0435\u043D\u0438\u0435\u043C \u043F\u043E \u043E\u0441\u0442\u0430\u0442\u043A\u0443",
      pseudoCode: PSEUDOCODE.combinationSum,
      description: "\u0415\u0441\u043B\u0438 \u0441\u0443\u043C\u043C\u0430 \u0443\u0436\u0435 \u043F\u0440\u0435\u0432\u044B\u0441\u0438\u043B\u0430 target, \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0430\u0442\u044C \u0432\u0435\u0442\u043A\u0443 \u043D\u0435 \u0438\u043C\u0435\u0435\u0442 \u0441\u043C\u044B\u0441\u043B\u0430. \u042D\u0442\u043E \u0438 \u0435\u0441\u0442\u044C \u043E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u043E\u0442\u0441\u0435\u0447\u043A\u0430.",
      metrics: [
        { label: "\u041E\u0442\u0441\u0435\u0447\u043A\u0430", value: "remain < 0" },
        { label: "\u041F\u043E\u0432\u0442\u043E\u0440\u044B", value: "\u043E\u0434\u043D\u043E \u0447\u0438\u0441\u043B\u043E \u043C\u043E\u0436\u043D\u043E \u0431\u0440\u0430\u0442\u044C \u043C\u043D\u043E\u0433\u043E\u043A\u0440\u0430\u0442\u043D\u043E" }
      ],
      presetCases: [
        {
          label: "\u041F\u0440\u0438\u043C\u0435\u0440 \u0438\u0437 PDF",
          values: {
            candidates: "2,3,6,7",
            target: "7"
          }
        }
      ],
      inputSchema: [
        {
          key: "candidates",
          label: "\u041A\u0430\u043D\u0434\u0438\u0434\u0430\u0442\u044B",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 2,3,6,7"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 7"
        }
      ],
      parser(values) {
        return {
          candidates: toIntegerList(values.candidates),
          target: toNumber(values.target, "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430")
        };
      },
      run: runCombinationSum
    },
    {
      id: "bellman-basic",
      topic: "bellman-ford",
      title: "\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440 \u0441 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C \u0432\u0435\u0441\u043E\u043C",
      shortDescription: "\u0421\u0447\u0438\u0442\u0430\u0435\u043C \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043F\u0443\u0442\u0438 \u043E\u0442 A \u0434\u043E \u0432\u0441\u0435\u0445 \u0432\u0435\u0440\u0448\u0438\u043D.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0440\u0438\u043C\u0435\u0440, \u0433\u0434\u0435 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u0451\u0442 \u0446\u0438\u043A\u043B\u0430, \u043D\u043E \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u0438\u0442\u043E\u0433\u043E\u0432\u044B\u0435 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F.",
      metrics: [
        { label: "\u0421\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430", value: "\u0443\u043C\u0435\u0435\u0442 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0451\u0431\u0440\u0430" },
        { label: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", value: "\u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439" }
      ],
      presetCases: [
        {
          label: "\u0421\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440 \u0431\u0435\u0437 \u043F\u0440\u043E\u0442\u0438\u0432\u043E\u0440\u0435\u0447\u0438\u044F",
          values: {
            edges: "A B 4\nA C 5\nB C -1\nB D 5\nC D 8\nC E 10\nD E 2",
            start: "A",
            target: ""
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 8,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041E\u0441\u0442\u0430\u0432\u044C \u043F\u0443\u0441\u0442\u044B\u043C \u0434\u043B\u044F \u0440\u0430\u0441\u0447\u0451\u0442\u0430 \u0434\u043E \u0432\u0441\u0435\u0445 \u0432\u0435\u0440\u0448\u0438\u043D."
        }
      ],
      parser(values) {
        var _a;
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: String((_a = values.target) != null ? _a : "").trim() || null
        };
      },
      run: runBellmanFord
    },
    {
      id: "bellman-cycle",
      topic: "bellman-ford",
      title: "\u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430",
      shortDescription: "\u041F\u0440\u043E\u0432\u0435\u0440\u044F\u0435\u043C, \u043C\u043E\u0436\u043D\u043E \u043B\u0438 \u0435\u0449\u0451 \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u043F\u043E\u0441\u043B\u0435 |V|-1 \u043F\u0440\u043E\u0445\u043E\u0434\u043E\u0432.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 + \u0446\u0438\u043A\u043B-\u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0430",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u0415\u0441\u043B\u0438 \u043F\u043E\u0441\u043B\u0435 \u0432\u0441\u0435\u0445 \u043E\u0441\u043D\u043E\u0432\u043D\u044B\u0445 \u0438\u0442\u0435\u0440\u0430\u0446\u0438\u0439 \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435 \u0432\u0441\u0451 \u0435\u0449\u0451 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u0432 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u043E\u0439 \u0447\u0430\u0441\u0442\u0438 \u0433\u0440\u0430\u0444\u0430 \u0435\u0441\u0442\u044C \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B.",
      metrics: [
        { label: "\u041A\u0440\u0438\u0442\u0435\u0440\u0438\u0439", value: "\u0435\u0441\u0442\u044C \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0435 \u043D\u0430 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C \u043F\u0440\u043E\u0445\u043E\u0434\u0435" },
        { label: "\u041E\u0442\u0432\u0435\u0442", value: "True / False" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 2 \u0438\u0437 PDF",
          values: {
            edges: "A B 1\nB C -1\nC A -1",
            start: "A",
            target: ""
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 6,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0434\u043B\u044F \u044D\u0442\u043E\u0439 \u0437\u0430\u0434\u0430\u0447\u0438."
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: null
        };
      },
      run(parsed) {
        const result = runBellmanFord(parsed);
        result.answer = result.hasNegativeCycle ? "True" : "False";
        return result;
      }
    },
    {
      id: "bellman-negative-path",
      topic: "bellman-ford",
      title: "\u041A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C \u0441 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u0440\u0451\u0431\u0440\u0430\u043C\u0438",
      shortDescription: "\u041D\u0430\u0445\u043E\u0434\u0438\u043C \u043F\u0443\u0442\u044C S \u2192 F, \u0433\u0434\u0435 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u043F\u043E\u043C\u043E\u0433\u0430\u0435\u0442 \u0441\u043E\u043A\u0440\u0430\u0442\u0438\u0442\u044C \u043C\u0430\u0440\u0448\u0440\u0443\u0442.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 \u0441 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435\u043C \u043F\u0443\u0442\u0438",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u0414\u0430\u0436\u0435 \u0435\u0441\u043B\u0438 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0451\u0431\u0440\u0430 \u0435\u0441\u0442\u044C, \u043D\u043E \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430 \u043D\u0435\u0442, \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u043E \u043D\u0430\u0445\u043E\u0434\u0438\u0442 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0439 \u043F\u0443\u0442\u044C.",
      metrics: [
        { label: "\u0421\u0442\u0430\u0440\u0442", value: "S" },
        { label: "\u0426\u0435\u043B\u044C", value: "F" }
      ],
      presetCases: [
        {
          label: "\u0410\u0434\u0430\u043F\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u0440\u0438\u043C\u0435\u0440 \u0431\u0435\u0437 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430",
          values: {
            edges: "S A 4\nS B 3\nA B -2\nB A 3\nB C 2\nC F 1\nA F 5",
            start: "S",
            target: "F"
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 8,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: S"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: F"
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: String(values.target).trim()
        };
      },
      run: runBellmanFord
    },
    {
      id: "bellman-matrix",
      topic: "bellman-ford",
      title: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u043C\u0435\u0436\u043D\u043E\u0441\u0442\u0438",
      shortDescription: "\u041A\u043E\u043D\u0432\u0435\u0440\u0442\u0438\u0440\u0443\u0435\u043C \u043C\u0430\u0442\u0440\u0438\u0446\u0443 \u0432 \u0441\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440 \u0438 \u0441\u0447\u0438\u0442\u0430\u0435\u043C \u043F\u0443\u0442\u0438 \u043E\u0442 \u0432\u0435\u0440\u0448\u0438\u043D\u044B 0.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 \u043F\u043E \u043C\u0430\u0442\u0440\u0438\u0446\u0435",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u0412\u0432\u043E\u0434 \u0432 \u0432\u0438\u0434\u0435 \u043C\u0430\u0442\u0440\u0438\u0446\u044B \u0441\u043C\u0435\u0436\u043D\u043E\u0441\u0442\u0438 \u2014 \u044D\u0442\u043E \u043F\u0440\u043E\u0441\u0442\u043E \u0434\u0440\u0443\u0433\u043E\u0439 \u0441\u043F\u043E\u0441\u043E\u0431 \u0437\u0430\u0434\u0430\u0442\u044C \u0433\u0440\u0430\u0444. \u0412\u043D\u0443\u0442\u0440\u0438 \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0432\u0441\u0451 \u0440\u0430\u0432\u043D\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0441\u043E \u0441\u043F\u0438\u0441\u043A\u043E\u043C \u0440\u0451\u0431\u0435\u0440.",
      metrics: [
        { label: "\u0421\u0442\u0430\u0440\u0442", value: "\u0432\u0435\u0440\u0448\u0438\u043D\u0430 0" },
        { label: "\u041D\u043E\u043B\u044C \u0432\u043D\u0435 \u0434\u0438\u0430\u0433\u043E\u043D\u0430\u043B\u0438", value: "\u0440\u0435\u0431\u0440\u0430 \u043D\u0435\u0442" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 4 \u0438\u0437 PDF",
          values: {
            matrix: "0 5 0 0\n0 0 -3 0\n0 0 0 4\n2 0 0 0",
            start: "0"
          }
        }
      ],
      inputSchema: [
        {
          key: "matrix",
          label: "\u041C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u043C\u0435\u0436\u043D\u043E\u0441\u0442\u0438",
          type: "textarea",
          rows: 6,
          hint: "\u0421\u0442\u0440\u043E\u043A\u0438 \u0447\u0435\u0440\u0435\u0437 \u043F\u0435\u0440\u0435\u043D\u043E\u0441, \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u044F \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u0431\u0435\u043B."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0"
        }
      ],
      parser(values) {
        const { edges } = parseAdjacencyMatrix(values.matrix);
        return {
          edges,
          start: String(values.start).trim(),
          target: null
        };
      },
      run: runBellmanFord
    },
    {
      id: "bellman-path-restore",
      topic: "bellman-ford",
      title: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0443\u0442\u0438",
      shortDescription: "\u041D\u0443\u0436\u0435\u043D \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u043E\u0442\u0432\u0435\u0442, \u043D\u043E \u0438 \u0441\u0430\u043C \u043C\u0430\u0440\u0448\u0440\u0443\u0442 \u043E\u0442 A \u0434\u043E D.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 + parent-\u0446\u0435\u043F\u043E\u0447\u043A\u0430",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u041F\u043E\u0441\u043B\u0435 \u0440\u0435\u043B\u0430\u043A\u0441\u0430\u0446\u0438\u0438 \u0440\u0451\u0431\u0435\u0440 \u0442\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u0440\u0435\u0434\u043A\u043E\u0432 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0444\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0446\u0435\u043F\u043E\u0447\u043A\u0443 \u0432\u0435\u0440\u0448\u0438\u043D \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0435\u0433\u043E \u043F\u0443\u0442\u0438.",
      metrics: [
        { label: "\u0426\u0435\u043B\u044C", value: "A \u2192 D" },
        { label: "\u0418\u0442\u043E\u0433", value: "\u0434\u043B\u0438\u043D\u0430 + \u043F\u0443\u0442\u044C" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 5 \u0438\u0437 PDF",
          values: {
            edges: "A B 3\nA C 5\nB C -2\nB D 1\nC D 4",
            start: "A",
            target: "D"
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 7,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: D"
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: String(values.target).trim()
        };
      },
      run: runBellmanFord
    },
    {
      id: "bellman-unreachable-cycle",
      topic: "bellman-ford",
      title: "\u041D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0439 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B",
      shortDescription: "\u0426\u0438\u043A\u043B \u0435\u0441\u0442\u044C, \u043D\u043E \u043E\u043D \u043E\u0442\u043E\u0440\u0432\u0430\u043D \u043E\u0442 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u043E\u0439 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u0438 \u043F\u043E\u0442\u043E\u043C\u0443 \u043D\u0435 \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u043E\u0442\u0432\u0435\u0442.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u0410\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0440\u0435\u0430\u0433\u0438\u0440\u0443\u0435\u0442 \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0446\u0438\u043A\u043B\u044B, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B \u0438\u0437 \u0441\u0442\u0430\u0440\u0442\u0430. \u0418\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B \u043D\u0435 \u0434\u043E\u043B\u0436\u0435\u043D \u043B\u043E\u043C\u0430\u0442\u044C \u043E\u0442\u0432\u0435\u0442.",
      metrics: [
        { label: "\u0412\u0430\u0436\u043D\u044B\u0439 \u043D\u044E\u0430\u043D\u0441", value: "\u0446\u0438\u043A\u043B \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442, \u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C" },
        { label: "\u041E\u0442\u0432\u0435\u0442", value: "\u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u043A\u043E\u043C\u043F\u043E\u043D\u0435\u043D\u0442\u044B \u0441\u0442\u0430\u0440\u0442\u0430" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 6 \u0438\u0437 PDF",
          values: {
            edges: "A B 2\nB C 3\nX Y 1\nY X -5",
            start: "A",
            target: ""
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 6,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F."
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: null
        };
      },
      run: runBellmanFord
    },
    {
      id: "bellman-vs-dijkstra",
      topic: "bellman-ford",
      title: "\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0441 \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u043E\u0439",
      shortDescription: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u043C, \u043F\u043E\u0447\u0435\u043C\u0443 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u043B\u043E\u043C\u0430\u0435\u0442 \u0436\u0430\u0434\u043D\u0443\u044E \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044E \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u044B.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 + \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u0441\u0442\u0430",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u0412 \u044D\u0442\u043E\u043C \u0433\u0440\u0430\u0444\u0435 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u0434\u0435\u043B\u0430\u0435\u0442 \u043F\u0443\u0442\u044C \u0447\u0435\u0440\u0435\u0437 \u043F\u0440\u043E\u043C\u0435\u0436\u0443\u0442\u043E\u0447\u043D\u0443\u044E \u0432\u0435\u0440\u0448\u0438\u043D\u0443 \u0432\u044B\u0433\u043E\u0434\u043D\u0435\u0435 \u043F\u043E\u0437\u0436\u0435, \u0447\u0435\u043C \u043E\u0436\u0438\u0434\u0430\u043B \u0431\u044B \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0414\u0435\u0439\u043A\u0441\u0442\u0440\u044B.",
      metrics: [
        { label: "\u041A\u043B\u044E\u0447\u0435\u0432\u0430\u044F \u043F\u0440\u0438\u0447\u0438\u043D\u0430", value: "\u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0440\u0435\u0431\u0440\u043E \u043C\u043E\u0436\u0435\u0442 \u0443\u043B\u0443\u0447\u0448\u0438\u0442\u044C \u0443\u0436\u0435 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u043F\u0443\u0442\u044C" },
        { label: "\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u0432\u044B\u0431\u043E\u0440", value: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 7 \u0438\u0437 PDF",
          values: {
            edges: "A B 10\nA C 5\nC B -8",
            start: "A",
            target: ""
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 6,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041E\u0441\u0442\u0430\u0432\u044C \u043F\u0443\u0441\u0442\u044B\u043C \u0434\u043B\u044F \u0442\u0430\u0431\u043B\u0438\u0446\u044B \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0439."
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: null,
          noteDijkstra: true
        };
      },
      run: runBellmanFord
    },
    {
      id: "bellman-infinite-updates",
      topic: "bellman-ford",
      title: "\u041C\u043D\u043E\u0433\u043E\u043A\u0440\u0430\u0442\u043D\u044B\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F",
      shortDescription: "\u0415\u0441\u043B\u0438 \u0446\u0438\u043A\u043B \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C, \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u043C\u043E\u0436\u043D\u043E \u0443\u043C\u0435\u043D\u044C\u0448\u0430\u0442\u044C \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434 \u0441 \u0434\u0435\u0442\u0435\u043A\u0446\u0438\u0435\u0439 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u0417\u0430\u0434\u0430\u0447\u0430 \u043F\u043E\u0434\u0447\u0451\u0440\u043A\u0438\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0434\u043B\u044F \u043D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0432\u0435\u0440\u0448\u0438\u043D \u0447\u0438\u0441\u043B\u043E \u0443\u043B\u0443\u0447\u0448\u0435\u043D\u0438\u0439 \u043D\u0435 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u043E: \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B \u0431\u0443\u0434\u0435\u0442 \u0443\u043C\u0435\u043D\u044C\u0448\u0430\u0442\u044C \u0440\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0441\u043D\u043E\u0432\u0430 \u0438 \u0441\u043D\u043E\u0432\u0430.",
      metrics: [
        { label: "\u041F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u044B\u0439 \u043E\u0442\u0432\u0435\u0442", value: "\u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E" },
        { label: "\u041F\u0440\u0438\u0447\u0438\u043D\u0430", value: "\u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u0439 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0438\u043A\u043B" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 8 \u0438\u0437 PDF",
          values: {
            edges: "A B 1\nB C 1\nC D 1\nD A -4",
            start: "A",
            target: ""
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 6,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: A"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041D\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F."
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: null
        };
      },
      run(parsed) {
        const result = runBellmanFord(parsed);
        if (result.hasNegativeCycle) {
          result.answer = "\u0411\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u043E";
          result.conclusion = "\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0434\u043E \u0432\u0435\u0440\u0448\u0438\u043D, \u0437\u0430\u0442\u0440\u043E\u043D\u0443\u0442\u044B\u0445 \u0434\u043E\u0441\u0442\u0438\u0436\u0438\u043C\u044B\u043C \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C \u0446\u0438\u043A\u043B\u043E\u043C, \u043C\u043E\u0436\u043D\u043E \u0443\u043B\u0443\u0447\u0448\u0430\u0442\u044C \u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0443\u0433\u043E\u0434\u043D\u043E \u0440\u0430\u0437.";
        }
        return result;
      }
    },
    {
      id: "bellman-two-negative",
      topic: "bellman-ford",
      title: "\u0414\u0432\u0430 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0440\u0435\u0431\u0440\u0430",
      shortDescription: "\u0415\u0449\u0451 \u043E\u0434\u0438\u043D \u043F\u0440\u0438\u043C\u0435\u0440 \u043D\u0430 \u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0440\u0430\u0441\u0447\u0451\u0442 \u043F\u0443\u0442\u0435\u0439 \u043F\u0440\u0438 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0440\u0451\u0431\u0440\u0430\u0445.",
      complexity: "O(V \xB7 E)",
      algorithmFamily: "\u0411\u0435\u043B\u043B\u043C\u0430\u043D\u2013\u0424\u043E\u0440\u0434",
      pseudoCode: PSEUDOCODE.bellmanFord,
      description: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442, \u0447\u0442\u043E \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u0438 \u0441 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u043C\u0438 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u043C\u0438 \u0440\u0451\u0431\u0440\u0430\u043C\u0438, \u043F\u043E\u043A\u0430 \u043E\u0442\u0440\u0438\u0446\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0446\u0438\u043A\u043B\u0430 \u043D\u0435\u0442.",
      metrics: [
        { label: "\u0421\u0442\u0430\u0440\u0442", value: "S" },
        { label: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442", value: "\u0432\u0441\u0435 \u043A\u0440\u0430\u0442\u0447\u0430\u0439\u0448\u0438\u0435 \u043F\u0443\u0442\u0438" }
      ],
      presetCases: [
        {
          label: "\u0417\u0430\u0434\u0430\u0447\u0430 9 \u0438\u0437 PDF",
          values: {
            edges: "S A 3\nS B 4\nA B -2\nB C 1\nA C 5",
            start: "S",
            target: ""
          }
        }
      ],
      inputSchema: [
        {
          key: "edges",
          label: "\u0421\u043F\u0438\u0441\u043E\u043A \u0440\u0451\u0431\u0435\u0440",
          type: "textarea",
          rows: 6,
          hint: "\u0424\u043E\u0440\u043C\u0430\u0442: \u043E\u0442 \u043A\u0443\u0434\u0430 \u0432\u0435\u0441."
        },
        {
          key: "start",
          label: "\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          hint: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: S"
        },
        {
          key: "target",
          label: "\u0426\u0435\u043B\u0435\u0432\u0430\u044F \u0432\u0435\u0440\u0448\u0438\u043D\u0430",
          type: "text",
          optional: true,
          hint: "\u041C\u043E\u0436\u043D\u043E \u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C."
        }
      ],
      parser(values) {
        return {
          edges: parseEdgeList(values.edges),
          start: String(values.start).trim(),
          target: null
        };
      },
      run: runBellmanFord
    }
  ];
  var TASKS_BY_ID = new Map(TASKS.map((task) => [task.id, task]));
  var TASKS_BY_TOPIC = new Map(
    TOPICS.map((topic) => [
      topic.id,
      TASKS.filter((task) => task.topic === topic.id)
    ])
  );

  // js/app.js
  var state = {
    topicId: TOPICS[0].id,
    taskId: TASKS_BY_TOPIC.get(TOPICS[0].id)[0].id,
    currentPresetIndex: 0,
    steps: [],
    currentStepIndex: 0,
    runResult: null,
    error: "",
    autoTimer: null,
    inputTimer: null
  };
  var refs = {
    topicTabs: document.getElementById("topicTabs"),
    taskTabs: document.getElementById("taskTabs"),
    currentTopicTitle: document.getElementById("currentTopicTitle"),
    currentTaskDescription: document.getElementById("currentTaskDescription"),
    taskComplexity: document.getElementById("taskComplexity"),
    taskAlgorithmFamily: document.getElementById("taskAlgorithmFamily"),
    taskAnswerPreview: document.getElementById("taskAnswerPreview"),
    inputForm: document.getElementById("inputForm"),
    prevStepButton: document.getElementById("prevStepButton"),
    nextStepButton: document.getElementById("nextStepButton"),
    inlinePrevStepButton: document.getElementById("inlinePrevStepButton"),
    inlineNextStepButton: document.getElementById("inlineNextStepButton"),
    autoButton: document.getElementById("autoButton"),
    resetButton: document.getElementById("resetButton"),
    taskMetrics: document.getElementById("taskMetrics"),
    taskConclusion: document.getElementById("taskConclusion"),
    visualizationTitle: document.getElementById("visualizationTitle"),
    visualizationLegend: document.getElementById("visualizationLegend"),
    visualizationStage: document.getElementById("visualizationStage"),
    visualizationPanels: document.getElementById("visualizationPanels"),
    currentStepTitle: document.getElementById("currentStepTitle"),
    stepCounter: document.getElementById("stepCounter"),
    stepAction: document.getElementById("stepAction"),
    stepWhy: document.getElementById("stepWhy"),
    stepPreview: document.getElementById("stepPreview")
  };
  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function simplifyText(value) {
    let text = String(value != null ? value : "").trim();
    if (!text) {
      return "";
    }
    const replacements = [
      [/BFS по матрице/gi, "\u043F\u043E\u0438\u0441\u043A \u043F\u043E \u043A\u043B\u0435\u0442\u043A\u0430\u043C"],
      [/BFS по состояниям/gi, "\u043F\u043E\u0438\u0441\u043A \u043F\u043E \u0448\u0430\u0433\u0430\u043C"],
      [/Многовершинный BFS/gi, "\u043F\u043E\u0438\u0441\u043A \u0441\u0440\u0430\u0437\u0443 \u043E\u0442 \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u0438\u0445 \u0442\u043E\u0447\u0435\u043A"],
      [/\bBFS\b/gi, "\u043F\u043E\u0438\u0441\u043A\u0435 \u043F\u043E \u0448\u0430\u0433\u0430\u043C"],
      [/\bDFS\b/gi, "\u043F\u043E\u0438\u0441\u043A\u0435 \u0432\u0433\u043B\u0443\u0431\u044C"],
      [/Backtracking/gi, "\u043F\u0435\u0440\u0435\u0431\u043E\u0440\u0435 \u0441 \u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043E\u043C"],
      [
        /Если клетка с землёй ещё не посещена, значит перед нами новая компонента связности, и счётчик островов нужно увеличить\./gi,
        "\u0415\u0441\u043B\u0438 \u044D\u0442\u0443 \u0437\u0435\u043C\u043B\u044E \u043C\u044B \u0435\u0449\u0451 \u043D\u0435 \u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0438, \u0437\u043D\u0430\u0447\u0438\u0442 \u044D\u0442\u043E \u043D\u043E\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432. \u041F\u0440\u0438\u0431\u0430\u0432\u043B\u044F\u0435\u043C 1."
      ],
      [
        /BFS обходит все клетки одной компоненты, чтобы больше не считать их как отдельные острова\./gi,
        "\u0421\u0435\u0439\u0447\u0430\u0441 \u043E\u0431\u0445\u043E\u0434\u0438\u043C \u0432\u0435\u0441\u044C \u044D\u0442\u043E\u0442 \u043E\u0441\u0442\u0440\u043E\u0432, \u0447\u0442\u043E\u0431\u044B \u043D\u0435 \u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0435\u0433\u043E \u0432\u0442\u043E\u0440\u043E\u0439 \u0440\u0430\u0437."
      ],
      [
        /Она соединена с уже найденной землёй по вертикали или горизонтали, значит входит в эту же компоненту\./gi,
        "\u042D\u0442\u0430 \u043A\u043B\u0435\u0442\u043A\u0430 \u0440\u044F\u0434\u043E\u043C \u0441 \u043D\u0430\u0448\u0435\u0439 \u0437\u0435\u043C\u043B\u0451\u0439. \u0417\u043D\u0430\u0447\u0438\u0442 \u044D\u0442\u043E \u0442\u043E\u0442 \u0436\u0435 \u043E\u0441\u0442\u0440\u043E\u0432."
      ],
      [
        /Каждый запуск BFS соответствовал одному новому острову, поэтому финальный счётчик и есть ответ задачи\./gi,
        "\u041A\u0430\u0436\u0434\u044B\u0439 \u043D\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0443\u0441\u043A \u0434\u0430\u043B \u043E\u0434\u0438\u043D \u043D\u043E\u0432\u044B\u0439 \u043E\u0441\u0442\u0440\u043E\u0432. \u042D\u0442\u043E \u0438 \u0435\u0441\u0442\u044C \u043E\u0442\u0432\u0435\u0442."
      ],
      [/компонент[аы] связности/gi, "\u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0443\u0441\u043E\u0447\u0435\u043A"],
      [/счётчик/gi, "\u0441\u0447\u0451\u0442"],
      [/извлекаем/gi, "\u0431\u0435\u0440\u0451\u043C"],
      [/вершина/gi, "\u0442\u043E\u0447\u043A\u0430"],
      [/вершины/gi, "\u0442\u043E\u0447\u043A\u0438"],
      [/предка/gi, "\u043E\u0442\u043A\u0443\u0434\u0430 \u043F\u0440\u0438\u0448\u043B\u0438"],
      [/восстановления маршрута/gi, "\u0447\u0442\u043E\u0431\u044B \u043F\u043E\u0442\u043E\u043C \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u043F\u0443\u0442\u044C"],
      [/достижима/gi, "\u0434\u043E \u043D\u0435\u0451 \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0439\u0442\u0438"],
      [/достижим/gi, "\u0434\u043E \u043D\u0435\u0433\u043E \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0439\u0442\u0438"],
      [/гарантирует обход по слоям/gi, "\u0438\u0434\u0451\u0442 \u0448\u0430\u0433 \u0437\u0430 \u0448\u0430\u0433\u043E\u043C"],
      [/слоями/gi, "\u0448\u0430\u0433 \u0437\u0430 \u0448\u0430\u0433\u043E\u043C"],
      [/минимальное расстояние/gi, "\u0441\u0430\u043C\u0443\u044E \u043A\u043E\u0440\u043E\u0442\u043A\u0443\u044E \u0434\u043B\u0438\u043D\u0443 \u043F\u0443\u0442\u0438"],
      [/минимальное число/gi, "\u0441\u0430\u043C\u043E\u0435 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0447\u0438\u0441\u043B\u043E"],
      [/маршрут/gi, "\u043F\u0443\u0442\u044C"],
      [/финиш/gi, "\u043A\u043E\u043D\u0435\u0446"],
      [/цель/gi, "\u043D\u0443\u0436\u043D\u0443\u044E \u0442\u043E\u0447\u043A\u0443"],
      [/ветка/gi, "\u043F\u0443\u0442\u044C"],
      [/рекурсивно/gi, "\u043F\u043E \u0448\u0430\u0433\u0430\u043C"]
    ];
    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }
    return text.replace(/, потому что/gi, ". \u041F\u043E\u0442\u043E\u043C\u0443 \u0447\u0442\u043E").replace(/, значит/gi, ". \u0417\u043D\u0430\u0447\u0438\u0442").replace(/\s+/g, " ").trim();
  }
  function compactStepText(value, maxLength = 220) {
    var _a, _b;
    const text = simplifyText(value);
    if (!text) {
      return "";
    }
    if (text.length <= maxLength) {
      return text;
    }
    const sentences = (_b = (_a = text.match(/[^.!?]+[.!?]?/g)) == null ? void 0 : _a.map((part) => part.trim()).filter(Boolean)) != null ? _b : [text];
    let result = "";
    for (const sentence of sentences) {
      const candidate = result ? `${result} ${sentence}` : sentence;
      if (candidate.length > maxLength) {
        break;
      }
      result = candidate;
      if (result.length >= Math.min(150, maxLength)) {
        break;
      }
    }
    if (!result) {
      result = text.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
    }
    return result.trim();
  }
  function formatTreeFieldValue(value) {
    var _a;
    const text = String(value != null ? value : "").trim();
    if (!text) {
      return "";
    }
    const tokens = text.replace(/^\[/, "").replace(/\]$/, "").split(",").map((token) => token.trim()).filter(Boolean);
    while (tokens.length) {
      const last = (_a = tokens.at(-1)) == null ? void 0 : _a.toLowerCase();
      if (last === "null" || last === "none" || last === "-") {
        tokens.pop();
        continue;
      }
      break;
    }
    if (!tokens.length) {
      return "[]";
    }
    return `[${tokens.map((token) => {
      const normalized = token.toLowerCase();
      return normalized === "null" || normalized === "none" ? "-" : token;
    }).join(",")}]`;
  }
  function getCurrentTask() {
    return TASKS_BY_ID.get(state.taskId);
  }
  function getCurrentTopic() {
    return TOPICS.find((topic) => topic.id === state.topicId);
  }
  function readFormValues() {
    const formData = new FormData(refs.inputForm);
    return Object.fromEntries(formData.entries());
  }
  function stopAutoPlay() {
    if (state.autoTimer) {
      window.clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
  }
  function clearInputTimer() {
    if (state.inputTimer) {
      window.clearTimeout(state.inputTimer);
      state.inputTimer = null;
    }
  }
  function scheduleAutoRun() {
    clearInputTimer();
    stopAutoPlay();
    state.inputTimer = window.setTimeout(() => {
      state.inputTimer = null;
      executeTask();
    }, 280);
  }
  function renderTopicTabs() {
    refs.topicTabs.innerHTML = "";
    for (const topic of TOPICS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `topic-tab${topic.id === state.topicId ? " is-active" : ""}`;
      button.textContent = topic.title;
      button.addEventListener("click", () => {
        if (state.topicId === topic.id) {
          return;
        }
        stopAutoPlay();
        clearInputTimer();
        state.topicId = topic.id;
        const firstTask = TASKS_BY_TOPIC.get(topic.id)[0];
        state.taskId = firstTask.id;
        state.currentPresetIndex = 0;
        state.error = "";
        renderEverything({ rerun: true });
      });
      refs.topicTabs.appendChild(button);
    }
  }
  function renderTaskTabs() {
    refs.taskTabs.innerHTML = "";
    const topicTasks = TASKS_BY_TOPIC.get(state.topicId);
    for (const task of topicTasks) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `task-tab${task.id === state.taskId ? " is-active" : ""}`;
      button.innerHTML = `
      <span class="task-tab-title">${escapeHtml(task.title)}</span>
      <span class="task-tab-subtitle">${escapeHtml(simplifyText(task.shortDescription))}</span>
    `;
      button.addEventListener("click", () => {
        if (state.taskId === task.id) {
          return;
        }
        stopAutoPlay();
        clearInputTimer();
        state.taskId = task.id;
        state.currentPresetIndex = 0;
        state.error = "";
        renderEverything({ rerun: true });
      });
      refs.taskTabs.appendChild(button);
    }
  }
  function renderInputForm(task) {
    refs.inputForm.innerHTML = "";
    task.inputSchema.forEach((field) => {
      var _a, _b;
      const wrapper = document.createElement("div");
      wrapper.className = `input-group${field.type === "textarea" ? " is-wide" : " is-compact"}`;
      const label = document.createElement("label");
      label.className = "field";
      const title = document.createElement("span");
      title.className = "field-label";
      title.textContent = field.label;
      label.appendChild(title);
      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.className = "textarea";
        input.rows = (_a = field.rows) != null ? _a : 5;
      } else {
        input = document.createElement("input");
        input.className = "input";
        input.type = "text";
      }
      input.name = field.key;
      input.placeholder = (_b = field.placeholder) != null ? _b : "";
      input.dataset.optional = field.optional ? "true" : "false";
      input.addEventListener("input", () => {
        scheduleAutoRun();
      });
      input.addEventListener("change", () => {
        scheduleAutoRun();
      });
      label.appendChild(input);
      if (field.hint) {
        const hint = document.createElement("p");
        hint.className = "input-hint";
        hint.textContent = field.hint;
        label.appendChild(hint);
      }
      wrapper.append(label);
      refs.inputForm.appendChild(wrapper);
    });
  }
  function setFieldValues(values) {
    Object.entries(values).forEach(([key, value]) => {
      const field = refs.inputForm.elements.namedItem(key);
      if (field) {
        field.value = key === "tree" ? formatTreeFieldValue(value) : value;
      }
    });
  }
  function loadPreset(shouldRun = true) {
    const task = getCurrentTask();
    const preset = task.presetCases[0];
    if (!preset) {
      return;
    }
    setFieldValues(preset.values);
    if (shouldRun) {
      executeTask();
    }
  }
  function renderHeader(task, topic) {
    var _a, _b;
    refs.currentTopicTitle.textContent = `${topic.title} \xB7 ${task.title}`;
    refs.currentTaskDescription.textContent = simplifyText(task.description);
    refs.taskComplexity.textContent = task.complexity;
    refs.taskAlgorithmFamily.textContent = simplifyText(task.algorithmFamily);
    refs.taskAnswerPreview.textContent = (_b = (_a = state.runResult) == null ? void 0 : _a.answer) != null ? _b : "\u2014";
  }
  function renderMetrics(task) {
    if (!refs.taskMetrics) {
      return;
    }
    const dynamicMetrics = [
      { label: "\u0428\u0430\u0433\u043E\u0432", value: String(state.steps.length || 0) }
    ];
    refs.taskMetrics.innerHTML = [...task.metrics, ...dynamicMetrics].map(
      (metric) => `
        <article class="metric-card">
          <span class="metric-label">${escapeHtml(metric.label)}</span>
          <span class="metric-value">${escapeHtml(metric.value)}</span>
        </article>
      `
    ).join("");
  }
  function renderConclusion(task) {
    var _a, _b;
    if (!refs.taskConclusion) {
      return;
    }
    if (state.error) {
      refs.taskConclusion.className = "error-banner";
      refs.taskConclusion.textContent = simplifyText(state.error);
      return;
    }
    refs.taskConclusion.className = "conclusion-card";
    refs.taskConclusion.innerHTML = `
    <strong>${escapeHtml(task.title)}</strong><br />
    ${escapeHtml(simplifyText((_b = (_a = state.runResult) == null ? void 0 : _a.conclusion) != null ? _b : task.description))}
  `;
  }
  function renderLegend(legend = []) {
    refs.visualizationLegend.innerHTML = legend.map(
      (item) => `
        <span class="legend-chip">
          <span class="legend-swatch" style="background:${escapeHtml(item.color)}"></span>
          ${escapeHtml(item.label)}
        </span>
      `
    ).join("");
  }
  function renderPanels(panels = []) {
    refs.visualizationPanels.innerHTML = panels.map(
      (item) => `
        <article class="state-card">
          <span class="metric-label">${escapeHtml(item.label)}</span>
          <span class="metric-value">${escapeHtml(item.value)}</span>
        </article>
      `
    ).join("");
  }
  function renderMatrix(snapshot, container) {
    const root = document.createElement("div");
    root.className = "matrix-grid";
    root.style.gridTemplateRows = `repeat(${snapshot.cells.length}, auto)`;
    snapshot.cells.forEach((row) => {
      const rowElement = document.createElement("div");
      rowElement.className = "matrix-row";
      rowElement.style.gridTemplateColumns = `repeat(${row.length}, minmax(56px, 1fr))`;
      row.forEach((cell) => {
        const cellElement = document.createElement("div");
        cellElement.className = `matrix-cell${cell.state ? ` state-${cell.state}` : ""}`;
        cellElement.innerHTML = `
        <div>
          <div>${escapeHtml(cell.value)}</div>
          ${cell.label ? `<small>${escapeHtml(cell.label)}</small>` : ""}
        </div>
      `;
        rowElement.appendChild(cellElement);
      });
      root.appendChild(rowElement);
    });
    container.appendChild(root);
  }
  function renderTrace(snapshot, container) {
    const root = document.createElement("div");
    root.className = "token-groups";
    snapshot.groups.forEach((group) => {
      const section = document.createElement("section");
      section.className = "token-group";
      section.innerHTML = `<h4>${escapeHtml(group.label)}</h4>`;
      const list = document.createElement("div");
      list.className = "token-list";
      if (!group.items.length) {
        const empty = document.createElement("span");
        empty.className = "empty-note";
        empty.textContent = "\u041F\u0443\u0441\u0442\u043E";
        list.appendChild(empty);
      } else {
        group.items.forEach((item) => {
          const token = document.createElement("span");
          token.className = `token${item.state ? ` state-${item.state}` : ""}`;
          token.textContent = item.label === item.value ? item.value : `${item.label}: ${item.value}`;
          list.appendChild(token);
        });
      }
      section.appendChild(list);
      root.appendChild(section);
    });
    container.appendChild(root);
  }
  function renderGraph(snapshot, container) {
    const stage = document.createElement("div");
    stage.className = "graph-stage";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "graph-svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const bounds = snapshot.nodes.reduce(
      (accumulator, node) => ({
        minX: Math.min(accumulator.minX, node.x),
        maxX: Math.max(accumulator.maxX, node.x),
        minY: Math.min(accumulator.minY, node.y),
        maxY: Math.max(accumulator.maxY, node.y)
      }),
      {
        minX: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY
      }
    );
    const paddingX = 96;
    const paddingTop = 92;
    const paddingBottom = 126;
    const hasNodes = snapshot.nodes.length > 0;
    const viewBoxX = hasNodes ? bounds.minX - paddingX : 0;
    const viewBoxY = hasNodes ? bounds.minY - paddingTop : 0;
    const viewBoxWidth = hasNodes ? Math.max(420, bounds.maxX - bounds.minX + paddingX * 2) : 680;
    const viewBoxHeight = hasNodes ? Math.max(300, bounds.maxY - bounds.minY + paddingTop + paddingBottom) : 380;
    svg.setAttribute(
      "viewBox",
      `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`
    );
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="8" refY="4.5" orient="auto">
      <polygon points="0 0, 9 4.5, 0 9" fill="#7485a0"></polygon>
    </marker>
  `;
    svg.appendChild(defs);
    const nodeMap = new Map(snapshot.nodes.map((node) => [node.id, node]));
    const edgeGeometries = snapshot.edges.map((edge) => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) {
        return null;
      }
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      const offset = 34;
      const x1 = from.x + dx / length * offset;
      const y1 = from.y + dy / length * offset;
      const x2 = to.x - dx / length * offset;
      const y2 = to.y - dy / length * offset;
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      return {
        edge,
        from,
        to,
        dx,
        dy,
        length,
        x1,
        y1,
        x2,
        y2,
        midX,
        midY,
        nx: -dy / length,
        ny: dx / length,
        tx: dx / length,
        ty: dy / length,
        labelGroupKey: `${Math.round(midX / 56)}:${Math.round(midY / 56)}`
      };
    }).filter(Boolean);
    const labelGroups = /* @__PURE__ */ new Map();
    edgeGeometries.forEach((geometry) => {
      var _a;
      const group = (_a = labelGroups.get(geometry.labelGroupKey)) != null ? _a : [];
      group.push(geometry);
      labelGroups.set(geometry.labelGroupKey, group);
    });
    labelGroups.forEach((group) => {
      group.sort(
        (left, right) => `${left.edge.from}-${left.edge.to}-${left.edge.weight}`.localeCompare(
          `${right.edge.from}-${right.edge.to}-${right.edge.weight}`
        )
      ).forEach((geometry, index) => {
        const lane = index - (group.length - 1) / 2;
        const normalShift = 18 + Math.abs(lane) * 18;
        const tangentShift = lane * 10;
        geometry.labelX = geometry.midX + geometry.nx * normalShift + geometry.tx * tangentShift;
        geometry.labelY = geometry.midY + geometry.ny * normalShift + geometry.ty * tangentShift;
      });
    });
    edgeGeometries.forEach((geometry) => {
      const { edge, x1, y1, x2, y2 } = geometry;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(x1));
      line.setAttribute("y1", String(y1));
      line.setAttribute("x2", String(x2));
      line.setAttribute("y2", String(y2));
      line.setAttribute("class", `graph-edge${edge.state === "active" ? " is-active" : ""}`);
      line.setAttribute("marker-end", "url(#arrowhead)");
      svg.appendChild(line);
      const weightGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      weightGroup.setAttribute(
        "class",
        `graph-weight-group${edge.state === "active" ? " is-active" : ""}`
      );
      const weightText = String(edge.weight);
      const labelWidth = Math.max(26, weightText.length * 10 + 16);
      const weightBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      weightBg.setAttribute("x", String(geometry.labelX - labelWidth / 2));
      weightBg.setAttribute("y", String(geometry.labelY - 12));
      weightBg.setAttribute("width", String(labelWidth));
      weightBg.setAttribute("height", "24");
      weightBg.setAttribute("rx", "10");
      weightBg.setAttribute("class", "graph-weight-bg");
      const weight = document.createElementNS("http://www.w3.org/2000/svg", "text");
      weight.setAttribute("x", String(geometry.labelX));
      weight.setAttribute("y", String(geometry.labelY));
      weight.setAttribute("class", "graph-weight");
      weight.setAttribute("dominant-baseline", "middle");
      weight.setAttribute("text-anchor", "middle");
      weight.textContent = weightText;
      weightGroup.append(weightBg, weight);
      svg.appendChild(weightGroup);
    });
    snapshot.nodes.forEach((node) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", `graph-node${node.state ? ` state-${node.state}` : ""}`);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(node.x));
      circle.setAttribute("cy", String(node.y));
      circle.setAttribute("r", "34");
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(node.x));
      label.setAttribute("y", String(node.y - 2));
      label.setAttribute("class", "graph-node-label");
      label.textContent = node.label;
      const meta = document.createElementNS("http://www.w3.org/2000/svg", "text");
      meta.setAttribute("x", String(node.x));
      meta.setAttribute("y", String(node.y + 54));
      meta.setAttribute("class", "graph-node-meta");
      meta.textContent = node.meta;
      group.append(circle, label, meta);
      svg.appendChild(group);
    });
    stage.appendChild(svg);
    container.appendChild(stage);
  }
  function computeTreeLayout(tree) {
    const nodes = [];
    const links = [];
    let cursor = 0;
    function walk(node, depth, parent = null) {
      if (!node) {
        return null;
      }
      walk(node.left, depth + 1, node);
      const positioned = {
        ...node,
        x: 96 + cursor * 132,
        y: 76 + depth * 108
      };
      cursor += 1;
      nodes.push(positioned);
      if (parent) {
        links.push([parent.id, node.id]);
      }
      walk(node.right, depth + 1, node);
      return positioned;
    }
    walk(tree, 0);
    const map = new Map(nodes.map((node) => [node.id, node]));
    return {
      width: Math.max(360, cursor * 132 + 96),
      height: Math.max(260, Math.max(...nodes.map((node) => node.y)) + 96),
      nodes,
      links: links.map(([from, to]) => [map.get(from), map.get(to)])
    };
  }
  function renderTree(snapshot, container) {
    if (!snapshot.tree) {
      const note = document.createElement("p");
      note.className = "empty-note";
      note.textContent = "\u0414\u0435\u0440\u0435\u0432\u043E \u043F\u0443\u0441\u0442\u043E\u0435.";
      container.appendChild(note);
      return;
    }
    const layout = computeTreeLayout(snapshot.tree);
    const stage = document.createElement("div");
    stage.className = "tree-stage";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${layout.width} ${layout.height}`);
    svg.setAttribute("class", "tree-svg");
    layout.links.forEach(([from, to]) => {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(from.x));
      line.setAttribute("y1", String(from.y));
      line.setAttribute("x2", String(to.x));
      line.setAttribute("y2", String(to.y));
      line.setAttribute("class", "tree-link");
      svg.appendChild(line);
    });
    layout.nodes.forEach((node) => {
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", `tree-node${node.state ? ` state-${node.state}` : ""}`);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(node.x));
      circle.setAttribute("cy", String(node.y));
      circle.setAttribute("r", "26");
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", String(node.x));
      label.setAttribute("y", String(node.y));
      label.setAttribute("class", "tree-label");
      label.textContent = String(node.value);
      group.append(circle, label);
      svg.appendChild(group);
    });
    stage.appendChild(svg);
    container.appendChild(stage);
  }
  function renderSnapshotContent(snapshot, container) {
    if (!snapshot) {
      container.innerHTML = `<p class="empty-note">\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u0432\u0438\u0437\u0443\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438.</p>`;
      return;
    }
    switch (snapshot.kind) {
      case "matrix":
        renderMatrix(snapshot, container);
        break;
      case "trace":
        renderTrace(snapshot, container);
        break;
      case "graph":
        renderGraph(snapshot, container);
        break;
      case "tree":
        renderTree(snapshot, container);
        break;
      case "backtracking": {
        const root = document.createElement("div");
        root.className = "backtracking-stage";
        const currentStrip = document.createElement("section");
        currentStrip.className = "backtracking-strip";
        currentStrip.innerHTML = `<h4>\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0432\u0435\u0442\u043A\u0430</h4>`;
        const currentList = document.createElement("div");
        currentList.className = "backtracking-sequence";
        if (!snapshot.current.length) {
          currentList.innerHTML = `<span class="empty-note">\u041F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E</span>`;
        } else {
          snapshot.current.forEach((item) => {
            const token = document.createElement("span");
            token.className = "token state-current";
            token.textContent = item;
            currentList.appendChild(token);
          });
        }
        currentStrip.appendChild(currentList);
        root.appendChild(currentStrip);
        if (snapshot.choices.length) {
          const choiceStrip = document.createElement("section");
          choiceStrip.className = "backtracking-strip";
          choiceStrip.innerHTML = `<h4>\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0435 \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B</h4>`;
          const choiceList = document.createElement("div");
          choiceList.className = "backtracking-sequence";
          snapshot.choices.forEach((choice) => {
            const token = document.createElement("span");
            token.className = `token${choice.state ? ` state-${choice.state}` : ""}`;
            token.textContent = choice.label;
            choiceList.appendChild(token);
          });
          choiceStrip.appendChild(choiceList);
          root.appendChild(choiceStrip);
        }
        if (snapshot.board) {
          const boardStrip = document.createElement("section");
          boardStrip.className = "backtracking-strip";
          boardStrip.innerHTML = `<h4>\u0421\u0446\u0435\u043D\u0430 \u0437\u0430\u0434\u0430\u0447\u0438</h4>`;
          renderSnapshotContent(snapshot.board, boardStrip);
          root.appendChild(boardStrip);
        }
        const resultStrip = document.createElement("section");
        resultStrip.className = "backtracking-strip";
        resultStrip.innerHTML = `<h4>\u041D\u0430\u0439\u0434\u0435\u043D\u043D\u044B\u0435 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B</h4>`;
        const resultList = document.createElement("div");
        resultList.className = "backtracking-sequence";
        if (!snapshot.results.length) {
          resultList.innerHTML = `<span class="empty-note">\u041F\u043E\u043A\u0430 \u043D\u0438 \u043E\u0434\u043D\u043E\u0433\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u0430</span>`;
        } else {
          snapshot.results.slice(-10).forEach((result) => {
            const token = document.createElement("span");
            token.className = "token state-path";
            token.textContent = result;
            resultList.appendChild(token);
          });
        }
        resultStrip.appendChild(resultList);
        root.appendChild(resultStrip);
        container.appendChild(root);
        break;
      }
      default:
        container.innerHTML = `<p class="empty-note">\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0432\u0438\u0437\u0443\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u0438.</p>`;
    }
  }
  function renderVisualization() {
    var _a, _b, _c;
    refs.visualizationStage.innerHTML = "";
    const currentStep = state.steps[state.currentStepIndex];
    const snapshot = currentStep == null ? void 0 : currentStep.stateSnapshot;
    refs.visualizationTitle.textContent = (_a = snapshot == null ? void 0 : snapshot.title) != null ? _a : "\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C\u0430";
    renderLegend((_b = snapshot == null ? void 0 : snapshot.legend) != null ? _b : []);
    renderSnapshotContent(snapshot, refs.visualizationStage);
    renderPanels((_c = snapshot == null ? void 0 : snapshot.panels) != null ? _c : []);
  }
  function renderStepInfo() {
    var _a;
    const total = state.steps.length;
    const current = state.steps[state.currentStepIndex];
    refs.currentStepTitle.textContent = total ? `\u0428\u0430\u0433 ${current.stepNumber}` : "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0448\u0430\u0433";
    refs.stepCounter.textContent = `\u0428\u0430\u0433 ${total ? current.stepNumber : 0} / ${total}`;
    refs.stepAction.textContent = (_a = current == null ? void 0 : current.action) != null ? _a : "\u0421\u043A\u043E\u0440\u043E \u0437\u0434\u0435\u0441\u044C \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0440\u0430\u0437\u0431\u043E\u0440";
    refs.stepWhy.textContent = compactStepText(current == null ? void 0 : current.why, 210) || "\u041F\u043E\u043C\u0435\u043D\u044F\u0439 \u0434\u0430\u043D\u043D\u044B\u0435 \u0438\u043B\u0438 \u043E\u0442\u043A\u0440\u043E\u0439 \u0434\u0440\u0443\u0433\u0443\u044E \u0437\u0430\u0434\u0430\u0447\u0443, \u0438 \u0442\u0443\u0442 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u043F\u0440\u043E\u0441\u0442\u043E\u0435 \u043E\u0431\u044A\u044F\u0441\u043D\u0435\u043D\u0438\u0435.";
    refs.stepPreview.textContent = compactStepText(current == null ? void 0 : current.resultPreview, 110) || "\u0417\u0434\u0435\u0441\u044C \u0431\u0443\u0434\u0435\u0442 \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0438\u0442\u043E\u0433 \u044D\u0442\u043E\u0433\u043E \u0448\u0430\u0433\u0430.";
  }
  function renderStepArea() {
    renderStepInfo();
    renderVisualization();
    updateControls();
  }
  function updateControls() {
    const total = state.steps.length;
    const isFirstStep = total === 0 || state.currentStepIndex === 0;
    const isLastStep = total === 0 || state.currentStepIndex >= total - 1;
    if (refs.prevStepButton) {
      refs.prevStepButton.disabled = isFirstStep;
    }
    if (refs.nextStepButton) {
      refs.nextStepButton.disabled = isLastStep;
    }
    refs.inlinePrevStepButton.disabled = isFirstStep;
    refs.inlineNextStepButton.disabled = isLastStep;
    if (refs.autoButton) {
      refs.autoButton.disabled = total === 0;
      refs.autoButton.textContent = state.autoTimer ? "\u0421\u0442\u043E\u043F" : "\u0410\u0432\u0442\u043E";
    }
    if (refs.resetButton) {
      refs.resetButton.disabled = total === 0;
    }
  }
  function stepBackward() {
    stopAutoPlay();
    state.currentStepIndex = Math.max(0, state.currentStepIndex - 1);
    renderStepArea();
  }
  function stepForward() {
    stopAutoPlay();
    state.currentStepIndex = Math.min(
      state.steps.length - 1,
      state.currentStepIndex + 1
    );
    renderStepArea();
  }
  function executeTask() {
    stopAutoPlay();
    clearInputTimer();
    const task = getCurrentTask();
    try {
      const parsed = task.parser(readFormValues());
      state.runResult = task.run(parsed);
      state.steps = state.runResult.steps;
      state.currentStepIndex = 0;
      state.error = "";
    } catch (error) {
      state.runResult = null;
      state.steps = [];
      state.currentStepIndex = 0;
      state.error = error.message || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435.";
    }
    renderHeader(task, getCurrentTopic());
    renderMetrics(task);
    renderConclusion(task);
    renderStepArea();
  }
  function startAutoPlay() {
    if (!state.steps.length) {
      return;
    }
    if (state.autoTimer) {
      stopAutoPlay();
      updateControls();
      return;
    }
    state.autoTimer = window.setInterval(() => {
      if (state.currentStepIndex >= state.steps.length - 1) {
        stopAutoPlay();
        updateControls();
        return;
      }
      state.currentStepIndex += 1;
      renderStepArea();
    }, 1200);
    updateControls();
  }
  function renderEverything({ rerun = false } = {}) {
    const task = getCurrentTask();
    renderTopicTabs();
    renderTaskTabs();
    renderHeader(task, getCurrentTopic());
    renderInputForm(task);
    renderMetrics(task);
    renderConclusion(task);
    updateControls();
    if (rerun) {
      loadPreset(true);
    } else {
      loadPreset(false);
    }
  }
  if (refs.prevStepButton) {
    refs.prevStepButton.addEventListener("click", () => {
      stepBackward();
    });
  }
  if (refs.nextStepButton) {
    refs.nextStepButton.addEventListener("click", () => {
      stepForward();
    });
  }
  refs.inlinePrevStepButton.addEventListener("click", () => {
    stepBackward();
  });
  refs.inlineNextStepButton.addEventListener("click", () => {
    stepForward();
  });
  if (refs.autoButton) {
    refs.autoButton.addEventListener("click", () => {
      startAutoPlay();
    });
  }
  if (refs.resetButton) {
    refs.resetButton.addEventListener("click", () => {
      stopAutoPlay();
      state.currentStepIndex = 0;
      renderStepArea();
    });
  }
  renderEverything({ rerun: true });
})();
