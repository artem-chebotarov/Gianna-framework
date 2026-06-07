import { Utils } from "./Utils.js";
export class AttributeMatcher {
    /**
     * @param {string} type - Префикс атрибута (например, "gn-continue-")
     * @param {HTMLElement} element - Элемент для парсинга
     */
    constructor(type, element) {
        this.type = type;
        this.element = element; // переименовала l в element для понятности
        this.data = {};
        this.init();
    }
    /* Получаем чистое имя поля, отрезая префикс */
    getName(attributeName) {
        // Динамически отрезаем длину префикса
        return attributeName.slice(this.type.length);
    }

    /* Превращаем строку "1, 5, Admin" в массив [1, 5, "Admin"] */
    getValue(valueString) {
        return valueString
            .split(",")
            .map(item => Utils.typeCuster(item.trim()));
    }

    init() {
        for (const attr of this.element.attributes) {
            // Проверяем, начинается ли атрибут с нужного префикса
            if (attr.name.startsWith(this.type)) {
                let cleanName = this.getName(attr.name).trim();
                this.data[cleanName] = this.getValue(attr.value);
            }
        }
    }

    /* Проверка: Возвращает true, если ХОТЯ БЫ ОДНО правило сработало.
       (Логика ИЛИ). Для continue это подходит: "пропусти если ID=1 ИЛИ Name=Admin"
    */
    match(candidateObject) {
        // Перебираем наши ПРАВИЛА, а не поля объекта
        for (let ruleKey in this.data) {
            // Если в объекте есть такое поле
            if (candidateObject.hasOwnProperty(ruleKey)) {
                let candidateValue = candidateObject[ruleKey];
                // Проверяем вхождение
                if (this.data[ruleKey].includes(candidateValue)) {
                    return true;
                }
            }
        }
        return false;
    }
}
