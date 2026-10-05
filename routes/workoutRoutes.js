const express = require('express'); 
const router = express.Router(); 
const workoutController = require('../controllers/workoutController');

// 1. ИМПОРТИРУЕМ НАШИ ЗАЩИТНИКИ:
const { authenticateToken, isAdmin } = require('../middlewares/authMiddleware');

// 2. ВСТАВЛЯЕМ ИХ В МАРШРУТЫ:
// Читать (GET) могут ВСЕ авторизованные пользователи (передаем authenticateToken)
router.get('/', authenticateToken, workoutController.getAllWorkouts); 
router.get('/:id', authenticateToken, workoutController.getWorkoutById); 

// Создавать, изменять и удалять могут ТОЛЬКО АДМИНЫ (передаем authenticateToken, а затем isAdmin)
router.post('/', authenticateToken, isAdmin, workoutController.createWorkout); 
router.put('/:id', authenticateToken, isAdmin, workoutController.updateWorkout); 
router.delete('/:id', authenticateToken, isAdmin, workoutController.deleteWorkout);

module.exports = router;