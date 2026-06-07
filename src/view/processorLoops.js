import { AttributeMatcher } from "../utils/AttributeMatcher.js";
/**
 * Класс, управляющий <gn-loop>
 */
export class ProcessorLoops {
    /**
     * @param context - глобальный объект фреймворка
     * @param content - ссылка на <gn-loop>
     */
    constructor(context,content) {
        this.context = context;
        this.content = content;
    }
    /**
     * Запуск обработки цикла
     */
async init() {
let loops = this.content.querySelectorAll("gn-loop");
if (loops.length==0) return;
for (let i=0; i<=loops.length-1; i++) {
await this.gnLoop(loops[i]); // обработка <gn-loop>
}
return;
}
/**
 * Решающий роутер, который запускает цикл
 */
async gnLoop(l) {
let gnData = await this.gnData(l); // обработанные и подготовленные данные из атрибутов
if (isNaN(gnData['start']) && isNaN(gnData["end"])) {} else { await this.gnFor(gnData,l);}
if (gnData["url"]!=null) { await this.requestLoop(gnData,l); }
if (gnData['array']!=null) { await this.requestLoop(gnData,l);}
}
/**
 * метод запускает цикл по обработке массива.
 */
async requestLoop(gn,l) {
    let resp = null; // переменная для массива
    let defaultLoop = null;
if (gn['array']!=null) { // если есть атрибут gn-array
     defaultLoop = this.context.loop.get(gn['array']);
     defaultLoop["template"] = gn['template'];
     defaultLoop['value'] = gn['value'];
resp = defaultLoop.elements; // найден массив в хранилище
} else { // делаем запрос к серверу
    resp = await this.context.loader.json(gn.url);
}
// подготовка для обработки gn-continue-* gn-break-*
let attributeMatcherContinue = new AttributeMatcher("gn-continue-",l);
let attributeMatcherBreak = new AttributeMatcher("gn-break-",l);
    let fragment = new DocumentFragment(); // оболочка для данных
    let tmp = this.tmpReplaceMatch(gn);
    if (resp===undefined) return;
for (let i=0; i<=resp.length-1; i++) {
        let currentData = (typeof resp[i] === 'object' && resp[i] !== null) 
                      ? resp[i] 
                      : { value: resp[i] };

if (attributeMatcherBreak.match(currentData)) break;
if (attributeMatcherContinue.match(currentData)) continue;    

let rk = await this.context.utils.replaceAtCode(tmp,currentData);
let format = await this.context.utils.format(rk);
let stringToDOM = await this.context.utils.stringToDOM(format);
let element = stringToDOM.querySelector("input, option");
if (element) {
    if (element.tagName.toLowerCase()=="option" && element.getAttribute("gn-match")!=null && element.getAttribute("gn-match")==element.value) {
        element.setAttribute("selected","true");
    } else if (element.tagName.toLowerCase()=="input" && element.getAttribute("type")=="radio" && element.getAttribute("gn-match")!=null && element.getAttribute("gn-match")==element.value) {
        element.setAttribute("checked","true");
    }
element.removeAttribute("gn-match");
}
fragment.appendChild(stringToDOM);

}
 l.parentNode.appendChild(fragment);
 l.remove();
}
tmpReplaceMatch(gn) {
        if (gn.value!=null) {
        return gn.template.replace("gn-match=\"*\"","gn-match=\""+gn.value+"\"");
    } else {
     return gn.template;
    }
}
/**
 * Метод выполняет цикл for из шаблона.
 * @param gn - объект обработанных входящих данных
 * @param l - ссылка на найденный цикл в шаблоне
 * @param template - ссылка на <template>
 */
async gnFor(gn,l) {
    let fragment = new DocumentFragment(); // фрагмент сборник
    let tmp = this.tmpReplaceMatch(gn);
    // Запускаем утилиту цикла с callback
    await this.context.utils.gnFor({
start: gn.start, end: gn.end, step: gn.step, continue: gn.continue, break: gn.break
    },
async (i) => {
let rc = await this.context.utils.replaceAtCode(tmp,{value: i}); // заменили @{key=value}

let format = await this.context.utils.format(rc); // заменили все at codes
let dom = await this.context.utils.stringToDOM(format); // строку превратили в DOM

// обработка gn-match
let element = dom.getAttribute("gn-match")!=null ? dom : dom.querySelector("[gn-match]");
if (element && parseInt(element.getAttribute("gn-match"))==i) {
if (element.tagName.toLowerCase()=="option") { element.setAttribute("selected","true");}
else { element.setAttribute("checked","true");}
element.removeAttribute("gn-match");
}
fragment.appendChild(dom);

});
l.parentNode.appendChild(fragment);
l.remove();
}







async gnData(l) {
    let tpl = l.getAttribute("gn-template")==null ? null : await this.context.loader.xml(l.getAttribute("gn-template"));
    this.context.utils.searchParserError(tpl,l.getAttribute("gn-template"));

let data = {};
data.template = tpl.documentElement.innerHTML;
data.start = parseInt(l.getAttribute("gn-start"));
data.end = parseInt(l.getAttribute("gn-end"));
data.step = parseInt(l.getAttribute("gn-step"));
data.continue = l.getAttribute("gn-continue")==null ? null : JSON.parse(l.getAttribute("gn-continue"));
data.type = l.getAttribute("gn-type");
data.break = parseInt(l.getAttribute("gn-break"));
data.url = l.getAttribute("gn-url");
data.array = l.getAttribute("gn-array");
data.value = l.getAttribute("gn-value");
return data;
}
}


