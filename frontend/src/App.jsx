import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('workouts');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: 'Утренняя разминка', duration: 15, difficulty: 'Легкая' },
      { id: 2, title: 'Кардио', duration: 30, difficulty: 'Средняя' },
    ];
  });

  const [formData, setFormData] = useState({ title: '', duration: '', difficulty: 'Легкая' });
  const [filter, setFilter] = useState('Все');

  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    document.title = `Тренировок: ${workouts.length}`;
  }, [workouts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.duration) return;

    const newWorkout = {
      id: Date.now(),
      title: formData.title,
      duration: parseInt(formData.duration),
      difficulty: formData.difficulty,
    };

    setWorkouts([...workouts, newWorkout]);
    setFormData({ title: '', duration: '', difficulty: 'Легкая' });
  };

  const handleDelete = (id) => {
    setWorkouts(workouts.filter((w) => w.id !== id));
  };

  const filteredWorkouts = workouts.filter((w) => {
    if (filter === 'Все') return true;
    return w.difficulty === filter;
  });

  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);

  const getBadgeClass = (diff) => {
    switch (diff) {
      case 'Легкая': return 'badge-easy';
      case 'Средняя': return 'badge-medium';
      case 'Тяжелая': return 'badge-hard';
      default: return '';
    }
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <div className="header-section">
          <h1 className="main-title">Тренировки</h1>
          
          <div className="stats-box">
            <div className="stats-item">
              <span>Всего:</span> 
              <strong className="stats-value">{filteredWorkouts.length}</strong>
            </div>
            <div className="stats-item">
              <span>Время:</span> 
              <strong className="stats-value">{totalDuration} мин</strong>
            </div>
          </div>
        </div>

        <div className="controls-panel">
          
          <form className="add-form" onSubmit={handleAdd}>
            <div className="form-group title-group">
              <label>Название тренировки</label>
              <input type="text" name="title" className="form-input" 
                value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Время (мин)</label>
              <input type="number" name="duration" className="form-input" 
                value={formData.duration} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Сложность</label>
              <select name="difficulty" className="form-input" 
                value={formData.difficulty} onChange={handleChange}>
                <option value="Легкая">Легкая</option>
                <option value="Средняя">Средняя</option>
                <option value="Тяжелая">Тяжелая</option>
              </select>
            </div>
            
            <button type="submit" className="btn-add">Добавить</button>
          </form>

          <div className="form-group filter-section">
            <label>Фильтр списка</label>
            <select className="form-input filter-input" 
              value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="Все">Все тренировки</option>
              <option value="Легкая">Только Легкие</option>
              <option value="Средняя">Только Средние</option>
              <option value="Тяжелая">Только Тяжелые</option>
            </select>
          </div>
        </div>

        {filteredWorkouts.length === 0 ? (
          <div className="empty-state">
            Пока нет тренировок.
          </div>
        ) : (
          <div className="workouts-grid">
            {filteredWorkouts.map((workout) => (
              <div key={workout.id} className="workout-card">
                
                <span className={`badge ${getBadgeClass(workout.difficulty)}`}>
                  {workout.difficulty}
                </span>

                <h3 className="card-title">{workout.title}</h3>
                
                <div className="card-info">
                   Длительность: <strong>{workout.duration} мин</strong>
                </div>

                <button className="btn-delete" onClick={() => handleDelete(workout.id)}>
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;