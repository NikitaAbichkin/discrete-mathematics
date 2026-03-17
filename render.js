// ============================================================
// render.js — Рендеринг (отрисовка) красно-чёрного дерева в SVG.
//
// Этот модуль отвечает за визуальное представление дерева:
// - Вычисляет позиции узлов на экране
// - Рисует рёбра (линии между узлами) и сами узлы (круги с числами)
// - Создаёт кнопки удаления (✕) рядом с каждым узлом
// - Поддерживает визуальные эффекты: подсветка, двойной чёрный, метки
// ============================================================

class TreeRenderer {
    // Конструктор принимает SVG-элемент и контейнер для кнопок удаления
    constructor(svgElement, deleteContainer) {
        this.svg = svgElement;               // <svg> элемент, в который рисуем дерево
        this.deleteContainer = deleteContainer; // <div> для HTML-кнопок удаления (поверх SVG)
        this.nodeRadius = 20;                // Радиус круга узла в пикселях (SVG-координаты)
        this.levelHeight = 70;               // Вертикальное расстояние между уровнями дерева
        this.minHGap = 50;                   // Минимальный горизонтальный зазор между соседними узлами
        this.padding = 50;                   // Отступ от краёв SVG до ближайших узлов
        this.positions = new Map();          // Словарь: узел → {x, y} координаты на canvas
        this.onDeleteClick = null;           // Колбэк, вызываемый при нажатии кнопки удаления
        this.showDeleteButtons = true;       // Флаг: показывать ли кнопки удаления

        // Фиксированные размеры области рисования (viewBox SVG).
        // Это решает проблему «прыгающего масштаба» — при удалении узлов
        // дерево становится меньше, но область отрисовки не уменьшается.
        this.fixedWidth = 800;               // Фиксированная ширина viewBox
        this.fixedHeight = 500;              // Фиксированная высота viewBox
    }

    // ============================================================
    // render(treeData) — главный метод отрисовки.
    // Принимает сериализованное дерево (из RBTree.serialize()) и рисует его.
    // ============================================================
    render(treeData) {
        this.svg.innerHTML = '';             // Очищаем SVG от предыдущей отрисовки
        this.deleteContainer.innerHTML = ''; // Очищаем кнопки удаления
        this.positions.clear();              // Очищаем сохранённые позиции

        // Устанавливаем фиксированный viewBox — область координат SVG.
        // viewBox определяет «виртуальную» систему координат внутри SVG.
        // preserveAspectRatio="xMidYMin meet" — центрирует по горизонтали,
        // выравнивает по верху, сохраняет пропорции.
        this.svg.setAttribute('viewBox', `0 0 ${this.fixedWidth} ${this.fixedHeight}`);
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMin meet');

        // Если дерево пустое — показываем заглушку
        if (!treeData) {
            this._renderEmpty();
            return;
        }

        // Шаг 1: вычисляем позиции всех узлов
        this._computeLayout(treeData);

        // Шаг 2: находим границы дерева (минимальные/максимальные координаты)
        let minX = Infinity, maxX = -Infinity, maxY = 0;
        this.positions.forEach(pos => {
            minX = Math.min(minX, pos.x);    // Самый левый узел
            maxX = Math.max(maxX, pos.x);    // Самый правый узел
            maxY = Math.max(maxY, pos.y);    // Самый нижний узел
        });

        const treeWidth = maxX - minX;       // Ширина дерева (разница правого и левого узлов)
        const treeHeight = maxY;             // Высота дерева

        // Шаг 3: вычисляем смещение для центрирования дерева в viewBox
        const offsetX = (this.fixedWidth - treeWidth) / 2 - minX; // Смещение по X (центрирование)
        const offsetY = this.padding;        // Смещение по Y (отступ сверху)

        // Шаг 4: если дерево не помещается в фиксированный viewBox — расширяем
        const neededWidth = treeWidth + this.padding * 2;   // Нужная ширина с отступами
        const neededHeight = treeHeight + this.padding * 2; // Нужная высота с отступами
        const vbW = Math.max(this.fixedWidth, neededWidth); // Итоговая ширина (не меньше фиксированной)
        const vbH = Math.max(this.fixedHeight, neededHeight); // Итоговая высота

        if (vbW > this.fixedWidth || vbH > this.fixedHeight) {
            // Дерево не помещается → расширяем viewBox и пересчитываем центрирование
            this.svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
            const newOffsetX = (vbW - treeWidth) / 2 - minX;
            this._drawAll(treeData, newOffsetX, offsetY, vbW, vbH);
        } else {
            // Дерево помещается → рисуем с фиксированным viewBox
            this._drawAll(treeData, offsetX, offsetY, vbW, vbH);
        }
    }

    // Рисуем всё: сначала рёбра (чтобы были «под» узлами), потом узлы
    _drawAll(treeData, offsetX, offsetY, vbW, vbH) {
        this._drawEdges(treeData, offsetX, offsetY);          // Рёбра (линии)
        this._drawNodes(treeData, offsetX, offsetY, vbW, vbH); // Узлы (круги + текст + кнопки)
    }

    // ============================================================
    // _computeLayout(node) — вычисляет координаты x, y для каждого узла.
    //
    // Используется in-order обход: сначала левое поддерево, потом узел,
    // потом правое. Каждый узел получает порядковый номер (index),
    // который определяет его горизонтальную позицию.
    //
    // Это даёт красивое расположение, где узлы не пересекаются
    // и in-order порядок совпадает с визуальным порядком слева направо.
    // ============================================================
    _computeLayout(node) {
        let index = 0;                       // Счётчик in-order номера

        // Рекурсивная функция обхода
        const assignIndex = (n, depth) => {
            if (!n) return;                  // Базовый случай: пустой узел

            assignIndex(n.left, depth + 1);  // Сначала левое поддерево (меньшие значения)

            // Сохраняем позицию текущего узла
            this.positions.set(n, {
                x: index * this.minHGap,     // X = порядковый номер × горизонтальный шаг
                y: depth * this.levelHeight, // Y = глубина × вертикальный шаг
                node: n                      // Ссылка на узел (для доступа к его свойствам)
            });
            index++;                         // Увеличиваем счётчик

            assignIndex(n.right, depth + 1); // Затем правое поддерево (большие значения)
        };

        assignIndex(node, 0);               // Запускаем с корня (глубина 0)
    }

    // ============================================================
    // _drawEdges(node, ox, oy) — рисует рёбра (линии) между узлами.
    // ox, oy — смещение для центрирования дерева.
    // Рёбра рисуются от родителя к каждому потомку.
    // ============================================================
    _drawEdges(node, ox, oy) {
        if (!node) return;                   // Базовый случай: пустой узел

        const pos = this.positions.get(node); // Позиция текущего узла

        // Функция для рисования одного ребра от текущего узла к потомку
        const drawEdge = (child) => {
            if (!child) return;              // Нет потомка — нет ребра
            const cpos = this.positions.get(child); // Позиция потомка

            // Создаём SVG-линию
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pos.x + ox);   // Начало линии: X родителя
            line.setAttribute('y1', pos.y + oy);   // Начало линии: Y родителя
            line.setAttribute('x2', cpos.x + ox);  // Конец линии: X потомка
            line.setAttribute('y2', cpos.y + oy);  // Конец линии: Y потомка
            line.setAttribute('class', 'tree-edge'); // CSS-класс для стилизации

            // Если потомок подсвечен или является двойным чёрным — ребро тоже подсвечивается
            if (child.highlight || child.doubleBlack) {
                line.classList.add('highlighted');
            }

            this.svg.appendChild(line);      // Добавляем линию в SVG
        };

        drawEdge(node.left);                 // Ребро к левому потомку
        drawEdge(node.right);                // Ребро к правому потомку
        this._drawEdges(node.left, ox, oy);  // Рекурсивно рисуем рёбра в левом поддереве
        this._drawEdges(node.right, ox, oy); // Рекурсивно рисуем рёбра в правом поддереве
    }

    // ============================================================
    // _drawNodes(node, ox, oy, vbW, vbH) — рисует узлы (круги, текст, кнопки).
    // ox, oy — смещение для центрирования.
    // vbW, vbH — размеры viewBox (нужны для позиционирования HTML-кнопок).
    // ============================================================
    _drawNodes(node, ox, oy, vbW, vbH) {
        if (!node) return;

        // Сначала рисуем потомков, потом сам узел — так узлы будут «поверх» рёбер
        this._drawNodes(node.left, ox, oy, vbW, vbH);
        this._drawNodes(node.right, ox, oy, vbW, vbH);

        const pos = this.positions.get(node); // Позиция узла
        const x = pos.x + ox;               // Финальная X-координата (с учётом смещения)
        const y = pos.y + oy;               // Финальная Y-координата

        // Создаём SVG-группу <g> для всех элементов узла
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group' + (node.highlight ? ' pulse' : '')); // Пульсация при подсветке

        // --- Круг узла ---
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);       // Центр круга по X
        circle.setAttribute('cy', y);       // Центр круга по Y
        circle.setAttribute('r', this.nodeRadius); // Радиус круга

        // Определяем CSS-класс круга в зависимости от состояния
        let circleClass = 'node-circle ' + node.color;              // Базовый класс + цвет (red/black)
        if (node.doubleBlack) circleClass = 'node-circle double-black'; // Двойной чёрный — особый стиль
        if (node.highlight) circleClass += ' highlight';             // Подсветка (жёлтое свечение)
        circle.setAttribute('class', circleClass);
        g.appendChild(circle);               // Добавляем круг в группу

        // --- Текст со значением узла ---
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);          // Позиция текста = центр круга
        text.setAttribute('y', y);
        text.setAttribute('class', 'node-text'); // CSS-класс (белый, жирный, по центру)
        text.textContent = node.value;       // Само числовое значение
        g.appendChild(text);

        // --- Текстовая метка над узлом (если есть) ---
        // Метки используются для обозначения ролей узлов в процессе удаления:
        // «удаляемый», «преемник», «брат», «двойной чёрный» и т.д.
        if (node.label) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y - this.nodeRadius - 8); // Над кругом
            label.setAttribute('class', 'node-label');
            // Жёлтый цвет для двойного чёрного, синий для остальных
            label.style.fill = node.doubleBlack ? '#fbbf24' : '#60a5fa';
            label.textContent = node.label;
            g.appendChild(label);
        }

        this.svg.appendChild(g);             // Добавляем группу в SVG

        // --- Кнопка удаления (HTML, не SVG) ---
        // Кнопки — обычные HTML-элементы, расположенные поверх SVG.
        // Их позиция вычисляется в процентах от viewBox.
        if (this.showDeleteButtons && this.onDeleteClick) {
            const btn = document.createElement('button');
            btn.className = 'delete-btn';    // CSS-класс кнопки
            btn.textContent = '✕';           // Символ крестика
            btn.title = `Удалить ${node.value}`; // Подсказка при наведении

            // Позиционируем кнопку через проценты от viewBox,
            // чтобы она корректно совпадала с SVG-координатами узла
            btn.style.left = `calc(${(x / vbW) * 100}% + ${this.nodeRadius * 0.5}px)`;
            btn.style.top = `calc(${(y / vbH) * 100}% - ${this.nodeRadius}px)`;

            const val = node.value;
            btn.addEventListener('click', () => this.onDeleteClick(val)); // Обработчик клика
            this.deleteContainer.appendChild(btn);
        }
    }

    // ============================================================
    // _renderEmpty() — отрисовка заглушки для пустого дерева.
    // Показывает текст «Дерево пустое» по центру SVG.
    // ============================================================
    _renderEmpty() {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', this.fixedWidth / 2);  // По центру по горизонтали
        text.setAttribute('y', this.fixedHeight / 2);  // По центру по вертикали
        text.setAttribute('text-anchor', 'middle');    // Текст выровнен по центру
        text.setAttribute('fill', '#444');             // Серый цвет текста
        text.setAttribute('font-size', '14');
        text.setAttribute('font-family', '-apple-system, sans-serif');
        text.textContent = 'Дерево пустое. Добавьте узлы для начала.';
        this.svg.appendChild(text);
    }
}
