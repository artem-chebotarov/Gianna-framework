export class Functions {
constructor(context) {
    this.context = context;``
}
set(name,callback,s = "local") {
let status;
if (s==="local" || s==="global") {
    status = s;
} else {
   status = "local"; 
}
this.context.store.functions[status][name] = callback;
}
get(name) {
    let f = this.context.store.functions;
    return f.local[name] || f.global[name] || undefined;
}
remove(name) {
    let f = this.context.store.functions;
    if (f.local[name]!==undefined) {
        delete f.local[name];
        return;
    } else if (f.global[name]!==undefined) {
        delete f.global[name];
        return;
    }
}
}