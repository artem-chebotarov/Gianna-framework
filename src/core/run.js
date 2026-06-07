export class Run {
    constructor(context) {
        this.context = context;
    }
    set(name, callback,s = "local") {
        let status;
        if (s==="local" || s==="global") {
            status = s;
        } else {
            status = "local";
        }
        this.context.store.run.data[status][name] = callback;
        console.log("Функция выполнения успешно зарегистрирована: " + name);
    }
    async get(name) {
        let handler = this.context.store.run.data;
        let fun = handler.local[name] || handler.global[name];
        if (typeof fun==="function") {
return fun;
        } else {
        return undefined;
        }
    }
    reg(a) {
        for (let i = 0; i <= a.length - 1; i++) {
            this.context.store.run.queue.push(a[i]);
        }
    }
    exec() {

        let data = this.context.store.run.data;
        let queue = this.context.store.run.queue;
        if (queue.length <= 0) return;
        console.log("Найдены ждуны для run " + queue.length + "///" + JSON.stringify(this.context.store.run.queue));
        for (let i = 0; i <= queue.length - 1; i++) {
            let name = queue[i];
                        let handler = this.context.store.run.data;
            let fun = handler.local[name] || handler.global[name];

            if (typeof fun==="function") {
                fun();
                console.log("Функция отработала: " + name + "///" + JSON.stringify(this.context.store.run.queue));
            }
        }
this.context.store.run.queue.length = 0;
    }
}