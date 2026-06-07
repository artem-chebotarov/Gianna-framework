/**
 * Хранилище состояния в данный момент.
 * То есть, храним все данные, которые нужны для работы приложения в открытом окне.
 */
export const Store = {
  prototype: { // Прототипы
addEventListener: EventTarget.prototype.addEventListener,
removeEventListener: EventTarget.prototype.removeEventListener,
setTimeout: window.setTimeout,
clearTimeout: window.clearTimeout,
setInterval: window.setInterval,
clearInterval: window.clearInterval
  },
  stern: {
  events: [], // события js. не путать с on.
  timeouts: {},
  intervals: {}
  },
  
  state: {}, // окружение
  get_param: {}, // get параметры в url
  loops: {global: {},local: {}}, // данные о циклах
  repository: { // Репозиторий данных из различных плагинов и мест.
global: {},
local: {}
  },
config: {}, // Конфигурация из подгружаемого файла
router: {}, // Хранилище зарезирвированных url адресов.
run: { // Функции, которые надо выполнить после загрузки шаблона
data: {local: {},global: {}},
queue: []
},
plugins: { // хранилище плагинов.
waiting: {}, // очередь
data: {local: {},global: {}} // сами плагины
},
functions: {global: {},local: {}}, // Функции, которые выполняются внутри шаблонов
language: { // языковой пакет в данный момент
packages: {},
lang: "",
uri: ""
},
on: { // Хранилище событий.
click: {local: {},global: {}},
input: {local: {},global: {}},
change: {local: {},global: {}}, 
submit: {local: {},global: {}},
keydown: {global: {},local: {}},
keyup: {global: {},local: {}}
}, 
settings: {
ui: {
  content: "main"
},
back_end: {
url: ""
},

}
}



