const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Доступ запрещен. Токен не предоставлен." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Недействительный или просроченный токен." });
        }
        req.user = user; 
        next(); 
    });
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "У вас нет прав администратора для выполнения этого действия." });
    }
    next();
};

module.exports = { authenticateToken, isAdmin };