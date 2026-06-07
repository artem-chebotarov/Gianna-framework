export class RegexConfigParser {
    constructor(context) {
        this.context = context;
    }

    parse(configString) {
        // 1. Парсинг <request ... />
        // Сразу создаем структуру с null, чтобы она всегда была в ответе
        let requestConfig = { url: null, data: null };
        
        const reqMatch = configString.match(/<\s*request[^>]*\/?>/i);
        
        if (reqMatch) {
            // Если тег найден, перезаписываем null на значения атрибутов (или оставляем null, если атрибута нет)
            requestConfig.url = this._getAttr(reqMatch[0], 'url');
            requestConfig.data = this._getAttr(reqMatch[0], 'gn-data');
        }

        // 2. Парсинг <lang src="..." name="..." />
        const langMatch = configString.match(/<\s*lang[^>]*\/?>/i);
        const langData = langMatch ? {
            src: this._getAttr(langMatch[0], 'src'),
            name: this._getAttr(langMatch[0], 'name')
        } : null;

        // 3. Парсинг <js><file ... /></js>
        let jsFiles = [];
        const jsBlock = configString.match(/<\s*js\s*>([\s\S]*?)<\/\s*js\s*>/i);

        if (jsBlock) {
            const files = jsBlock[1].matchAll(/<\s*file[^>]*\/?>/gi);
            for (const f of files) {
                jsFiles.push({
                    src: this._getAttr(f[0], 'src'),
                    type: this._getAttr(f[0], 'type')
                });
            }
        }

        // 4. Парсинг <run name="func1, func2" />
        let runFunctions = [];
        const runMatch = configString.match(/<\s*run[^>]*\/?>/i);
        
        if (runMatch) {
            const rawNames = this._getAttr(runMatch[0], 'name');
            if (rawNames) {
                runFunctions = rawNames
                    .split(',')
                    .map(name => name.trim())
                    .filter(name => name.length > 0);
            }
        }

        return { 
            request: requestConfig, // Теперь это ВСЕГДА объект {url:..., data:...}
            lang: langData, 
            js: jsFiles,
            run: runFunctions 
        };
    }

    _getAttr(tag, name) {
        const regex = new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i');
        const match = tag.match(regex);
        return match ? match[1] : null;
    }
}