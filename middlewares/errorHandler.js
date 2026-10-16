const notFoundHandler = (req, res, next) => {
    res.status(404).render('404'); 
};

const serverErrorHandler = (err, req, res, next) => {
    console.error(err.stack); // Логируем ошибку в консоль
    res.status(500).render('500', { error: err.message });
};

module.exports = { notFoundHandler, serverErrorHandler };