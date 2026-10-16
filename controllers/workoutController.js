const { Workout } = require('../models');

const getAllWorkouts = async (req, res, next) => {
    try {
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
        } else if (duration < 0) {
            errorMessage = "Длительность не может быть отрицательной.";
        } else if (calories < 0) {
            errorMessage = "Сжигаемые калории не могут быть отрицательными.";
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