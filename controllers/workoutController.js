const { Workout } = require('../models');

const getAllWorkouts = async (req, res, next) => {
    try {
        if (req.query.auth && req.query.auth !== '1') {
            return res.redirect('/workouts');
        }

        const workouts = await Workout.findAll();
        res.render('index', { workouts, isAuth: req.query.auth === '1' });
    } catch (error) {
        next(error);
    }
};

const getAddForm = (req, res) => {
    res.render('add', { isAuth: true }); 
};

const createWorkout = async (req, res, next) => {
    try {
        let { title, duration, difficulty, calories } = req.body;

        title = title ? title.trim() : ''; 
        duration = parseInt(duration);
        calories = calories ? parseInt(calories) : 0;

        let errorMessage = null;

        if (!title) {
            errorMessage = "Название не может быть пустым или состоять только из пробелов.";
        } else if (duration < 0 || duration > 10000) {
            // ДОБАВИЛИ ПРОВЕРКУ НА МАКСИМУМ
            errorMessage = "Длительность должна быть от 0 до 10000 минут.";
        } else if (calories < 0 || calories > 50000) {
            // ДОБАВИЛИ ПРОВЕРКУ НА МАКСИМУМ
            errorMessage = "Сжигаемые калории должны быть от 0 до 50000.";
        }

        if (errorMessage) {
            return res.render('add', { isAuth: true, errorMessage });
        }

        await Workout.create({
            title,
            duration,
            difficulty: difficulty || "Не указана",
            calories
        });

        res.redirect('/workouts?auth=1');
    } catch (error) {
        next(error);
    }
};

const getWorkoutById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const workout = await Workout.findByPk(id);

        if (!workout) {
            return next(); 
        }
        
        res.render('item', { workout, isAuth: req.query.auth === '1' });
    } catch (error) {
        next(error);
    }
};

const simulateError = (req, res, next) => {
    try {
        throw new Error("Тестовая ошибка");
    } catch (error) {
        next(error); 
    }
};

module.exports = { getAllWorkouts, getAddForm, createWorkout, getWorkoutById, simulateError };