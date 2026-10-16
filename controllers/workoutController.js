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
        const { title, duration, difficulty, calories } = req.body;
        
        await Workout.create({
            title,
            duration,
            difficulty: difficulty || "Не указана",
            calories: calories || 0
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

module.exports = { getAllWorkouts, getAddForm, createWorkout, getWorkoutById };