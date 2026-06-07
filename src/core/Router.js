export class Router {
    constructor(context) {
        this.context = context;
}
getUri() {
    const fullUrl = window.location.href; 
    const url = new URL(fullUrl);
        return url.pathname;
}
getLang() {
    return this.context.store.language.lang;
}
getLangUri() {
    return this.context.store.language.uri;
}
getQueryString() {
    return this.context.store.get_param;
}
delLang(str) {
    let uri = str.replace(this.context.store.language.uri,"");
return uri;
}
getUriDefault() {
return window.location.pathname+""+window.location.search;
}
async load(obj) {
    // this.context.ggc.clear(); // Очистка и уборка грязи.

    if (obj.click==true) this.context.utils.setHistory(obj.uri || this.getUriDefault());
let content = this.get(this.delLang(obj?.uri?.split("?")[0] || this.getUriDefault().split("?")[0]));
await this.context.view.render(this.context.store['settings']['ui']['content'],content,true);
}
set(path,file) {
    Object.assign(this.context.store.router, {[path]: file});
}
get(path) {
let uri = this.context.store.router[this.delLang(path)];

if (uri==undefined) throw {"location": "core/Router.get","message": "404 - not found ("+path+")"};
return uri;    
}


}