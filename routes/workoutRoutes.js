const express = require('express'); 
const router = express.Router(); 
const workoutController = require('../controllers/workoutController');

const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', authenticateToken, workoutController.getAllWorkouts); 
router.get('/:id', authenticateToken, workoutController.getWorkoutById); 

router.post('/', authenticateToken, isAdmin, workoutController.createWorkout); 
router.put('/:id', authenticateToken, isAdmin, workoutController.updateWorkout); 
router.delete('/:id', authenticateToken, isAdmin, workoutController.deleteWorkout);

module.exports = router;