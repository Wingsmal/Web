const authMiddleware = (req, res, next) => {
    if (req.query.auth === '1') {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = authMiddleware;