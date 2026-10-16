const express = require('express'); 
const router = express.Router(); 
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middlewares/auth'); // Наш охранник

router.get('/', workoutController.getAllWorkouts);
router.get('/:id', workoutController.getWorkoutById); 
router.get('/add', authMiddleware, workoutController.getAddForm); 
router.post('/add', authMiddleware, workoutController.createWorkout); 


module.exports = router;