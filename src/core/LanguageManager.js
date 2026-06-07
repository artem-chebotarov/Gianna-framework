export class LanguageManager {
 constructor(context) {
this.context = context;
 }   
 async langLocalRegion()  {
      let uri = window.location.pathname.split("/").filter(Boolean); // получаем массив uri
      if (uri.length == 0) { // если uri пуст
        this.context.store.language.lang = this.context.store.config.lang;
        return;
      }
      let lang = uri[0].toLowerCase(); // возьмём первый элемент uri
      if (lang == this.context.store.config.lang) window.location.href = "/"; // если совпал язык по умолчанию, тогда выбросить на главную страницу.
      // проверка, чтобы ровно пять символа были
      if (lang.length > 5 || lang.length < 5) {
        this.context.store.language.lang = this.context.store.config.lang;
      }
      // Далее проверяем существование языка в конфигурации.
      if (this.context.store.config.languages[lang]?.length > 0 && this.context.store.config.languages[lang] !== undefined) {
        this.context.store.language.lang = lang;
        this.context.store.language.uri = "/" + lang;
      }
      else {

        this.context.store.language.lang = this.context.store.config.lang;
      }
    }
    async langDefault()  {
      let uri = window.location.pathname.split("/").filter(Boolean); // получаем массив uri
      if (uri.length == 0) { // если uri пуст
        this.context.store.language.lang = this.context.store.config.lang;
        return;
      }
      let lang = uri[0].toLowerCase(); // возьмём первый элемент uri
      if (lang == this.context.store.config.lang) window.location.href = "/"; // если совпал язык по умолчанию, тогда выбросить на главную страницу.
      // проверка, чтобы ровно два символа были
      if (lang.length > 2 || lang.length < 2) {
        this.context.store.language.lang = this.context.store.config.lang;
      }
      // Далее проверяем существование языка в конфигурации.
      if (this.context.store.config.languages[lang]?.length > 0 && this.context.store.config.languages[lang] !== undefined) {
        this.context.store.language.lang = lang;
        this.context.store.language.uri = "/" + lang;
      }
      else {

        this.context.store.language.lang = this.context.store.config.lang;
      }
    }
 async initLang(t = "default")  {
      if (t.toLowerCase() == "local-region") {
        await this.langLocalRegion();
      } else {
        await this.langDefault();
      }
    }


}