// Красно-чёрное дерево с генерацией шагов удаления
const RED = 'red';
const BLACK = 'black';

class RBNode {
    constructor(value, color = RED) {
        this.value = value;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = null;
    }
}

class RBTree {
    constructor() {
        this.NIL = new RBNode(null, BLACK);
        this.root = this.NIL;
    }

    // Глубокое копирование дерева для снимков состояния
    cloneTree() {
        const tree = new RBTree();
        if (this.root === this.NIL) return tree;
        tree.root = this._cloneNode(this.root, null, tree.NIL);
        return tree;
    }

    _cloneNode(node, parent, nil) {
        if (node === this.NIL || node === null) return nil;
        const copy = new RBNode(node.value, node.color);
        copy.parent = parent;
        copy._doubleBlack = node._doubleBlack || false;
        copy._highlight = node._highlight || false;
        copy._label = node._label || '';
        copy.left = this._cloneNode(node.left, copy, nil);
        copy.right = this._cloneNode(node.right, copy, nil);
        return copy;
    }

    // Сериализация дерева в простой объект для рендера
    serialize() {
        return this._serializeNode(this.root);
    }

    _serializeNode(node) {
        if (node === this.NIL || node === null) return null;
        return {
            value: node.value,
            color: node.color,
            doubleBlack: node._doubleBlack || false,
            highlight: node._highlight || false,
            label: node._label || '',
            left: this._serializeNode(node.left),
            right: this._serializeNode(node.right)
        };
    }

    // Поиск узла
    search(value) {
        let node = this.root;
        while (node !== this.NIL) {
            if (value === node.value) return node;
            node = value < node.value ? node.left : node.right;
        }
        return null;
    }

    // Получить все значения
    getValues() {
        const vals = [];
        this._inorder(this.root, vals);
        return vals;
    }

    _inorder(node, arr) {
        if (node === this.NIL) return;
        this._inorder(node.left, arr);
        arr.push(node.value);
        this._inorder(node.right, arr);
    }

    // Левый поворот
    rotateLeft(x) {
        const y = x.right;
        x.right = y.left;
        if (y.left !== this.NIL) y.left.parent = x;
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }

