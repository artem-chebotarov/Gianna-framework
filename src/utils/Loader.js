export class Loader {
    /**
     * @param {string} baseUrl - Базовый URL, например "https://api.mysite.com"
     */
    constructor(context) {
        this._baseUrl = "";
        this._headers = {}; // Глобальное хранилище заголовков
        this.context = context;
        this.now = Date.now();
    }
    async js(script,context) {
        let path = !context.cache ? script.src+"?v="+this.now : script.src;
try {
let module = await import(path);
if (typeof module.install === "function") {
await module.install(context);
} 

} catch(error) {
    this.context.error.send(error);
    console.error(error);
}
    }
/**
 * сеттер для редактирования api BaseUrl
 */
setBaseUrl(url) {
           this._baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
}
    // --- УПРАВЛЕНИЕ ЗАГОЛОВКАМИ ---

    /**
     * Добавить глобальный заголовок (токен, язык и т.д.)
     */
    addHeader(key, value) {
        this._headers[key] = value;
    }

    /**
     * Удалить глобальный заголовок
     */
    removeHeader(key) {
        delete this._headers[key];
    }

    // --- ВНУТРЕННЕЕ ЯДРО (ПРИВАТНОЕ) ---

    async _request(url, method, data, customHeaders = {}, expectedType = 'auto') {
        let fullUrl;

        // --- УМНАЯ ПРОВЕРКА URL ---
        // Проверяем: это абсолютный адрес (http/https)?
        if (/^https?:\/\//i.test(url)) {
            // Если да — используем его как есть, игнорируя baseUrl
            fullUrl = url;
        } else {
            // Если нет — клеим к базовому
            // Добавляем слэш, если его нет в начале пути
            const path = url.startsWith('/') ? url : '/' + url;
            fullUrl = this._baseUrl + path;
        }
                
        // 1. Слияние заголовков (Глобальные + Специфичные для запроса)
        const combinedHeaders = Object.assign({}, this._headers, customHeaders);
        const headers = new Headers(combinedHeaders);
        
        let body = null;

        // 2. Подготовка тела запроса (Body)
        if (data) {
            if (data instanceof FormData) {
                body = data;
                headers.delete('Content-Type'); // Браузер сам поставит boundary
            } 
            else if (data instanceof HTMLFormElement) {
                body = new FormData(data);
                headers.delete('Content-Type');
            } 
            else if (typeof data === 'object') {
                body = JSON.stringify(data);
                if (!headers.has('Content-Type')) {
                    headers.set('Content-Type', 'application/json');
                }
            } 
            else {
                body = data; // Строка или Blob
            }
        }

        // 3. Выполнение запроса
        try {
let pathurl = this.context.cache ? fullUrl : fullUrl+"?v="+this.now;
            const response = await fetch(pathurl, {
                method: method,
                headers: headers,
                body: (method !== 'GET' && method !== 'HEAD') ? body : null
            });

            // Обработка статуса (4xx, 5xx - это ошибка)
            if (!response.ok) {
                // Пытаемся прочитать текст ошибки от сервера
                const errorText = await response.text();
                let errorBody = errorText;
                try { errorBody = JSON.parse(errorText); } catch(e) {}

                throw {
                    ok: false,
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                    data: errorBody
                };
            }

            // 4. Парсинг ответа
            // Если мы явно ждем XML, используем парсер
            if (expectedType === 'xml') {
                const text = await response.text();
                const parser = new DOMParser();
                return parser.parseFromString(text, "text/xml");
            }
            
            // Если мы явно ждем Blob
            if (expectedType === 'blob') {
                return await response.blob();
            }

            // Если мы явно ждем Text
            if (expectedType === 'text') {
                let responseText = await response.text();
                return responseText;
            }

            // Если expectedType === 'json' или 'auto'
            // Смотрим на Content-Type ответа
            const contentType = response.headers.get('Content-Type') || '';

            if (expectedType === 'json' || contentType.includes('application/json')) {
                const text = await response.text();
                try {
                    return text ? JSON.parse(text) : null;
                } catch (e) {
                    // Если обещали JSON, а пришел мусор — кидаем ошибку
                    if (expectedType === 'json') throw new Error("Invalid JSON response. "+url);
                    return text; // Если 'auto' — возвращаем как текст
                }
            }
            
            // Фолбэк для всего остального
            return await response.text();

        } catch (error) {
            // Пробрасываем ошибку наружу
            throw error;
        }
    }

    // --- ПУБЛИЧНЫЕ МЕТОДЫ ---

    /**
     * Загрузить JSON.
     * @param {string} url 
     * @param {object|null} data - Данные для отправки. Если переданы, метод станет POST (если не указан другой).
     * @param {string} method - 'GET', 'POST', 'PUT', 'DELETE'.
     */
    async json(url, data = null, method = 'GET') {
        // Авто-переключение на POST, если есть данные и метод дефолтный
        const finalMethod = (data && method === 'GET') ? 'POST' : method;
        
        return this._request(
            url, 
            finalMethod, 
            data, 
            { 'Accept': 'application/json' }, 
            'json'
        );
    }

    /**
     * Загрузить Текст/HTML.
     */
    async text(url, data = null, method = 'GET') {
        const finalMethod = (data && method === 'GET') ? 'POST' : method;
        return this._request(url, finalMethod, data, {}, 'text');
    }

    /**
     * Загрузить XML.
     * Возвращает XMLDocument.
     */
    async xml(url, data = null, method = 'GET') {
        const finalMethod = (data && method === 'GET') ? 'POST' : method;
        return this._request(url, finalMethod, data, {}, 'xml');
    }

    /**
     * Загрузить Файл (Blob) - картинку, PDF и т.д.
     */
    async blob(url, data = null, method = 'GET') {
        const finalMethod = (data && method === 'GET') ? 'POST' : method;
        return this._request(url, finalMethod, data, {}, 'blob');
    }
}