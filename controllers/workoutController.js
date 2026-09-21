// Импортируем модель, созданную Sequelize
const { Workout } = require('../models');

const getAllWorkouts = async (req, res, next) => {
    try {
        const workouts = await Workout.findAll();
        res.status(200).json(workouts);
    } catch (error) {
        next(error);
    }
};

const getWorkoutById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const workout = await Workout.findByPk(id);

        if (!workout) {
            return res.status(404).json({ error: "Тренировка с таким ID не найдена" });
        }
        res.status(200).json(workout);
    } catch (error) {
        next(error);
    }
};

const createWorkout = async (req, res, next) => {
    try {
        const { title, duration, difficulty, calories } = req.body;

        if (!title || !duration) {
            return res.status(400).json({ error: "Необходимы поля title и duration" });
        }

        const newWorkout = await Workout.create({
            title,
            duration,
            difficulty: difficulty || "Не указана",
            calories: calories || 0 
        });

        res.status(201).json(newWorkout);
    } catch (error) {
        next(error);
    }
};

const updateWorkout = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { title, duration, difficulty, calories} = req.body;

        if (!title || !duration) {
            return res.status(400).json({ error: "Необходимы поля title и duration для обновления" });
        }

        const workout = await Workout.findByPk(id);
        if (!workout) {
            return res.status(404).json({ error: "Тренировка с таким ID не найдена" });
        }

        await workout.update({ title, duration, difficulty, calories });
        res.status(200).json(workout);
    } catch (error) {
        next(error);
    }
};

const deleteWorkout = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        
        const deletedCount = await Workout.destroy({ where: { id } });

        if (deletedCount === 0) {
            return res.status(404).json({ error: "Тренировка с таким ID не найдена" });
        }

        res.status(200).json({ message: "Тренировка успешно удалена" });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout };