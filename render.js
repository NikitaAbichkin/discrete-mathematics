// Рендеринг красно-чёрного дерева в SVG
class TreeRenderer {
    constructor(svgElement, deleteContainer) {
        this.svg = svgElement;
        this.deleteContainer = deleteContainer;
        this.nodeRadius = 20;
        this.levelHeight = 70;
        this.minHGap = 50;
        this.padding = 50;
        this.positions = new Map();
        this.onDeleteClick = null;
        this.showDeleteButtons = true;

        // Фиксированный viewBox — не меняется при удалении
        this.fixedWidth = 800;
        this.fixedHeight = 500;
    }

    render(treeData) {
        this.svg.innerHTML = '';
        this.deleteContainer.innerHTML = '';
        this.positions.clear();

        // Всегда один и тот же viewBox
        this.svg.setAttribute('viewBox', `0 0 ${this.fixedWidth} ${this.fixedHeight}`);
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMin meet');

        if (!treeData) {
            this._renderEmpty();
            return;
        }

        // Вычисляем позиции
        this._computeLayout(treeData);

        // Находим границы дерева
        let minX = Infinity, maxX = -Infinity, maxY = 0;
        this.positions.forEach(pos => {
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            maxY = Math.max(maxY, pos.y);
        });

        const treeWidth = maxX - minX;
        const treeHeight = maxY;

        // Центрируем дерево в фиксированном viewBox
        const offsetX = (this.fixedWidth - treeWidth) / 2 - minX;
        const offsetY = this.padding;

        // Если дерево выходит за пределы — расширяем viewBox
        const neededWidth = treeWidth + this.padding * 2;
        const neededHeight = treeHeight + this.padding * 2;
        const vbW = Math.max(this.fixedWidth, neededWidth);
        const vbH = Math.max(this.fixedHeight, neededHeight);

        if (vbW > this.fixedWidth || vbH > this.fixedHeight) {
            this.svg.setAttribute('viewBox', `0 0 ${vbW} ${vbH}`);
            // Пересчитываем offset для расширенного viewBox
            const newOffsetX = (vbW - treeWidth) / 2 - minX;
            this._drawAll(treeData, newOffsetX, offsetY, vbW, vbH);
        } else {
            this._drawAll(treeData, offsetX, offsetY, vbW, vbH);
        }
    }

    _drawAll(treeData, offsetX, offsetY, vbW, vbH) {
        this._drawEdges(treeData, offsetX, offsetY);
        this._drawNodes(treeData, offsetX, offsetY, vbW, vbH);
    }

    _computeLayout(node) {
        let index = 0;
        const assignIndex = (n, depth) => {
            if (!n) return;
            assignIndex(n.left, depth + 1);
            this.positions.set(n, {
                x: index * this.minHGap,
                y: depth * this.levelHeight,
                node: n
            });
            index++;
            assignIndex(n.right, depth + 1);
        };
        assignIndex(node, 0);
    }

    _drawEdges(node, ox, oy) {
        if (!node) return;

        const pos = this.positions.get(node);
        const drawEdge = (child) => {
            if (!child) return;
            const cpos = this.positions.get(child);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pos.x + ox);
            line.setAttribute('y1', pos.y + oy);
            line.setAttribute('x2', cpos.x + ox);
            line.setAttribute('y2', cpos.y + oy);
            line.setAttribute('class', 'tree-edge');
            if (child.highlight || child.doubleBlack) {
                line.classList.add('highlighted');
            }
            this.svg.appendChild(line);
        };

        drawEdge(node.left);
        drawEdge(node.right);
        this._drawEdges(node.left, ox, oy);
        this._drawEdges(node.right, ox, oy);
    }

    _drawNodes(node, ox, oy, vbW, vbH) {
        if (!node) return;

        this._drawNodes(node.left, ox, oy, vbW, vbH);
        this._drawNodes(node.right, ox, oy, vbW, vbH);

        const pos = this.positions.get(node);
        const x = pos.x + ox;
        const y = pos.y + oy;

        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'node-group' + (node.highlight ? ' pulse' : ''));

        // Круг узла
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', this.nodeRadius);
        let circleClass = 'node-circle ' + node.color;
        if (node.doubleBlack) circleClass = 'node-circle double-black';
        if (node.highlight) circleClass += ' highlight';
        circle.setAttribute('class', circleClass);
        g.appendChild(circle);

        // Текст значения
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        text.setAttribute('class', 'node-text');
        text.textContent = node.value;
        g.appendChild(text);

        // Метка
        if (node.label) {
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x);
            label.setAttribute('y', y - this.nodeRadius - 8);
            label.setAttribute('class', 'node-label');
            label.style.fill = node.doubleBlack ? '#fbbf24' : '#60a5fa';
            label.textContent = node.label;
            g.appendChild(label);
        }

        this.svg.appendChild(g);

        // Кнопка удаления — позиционируем через процент от viewBox
        if (this.showDeleteButtons && this.onDeleteClick) {
            const btn = document.createElement('button');
            btn.className = 'delete-btn';
            btn.textContent = '✕';
            btn.title = `Удалить ${node.value}`;

            btn.style.left = `calc(${(x / vbW) * 100}% + ${this.nodeRadius * 0.5}px)`;
            btn.style.top = `calc(${(y / vbH) * 100}% - ${this.nodeRadius}px)`;

            const val = node.value;
            btn.addEventListener('click', () => this.onDeleteClick(val));
            this.deleteContainer.appendChild(btn);
        }
    }

    _renderEmpty() {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', this.fixedWidth / 2);
        text.setAttribute('y', this.fixedHeight / 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#444');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-family', '-apple-system, sans-serif');
        text.textContent = 'Дерево пустое. Добавьте узлы для начала.';
        this.svg.appendChild(text);
    }
}
