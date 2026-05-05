const graphCanvas = document.getElementById("graph-canvas");
const searchForm = document.getElementById("search-form");
const sourceInput = document.getElementById("source-input");
const targetInput = document.getElementById("target-input");
const algorithmSelect = document.getElementById("algorithm-select");
const swapButton = document.getElementById("swap-button");
const resetButton = document.getElementById("reset-button");
const usersList = document.getElementById("users-list");
const tipsList = document.getElementById("tips-list");
const selectionStatus = document.getElementById("selection-status");
const resultTitle = document.getElementById("result-title");
const resultChip = document.getElementById("result-chip");
const resultSummary = document.getElementById("result-summary");
const metricPaths = document.getElementById("metric-paths");
const metricDistance = document.getElementById("metric-distance");
const metricVisited = document.getElementById("metric-visited");
const pathsList = document.getElementById("paths-list");
const stepsList = document.getElementById("steps-list");

const state = {
    graph: null,
    nodes: null,
    edges: null,
    network: null,
    nodeMap: new Map(),
    edgeMap: new Map(),
    selectedIds: [],
    lastResult: null,
    focusedPathIndex: null
};

const EDGE_BASE = {
    color: { color: "rgba(255,255,255,0.18)", highlight: "#ffc857", hover: "#79f0ff", inherit: false },
    width: 1.25,
    opacity: 0.6
};

const EDGE_PATH = {
    color: { color: "#ffc857", highlight: "#ffc857", hover: "#ffc857", inherit: false },
    width: 4,
    opacity: 1
};

const EDGE_PATH_SECONDARY = {
    color: { color: "#79f0ff", highlight: "#79f0ff", hover: "#79f0ff", inherit: false },
    width: 3.25,
    opacity: 0.95
};

boot();

async function boot() {
    try {
        const response = await fetch("/api/graph");
        if (!response.ok) {
            throw new Error("Не удалось загрузить граф.");
        }

        const graph = await response.json();
        state.graph = graph;

        hydrateGraphState(graph);
        fillUserHints(graph.nodes);
        renderTips(graph.tips);
        initNetwork(graph);

        sourceInput.value = graph.defaultSource;
        targetInput.value = graph.defaultTarget;
        syncSelectionFromInputs();
        updateSelectionStatus();

        await runSearch();
    } catch (error) {
        paintFatal(error.message);
    }
}

function hydrateGraphState(graph) {
    state.nodeMap = new Map(graph.nodes.map((node) => [node.id, node]));
    state.edgeMap = new Map(
        graph.edges.map((edge) => [buildEdgeKey(edge.sourceId, edge.targetId), edge])
    );
}

function fillUserHints(nodes) {
    usersList.innerHTML = "";

    for (const node of nodes) {
        const option = document.createElement("option");
        option.value = node.name;
        usersList.append(option);
    }
}

function renderTips(tips) {
    tipsList.innerHTML = "";

    for (const tip of tips) {
        const item = document.createElement("li");
        item.textContent = tip;
        tipsList.append(item);
    }
}

