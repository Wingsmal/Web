const express = require('express'); 
const router = express.Router(); 
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middlewares/auth'); // Наш охранник

router.get('/', workoutController.getAllWorkouts);
router.get('/add', authMiddleware, workoutController.getAddForm); 
router.post('/add', authMiddleware, workoutController.createWorkout); 
router.get('/simulate-error', workoutController.simulateError);
router.get('/:id', workoutController.getWorkoutById); 

module.exports = router;