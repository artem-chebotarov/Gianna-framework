function ggcModules(context) {
    return {
        getUri() {
if (context.router && typeof context.router.getUri==="function") {
    return context.router.getUri();
}
        },
        
        clearTimeouts() {
Object.keys(context.store.stern.timeouts).forEach(id => window.clearTimeout(id));
context.store.stern.timeouts = {};
        },
        clearIntervals() {
Object.keys(context.store.stern.intervals).forEach(id => window.clearInterval(id));
context.store.stern.intervals = {};
        },
clearEvents() {
let event = context.store.stern.events;
for (let i=0; i<=event.length-1; i++) {
let e = event[i];
if (e.target && typeof e.target.removeEventListener==="function") {
context.store.prototype.removeEventListener.apply(e.target, [e.type,e.callback,e.options]);
}
}
event.length = 0;
},
clear: function() {
    this.clearTimeouts();
    this.clearIntervals();
    this.clearEvents();
    return true;
}
    };
}

export function ggc(context) {
    let m = ggcModules(context);
window.clearInterval = function(id) {
    delete context.store.stern.intervals[id];
return context.store.prototype.clearInterval.apply(window,[id]);
}    



window.setInterval = function(callback, delay, ...args) {
let status = "local";
if (args.length>0) {
let last = args[args.length-1];
if (typeof last==="string" && (last==="global" || last==="local")) {
    status = last;
    args.pop();
}
}
let timer = context.store.prototype.setInterval.apply(window,[callback,delay,...args]);
if (status==="local") {
    context.store.stern.intervals[timer] = {
        uri: m.getUri(),
        status: status
    };
}
return timer;
}


window.clearTimeout = function(id) {
    delete context.store.stern.timeouts[id];
return context.store.prototype.clearTimeout.apply(window,[id]);
}



window.setTimeout = function(callback,delay,...args) {
let status = "local";
if (args.length>0) {
let last = args[args.length-1];
if (typeof last==="string" && (last==="global" || last==="local")) {
status = last;
args.pop();
}
}    
let timer = context.store.prototype.setTimeout.apply(window,[callback, delay, ...args]);
if (status==="local") {
context.store.stern.timeouts[timer] = {
status: status,
uri: m.getUri()
};
}
return timer;
}

EventTarget.prototype.removeEventListener = function (type, callback, options) {
    let event = context.store.stern.events;
    let  opt;
    for (let i=event.length-1; i>=0; i--) {
        let e = event[i];
        if (e.target===this && e.callback===callback && e.type===type) {
opt = options===undefined ? e.options : options;
event.splice(i,1);
break;
        }
    }
return context.store.prototype.removeEventListener.apply(this, [type,callback,opt]);
}



EventTarget.prototype.addEventListener = function (type,callback,options) {
let status = "local";
if (typeof options==="string") {
if (options=="global" || options=="local") {
    status = options;
} else {
    options = false;
}
} else {
    options = options;
}
if (status==="local") {
context.store.stern.events.push({
    target: this,
uri: m.getUri(),
type: type,
callback: callback,
options: options,
status: status
});
}
return context.store.prototype.addEventListener.apply(this, [type, callback,options]);
}
return m;
}