import { Store } from "./core/store.js";
import { ggc } from "./core/ggc.js";
import { Router } from "./core/Router.js";
import { EventManager } from "./core/EventManager.js";
import { LanguageManager } from "./core/LanguageManager.js";
import { PluginManager } from "./core/PluginManager.js";
import { Repository } from "./core/Repository.js";
import { Loop } from "./core/loop.js";
import { Loader } from "./utils/Loader.js";
import { Utils } from "./utils/Utils.js";
import { Config } from "./view/Config.js";
import { View } from "./view/View.js";
import { GNDB } from "./utils/gndb.js";
import { Run } from "./core/run.js";
import { Functions } from "./core/functions.js";
import { ErrorGN } from "./core/error.js";
/**
 * Главный класс фреймворка
 */
class GiannaFramework {
    constructor() {
        this.cache = true; // Включили кеширование. Если указать false, браузер не сможет кешировать.
this.store = Store;
this.ggc = ggc(this);

this.router = new Router(this);
this.event = new EventManager(this);

this.languageManager = new LanguageManager(this);
this.plugin = new PluginManager(this);
this.repository = new Repository(this);
this.loop = new Loop(this);
this.loader = new Loader(this);
this.utils = new Utils(this);
this.config = new Config(this);
this.view = new View(this);
this.db = new GNDB();
this.run = new Run(this);
this.functions = new Functions(this);
this.error = new ErrorGN();
    }
/*
 * Загрузка конфигурационного файла
 */
async loadConfig(path) {
    if (typeof path==="object") {
this.store.config = path;
    } else {
this.store.config = await this.loader.json(path);
    }
let len = this.store.config.lang.length;
let type = null;
if (len==2) {
type = "default";
} else if (len==5) {
type = "region";
}
await this.languageManager.initLang(type);
}
async loadRouter(path) {
let a = await this.loader.json(path);
this.store.router = a;
}
setServiceWorker(file,path)  {
if ('serviceWorker' in navigator) {

    const swUrl = file;

    // Сразу регистрируем, без всяких 'load'
    navigator.serviceWorker.register(swUrl, { scope: path })
        .then(registration => {
            // console.log('Область действия (scope):', registration.scope);
        })
        .catch(error => {
            console.error('Error reg service worker: ', error);
        });
} else {
    console.error("error service worker");
}



}


}
export const $gianna = new GiannaFramework();
export const $gn = $gianna;
