export class Utils {
    constructor(context) {
      this.context = context;
    }
    // Регистрируем утилиту в твоём фреймворке
nl2br(target,lang) {
    if (!(target instanceof HTMLElement)) {
        console.error("Gianna.js Error: target is not an HTMLElement");
        return;
    }
    const s = target.style;
    s.whiteSpace = 'pre-wrap';       // Сохраняем переносы строк
    s.hyphens = 'auto';              // Умные переносы по слогам
    s.webkitHyphens = 'auto';        // Поддержка Safari/iOS
    s.overflowWrap = 'break-word';   // Защита от вылета длинных слов    
    target.setAttribute('lang', lang);
};
    /**
 * Заменяет @{key=...} на значения из объекта, поддерживая вложенность (dot notation).
 * @param {string} content - Строка с "at codes"
 * @param {object} data - Объект с данными (ключ-значение)
 * @returns {string} - Готовая строка
 */
async replaceAtCode(content, data) {
    if (typeof content !== 'string') return "";
    if (!data || typeof data !== 'object') return content;

    const regex = /@\{key=([^}]+)\}/g;

    return content.replace(regex, (match, keyName) => {        
        const cleanKey = keyName.trim();
        
        // 1. Разбиваем ключ на части по точке
        const path = cleanKey.split('.');
        
        let current = data;

        // 2. Проходимся вглубь объекта
        for (let i = 0; i < path.length; i++) {
            const k = path[i];

            // Проверяем, есть ли такой ключ на текущем уровне
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                // Если путь оборвался (ключа нет) — возвращаем исходную строку @{...}
                return undefined;
        }   
        }

        // 3. Возвращаем найденное значение
        // Если это объект, может потребоваться JSON.stringify(current), но обычно там строка/число
        return current;
    });
};
    searchParserError(xml,path,className,method) {
let parser = xml?.querySelector("parsererror")
if (parser) {
let text = parser.innerHTML.replace(window.location.href,path);
throw {class: className,method: method,status: 400,statusText: "BAD REQUEST",message: text};
} else {
  return null;
}
    }
    async gnFor(options,callback) {
    const start = options.start;
    const end = options.end;
    const stopPoint = options.break;
    
    const skipSet = new Set(options.continue || []);
     let step = isNaN(options.step)? 1 : options.step;
     for (let i=start; end>start ? i<=end : i>=end; end>start ? i += step : i -= step) {
      
        if (i === stopPoint) break;
        if (skipSet.has(i)) {
            continue;
        }
        if (typeof callback === 'function') {
            await callback(i);
        }
        
    }
}
getParam() {
        return Object.fromEntries(new URLSearchParams(window.location.search));
}
setHistory(url) {
  history.pushState({ page: 1 }, "", url);
  this.context.store.get_param = this.getParam();
}
    // Строку превращаем в DOM
    async stringToDOM(str) {
      let template = document.createElement("template");
      template.innerHTML = ""+str+"";
      return template.content;
}
/**
 * Получаем сегмент uri  по номеру
 */
