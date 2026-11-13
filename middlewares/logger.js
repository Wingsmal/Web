const { Log } = require('../models');

const loggerMiddleware = async (req, res, next) => {
    const method = req.method;
    const url = req.url;
    const time = new Date();

    console.log(`[ЛОГ] ${time.toLocaleString()} | Метод: ${method} | URL: ${url}`);

    try {
        await Log.create({
            method: method,
            url: url,
            timestamp: time
        });
        
        next(); 
    } catch (error) {
        if (method === 'GET') {
            console.warn("ВНИМАНИЕ: Логи недоступны. Включен режим 'Только чтение'.");
            next(); 
        } else {
            console.error("КРИТИЧЕСКАЯ ОШИБКА: Изменение данных без логов запрещено!");
            error.message = "Система переведена в безопасный режим (Только чтение). Сохранение данных временно недоступно.";
            next(error); 
        }
    }
};

module.exports = loggerMiddleware;