function initNetwork(graph) {
    const visNodes = graph.nodes.map((node) => ({
        id: node.id,
        label: node.name,
        title: `${node.name} · ${node.role}\n${node.description}`,
        shape: "dot",
        size: 24,
        borderWidth: 1.5,
        color: {
            background: node.accent,
            border: "rgba(255,255,255,0.3)",
            highlight: { background: node.accent, border: "#ffffff" },
            hover: { background: node.accent, border: "#ffffff" }
        },
        font: {
            color: "#f5f0e8",
            face: "Space Grotesk",
            size: 18,
            strokeWidth: 0
        }
    }));

    const visEdges = graph.edges.map((edge) => ({
        id: buildEdgeKey(edge.sourceId, edge.targetId),
        from: edge.sourceId,
        to: edge.targetId,
        label: edge.label,
        font: {
            color: "rgba(255,255,255,0.36)",
            size: 12,
            face: "Manrope",
            align: "middle",
            strokeWidth: 0
        },
        smooth: {
            enabled: true,
            type: "dynamic"
        },
        ...EDGE_BASE
    }));

    state.nodes = new vis.DataSet(visNodes);
    state.edges = new vis.DataSet(visEdges);

    state.network = new vis.Network(
        graphCanvas,
        { nodes: state.nodes, edges: state.edges },
        {
            autoResize: true,
            interaction: {
                hover: true,
                tooltipDelay: 120,
                multiselect: false
            },
            physics: {
                enabled: true,
                solver: "forceAtlas2Based",
                forceAtlas2Based: {
                    gravitationalConstant: -48,
                    springLength: 132,
                    springConstant: 0.038
                },
                stabilization: {
                    iterations: 240,
                    fit: true
                }
            }
        }
    );

    state.network.on("click", ({ nodes }) => {
        if (!nodes.length) {
            return;
        }

        selectNode(nodes[0]);
    });
}

function selectNode(nodeId) {
    const existingIndex = state.selectedIds.indexOf(nodeId);

    if (existingIndex !== -1) {
        state.selectedIds.splice(existingIndex, 1);
    } else if (state.selectedIds.length < 2) {
        state.selectedIds.push(nodeId);
    } else {
        // Третий клик не должен превращать выбор в кашу:
        // держим первый узел как старт и заменяем только цель.
        state.selectedIds = [state.selectedIds[1], nodeId];
    }

    syncInputsFromSelection();
    updateSelectionStatus();
    paintSelection();
}

function syncInputsFromSelection() {
    sourceInput.value = state.selectedIds[0] ? state.nodeMap.get(state.selectedIds[0]).name : "";
    targetInput.value = state.selectedIds[1] ? state.nodeMap.get(state.selectedIds[1]).name : "";
}

function syncSelectionFromInputs() {
    state.selectedIds = [];

    const sourceId = resolveNodeId(sourceInput.value);
    const targetId = resolveNodeId(targetInput.value);

    if (sourceId) {
        state.selectedIds.push(sourceId);
    }

    if (targetId && targetId !== sourceId) {
        state.selectedIds.push(targetId);
    }

    paintSelection();
}

function resolveNodeId(rawValue) {
    const normalized = normalizeValue(rawValue);

    for (const node of state.graph.nodes) {
        if (normalizeValue(node.id) === normalized || normalizeValue(node.name) === normalized) {
            return node.id;
        }
    }

    return null;
}

function normalizeValue(value) {
    return value.trim().toLowerCase().replaceAll("ё", "е");
}

async function runSearch() {
    try {
        const payload = {
            source: sourceInput.value.trim(),
            target: targetInput.value.trim(),
            algorithm: algorithmSelect.value
        };

        const response = await fetch("/api/paths", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Поиск не выполнился.");
        }

        state.lastResult = data;
        state.focusedPathIndex = 0;
        syncSelectionFromInputs();
        renderResult(data);
        applyPathHighlight(data.paths[0]?.nodeIds ?? [], data.paths, 0);
    } catch (error) {
        resultTitle.textContent = "Ошибка поиска";
        resultChip.textContent = "Проверь ввод";
        resultSummary.textContent = error.message;
        metricPaths.textContent = "0";
        metricDistance.textContent = "-";
        metricVisited.textContent = "-";
        pathsList.innerHTML = `<article class="path-card muted">${error.message}</article>`;
        stepsList.innerHTML = "<li>Поиск не выполнился, поэтому пошагового лога пока нет.</li>";
        clearPathHighlight();
    }
}

function renderResult(result) {
    resultTitle.textContent = `${result.algorithm}: ${result.source} → ${result.target}`;
    resultChip.textContent = result.algorithm === "BFS" ? "Кратчайший путь" : "Все маршруты";
    resultSummary.textContent = result.summary;
    metricPaths.textContent = String(result.pathCount);
    metricDistance.textContent = result.shortestDistance ?? "-";
    metricVisited.textContent = formatVisitedPreview(result.visitedOrder);

    renderPaths(result.paths);
    renderSteps(result.explanationSteps);
    updateSelectionStatus();
}

