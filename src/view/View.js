import { Config } from "./Config.js";
import { ProcessorLoops } from "./processorLoops.js";
import { RegexConfigParser } from "../utils/RegexConfigParser.js";
import { Utils } from "../utils/Utils.js";
export class View {
constructor(context) {
   this.context = context;
    this.rcp = new RegexConfigParser(context);
}
  dom(selector) {
          let el = document.querySelectorAll(selector);
      return el.length > 1 ? el : el[0];
  }

async processConditions(content) {
let gnIF = content.querySelectorAll("[gn-if]");
if (gnIF && gnIF.length!=0) {
   for (let c of gnIF) {
      let checkif = Utils.checkIf(c.getAttribute("gn-if"));
      if (checkif) {
c.removeAttribute("gn-if");
      } else {
c.remove();
      }
   }
}    
}
async load(file) {
   let datametafile = file;
   // Вызываем файл шаблон
   let template = await this.context.utils.format(await this.context.loader.text(datametafile));

// обработка <config>
let rcp = this.rcp.parse(template);
let config = new Config(this.context);
await config.processorConfig(rcp);

// Далее вызываем request.
if (rcp.request.url!=null) {
let rk = await this.context.loader.json(rcp.request.url);
template = await this.context.utils.replaceAtCode(template,rk);
} else if (rcp.request.data!=null) {
let rk = this.context.repository.get(rcp.request.data);
template = await this.context.utils.replaceAtCode(template,rk);
} 



let template24 = await this.context.utils.format(template);

let d = new DOMParser();
let x = d.parseFromString(template24,"text/xml");
let parsererror = x.querySelector("parsererror");
if (parsererror) {
   throw {path: "View.load",message: parsererror.textContent};
}
let meta = x.querySelector("meta");
config.meta(meta);

let q = x.querySelector("content");
if (q) {
   this.context.run.reg(rcp.run);
   return q;
} else {
   return x.documentElement;
}
}
/**
 * Отрисовка шаблона.
 * Метод принимает данные для вызова и вставки шаблона.
 * @param selector: string - селектор html элемента. может принять null
 * @param file: string - файл шаблона *.gtpl
 * @param clear: boolean - true очистить селектор перед ставкой. false - просто добавить в конец
 */
async render(selector,file,clear) {
let element = null;
if (selector!=null) {
element = this.dom(selector); // получаем элемент
} else {
   element = document.createElement("div");
}
if (!element) { // элемент не найден
   throw {"Render": "The selector '"+selector+"' is missing."};
}
/*
Вызываем шаблон. но в начале инициируем переменную для шаблона 
*/

   let template = await this.load(file);
// Далее проверяем индекатор для очистки. true, тогда чистим. false, оставляем всё как есть.
if (clear) element.innerHTML = "";
let pl = new ProcessorLoops(this.context,template); await pl.init(); // Обработка циклов
await this.processConditions(template);
let strToDOM = await this.context.utils.stringToDOM(template.innerHTML);
if (selector!=null) {
element.appendChild(strToDOM);
let gnFocus = document.querySelector(`[gn-focus="true"]`);
if (gnFocus) {
gnFocus.setAttribute("tabindex","0");
gnFocus.focus();
}
this.checkedSelect();
this.context.run.exec(); // запускаем функции для выполнения.

} else {
   return strToDOM;
}
}
checkedSelect() {
   let elements = document.querySelectorAll(`select[gn-select]`);
   if (elements.length<=0) {
      return;
   }
for (let i=0; i<=elements.length-1; i++) {
elements[i].value = elements[i].getAttribute("gn-select");
elements[i].removeAttribute("gn-select");
   }

}


}