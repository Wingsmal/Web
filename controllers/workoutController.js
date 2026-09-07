let workouts = require('../models/workoutModel');

const getAllWorkouts = (req, res, next) => {
    try {
        res.status(200).json(workouts);
    } catch (error) {
        next(error);
    }
};

const getWorkoutById = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const workout = workouts.find(w => w.id === id);

        if (!workout) {
            return res.status(404).json({ error: "Тренировка с таким ID не найдена" });
        }
        res.status(200).json(workout);
    } catch (error) {
        next(error);
    }
};

const createWorkout = (req, res, next) => {
    try {
        const { title, duration, difficulty } = req.body;

        if (!title || !duration) {
            return res.status(400).json({ error: "Необходимы поля title и duration" });
        }

        const newWorkout = {
            id: workouts.length > 0 ? workouts[workouts.length - 1].id + 1 : 1,
            title,
            duration,
            difficulty: difficulty || "Не указана"
        };

        workouts.push(newWorkout);
        res.status(201).json(newWorkout);
    } catch (error) {
        next(error);
    }
};

const updateWorkout = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const { title, duration, difficulty } = req.body;

        const workoutIndex = workouts.findIndex(w => w.id === id);

        if (workoutIndex === -1) {
            return res.status(404).json({ error: "Тренировка с таким ID не найдена" });
        }

        if (!title || !duration) {
            return res.status(400).json({ error: "Необходимы поля title и duration для обновления" });
        }

        workouts[workoutIndex] = { id, title, duration, difficulty };
        res.status(200).json(workouts[workoutIndex]);
    } catch (error) {
        next(error);
    }
};

const deleteWorkout = (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        const workoutIndex = workouts.findIndex(w => w.id === id);

        if (workoutIndex === -1) {
            return res.status(404).json({ error: "Тренировка с таким ID не найдена" });
        }

        const deletedWorkout = workouts.splice(workoutIndex, 1);
        res.status(200).json({ message: "Тренировка успешно удалена", workout: deletedWorkout[0] });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllWorkouts,
    getWorkoutById,
    createWorkout,
    updateWorkout,
    deleteWorkout
};