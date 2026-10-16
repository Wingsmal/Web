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
    } catch (error) {
        console.error("Ошибка при записи лога в БД:", error);
    }

    next();
};

module.exports = loggerMiddleware;