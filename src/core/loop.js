export class Loop {
constructor(context) {
    this.context = context;
}
set(name,arr,status = "local") {
this.context.store.loops[status][name] = {
    template: null,
   elements: arr,
   value: null
   };    
}
get(name) {
let l = this.context.store.loops;
return l.local[name] || l.global[name];
}
remove(name,status = "local") {
 let l =  this.context.store.loops;   
 delete l[status][name];
}
}