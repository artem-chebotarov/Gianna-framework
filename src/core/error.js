export class ErrorGN {
    /**
     * Выводит красивое модальное окно с текстом ошибки
     * @param {any} errorData - Строка, объект ошибки или JSON
     */
    send(errorData) {
        // Находим элементы в DOM
        const modalEl = document.getElementById('gnErrorModal');
        const messageContainer = document.getElementById('gnErrorMessage');
        
        if (!modalEl || !messageContainer) {
            console.log(JSON.stringify(errorData));
            console.error("Критический сбой: Диалог ошибки не найден в DOM.", errorData);
            return;
        }

        // Подготавливаем данные. Если передали объект — красиво форматируем его в строку
        let errorText = "";
        if (errorData instanceof Error) {
            // Явно склеиваем тип ошибки, сообщение и стек вызовов для любого браузера
            errorText = `[${errorData.name}]: ${errorData.message}\n\nСтек вызовов:\n${errorData.stack}`;
        } else if (typeof errorData === 'object') {
            errorText = JSON.stringify(errorData, null, 2);
        } else {
            errorText = String(errorData);
        }

        // Вставляем текст (используем textContent для защиты от XSS инъекций)
        messageContainer.textContent = errorText;

        // Инициализируем и показываем модалку средствами Bootstrap 5
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    }    
}