function renderPaths(paths) {
    if (!paths.length) {
        pathsList.innerHTML = `<article class="path-card muted">Маршрутов нет — граф не смог связать выбранные вершины.</article>`;
        return;
    }

    pathsList.innerHTML = "";

    paths.forEach((path, index) => {
        const card = document.createElement("article");
        card.className = `path-card${index === state.focusedPathIndex ? " is-active" : ""}`;
        card.dataset.index = String(index);
        card.innerHTML = `
            <div class="path-card-header">
                <h3>${path.title}</h3>
                <span>${path.names.length - 1} связи</span>
            </div>
            <p class="path-chain">${path.names.join(" → ")}</p>
            <p>${path.commentary}</p>
        `;

        card.addEventListener("click", () => {
            state.focusedPathIndex = index;
            applyPathHighlight(path.nodeIds, paths, index);
            renderPaths(paths);
        });

        pathsList.append(card);
    });
}

function renderSteps(steps) {
    stepsList.innerHTML = "";

    for (const step of steps) {
        const item = document.createElement("li");
        item.textContent = step;
        stepsList.append(item);
    }
}

function applyPathHighlight(focusedPath, allPaths, focusedIndex) {
    paintSelection();

    const pathEdgeIds = new Set();
    const secondaryEdgeIds = new Set();

    for (const path of allPaths) {
        const targetSet = path === allPaths[focusedIndex] ? pathEdgeIds : secondaryEdgeIds;

        for (let index = 0; index < path.nodeIds.length - 1; index += 1) {
            targetSet.add(buildEdgeKey(path.nodeIds[index], path.nodeIds[index + 1]));
        }
    }

    const nodeUpdates = [];
    const edgeUpdates = [];

    for (const node of state.graph.nodes) {
        const isFocused = focusedPath.includes(node.id);
        const isSelected = state.selectedIds.includes(node.id);

        nodeUpdates.push({
            id: node.id,
            size: isFocused ? 31 : isSelected ? 29 : 24,
            shadow: isFocused
                ? { enabled: true, color: `${node.accent}66`, size: 24, x: 0, y: 0 }
                : isSelected
                    ? { enabled: true, color: `${node.accent}44`, size: 16, x: 0, y: 0 }
                    : { enabled: false, color: "transparent", size: 0, x: 0, y: 0 }
        });
    }

    for (const edge of state.graph.edges) {
        const edgeId = buildEdgeKey(edge.sourceId, edge.targetId);
        const sharedShape = { id: edgeId };

        if (pathEdgeIds.has(edgeId)) {
            edgeUpdates.push({ ...sharedShape, ...EDGE_PATH });
        } else if (secondaryEdgeIds.has(edgeId)) {
            edgeUpdates.push({ ...sharedShape, ...EDGE_PATH_SECONDARY });
        } else {
            edgeUpdates.push({ ...sharedShape, ...EDGE_BASE });
        }
    }

    state.nodes.update(nodeUpdates);
    state.edges.update(edgeUpdates);

    if (focusedPath.length) {
        state.network.fit({
            nodes: focusedPath,
            animation: {
                duration: 600,
                easingFunction: "easeInOutQuad"
            }
        });
    }
}

function clearPathHighlight() {
    if (!state.graph) {
        return;
    }

    paintSelection();
}

