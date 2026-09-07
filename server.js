const express = require('express');
const app = express();
const workoutRoutes = require('./routes/workoutRoutes');

const PORT = 3000;

app.use(express.json());

app.use('/api/workouts', workoutRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});