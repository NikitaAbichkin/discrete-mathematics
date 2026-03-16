// Главный модуль приложения
(function () {
    const tree = new RBTree();
    const svg = document.getElementById('treeSvg');
    const deleteContainer = document.getElementById('deleteButtons');
    const renderer = new TreeRenderer(svg, deleteContainer);

    const nodeValueInput = document.getElementById('nodeValue');
    const addBtn = document.getElementById('addBtn');
    const addRandomBtn = document.getElementById('addRandomBtn');
    const clearBtn = document.getElementById('clearBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedLabel = document.getElementById('speedLabel');
    const stepsList = document.getElementById('stepsList');
    const stepControls = document.getElementById('stepControls');
    const prevStepBtn = document.getElementById('prevStepBtn');
    const nextStepBtn = document.getElementById('nextStepBtn');
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    const finishBtn = document.getElementById('finishBtn');
    const stepCounter = document.getElementById('stepCounter');
    const tooltip = document.getElementById('tooltip');

    let currentSteps = [];
    let currentStepIndex = -1;
    let isAnimating = false;
    let autoPlayInterval = null;

    // Подсказки для правил
    const ruleTooltips = {
        'Случай 1: красный брат': 'Если брат удалённого узла красный, мы делаем поворот, чтобы привести к случаю с чёрным братом. Это не решает проблему сразу, но упрощает её.',
        'Случай 2: чёрный брат, чёрные племянники': 'Если брат и оба его потомка чёрные, мы «забираем» один чёрный уровень у брата (красим его в красный) и передаём проблему двойного чёрного вверх к родителю.',
        'Случай 2: чёрные племянники': 'Зеркальный вариант случая 2. Брат и оба его потомка чёрные — перекрашиваем брата в красный.',
        'Случай 3: красный левый племянник': 'Если ближний племянник красный, а дальний чёрный — поворот вокруг брата приводит к случаю 4, где дальний племянник красный.',
        'Случай 3: красный правый племянник': 'Зеркальный вариант случая 3. Ближний племянник красный — поворот для перехода к случаю 4.',
        'Случай 4: красный правый племянник': 'Финальный случай: дальний племянник красный. Один поворот и перекраска полностью устраняют двойной чёрный узел.',
        'Случай 4: финальная балансировка': 'Зеркальный вариант случая 4. Поворот и перекраска полностью восстанавливают баланс.',
        'Двойной чёрный узел': 'Когда удаляется чёрный узел, на его месте возникает «двойной чёрный» — узел, который считается за два чёрных для подсчёта чёрной высоты. Задача балансировки — устранить этот двойной чёрный.',
        'Случай 1: один потомок или лист': 'Если у узла нет одного из потомков, можно просто заменить его другим потомком (или NIL).',
        'Случай 2: один потомок': 'Узел имеет только левого потомка — заменяем узел этим потомком.',
        'Случай 3: два потомка': 'При удалении узла с двумя потомками находим его in-order преемника (минимальный элемент правого поддерева) и ставим его на место удалённого.',
        'Устранение двойного чёрного': 'Если двойной чёрный узел стал красно-чёрным (его родитель был красным в случае 2) или дошёл до корня — просто снимаем «лишний» чёрный.',
        'Свойства сохранены': 'Удалённый узел был красным, поэтому чёрная высота не изменилась и балансировка не требуется.'
    };

    // Инициализация
    function init() {
        renderTree();
        setupEvents();
    }

    function renderTree() {
        renderer.showDeleteButtons = !isAnimating;
        renderer.onDeleteClick = isAnimating ? null : handleDelete;
        renderer.render(tree.serialize());
    }

    function renderSnapshot(treeData) {
        renderer.showDeleteButtons = false;
        renderer.onDeleteClick = null;
        renderer.render(treeData);
    }

    function setupEvents() {
        addBtn.addEventListener('click', handleAdd);
        nodeValueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAdd();
        });
        addRandomBtn.addEventListener('click', handleAddRandom);
        clearBtn.addEventListener('click', handleClear);

        speedSlider.addEventListener('input', () => {
            speedLabel.textContent = speedSlider.value + 'мс';
        });

        prevStepBtn.addEventListener('click', () => goToStep(currentStepIndex - 1));
        nextStepBtn.addEventListener('click', () => goToStep(currentStepIndex + 1));
        autoPlayBtn.addEventListener('click', toggleAutoPlay);
        finishBtn.addEventListener('click', finishAnimation);

        // Тултипы
        document.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.clientX + 12) + 'px';
            tooltip.style.top = (e.clientY + 12) + 'px';
        });
    }

    function handleAdd() {
        const raw = nodeValueInput.value.trim();

        // Пасхалки
        const easterEggs = {
            'ЛевЛихачев': 'lev.jpg',
            'ВанекТигунов': 'ВанекТигунов.jpg',
            'ГришаняВоробьев': 'ГришаняВоробьев.jpg'
        };
        if (easterEggs[raw]) {
            nodeValueInput.value = '';
            triggerEasterEgg(easterEggs[raw]);
            return;
        }

        const val = parseInt(raw);
        if (isNaN(val)) return;
        if (isAnimating) return;
        tree.insert(val);
        nodeValueInput.value = '';
        renderTree();
        nodeValueInput.focus();
    }

    function triggerEasterEgg(imageFile) {
        const circles = svg.querySelectorAll('.node-circle');
        if (circles.length === 0) return;

        // Создаём defs с pattern для изображения
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.prepend(defs);
        }

        // Для каждого круга создаём индивидуальный pattern
        const patternIds = [];
        circles.forEach((circle, i) => {
            const cx = parseFloat(circle.getAttribute('cx'));
            const cy = parseFloat(circle.getAttribute('cy'));
            const r = parseFloat(circle.getAttribute('r'));
            const pid = 'lev-pattern-' + i;
            patternIds.push(pid);

            const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            pattern.setAttribute('id', pid);
            pattern.setAttribute('patternUnits', 'objectBoundingBox');
            pattern.setAttribute('width', '1');
            pattern.setAttribute('height', '1');

            const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            img.setAttribute('href', imageFile);
            img.setAttribute('width', r * 2);
            img.setAttribute('height', r * 2);
            img.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            pattern.appendChild(img);
            defs.appendChild(pattern);
        });

        // Сохраняем оригинальные стили и заменяем заливку
        const originals = [];
        circles.forEach((circle, i) => {
            originals.push({
                fill: circle.style.fill || '',
                className: circle.getAttribute('class')
            });
            circle.style.fill = `url(#${patternIds[i]})`;
            circle.style.stroke = '#fbbf24';
            circle.style.strokeWidth = '3';
        });

        // Скрываем текст узлов на время
        const texts = svg.querySelectorAll('.node-text');
        texts.forEach(t => t.style.opacity = '0');

        // Через 1.5 секунды — возвращаем обратно
        setTimeout(() => {
            circles.forEach((circle, i) => {
                circle.style.fill = '';
                circle.style.stroke = '';
                circle.style.strokeWidth = '';
                circle.setAttribute('class', originals[i].className);
            });
            texts.forEach(t => t.style.opacity = '');
            // Убираем паттерны
            patternIds.forEach(pid => {
                const el = defs.querySelector('#' + pid);
                if (el) el.remove();
            });
        }, 1500);
    }

    function handleAddRandom() {
        if (isAnimating) return;
        // Очищаем и строим дерево из 7-10 узлов
        const newTree = new RBTree();
        const count = 7 + Math.floor(Math.random() * 4);
        const values = new Set();
        while (values.size < count) {
            values.add(Math.floor(Math.random() * 99) + 1);
        }
        values.forEach(v => newTree.insert(v));

        // Копируем состояние
        Object.assign(tree, newTree);
        renderTree();
    }

    function handleClear() {
        if (isAnimating) stopAutoPlay();
        isAnimating = false;
        currentSteps = [];
        currentStepIndex = -1;
        tree.root = tree.NIL;
        stepsList.innerHTML = '<p class="placeholder-text">Нажмите ✕ у узла, чтобы начать удаление</p>';
        stepControls.style.display = 'none';
        renderTree();
    }

    function handleDelete(value) {
        if (isAnimating) return;

        // Генерируем шаги
        currentSteps = tree.deleteWithSteps(value);
        if (currentSteps.length === 0) return;

        isAnimating = true;
        currentStepIndex = -1;

        // Строим список шагов
        buildStepsList();
        stepControls.style.display = 'flex';
        goToStep(0);
    }

    function buildStepsList() {
        stepsList.innerHTML = '';
        currentSteps.forEach((step, i) => {
            const div = document.createElement('div');
            div.className = 'step-item';
            div.dataset.index = i;

            let html = `<span class="step-num">${i + 1}.</span> ${step.text}`;
            if (step.rule) {
                html += ` <span class="rule-tag" data-rule="${step.rule}">${step.rule}</span>`;
            }
            div.innerHTML = html;

            // Тултип для правила
            const ruleTag = div.querySelector('.rule-tag');
            if (ruleTag) {
                ruleTag.addEventListener('mouseenter', (e) => showTooltip(e, step.rule));
                ruleTag.addEventListener('mouseleave', hideTooltip);
            }

            div.addEventListener('click', () => goToStep(i));
            stepsList.appendChild(div);
        });
    }

    function goToStep(index) {
        if (index < 0 || index >= currentSteps.length) return;
        currentStepIndex = index;

        // Обновляем визуализацию
        renderSnapshot(currentSteps[index].tree);

        // Обновляем UI шагов
        const items = stepsList.querySelectorAll('.step-item');
        items.forEach((item, i) => {
            item.classList.remove('active', 'done');
            if (i < index) item.classList.add('done');
            if (i === index) item.classList.add('active');
        });

        // Прокрутка к активному шагу
        items[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Обновляем счётчик
        stepCounter.textContent = `${index + 1} / ${currentSteps.length}`;

        // Кнопки
        prevStepBtn.disabled = index === 0;
        nextStepBtn.disabled = index === currentSteps.length - 1;
    }

    function toggleAutoPlay() {
        if (autoPlayInterval) {
            stopAutoPlay();
        } else {
            autoPlayBtn.textContent = '⏸ Пауза';
            const speed = parseInt(speedSlider.value);
            autoPlayInterval = setInterval(() => {
                if (currentStepIndex < currentSteps.length - 1) {
                    goToStep(currentStepIndex + 1);
                } else {
                    stopAutoPlay();
                }
            }, speed);
        }
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        autoPlayBtn.textContent = '▶ Авто';
    }

    function finishAnimation() {
        stopAutoPlay();
        isAnimating = false;
        currentSteps = [];
        currentStepIndex = -1;
        stepControls.style.display = 'none';
        stepsList.innerHTML = '<p class="placeholder-text">Нажмите ✕ у узла, чтобы начать удаление</p>';
        renderTree();
    }

    function showTooltip(e, rule) {
        const content = ruleTooltips[rule];
        if (!content) return;
        tooltip.innerHTML = `<div class="tooltip-title">${rule}</div>${content}`;
        tooltip.style.display = 'block';
    }

    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    init();
})();
