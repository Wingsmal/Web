require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // ДОБАВИЛИ MONGOOSE

const workoutRoutes = require('./routes/workoutRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Подключение к MongoDB прошло успешно'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

app.use((req, res) => { res.status(404).json({ error: "Маршрут не найден" }); });

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});