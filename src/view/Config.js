export class Config {
    constructor(context) {
        this.context = context;
    }
async processorConfig(regexData) {
if (regexData.lang!=null) await this.lang(regexData.lang);
if (regexData.js!=null) await this.js(regexData.js);
}
async js(f) {
for (let i=0; i<=f.length-1; i++) {
  let jsScript = {
src: f[i].src.trim()
  }
await this.context.loader.js(jsScript,this.context);  
}
}
async meta(m) {
  if (m) {
let title = m.querySelector("title");
document.title = title.getAttribute("value");

  }
}
async lang(l) {
let lang_path = l.src.replace("*",this.context.store.language.lang);
let var_name = l.name;
if (this.context.store.language.packages[var_name]) { return; }
let a = await this.context.loader.json(lang_path);
Object.assign(this.context.store.language.packages,{[var_name]: a});
return;
}

}