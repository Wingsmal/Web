const express = require('express'); 
const router = express.Router(); 
const workoutController = require('../controllers/workoutController');
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, workoutController.getAllWorkouts); 
router.get('/:id', authenticateToken, workoutController.getWorkoutById); 

router.post('/', authenticateToken, isAdmin, workoutController.createWorkout); 
router.put('/:id', authenticateToken, isAdmin, workoutController.updateWorkout); 
router.delete('/:id', authenticateToken, isAdmin, workoutController.deleteWorkout);

router.post('/:id/exercises', authenticateToken, isAdmin, workoutController.addExercise);
router.delete('/:id/exercises/:exerciseId', authenticateToken, isAdmin, workoutController.deleteExercise);
router.put('/:id/exercises/:exerciseId', authenticateToken, isAdmin, workoutController.updateExercise);

module.exports = router;