export class EventManager {
    constructor(context) {
        this.context = context;
        this.init();
    }
    set(type,name,callback,isGlobal = false) {
        let scope = isGlobal ? "global" : "local";
Object.assign(this.context.store.on[type][scope], {[name]: callback});
    }
    remove(type,name,isGlobal = false) {
        let scope = isGlobal ? "global" : "local";
delete this.context.store.on[type][scope][name];
    }
init() {
    this.click();
    this.input();
    this.change();
    this.submit();
 this.pop();   
}
pop() {
window.addEventListener("popstate",(e) => {
this.context.router.load({click:false,uri:window.location.pathname+window.location.search});
},"global");
}
click() {
    document.addEventListener("click",async (e) => {
let element = e.target.closest("[gn-click], [href]");
if (element==null) return;
let tagName = element.tagName.toLowerCase();
if (tagName=="a" && (element.getAttribute("gn-link-skip")?.toLowerCase()=="true" || element.getAttribute("target")?.toLowerCase()=="_blank")) return;
e.preventDefault();
if (element.getAttribute("href")!=null) {
    await this.context.router.load({click: true,uri: element.getAttribute("href")});
} else {
    let handle = this.context.store.on.click;
    let fun = handle.local[element.getAttribute("gn-click")] || handle.global[element.getAttribute("gn-click")];
    if (typeof fun=="function") {
        await fun(e);
    }
}
    },"global");
}
submit() {
document.addEventListener("submit",async (event) => {
    event.preventDefault();
let form = event.target.getAttribute("gn-submit");
let handler = this.context.store.on.submit;
let fun = handler.local[form] || handler.global[form];
if (typeof fun==="function") {
await fun(event);
}
},"global");
}
input() {
document.addEventListener("input",(e) => {
let input = e.target.getAttribute("gn-input");
let handler = this.context.store.on.input;
let fun = handler.local[input] || handler.global[input];
if (typeof fun==="function") {
    fun(e);
}
},"global");
}
change() {

}

}