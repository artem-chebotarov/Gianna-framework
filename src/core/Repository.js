export class Repository {
    constructor(context) {
        this.context = context;
    }
    
    set(name,obj,s = "local") {
let status;
if (s==="local" || s==="global") {
    status = s;
} else {
    status = "local";
}
this.context.store.repository[status][name] = obj;
    }
    get(key) {
        let r = this.context.store.repository;
        return r.local[key] || r.global[key] || undefined;
    }
    remove(key) {
        let r = this.context.store.repository;
        if (r.local[key]!==undefined) {
delete r.local[key];
        } else if (r.global[key]!==undefined) {
delete r.global[key];
        }
    }
}