function paintSelection() {
    if (!state.graph || !state.nodes || !state.edges) {
        return;
    }

    const nodeUpdates = state.graph.nodes.map((node) => {
        const isSource = state.selectedIds[0] === node.id;
        const isTarget = state.selectedIds[1] === node.id;
        const isSelected = isSource || isTarget;

        return {
            id: node.id,
            size: isSelected ? 29 : 24,
            color: {
                background: isSource ? "#79f0ff" : isTarget ? "#ff82c9" : node.accent,
                border: isSelected ? "#ffffff" : "rgba(255,255,255,0.3)",
                highlight: {
                    background: isSource ? "#79f0ff" : isTarget ? "#ff82c9" : node.accent,
                    border: "#ffffff"
                },
                hover: {
                    background: isSource ? "#79f0ff" : isTarget ? "#ff82c9" : node.accent,
                    border: "#ffffff"
                }
            },
            shadow: isSelected
                ? { enabled: true, color: isSource ? "#79f0ff66" : "#ff82c966", size: 18, x: 0, y: 0 }
                : { enabled: false, color: "transparent", size: 0, x: 0, y: 0 }
        };
    });

    const edgeUpdates = state.graph.edges.map((edge) => ({
        id: buildEdgeKey(edge.sourceId, edge.targetId),
        ...EDGE_BASE
    }));

    state.nodes.update(nodeUpdates);
    state.edges.update(edgeUpdates);
}

function buildEdgeKey(sourceId, targetId) {
    return [sourceId, targetId].sort().join("__");
}

function updateSelectionStatus() {
    const sourceName = state.selectedIds[0] ? state.nodeMap.get(state.selectedIds[0]).name : "не выбран";
    const targetName = state.selectedIds[1] ? state.nodeMap.get(state.selectedIds[1]).name : "не выбран";
    const algorithmName = algorithmSelect.value.toUpperCase();

    selectionStatus.textContent =
        `Сейчас выбрано: старт — ${sourceName}, цель — ${targetName}. Активный режим: ${algorithmName}. ` +
        `Клик по узлу меняет выбор, а запуск алгоритма сразу обновляет подсветку и объяснение.`;
}

function paintFatal(message) {
    graphCanvas.innerHTML = `<div class="path-card muted">${message}</div>`;
    resultTitle.textContent = "Сайт не смог загрузиться";
    resultChip.textContent = "Ошибка";
    resultSummary.textContent = message;
}

function formatVisitedPreview(visitedOrder) {
    const unique = [...new Set(visitedOrder)];
    const preview = unique.slice(0, 6).join(" → ");

    if (unique.length <= 6) {
        return preview;
    }

    return `${preview} ... (+${unique.length - 6})`;
}

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    syncSelectionFromInputs();
    updateSelectionStatus();
    await runSearch();
});

swapButton.addEventListener("click", async () => {
    const oldSource = sourceInput.value;
    sourceInput.value = targetInput.value;
    targetInput.value = oldSource;

    syncSelectionFromInputs();
    updateSelectionStatus();

    if (sourceInput.value && targetInput.value) {
        await runSearch();
    }
});

resetButton.addEventListener("click", () => {
    state.focusedPathIndex = null;
    state.lastResult = null;
    state.selectedIds = [];
    sourceInput.value = "";
    targetInput.value = "";
    resultTitle.textContent = "Подсветка сброшена";
    resultChip.textContent = "Ожидание";
    resultSummary.textContent =
        "Выбор очищен. Можно заново кликнуть по двум вершинам или ввести имена вручную и снова запустить BFS/DFS.";
    metricPaths.textContent = "0";
    metricDistance.textContent = "-";
    metricVisited.textContent = "-";
    pathsList.innerHTML = `<article class="path-card muted">После нового запуска тут снова появятся маршруты.</article>`;
    stepsList.innerHTML = "<li>Лог очищен. Алгоритм ещё не запускался после сброса.</li>";
    paintSelection();
    updateSelectionStatus();
});

sourceInput.addEventListener("change", () => {
    syncSelectionFromInputs();
    updateSelectionStatus();
});

targetInput.addEventListener("change", () => {
    syncSelectionFromInputs();
    updateSelectionStatus();
});

algorithmSelect.addEventListener("change", () => {
    updateSelectionStatus();
});
