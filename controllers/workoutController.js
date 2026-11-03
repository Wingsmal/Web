const Workout = require('../models/workoutModel');

const getAllWorkouts = async (req, res, next) => {
    try {
        const workouts = await Workout.find();
        res.status(200).json(workouts);
    } catch (error) {
        next(error);
    }
};

const getWorkoutById = async (req, res, next) => {
    try {
        const workout = await Workout.findById(req.params.id); 
        if (!workout) {
            return res.status(404).json({ error: "Тренировка не найдена" });
        }
        res.status(200).json(workout);
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ error: "Неверный формат ID" });
        next(error);
    }
};

const createWorkout = async (req, res, next) => {
    try {
        const { title, duration, difficulty, calories, exercises } = req.body;

        if (!title || !duration) {
            return res.status(400).json({ error: "Необходимы поля title и duration" });
        }

        const newWorkout = await Workout.create({
            title,
            duration,
            difficulty: difficulty || "Легкая",
            calories: calories || 0,
            exercises: exercises || [] 
        });

        res.status(201).json(newWorkout);
    } catch (error) {
        next(error);
    }
};

const updateWorkout = async (req, res, next) => {
    try {
        const { title, duration, difficulty, calories, exercises } = req.body;

        const updatedWorkout = await Workout.findByIdAndUpdate(
            req.params.id,
            { title, duration, difficulty, calories, exercises },
            { new: true, runValidators: true }
        );

        if (!updatedWorkout) {
            return res.status(404).json({ error: "Тренировка не найдена" });
        }

        res.status(200).json(updatedWorkout);
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ error: "Неверный формат ID" });
        next(error);
    }
};

const deleteWorkout = async (req, res, next) => {
    try {
        const deletedWorkout = await Workout.findByIdAndDelete(req.params.id); // Было destroy()

        if (!deletedWorkout) {
            return res.status(404).json({ error: "Тренировка не найдена" });
        }

        res.status(200).json({ message: "Тренировка успешно удалена", workout: deletedWorkout });
    } catch (error) {
        if (error.name === 'CastError') return res.status(404).json({ error: "Неверный формат ID" });
        next(error);
    }
};

const addExercise = async (req, res, next) => {
    try {
        const { name, sets, reps } = req.body;
        
        const updatedWorkout = await Workout.findByIdAndUpdate(
            req.params.id,
            { $push: { exercises: { name, sets, reps } } },
            { new: true }
        );

        if (!updatedWorkout) return res.status(404).json({ error: "Тренировка не найдена" });
        res.status(200).json(updatedWorkout);
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllWorkouts, getWorkoutById, createWorkout, updateWorkout, deleteWorkout, addExercise };