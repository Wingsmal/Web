require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const http = require('http');
const { Server } = require('socket.io');

const workoutRoutes = require('./routes/workoutRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Успешно подключились к MongoDB!'))
  .catch(err => console.error('Ошибка подключения к MongoDB:', err));

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);

const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: '*' } 
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  socket.on('chat message', (msgData) => {
    io.emit('chat message', msgData);
  });

  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
  });
});

app.use((req, res) => { res.status(404).json({ error: "Маршрут не найден" }); });
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

server.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});