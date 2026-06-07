export class PluginManager {
    constructor(context) {
        this.context = context;        
    }

    /**
     * Регистрация плагина
     * @param {string} name - Имя плагина
     * @param {any} pluginInstance - Экземпляр (класс, объект или функция)
     * @param {string} status - "local" или "global"
     */
    reg(name, pluginInstance, status = "local") {
        const s = status === "global" ? "global" : "local";
        const data = this.context.store.plugins.data;

        // Защита: не даем локальному плагину затереть системный глобальный
        if (s === "local" && data.global[name]) {
            console.warn(`GpaOS: Локальный плагин ${name} проигнорирован, так как есть глобальный.`);
            return;
        }

        // 1. Сохраняем экземпляр
        data[s][name] = pluginInstance;

        // 2. Раздаем ждунам
        const waiters = this.context.store.plugins.waiting[name];
        if (waiters && waiters.length > 0) {
            // Копируем массив, чтобы избежать проблем при мутации во время цикла
            [...waiters].forEach(callback => callback(pluginInstance));
            // Очищаем список ожидания полностью
            delete this.context.store.plugins.waiting[name];
        }
    }

    /**
     * Подписка на плагин (Callback-style)
     */
    use(name, callback) {
        const data = this.context.store.plugins.data;
        const plugin = data.local[name] || data.global[name];

        if (plugin) {
            callback(plugin);
        } else {
            if (!this.context.store.plugins.waiting[name]) {
                this.context.store.plugins.waiting[name] = [];
            }
            this.context.store.plugins.waiting[name].push(callback);
        }
    }

    /**
     * Асинхронное получение плагина (Promise-style)
     * @param {string} name 
     * @param {number} timeout - Время ожидания в мс (0 - бесконечно)
     */
    async get(name, timeout = 0) {
        const data = this.context.store.plugins.data;
        const plugin = data.local[name] || data.global[name];

        if (plugin) return plugin;

        return new Promise((resolve, reject) => {
            let timer = null;

            // Создаем именованную функцию-обертку, чтобы её можно было удалить из очереди
            const waiterWrapper = (p) => {
                if (timer) clearTimeout(timer);
                resolve(p);
            };

            if (timeout > 0) {
                timer = setTimeout(() => {
                    this._removeWaiter(name, waiterWrapper);
                    reject(new Error(`GpaOS: Плагин [${name}] не загружен за ${timeout}ms`));
                }, timeout);
            }

            // Подписываемся на появление
            this.use(name, waiterWrapper);
        });
    }

    /**
     * Внутренний метод очистки очереди (используется при тайм-аутах)
     */
    _removeWaiter(name, callback) {
        const list = this.context.store.plugins.waiting[name];
        if (list) {
            this.context.store.plugins.waiting[name] = list.filter(cb => cb !== callback);
            // Если в очереди больше никого нет — удаляем ключ целиком
            if (this.context.store.plugins.waiting[name].length === 0) {
                delete this.context.store.plugins.waiting[name];
            }
        }
    }
}