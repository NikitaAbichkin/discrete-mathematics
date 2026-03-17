// ============================================================
// app.js — Главный модуль приложения.
//
// Связывает логику КЧ-дерева (rbtree.js) с визуализацией (render.js)
// и пользовательским интерфейсом (HTML-элементы).
//
// Отвечает за:
// - Обработку пользовательского ввода (добавление/удаление узлов)
// - Управление пошаговой анимацией удаления
// - Всплывающие подсказки с правилами балансировки
// - Пасхалки (секретные имена)
// ============================================================

// IIFE (Immediately Invoked Function Expression) — самовызывающаяся функция.
// Создаёт изолированную область видимости, чтобы переменные не попадали
// в глобальное пространство имён и не конфликтовали с другими скриптами.
(function () {
    // ============================================================
    // Инициализация основных объектов
    // ============================================================

    // Создаём экземпляр красно-чёрного дерева — хранит все данные
    const tree = new RBTree();

    // Получаем SVG-элемент для отрисовки дерева
    const svg = document.getElementById('treeSvg');

    // Получаем контейнер для HTML-кнопок удаления (накладываются поверх SVG)
    const deleteContainer = document.getElementById('deleteButtons');

    // Создаём рендерер — связывает данные дерева с SVG-визуализацией
    const renderer = new TreeRenderer(svg, deleteContainer);

    // ============================================================
    // Получаем ссылки на все HTML-элементы управления
    // ============================================================
    const nodeValueInput = document.getElementById('nodeValue');   // Поле ввода значения узла
    const addBtn = document.getElementById('addBtn');              // Кнопка «Добавить»
    const addRandomBtn = document.getElementById('addRandomBtn');  // Кнопка «Случайное дерево»
    const clearBtn = document.getElementById('clearBtn');          // Кнопка «Очистить»
    const speedSlider = document.getElementById('speedSlider');    // Ползунок скорости анимации
    const speedLabel = document.getElementById('speedLabel');      // Отображение текущей скорости
    const stepsList = document.getElementById('stepsList');        // Контейнер списка шагов
    const stepControls = document.getElementById('stepControls');  // Панель управления шагами
    const prevStepBtn = document.getElementById('prevStepBtn');    // Кнопка «← Назад»
    const nextStepBtn = document.getElementById('nextStepBtn');    // Кнопка «Вперёд →»
    const autoPlayBtn = document.getElementById('autoPlayBtn');    // Кнопка «▶ Авто»
    const finishBtn = document.getElementById('finishBtn');        // Кнопка «Завершить»
    const stepCounter = document.getElementById('stepCounter');    // Счётчик шагов «3 / 7»
    const tooltip = document.getElementById('tooltip');            // Всплывающая подсказка

    // ============================================================
    // Состояние анимации
    // ============================================================
    let currentSteps = [];       // Массив шагов текущего удаления (из deleteWithSteps)
    let currentStepIndex = -1;   // Индекс текущего отображаемого шага (-1 = нет активного шага)
    let isAnimating = false;     // Флаг: идёт ли сейчас пошаговый показ удаления
    let autoPlayInterval = null; // ID интервала автоматического проигрывания (для clearInterval)

    // ============================================================
    // Словарь подсказок для правил балансировки.
    // Ключ — название правила (отображается в бейдже на шаге),
    // Значение — развёрнутое объяснение (показывается при наведении).
    // ============================================================
    const ruleTooltips = {
        'Случай 1: красный брат':
            'Если брат удалённого узла красный, мы делаем поворот, чтобы привести к случаю с чёрным братом. Это не решает проблему сразу, но упрощает её.',

        'Случай 2: чёрный брат, чёрные племянники':
            'Если брат и оба его потомка чёрные, мы «забираем» один чёрный уровень у брата (красим его в красный) и передаём проблему двойного чёрного вверх к родителю.',

        'Случай 2: чёрные племянники':
            'Зеркальный вариант случая 2. Брат и оба его потомка чёрные — перекрашиваем брата в красный.',

        'Случай 3: красный левый племянник':
            'Если ближний племянник красный, а дальний чёрный — поворот вокруг брата приводит к случаю 4, где дальний племянник красный.',

        'Случай 3: красный правый племянник':
            'Зеркальный вариант случая 3. Ближний племянник красный — поворот для перехода к случаю 4.',

        'Случай 4: красный правый племянник':
            'Финальный случай: дальний племянник красный. Один поворот и перекраска полностью устраняют двойной чёрный узел.',

        'Случай 4: финальная балансировка':
            'Зеркальный вариант случая 4. Поворот и перекраска полностью восстанавливают баланс.',

        'Двойной чёрный узел':
            'Когда удаляется чёрный узел, на его месте возникает «двойной чёрный» — узел, который считается за два чёрных для подсчёта чёрной высоты. Задача балансировки — устранить этот двойной чёрный.',

        'Случай 1: один потомок или лист':
            'Если у узла нет одного из потомков, можно просто заменить его другим потомком (или NIL).',

        'Случай 2: один потомок':
            'Узел имеет только левого потомка — заменяем узел этим потомком.',

        'Случай 3: два потомка':
            'При удалении узла с двумя потомками находим его in-order преемника (минимальный элемент правого поддерева) и ставим его на место удалённого.',

        'Устранение двойного чёрного':
            'Если двойной чёрный узел стал красно-чёрным (его родитель был красным в случае 2) или дошёл до корня — просто снимаем «лишний» чёрный.',

        'Свойства сохранены':
            'Удалённый узел был красным, поэтому чёрная высота не изменилась и балансировка не требуется.'
    };

    // ============================================================
    // init() — точка входа. Запускает начальную отрисовку и привязывает события.
    // ============================================================
    function init() {
        renderTree();    // Отрисовываем текущее состояние дерева (изначально пустое)
        setupEvents();   // Привязываем обработчики событий к кнопкам и элементам
    }

    // ============================================================
    // renderTree() — отрисовка текущего «живого» состояния дерева.
    // Показывает кнопки удаления, если не идёт анимация.
    // ============================================================
    function renderTree() {
        renderer.showDeleteButtons = !isAnimating;               // Кнопки видны только вне анимации
        renderer.onDeleteClick = isAnimating ? null : handleDelete; // Обработчик удаления
        renderer.render(tree.serialize());                        // Сериализуем дерево и рисуем
    }

    // ============================================================
    // renderSnapshot(treeData) — отрисовка «снимка» дерева (из шага анимации).
    // Не показывает кнопки удаления, т.к. это промежуточное состояние.
    // ============================================================
    function renderSnapshot(treeData) {
        renderer.showDeleteButtons = false;  // Скрываем кнопки удаления
        renderer.onDeleteClick = null;       // Отключаем обработчик
        renderer.render(treeData);           // Рисуем снимок
    }

    // ============================================================
    // setupEvents() — привязка всех обработчиков событий к элементам UI.
    // ============================================================
    function setupEvents() {
        // Кнопка «Добавить» — вызывает handleAdd
        addBtn.addEventListener('click', handleAdd);

        // Нажатие Enter в поле ввода — тоже вызывает добавление
        nodeValueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAdd();
        });

        // Кнопка «Случайное дерево»
        addRandomBtn.addEventListener('click', handleAddRandom);

        // Кнопка «Очистить» — удаляет все узлы
        clearBtn.addEventListener('click', handleClear);

        // Ползунок скорости — обновляем отображаемое значение при перемещении
        speedSlider.addEventListener('input', () => {
            speedLabel.textContent = speedSlider.value + 'мс';
        });

        // Кнопки навигации по шагам
        prevStepBtn.addEventListener('click', () => goToStep(currentStepIndex - 1)); // Назад
        nextStepBtn.addEventListener('click', () => goToStep(currentStepIndex + 1)); // Вперёд
        autoPlayBtn.addEventListener('click', toggleAutoPlay);  // Авто/Пауза
        finishBtn.addEventListener('click', finishAnimation);   // Завершить анимацию

        // Тултип следует за курсором мыши
        document.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.clientX + 12) + 'px'; // Смещение вправо от курсора
            tooltip.style.top = (e.clientY + 12) + 'px';  // Смещение вниз от курсора
        });
    }

    // ============================================================
    // handleAdd() — обработчик добавления узла.
    // Читает значение из поля ввода, проверяет на пасхалки,
    // и если это число — вставляет в дерево.
    // ============================================================
    function handleAdd() {
        const raw = nodeValueInput.value.trim(); // Получаем введённый текст (без пробелов по краям)

        // === Пасхалки ===
        // Если введено одно из секретных имён — на 1.5 секунды
        // все узлы дерева заменяются соответствующей фотографией
        const easterEggs = {
            'ЛевЛихачев': 'lev.jpg',                // Фото Лёвы
            'ВанекТигунов': 'ВанекТигунов.jpg',      // Фото Ванька
            'ГришаняВоробьев': 'ГришаняВоробьев.jpg'  // Фото Гришани
        };
        if (easterEggs[raw]) {               // Если введённое имя есть в словаре пасхалок
            nodeValueInput.value = '';        // Очищаем поле ввода
            triggerEasterEgg(easterEggs[raw]); // Запускаем пасхалку с нужным файлом
            return;                          // Не вставляем ничего в дерево
        }

        // Обычная вставка числа
        const val = parseInt(raw);           // Пытаемся преобразовать текст в целое число
        if (isNaN(val)) return;              // Если не число — игнорируем
        if (isAnimating) return;             // Во время анимации вставка заблокирована
        tree.insert(val);                    // Вставляем значение в КЧ-дерево
        nodeValueInput.value = '';           // Очищаем поле ввода
        renderTree();                        // Перерисовываем дерево
        nodeValueInput.focus();              // Возвращаем фокус в поле ввода
    }

    // ============================================================
    // triggerEasterEgg(imageFile) — активация пасхалки.
    //
    // Заменяет заливку всех кругов-узлов на фотографию из файла imageFile.
    // Через 1.5 секунды возвращает всё обратно.
    //
    // Технически: создаём SVG <pattern> с <image> внутри,
    // и применяем его как fill для каждого <circle>.
    // ============================================================
    function triggerEasterEgg(imageFile) {
        // Находим все круги узлов в SVG
        const circles = svg.querySelectorAll('.node-circle');
        if (circles.length === 0) return;    // Если дерево пустое — ничего не делаем

        // Создаём элемент <defs> в SVG (если его ещё нет).
        // <defs> — контейнер для «определений» (паттерны, градиенты и т.д.),
        // которые не отображаются напрямую, но могут использоваться другими элементами.
        let defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.prepend(defs);               // Добавляем в начало SVG
        }

        // Для каждого круга создаём свой паттерн (шаблон заливки)
        const patternIds = [];               // Массив ID паттернов (для последующего удаления)
        circles.forEach((circle, i) => {
            const cx = parseFloat(circle.getAttribute('cx')); // Центр круга X (не используется, но может пригодиться)
            const cy = parseFloat(circle.getAttribute('cy')); // Центр круга Y
            const r = parseFloat(circle.getAttribute('r'));    // Радиус круга
            const pid = 'lev-pattern-' + i;  // Уникальный ID для каждого паттерна
            patternIds.push(pid);

            // Создаём <pattern> — шаблон заливки
            const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            pattern.setAttribute('id', pid);
            pattern.setAttribute('patternUnits', 'objectBoundingBox'); // Координаты относительно объекта
            pattern.setAttribute('width', '1');    // 100% ширины объекта
            pattern.setAttribute('height', '1');   // 100% высоты объекта

            // Создаём <image> внутри паттерна — сама фотография
            const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            img.setAttribute('href', imageFile);                // Путь к файлу фотографии
            img.setAttribute('width', r * 2);                   // Ширина = диаметр круга
            img.setAttribute('height', r * 2);                  // Высота = диаметр круга
            img.setAttribute('preserveAspectRatio', 'xMidYMid slice'); // Обрезка с сохранением пропорций
            pattern.appendChild(img);        // Добавляем изображение в паттерн
            defs.appendChild(pattern);       // Добавляем паттерн в <defs>
        });

        // Сохраняем оригинальные стили кругов (чтобы потом восстановить)
        const originals = [];
        circles.forEach((circle, i) => {
            originals.push({
                fill: circle.style.fill || '',           // Оригинальная заливка
                className: circle.getAttribute('class')  // Оригинальный CSS-класс
            });
            // Применяем паттерн как заливку круга
            circle.style.fill = `url(#${patternIds[i]})`;
            circle.style.stroke = '#fbbf24';             // Жёлтая обводка для эффекта
            circle.style.strokeWidth = '3';
        });

        // Скрываем текст (числа) на узлах, чтобы фотка была видна
        const texts = svg.querySelectorAll('.node-text');
        texts.forEach(t => t.style.opacity = '0');

        // Через 1.5 секунды возвращаем всё в исходное состояние
        setTimeout(() => {
            // Восстанавливаем оригинальные стили кругов
            circles.forEach((circle, i) => {
                circle.style.fill = '';                  // Убираем inline-стиль заливки
                circle.style.stroke = '';                // Убираем inline-стиль обводки
                circle.style.strokeWidth = '';
                circle.setAttribute('class', originals[i].className); // Восстанавливаем CSS-класс
            });

            // Показываем текст обратно
            texts.forEach(t => t.style.opacity = '');

            // Удаляем паттерны из <defs> (чистим за собой)
            patternIds.forEach(pid => {
                const el = defs.querySelector('#' + pid);
                if (el) el.remove();
            });
        }, 1500); // 1500 мс = 1.5 секунды
    }

    // ============================================================
    // handleAddRandom() — создание случайного дерева из 7-10 узлов.
    // Полностью заменяет текущее дерево.
    // ============================================================
    function handleAddRandom() {
        if (isAnimating) return;             // Во время анимации — игнорируем

        const newTree = new RBTree();        // Создаём новое пустое дерево
        const count = 7 + Math.floor(Math.random() * 4); // Случайное количество: 7, 8, 9 или 10

        // Генерируем уникальные случайные значения от 1 до 99
        const values = new Set();            // Set гарантирует уникальность
        while (values.size < count) {
            values.add(Math.floor(Math.random() * 99) + 1); // Случайное число 1-99
        }

        // Вставляем каждое значение в дерево (с автоматической балансировкой)
        values.forEach(v => newTree.insert(v));

        // Заменяем текущее дерево новым
        Object.assign(tree, newTree);        // Копируем все свойства нового дерева в текущее
        renderTree();                        // Перерисовываем
    }

    // ============================================================
    // handleClear() — полная очистка дерева и сброс анимации.
    // ============================================================
    function handleClear() {
        if (isAnimating) stopAutoPlay();     // Останавливаем автопроигрывание (если было)
        isAnimating = false;                 // Сбрасываем флаг анимации
        currentSteps = [];                   // Очищаем массив шагов
        currentStepIndex = -1;               // Сбрасываем индекс шага
        tree.root = tree.NIL;                // Делаем дерево пустым (корень = NIL)

        // Возвращаем начальный текст в панель шагов
        stepsList.innerHTML = '<p class="placeholder-text">Нажмите ✕ у узла, чтобы начать удаление</p>';
        stepControls.style.display = 'none'; // Скрываем панель управления шагами
        renderTree();                        // Перерисовываем (покажет пустое дерево)
    }

    // ============================================================
    // handleDelete(value) — обработчик нажатия кнопки удаления (✕) у узла.
    //
    // 1. Генерирует массив пошаговых снимков удаления (через tree.deleteWithSteps)
    // 2. Переключает UI в режим пошаговой анимации
    // 3. Показывает первый шаг
    // ============================================================
    function handleDelete(value) {
        if (isAnimating) return;             // Если уже идёт анимация — игнорируем

        // Генерируем все шаги удаления (дерево при этом РЕАЛЬНО меняется!)
        currentSteps = tree.deleteWithSteps(value);
        if (currentSteps.length === 0) return; // Узел не найден (не должно произойти)

        isAnimating = true;                  // Включаем режим анимации
        currentStepIndex = -1;               // Сбрасываем индекс

        buildStepsList();                    // Строим HTML-список шагов в боковой панели
        stepControls.style.display = 'flex'; // Показываем панель управления шагами
        goToStep(0);                         // Переходим к первому шагу
    }

    // ============================================================
    // buildStepsList() — создаёт HTML-элементы для списка шагов в боковой панели.
    // Каждый шаг — это карточка с номером, текстом и бейджем правила.
    // ============================================================
    function buildStepsList() {
        stepsList.innerHTML = '';             // Очищаем предыдущий список

        currentSteps.forEach((step, i) => {
            // Создаём div-элемент для одного шага
            const div = document.createElement('div');
            div.className = 'step-item';     // CSS-класс для стилизации
            div.dataset.index = i;           // Сохраняем индекс в data-атрибуте

            // Формируем HTML: номер шага + текст + бейдж правила (если есть)
            let html = `<span class="step-num">${i + 1}.</span> ${step.text}`;
            if (step.rule) {
                // Бейдж правила — синий элемент, при наведении показывает подсказку
                html += ` <span class="rule-tag" data-rule="${step.rule}">${step.rule}</span>`;
            }
            div.innerHTML = html;

            // Привязываем тултип к бейджу правила
            const ruleTag = div.querySelector('.rule-tag');
            if (ruleTag) {
                ruleTag.addEventListener('mouseenter', (e) => showTooltip(e, step.rule)); // Показать подсказку
                ruleTag.addEventListener('mouseleave', hideTooltip);                       // Скрыть подсказку
            }

            // Клик по шагу — переходим к нему
            div.addEventListener('click', () => goToStep(i));
            stepsList.appendChild(div);      // Добавляем в контейнер
        });
    }

    // ============================================================
    // goToStep(index) — переход к конкретному шагу анимации.
    //
    // 1. Отрисовывает снимок дерева для этого шага
    // 2. Подсвечивает текущий шаг в списке
    // 3. Обновляет счётчик и состояние кнопок навигации
    // ============================================================
    function goToStep(index) {
        if (index < 0 || index >= currentSteps.length) return; // Проверка границ
        currentStepIndex = index;            // Запоминаем текущий индекс

        // Отрисовываем снимок дерева для данного шага
        renderSnapshot(currentSteps[index].tree);

        // Обновляем классы шагов в списке: active (текущий) и done (пройденные)
        const items = stepsList.querySelectorAll('.step-item');
        items.forEach((item, i) => {
            item.classList.remove('active', 'done'); // Сначала убираем все классы
            if (i < index) item.classList.add('done');    // Пройденные шаги — серые
            if (i === index) item.classList.add('active'); // Текущий шаг — подсвеченный
        });

        // Плавная прокрутка к текущему шагу (если он не видим)
        items[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Обновляем текст счётчика: «3 / 7»
        stepCounter.textContent = `${index + 1} / ${currentSteps.length}`;

        // Блокируем кнопки на границах: «Назад» на первом шаге, «Вперёд» на последнем
        prevStepBtn.disabled = index === 0;
        nextStepBtn.disabled = index === currentSteps.length - 1;
    }

    // ============================================================
    // toggleAutoPlay() — включение/выключение автоматического проигрывания шагов.
    // При включении шаги переключаются автоматически с интервалом из ползунка.
    // ============================================================
    function toggleAutoPlay() {
        if (autoPlayInterval) {
            // Автопроигрывание уже идёт → останавливаем
            stopAutoPlay();
        } else {
            // Запускаем автопроигрывание
            autoPlayBtn.textContent = '⏸ Пауза';            // Меняем текст кнопки
            const speed = parseInt(speedSlider.value);        // Читаем скорость из ползунка (мс)

            // setInterval вызывает функцию каждые speed миллисекунд
            autoPlayInterval = setInterval(() => {
                if (currentStepIndex < currentSteps.length - 1) {
                    goToStep(currentStepIndex + 1);           // Переходим к следующему шагу
                } else {
                    stopAutoPlay();                           // Дошли до конца → останавливаем
                }
            }, speed);
        }
    }

    // ============================================================
    // stopAutoPlay() — остановка автоматического проигрывания.
    // ============================================================
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval); // Останавливаем интервал
            autoPlayInterval = null;         // Сбрасываем ссылку
        }
        autoPlayBtn.textContent = '▶ Авто'; // Возвращаем текст кнопки
    }

    // ============================================================
    // finishAnimation() — завершение пошаговой анимации.
    // Возвращает интерфейс в обычный режим и показывает итоговое состояние дерева.
    // ============================================================
    function finishAnimation() {
        stopAutoPlay();                      // Останавливаем автопроигрывание
        isAnimating = false;                 // Выходим из режима анимации
        currentSteps = [];                   // Очищаем шаги
        currentStepIndex = -1;               // Сбрасываем индекс
        stepControls.style.display = 'none'; // Скрываем панель управления шагами

        // Возвращаем начальный текст
        stepsList.innerHTML = '<p class="placeholder-text">Нажмите ✕ у узла, чтобы начать удаление</p>';
        renderTree();                        // Рисуем итоговое состояние дерева (с кнопками удаления)
    }

    // ============================================================
    // showTooltip(e, rule) — показывает всплывающую подсказку с объяснением правила.
    // Вызывается при наведении мыши на бейдж правила в списке шагов.
    // ============================================================
    function showTooltip(e, rule) {
        const content = ruleTooltips[rule];  // Ищем текст подсказки по названию правила
        if (!content) return;                // Если нет подсказки — ничего не показываем

        // Формируем HTML тултипа: заголовок + текст
        tooltip.innerHTML = `<div class="tooltip-title">${rule}</div>${content}`;
        tooltip.style.display = 'block';     // Делаем тултип видимым
    }

    // ============================================================
    // hideTooltip() — скрывает всплывающую подсказку.
    // Вызывается когда мышь уходит с бейджа правила.
    // ============================================================
    function hideTooltip() {
        tooltip.style.display = 'none';
    }

    // Запускаем приложение
    init();
})();
