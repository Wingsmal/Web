const express = require('express');
const app = express();
const workoutRoutes = require('./routes/workoutRoutes');

const loggerMiddleware = require('./middlewares/logger');
const { notFoundHandler, serverErrorHandler } = require('./middlewares/errorHandler');

const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(loggerMiddleware);

app.get('/login', (req, res) => {
    res.send('<h2>Вы не авторизованы!</h2><a href="/?auth=1">Войти с правами (добавить ?auth=1)</a>');
});

app.use('/workouts', workoutRoutes);

app.get('/', (req, res) => {
    const authQuery = req.query.auth === '1' ? '?auth=1' : '';
    res.redirect('/workouts' + authQuery);
});

app.use(notFoundHandler); 
app.use(serverErrorHandler); 

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});