    // Правый поворот
    rotateRight(x) {
        const y = x.left;
        x.left = y.right;
        if (y.right !== this.NIL) y.right.parent = x;
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }
        y.right = x;
        x.parent = y;
    }

    // Вставка с балансировкой
    insert(value) {
        if (this.search(value)) return; // дубликаты не вставляем

        const node = new RBNode(value);
        node.left = this.NIL;
        node.right = this.NIL;

        let parent = null;
        let current = this.root;

        while (current !== this.NIL) {
            parent = current;
            current = value < current.value ? current.left : current.right;
        }

        node.parent = parent;
        if (parent === null) {
            this.root = node;
        } else if (value < parent.value) {
            parent.left = node;
        } else {
            parent.right = node;
        }

        if (node.parent === null) {
            node.color = BLACK;
            return;
        }

        if (node.parent.parent === null) return;

        this._insertFix(node);
    }

    _insertFix(k) {
        while (k.parent && k.parent.color === RED) {
            if (k.parent === k.parent.parent.right) {
                const u = k.parent.parent.left;
                if (u.color === RED) {
                    u.color = BLACK;
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.left) {
                        k = k.parent;
                        this.rotateRight(k);
                    }
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    this.rotateLeft(k.parent.parent);
                }
            } else {
                const u = k.parent.parent.right;
                if (u.color === RED) {
                    u.color = BLACK;
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.right) {
                        k = k.parent;
                        this.rotateLeft(k);
                    }
                    k.parent.color = BLACK;
                    k.parent.parent.color = RED;
                    this.rotateRight(k.parent.parent);
                }
            }
            if (k === this.root) break;
        }
        this.root.color = BLACK;
    }

    // Минимум в поддереве
    minimum(node) {
        while (node.left !== this.NIL) {
            node = node.left;
        }
        return node;
    }

    // Трансплантация
    transplant(u, v) {
        if (u.parent === null) {
            this.root = v;
        } else if (u === u.parent.left) {
            u.parent.left = v;
        } else {
            u.parent.right = v;
        }
        v.parent = u.parent;
    }

    // Удаление с генерацией шагов
    deleteWithSteps(value) {
        const steps = [];
        const node = this.search(value);
        if (!node) return steps;

        // Шаг 0: начальное состояние
        this._clearLabels(this.root);
        node._highlight = true;
        node._label = 'удаляемый';
        steps.push({
            tree: this.cloneTree().serialize(),
            text: `Удаляем узел ${value}`,
            rule: ''
        });
        node._highlight = false;
        node._label = '';

        let y = node;
        let yOrigColor = y.color;
        let x;

        if (node.left === this.NIL) {
            // Случай 1: нет левого потомка
            x = node.right;
            steps.push({
                tree: this._snapshotWith(node, 'удаляемый'),
                text: `Узел ${value} не имеет левого потомка. Заменяем его правым потомком.`,
                rule: 'Случай 1: один потомок или лист'
            });
            this.transplant(node, node.right);
        } else if (node.right === this.NIL) {
            // Случай 2: нет правого потомка
            x = node.left;
            steps.push({
                tree: this._snapshotWith(node, 'удаляемый'),
                text: `Узел ${value} не имеет правого потомка. Заменяем его левым потомком.`,
                rule: 'Случай 2: один потомок'
            });
            this.transplant(node, node.left);
        } else {
            // Случай 3: два потомка
            y = this.minimum(node.right);
            yOrigColor = y.color;
            x = y.right;

            this._clearLabels(this.root);
            node._highlight = true;
            node._label = 'удаляемый';
            y._highlight = true;
            y._label = 'преемник';
            steps.push({
                tree: this.cloneTree().serialize(),
                text: `Узел ${value} имеет два потомка. Ищем преемника (минимум в правом поддереве): ${y.value}`,
                rule: 'Случай 3: два потомка'
            });
            this._clearLabels(this.root);

            if (y.parent === node) {
                x.parent = y;
            } else {
                steps.push({
                    tree: this._snapshotWith(y, 'преемник'),
                    text: `Заменяем преемник ${y.value} его правым потомком`,
                    rule: 'Трансплантация преемника'
                });
                this.transplant(y, y.right);
                y.right = node.right;
                y.right.parent = y;
            }

            this.transplant(node, y);
            y.left = node.left;
            y.left.parent = y;
            y.color = node.color;

            steps.push({
                tree: this._snapshotWith(y, 'на месте удалённого'),
                text: `Преемник ${y.value} занимает место удалённого узла ${value}, получает его цвет (${node.color === RED ? 'красный' : 'чёрный'})`,
                rule: 'Замена удалённого преемником'
            });
        }

        // Если удалённый узел (или преемник) был чёрным, нужна балансировка
        if (yOrigColor === BLACK) {
            steps.push({
                tree: this._snapshotWithDB(x),
                text: `Удалённый узел был чёрным → нарушено свойство чёрной высоты. Узел ${x.value !== null ? x.value : 'NIL'} получает «двойной чёрный» статус.`,
                rule: 'Двойной чёрный узел'
            });
            this._deleteFixWithSteps(x, steps);
        } else {
            steps.push({
                tree: this.cloneTree().serialize(),
                text: `Удалённый узел был красным — балансировка не требуется.`,
                rule: 'Свойства сохранены'
            });
        }

        // Финальное состояние
        this._clearLabels(this.root);
        steps.push({
            tree: this.cloneTree().serialize(),
            text: `Удаление узла ${value} завершено. Дерево сбалансировано.`,
            rule: 'Готово'
        });

        return steps;
    }

    _deleteFixWithSteps(x, steps) {
        while (x !== this.root && x.color === BLACK) {
            if (x === x.parent.left) {
                let w = x.parent.right; // брат

                // Случай 1: брат красный
                if (w.color === RED) {
                    this._clearLabels(this.root);
                    x._doubleBlack = true;
                    x._label = 'x (дв. чёрный)';
                    w._highlight = true;
                    w._label = 'брат (красный)';
                    steps.push({
                        tree: this.cloneTree().serialize(),
                        text: `Случай 1: брат ${w.value} — красный. Перекрашиваем брата в чёрный, родителя в красный, делаем левый поворот.`,
                        rule: 'Случай 1: красный брат'
                    });
                    this._clearLabels(this.root);

                    w.color = BLACK;
                    x.parent.color = RED;
                    this.rotateLeft(x.parent);
                    w = x.parent.right;

                    steps.push({
                        tree: this._snapshotWithDB(x),
                        text: `После поворота: новый брат — ${w.value !== null ? w.value : 'NIL'}. Продолжаем анализ.`,
                        rule: 'После поворота'
                    });
                }

                // Случай 2: брат чёрный, оба потомка брата чёрные
                if (w.left.color === BLACK && w.right.color === BLACK) {
                    this._clearLabels(this.root);
                    x._doubleBlack = true;
                    x._label = 'x';
                    w._highlight = true;
                    w._label = 'брат';
                    steps.push({
                        tree: this.cloneTree().serialize(),
                        text: `Случай 2: брат ${w.value !== null ? w.value : 'NIL'} чёрный, оба его потомка чёрные. Перекрашиваем брата в красный, поднимаем «двойной чёрный» к родителю.`,
                        rule: 'Случай 2: чёрный брат, чёрные племянники'
                    });
                    this._clearLabels(this.root);

                    w.color = RED;
                    x = x.parent;
                } else {
                    // Случай 3: правый потомок брата чёрный (левый — красный)
                    if (w.right.color === BLACK) {
                        this._clearLabels(this.root);
                        w._highlight = true;
                        w._label = 'брат';
                        w.left._highlight = true;
                        w.left._label = 'красный племянник';
                        steps.push({
                            tree: this.cloneTree().serialize(),
                            text: `Случай 3: правый потомок брата чёрный, левый — красный. Перекрашиваем левого потомка в чёрный, брата в красный, правый поворот вокруг брата.`,
                            rule: 'Случай 3: красный левый племянник'
                        });
                        this._clearLabels(this.root);

                        w.left.color = BLACK;
                        w.color = RED;
                        this.rotateRight(w);
                        w = x.parent.right;

                        steps.push({
                            tree: this._snapshotWithDB(x),
                            text: `После поворота: новый брат — ${w.value}. Переходим к случаю 4.`,
                            rule: 'Переход к случаю 4'
                        });
                    }

                    // Случай 4: правый потомок брата красный
                    this._clearLabels(this.root);
                    x._doubleBlack = true;
                    x._label = 'x';
                    w._highlight = true;
                    w._label = 'брат';
                    w.right._highlight = true;
                    w.right._label = 'красный племянник';
                    steps.push({
                        tree: this.cloneTree().serialize(),
                        text: `Случай 4: правый потомок брата ${w.right.value} — красный. Перекрашиваем брата в цвет родителя, родителя и правого потомка — в чёрный, левый поворот.`,
                        rule: 'Случай 4: красный правый племянник'
                    });
                    this._clearLabels(this.root);

                    w.color = x.parent.color;
                    x.parent.color = BLACK;
                    w.right.color = BLACK;
                    this.rotateLeft(x.parent);
                    x = this.root;
                }
            } else {
                // Зеркальные случаи
                let w = x.parent.left;

                if (w.color === RED) {
                    this._clearLabels(this.root);
                    x._doubleBlack = true;
                    x._label = 'x (дв. чёрный)';
                    w._highlight = true;
                    w._label = 'брат (красный)';
                    steps.push({
                        tree: this.cloneTree().serialize(),
                        text: `Случай 1 (зеркальный): брат ${w.value} — красный. Перекрашиваем и делаем правый поворот.`,
                        rule: 'Случай 1: красный брат'
                    });
                    this._clearLabels(this.root);

                    w.color = BLACK;
                    x.parent.color = RED;
                    this.rotateRight(x.parent);
                    w = x.parent.left;

                    steps.push({
                        tree: this._snapshotWithDB(x),
                        text: `После поворота: новый брат — ${w.value !== null ? w.value : 'NIL'}.`,
                        rule: 'После поворота'
                    });
                }

                if (w.right.color === BLACK && w.left.color === BLACK) {
                    this._clearLabels(this.root);
                    x._doubleBlack = true;
                    x._label = 'x';
                    w._highlight = true;
                    w._label = 'брат';
                    steps.push({
                        tree: this.cloneTree().serialize(),
                        text: `Случай 2 (зеркальный): оба потомка брата чёрные. Перекрашиваем брата в красный.`,
                        rule: 'Случай 2: чёрные племянники'
                    });
                    this._clearLabels(this.root);

                    w.color = RED;
                    x = x.parent;
                } else {
                    if (w.left.color === BLACK) {
                        this._clearLabels(this.root);
                        w._highlight = true;
                        w._label = 'брат';
                        w.right._highlight = true;
                        w.right._label = 'красный племянник';
                        steps.push({
                            tree: this.cloneTree().serialize(),
                            text: `Случай 3 (зеркальный): левый потомок брата чёрный. Поворот и перекраска.`,
                            rule: 'Случай 3: красный правый племянник'
                        });
                        this._clearLabels(this.root);

                        w.right.color = BLACK;
                        w.color = RED;
                        this.rotateLeft(w);
                        w = x.parent.left;

                        steps.push({
                            tree: this._snapshotWithDB(x),
                            text: `Новый брат — ${w.value}. Переходим к случаю 4.`,
                            rule: 'Переход к случаю 4'
                        });
                    }

                    this._clearLabels(this.root);
                    x._doubleBlack = true;
                    x._label = 'x';
                    w._highlight = true;
                    w._label = 'брат';
                    w.left._highlight = true;
                    w.left._label = 'красный племянник';
                    steps.push({
                        tree: this.cloneTree().serialize(),
                        text: `Случай 4 (зеркальный): левый потомок брата красный. Финальный поворот и перекраска.`,
                        rule: 'Случай 4: финальная балансировка'
                    });
                    this._clearLabels(this.root);

                    w.color = x.parent.color;
                    x.parent.color = BLACK;
                    w.left.color = BLACK;
                    this.rotateRight(x.parent);
                    x = this.root;
                }
            }
        }

        x.color = BLACK;

        if (x !== this.root || steps.length === 0) {
            steps.push({
                tree: this.cloneTree().serialize(),
                text: x === this.root
                    ? 'Двойной чёрный дошёл до корня — просто снимаем лишний чёрный.'
                    : `Узел ${x.value !== null ? x.value : 'NIL'} стал красно-чёрным → перекрашиваем в чёрный. Баланс восстановлен.`,
                rule: 'Устранение двойного чёрного'
            });
        }
    }

    _snapshotWith(node, label) {
        this._clearLabels(this.root);
        node._highlight = true;
        node._label = label;
        const snap = this.cloneTree().serialize();
        this._clearLabels(this.root);
        return snap;
    }

    _snapshotWithDB(node) {
        this._clearLabels(this.root);
        node._doubleBlack = true;
        node._label = 'двойной чёрный';
        const snap = this.cloneTree().serialize();
        this._clearLabels(this.root);
        return snap;
    }

    _clearLabels(node) {
        if (node === this.NIL || node === null) return;
        node._highlight = false;
        node._doubleBlack = false;
        node._label = '';
        this._clearLabels(node.left);
        this._clearLabels(node.right);
    }
}
