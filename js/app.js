import { TASKS_BY_ID, TASKS_BY_TOPIC, TASKS, TOPICS } from "./tasks.js";

const state = {
  topicId: TOPICS[0].id,
  taskId: TASKS_BY_TOPIC.get(TOPICS[0].id)[0].id,
  currentPresetIndex: 0,
  steps: [],
  currentStepIndex: 0,
  runResult: null,
  error: "",
  autoTimer: null,
  inputTimer: null,
};

const refs = {
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
  stepPreview: document.getElementById("stepPreview"),
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function simplifyText(value) {
  let text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  const replacements = [
    [/BFS по матрице/gi, "поиск по клеткам"],
    [/BFS по состояниям/gi, "поиск по шагам"],
    [/Многовершинный BFS/gi, "поиск сразу от нескольких точек"],
    [/\bBFS\b/gi, "поиске по шагам"],
    [/\bDFS\b/gi, "поиске вглубь"],
    [/Backtracking/gi, "переборе с возвратом"],
    [
      /Если клетка с землёй ещё не посещена, значит перед нами новая компонента связности, и счётчик островов нужно увеличить\./gi,
      "Если эту землю мы ещё не смотрели, значит это новый остров. Прибавляем 1.",
    ],
    [
      /BFS обходит все клетки одной компоненты, чтобы больше не считать их как отдельные острова\./gi,
      "Сейчас обходим весь этот остров, чтобы не считать его второй раз.",
    ],
    [
      /Она соединена с уже найденной землёй по вертикали или горизонтали, значит входит в эту же компоненту\./gi,
      "Эта клетка рядом с нашей землёй. Значит это тот же остров.",
    ],
    [
      /Каждый запуск BFS соответствовал одному новому острову, поэтому финальный счётчик и есть ответ задачи\./gi,
      "Каждый новый запуск дал один новый остров. Это и есть ответ.",
    ],
    [/компонент[аы] связности/gi, "отдельный кусочек"],
    [/счётчик/gi, "счёт"],
    [/извлекаем/gi, "берём"],
    [/вершина/gi, "точка"],
    [/вершины/gi, "точки"],
    [/предка/gi, "откуда пришли"],
    [/восстановления маршрута/gi, "чтобы потом собрать путь"],
    [/достижима/gi, "до неё можно дойти"],
    [/достижим/gi, "до него можно дойти"],
    [/гарантирует обход по слоям/gi, "идёт шаг за шагом"],
    [/слоями/gi, "шаг за шагом"],
    [/минимальное расстояние/gi, "самую короткую длину пути"],
    [/минимальное число/gi, "самое маленькое число"],
    [/маршрут/gi, "путь"],
    [/финиш/gi, "конец"],
    [/цель/gi, "нужную точку"],
    [/ветка/gi, "путь"],
    [/рекурсивно/gi, "по шагам"],
  ];

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  return text
    .replace(/, потому что/gi, ". Потому что")
    .replace(/, значит/gi, ". Значит")
    .replace(/\s+/g, " ")
    .trim();
}

function compactStepText(value, maxLength = 220) {
  const text = simplifyText(value);
  if (!text) {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  const sentences =
    text
      .match(/[^.!?]+[.!?]?/g)
      ?.map((part) => part.trim())
      .filter(Boolean) ?? [text];

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
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  const tokens = text
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  while (tokens.length) {
    const last = tokens.at(-1)?.toLowerCase();
    if (last === "null" || last === "none" || last === "-") {
      tokens.pop();
      continue;
    }
    break;
  }

  if (!tokens.length) {
    return "[]";
  }

  return `[${tokens
    .map((token) => {
      const normalized = token.toLowerCase();
      return normalized === "null" || normalized === "none" ? "-" : token;
    })
    .join(",")}]`;
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
      input.rows = field.rows ?? 5;
    } else {
      input = document.createElement("input");
      input.className = "input";
      input.type = "text";
    }

    input.name = field.key;
    input.placeholder = field.placeholder ?? "";
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
  refs.currentTopicTitle.textContent = `${topic.title} · ${task.title}`;
  refs.currentTaskDescription.textContent = simplifyText(task.description);
  refs.taskComplexity.textContent = task.complexity;
  refs.taskAlgorithmFamily.textContent = simplifyText(task.algorithmFamily);
  refs.taskAnswerPreview.textContent = state.runResult?.answer ?? "—";
}

function renderMetrics(task) {
  if (!refs.taskMetrics) {
    return;
  }
  const dynamicMetrics = [
    { label: "Шагов", value: String(state.steps.length || 0) },
  ];

  refs.taskMetrics.innerHTML = [...task.metrics, ...dynamicMetrics]
    .map(
      (metric) => `
        <article class="metric-card">
          <span class="metric-label">${escapeHtml(metric.label)}</span>
          <span class="metric-value">${escapeHtml(metric.value)}</span>
        </article>
      `
    )
    .join("");
}

function renderConclusion(task) {
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
    ${escapeHtml(simplifyText(state.runResult?.conclusion ?? task.description))}
  `;
}

function renderLegend(legend = []) {
  refs.visualizationLegend.innerHTML = legend
    .map(
      (item) => `
        <span class="legend-chip">
          <span class="legend-swatch" style="background:${escapeHtml(item.color)}"></span>
          ${escapeHtml(item.label)}
        </span>
      `
    )
    .join("");
}

function renderPanels(panels = []) {
  refs.visualizationPanels.innerHTML = panels
    .map(
      (item) => `
        <article class="state-card">
          <span class="metric-label">${escapeHtml(item.label)}</span>
          <span class="metric-value">${escapeHtml(item.value)}</span>
        </article>
      `
    )
    .join("");
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
      empty.textContent = "Пусто";
      list.appendChild(empty);
    } else {
      group.items.forEach((item) => {
        const token = document.createElement("span");
        token.className = `token${item.state ? ` state-${item.state}` : ""}`;
        token.textContent =
          item.label === item.value ? item.value : `${item.label}: ${item.value}`;
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
      maxY: Math.max(accumulator.maxY, node.y),
    }),
    {
      minX: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    }
  );

  const paddingX = 96;
  const paddingTop = 92;
  const paddingBottom = 126;
  const hasNodes = snapshot.nodes.length > 0;
  const viewBoxX = hasNodes ? bounds.minX - paddingX : 0;
  const viewBoxY = hasNodes ? bounds.minY - paddingTop : 0;
  const viewBoxWidth = hasNodes
    ? Math.max(420, bounds.maxX - bounds.minX + paddingX * 2)
    : 680;
  const viewBoxHeight = hasNodes
    ? Math.max(300, bounds.maxY - bounds.minY + paddingTop + paddingBottom)
    : 380;
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
  const edgeGeometries = snapshot.edges
    .map((edge) => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) {
        return null;
      }

      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.sqrt(dx * dx + dy * dy) || 1;
      const offset = 34;
      const x1 = from.x + (dx / length) * offset;
      const y1 = from.y + (dy / length) * offset;
      const x2 = to.x - (dx / length) * offset;
      const y2 = to.y - (dy / length) * offset;
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
        labelGroupKey: `${Math.round(midX / 56)}:${Math.round(midY / 56)}`,
      };
    })
    .filter(Boolean);

  const labelGroups = new Map();
  edgeGeometries.forEach((geometry) => {
    const group = labelGroups.get(geometry.labelGroupKey) ?? [];
    group.push(geometry);
    labelGroups.set(geometry.labelGroupKey, group);
  });

  labelGroups.forEach((group) => {
    group
      .sort((left, right) =>
        `${left.edge.from}-${left.edge.to}-${left.edge.weight}`.localeCompare(
          `${right.edge.from}-${right.edge.to}-${right.edge.weight}`
        )
      )
      .forEach((geometry, index) => {
        const lane = index - (group.length - 1) / 2;
        const normalShift = 18 + Math.abs(lane) * 18;
        const tangentShift = lane * 10;
        geometry.labelX =
          geometry.midX + geometry.nx * normalShift + geometry.tx * tangentShift;
        geometry.labelY =
          geometry.midY + geometry.ny * normalShift + geometry.ty * tangentShift;
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
      y: 76 + depth * 108,
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
    links: links.map(([from, to]) => [map.get(from), map.get(to)]),
  };
}

function renderTree(snapshot, container) {
  if (!snapshot.tree) {
    const note = document.createElement("p");
    note.className = "empty-note";
    note.textContent = "Дерево пустое.";
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
    container.innerHTML = `<p class="empty-note">Нет данных для визуализации.</p>`;
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
      currentStrip.innerHTML = `<h4>Текущая ветка</h4>`;
      const currentList = document.createElement("div");
      currentList.className = "backtracking-sequence";
      if (!snapshot.current.length) {
        currentList.innerHTML = `<span class="empty-note">Пока пусто</span>`;
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
        choiceStrip.innerHTML = `<h4>Доступные варианты</h4>`;
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
        boardStrip.innerHTML = `<h4>Сцена задачи</h4>`;
        renderSnapshotContent(snapshot.board, boardStrip);
        root.appendChild(boardStrip);
      }

      const resultStrip = document.createElement("section");
      resultStrip.className = "backtracking-strip";
      resultStrip.innerHTML = `<h4>Найденные результаты</h4>`;
      const resultList = document.createElement("div");
      resultList.className = "backtracking-sequence";
      if (!snapshot.results.length) {
        resultList.innerHTML = `<span class="empty-note">Пока ни одного результата</span>`;
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
      container.innerHTML = `<p class="empty-note">Неизвестный тип визуализации.</p>`;
  }
}

function renderVisualization() {
  refs.visualizationStage.innerHTML = "";
  const currentStep = state.steps[state.currentStepIndex];
  const snapshot = currentStep?.stateSnapshot;
  refs.visualizationTitle.textContent =
    snapshot?.title ?? "Состояние алгоритма";
  renderLegend(snapshot?.legend ?? []);
  renderSnapshotContent(snapshot, refs.visualizationStage);
  renderPanels(snapshot?.panels ?? []);
}

function renderStepInfo() {
  const total = state.steps.length;
  const current = state.steps[state.currentStepIndex];

  refs.currentStepTitle.textContent = total
    ? `Шаг ${current.stepNumber}`
    : "Текущий шаг";
  refs.stepCounter.textContent = `Шаг ${total ? current.stepNumber : 0} / ${total}`;
  refs.stepAction.textContent = current?.action ?? "Скоро здесь появится разбор";
  refs.stepWhy.textContent =
    compactStepText(current?.why, 210) ||
    "Поменяй данные или открой другую задачу, и тут появится простое объяснение.";
  refs.stepPreview.textContent =
    compactStepText(current?.resultPreview, 110) ||
    "Здесь будет короткий итог этого шага.";
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
    refs.autoButton.textContent = state.autoTimer ? "Стоп" : "Авто";
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
    state.error = error.message || "Не удалось обработать входные данные.";
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