getSegment(n) {
let pathname = window.location.pathname.split("/").filter(Boolean);
let l = this.context.store.language.uri.length;
if (l!=0) {
let p = n+1;
return pathname[p];

}  else {
return pathname[n];  
}
}


    connectFunction(val) {
      const regex = /^([a-zA-Z0-9_]+)\((.*)\)$/;
const match = val.match(regex);
if (match) {
  let name = match[1];

let arg = match[2];
let fun = this.context.functions.get(name);

if (fun && typeof fun === "function") {
let args = arg.split(",").map(a => {
return this.constructor.typeCuster(a.trim());
});
return fun(...args);
} else {
  return val;
}
} else {
  return val;
}
    }
    word(w) {
    // 1. Точка входа — всегда packages
    let current = this.context.store.language.packages;

    // Базовые проверки, чтобы не упало
    if (!current || !w) return undefined;

    // 2. Разбиваем ключ "blog.meta.author" -> ["blog", "meta", "author"]
    const path = w.split('.');

    // 3. Тупо идем по шагам
    for (let i = 0; i < path.length; i++) {
        const key = path[i];

        // Если ключа нет — останавливаемся
        if (current[key] === undefined) {
            return undefined; 
        }
        
        // Спускаемся на уровень ниже
        current = current[key];
    }

    // 4. Возвращаем то, что нашли в конце пути (строку или объект)
    return current;
}
getValueByProperty(store, val) {
    return val.split('.').reduce((obj, key) => {
        return (obj && obj[key] !== undefined) ? obj[key] : undefined;
    }, store);
}
async format(t) {
    if (!t) return '';

    // ИЗМЕНЕНИЕ 1: Регулярка теперь ищет [^{}]+ 
    // Это значит: ищи тег, внутри которого НЕТ фигурных скобок.
    // Это гарантирует, что мы всегда сначала найдем самый глубокий @{key=temp_c}, 
    // а не внешний @{function...
    const regex = /@\{(\w+)(?:=([^{}]+))?\}/g;

    let processingText = t;
    let hasMatches;
    
    // Защита от бесконечного цикла (на всякий случай)
    let loopSafety = 0; 
    const MAX_LOOPS = 10;

    // ИЗМЕНЕНИЕ 2: Цикл "Пока есть что заменять"
    do {
        hasMatches = false;
        const asyncReplacements = [];

        // 1. СИНХРОННЫЙ ПРОХОД (находим и заменяем простые вещи)
        // Обрати внимание: мы работаем с processingText, который обновляется на каждой итерации
        let currentPassText = processingText.replace(regex, (match, type, value) => {
            hasMatches = true; // Ага, что-то нашли, значит нужен будет еще один проход
            
            // Если value undefined, делаем пустой строкой, чтобы trim не падал
            const val = value ? value.trim() : "";

            switch (type) {
                case 'lang':
                    return this.context.store.language.lang;
                case 'lang_uri':
                    return this.context.store.language.uri;
                case 'word':
                    return this.word(val) || match;
                case 'segment':
                    return this.getSegment(val) || match;
                case 'property':
                    return this.getValueByProperty(this.context.store, val) || `${match}`;
                case 'get':
                    return  this.context.store.get_param[val] || undefined;
                case 'function':
                    // Теперь сюда попадет уже чистое значение "temp(значение_c)",
                    // так как внутренний цикл уже отработал
                    return this.connectFunction(val);
                
                case 'path':
                    // Path пока оставляем, но помечаем для асинхронности
                    // Важно: path может содержать вложенность, но пока он самый глубокий - ок.
                    asyncReplacements.push({ fullMatch: match, path: val });
                    return match; 

                default:
                    // Если тип не знаем, считаем, что замены не было
                    // Но чтобы цикл не зациклился на неизвестном теге,
                    // можно либо возвращать match, либо как-то метить.
                    // Для безопасности считаем match, но флаг hasMatches сбрасываем?
                    // Нет, лучше оставить как есть, но если ничего не поменялось - цикл сам остановится,
                    // если мы будем проверять изменение текста, а не просто вход в replace.
                    return match;
            }
        });

        // 2. АСИНХРОННЫЙ ПРОХОД (если были paths)
        if (asyncReplacements.length > 0) {
            const promises = asyncReplacements.map(async item => {
                try {
                    // Важно: здесь тоже рекурсивно может быть вызван render -> format
                    const domElement = await this.context.view.render(null, item.path, true);
                    const serializer = new XMLSerializer();
let result = serializer.serializeToString(domElement);
                    return { fullMatch: item.fullMatch, result: result };
                } catch (error) {
                    console.log(error);
                    return { fullMatch: item.fullMatch, result: item.fullMatch };
                }
            });

            const resolvedReplacements = await Promise.all(promises);

            for (const item of resolvedReplacements) {
                // Заменяем только если результат отличается
                if (item && item.result !== item.fullMatch) {
                   currentPassText = currentPassText.replace(item.fullMatch, item.result);
                   hasMatches = true; 
                }
            }
        }

        // Если текст не изменился за проход, значит мы уперлись (например, неизвестный тег)
        if (currentPassText === processingText) {
            hasMatches = false;
        } else {
            processingText = currentPassText;
        }

        loopSafety++;

    } while (hasMatches && loopSafety < MAX_LOOPS);

    return processingText;
}
 error(name,message) {
   let e = new Error(message);
   e.name = name;
   return e;
 }
 static checkIf(str) {
    if (!str) return false; 
    
    // Парсим строку: ЛеваяЧасть Оператор ПраваяЧасть
    const match = str.trim().match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);

    // Если оператора нет (например gn-if="true"), просто кастим значение
    if (!match) {
        return Boolean(this.typeCuster(str.trim()));
    }

    // Разбираем и прогоняем через typeCuster (он превратит "5" в 5, "null" в null)
    let left  = this.typeCuster(match[1].trim());
    let op    = match[2].trim();
    let right = this.typeCuster(match[3].trim());

    switch (op) {
        case '==': return left == right;
        case '!=': return left != right;
        case '>':  return left > right;
        case '<':  return left < right;
        case '>=': return left >= right;
        case '<=': return left <= right;
        default: return false;
    }
}
static typeCuster(str) {
    if (typeof str !== "string") return str;
    // Оптимизация: сразу отсекаем пустые строки, если нужно
    let lowercase = str.toLowerCase().trim();
    if (lowercase === "true") return true;
    if (lowercase === "false") return false;
    if (lowercase === "null") return null;
    if (lowercase === "undefined") return undefined;
    if (lowercase === "infinity") return Infinity;
    if (lowercase === "-infinity") return -Infinity;
    if (lowercase === "nan") return NaN;
    if (lowercase !== "" && !isNaN(lowercase)) return Number(lowercase);
    return str; // Возвращаем исходную строку, если это просто текст
}



}