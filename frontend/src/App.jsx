import { useState, useEffect } from 'react';
import { 
  login, 
  fetchWorkouts, 
  createWorkout, 
  updateWorkout, 
  deleteWorkout, 
  addExerciseToWorkout, 
  deleteExerciseFromWorkout,
  updateExerciseInWorkout
} from './api';
import './App.css';

const getUserFromToken = (token) => {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
};

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const user = getUserFromToken(token);
  const isAdmin = user?.role === 'admin';

  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ title: '', duration: '', difficulty: 'Легкая' });
  const [editId, setEditId] = useState(null); 
  const [filter, setFilter] = useState('Все');

  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({ name: '', sets: '', reps: '' });
  const [editExerciseId, setEditExerciseId] = useState(null);
  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const res = await fetchWorkouts(controller.signal);
        setWorkouts(res.data);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          setError('Ошибка загрузки данных. Проверьте сервер.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => controller.abort();
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(authForm.email, authForm.password);
      const accessToken = res.data.accessToken || res.data.token; 
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setAuthError('');
    } catch (err) {
      setAuthError('Неверный логин или пароль');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
    setWorkouts([]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.duration) return;

    if (editId) {
      const originalWorkouts = [...workouts];
      setWorkouts(workouts.map(w => w.id === editId ? { ...w, ...formData } : w));
      setFormData({ title: '', duration: '', difficulty: 'Легкая' });
      setEditId(null);

      try {
        await updateWorkout(editId, formData);
      } catch (err) {
        setWorkouts(originalWorkouts);
        alert('Ошибка при обновлении на сервере.');
      }
    } else {
      const tempId = Date.now().toString(); 
      const newWorkout = { id: tempId, ...formData, exercises: [] }; 
      
      setWorkouts([...workouts, newWorkout]);
      setFormData({ title: '', duration: '', difficulty: 'Легкая' });

      try {
        const res = await createWorkout(formData);
        setWorkouts(prev => prev.map(w => w.id === tempId ? res.data : w));
      } catch (err) {
        setWorkouts(prev => prev.filter(w => w.id !== tempId));
        alert('Ошибка при добавлении на сервере.');
      }
    }
  };

  const handleDelete = async (id) => {
    const originalWorkouts = [...workouts];
    setWorkouts(workouts.filter(w => w.id !== id));
    try {
      await deleteWorkout(id);
    } catch (err) {
      setWorkouts(originalWorkouts);
      alert('Ошибка при удалении на сервере.');
    }
  };

  const startEdit = (workout) => {
    setEditId(workout.id);
    setFormData({ title: workout.title, duration: workout.duration, difficulty: workout.difficulty });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: '', duration: '', difficulty: 'Легкая' });
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    if (!exerciseForm.name) return;

    if (editExerciseId) {
      const originalWorkout = { ...selectedWorkout };
      const updatedWorkout = {
        ...selectedWorkout,
        exercises: selectedWorkout.exercises.map(ex => ex._id === editExerciseId ? { ...ex, ...exerciseForm } : ex)
      };
      
      setSelectedWorkout(updatedWorkout);
      setWorkouts(workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
      setExerciseForm({ name: '', sets: '', reps: '' });
      setEditExerciseId(null);

      try {
        await updateExerciseInWorkout(updatedWorkout.id, editExerciseId, exerciseForm);
      } catch (err) {
        setSelectedWorkout(originalWorkout);
        setWorkouts(workouts.map(w => w.id === originalWorkout.id ? originalWorkout : w));
        alert('Ошибка обновления упражнения!');
      }
    } else {

      const originalWorkouts = [...workouts];
      const newExercise = { 
        _id: Date.now().toString(), 
        name: exerciseForm.name, 
        sets: parseInt(exerciseForm.sets || 1), 
        reps: parseInt(exerciseForm.reps || 10) 
      };

      const updatedWorkout = { 
        ...selectedWorkout, 
        exercises: [...(selectedWorkout.exercises || []), newExercise] 
      };
      
      setSelectedWorkout(updatedWorkout);
      setWorkouts(workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
      setExerciseForm({ name: '', sets: '', reps: '' });

      try {
        const res = await addExerciseToWorkout(updatedWorkout.id, newExercise);
        setSelectedWorkout(res.data);
        setWorkouts(prev => prev.map(w => w.id === res.data.id ? res.data : w));
      } catch (err) {
        setWorkouts(originalWorkouts);
        setSelectedWorkout(originalWorkouts.find(w => w.id === updatedWorkout.id));
        alert('Ошибка при добавлении упражнения!');
      }
    }
  };

  const handleDeleteExercise = async (workoutId, exerciseId) => {
    const originalWorkout = { ...selectedWorkout };
    const originalWorkouts = [...workouts];
    
    const updatedWorkout = {
      ...selectedWorkout,
      exercises: selectedWorkout.exercises.filter(ex => ex._id !== exerciseId)
    };
    
    setSelectedWorkout(updatedWorkout);
    setWorkouts(workouts.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));

    try {
      await deleteExerciseFromWorkout(workoutId, exerciseId);
    } catch (err) {
      setSelectedWorkout(originalWorkout);
      setWorkouts(originalWorkouts);
      alert('Ошибка при удалении упражнения на сервере.');
    }
  };

  const startEditExercise = (exercise) => {
    setEditExerciseId(exercise._id);
    setExerciseForm({ name: exercise.name, sets: exercise.sets, reps: exercise.reps });
  };

  const cancelEditExercise = () => {
    setEditExerciseId(null);
    setExerciseForm({ name: '', sets: '', reps: '' });
  };

  const filteredWorkouts = workouts.filter((w) => {
    if (filter === 'Все') return true;
    return w.difficulty === filter;
  });

  const totalDuration = filteredWorkouts.reduce((sum, w) => sum + parseInt(w.duration || 0), 0);
  const getBadgeClass = (diff) => {
    switch (diff) {
      case 'Легкая': return 'badge-easy';
      case 'Средняя': return 'badge-medium';
      case 'Тяжелая': return 'badge-hard';
      default: return '';
    }
  };

  if (!token) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="controls-panel" style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{marginTop: 0, marginBottom: '20px'}}>Вход в систему</h2>
          {authError && <p style={{ color: '#ef4444', marginBottom: '15px' }}>{authError}</p>}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input className="form-input" type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} placeholder="Email" required />
            <input className="form-input" type="password" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} placeholder="Пароль" required />
            <button className="btn-blue" type="submit">Войти</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      
      {selectedWorkout && (
        <div className="modal-overlay" onClick={() => setSelectedWorkout(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="btn-icon" onClick={() => setSelectedWorkout(null)}>✖</button>
            <h2 style={{marginTop: 0, color: '#111827'}}>{selectedWorkout.title}</h2>
            <p style={{color: '#6b7280', marginBottom: '20px'}}>Список упражнений в этой тренировке:</p>

            <div style={{marginBottom: '25px', maxHeight: '300px', overflowY: 'auto'}}>
              {(!selectedWorkout.exercises || selectedWorkout.exercises.length === 0) ? (
                <p style={{color: '#9ca3af', fontStyle: 'italic'}}>Пока нет ни одного упражнения.</p>
              ) : (
                selectedWorkout.exercises.map(ex => (
                  <div key={ex._id} className="exercise-item" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <strong style={{color: '#111827'}}>{ex.name}</strong> <br/>
                      <small style={{color: '#6b7280'}}>Подходов: {ex.sets} | Повторений: {ex.reps}</small>
                    </div>
                    {isAdmin && (
                      <div>
                        <button onClick={() => startEditExercise(ex)} style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '1rem', padding: '0 5px'}} title="Изменить">✎</button>
                        <button onClick={() => handleDeleteExercise(selectedWorkout.id, ex._id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', padding: '0 5px'}} title="Удалить">✖</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {isAdmin && (
              <form onSubmit={handleAddExercise} style={{display: 'flex', gap: '10px', flexDirection: 'column', borderTop: '1px solid #e5e7eb', paddingTop: '20px'}}>
                <h4 style={{margin: '0', color: '#374151'}}>{editExerciseId ? 'Редактировать упражнение' : 'Новое упражнение'}</h4>
                <input type="text" className="form-input" placeholder="Название упражнения" required
                  value={exerciseForm.name} onChange={e => setExerciseForm({...exerciseForm, name: e.target.value})} />
                <div style={{display: 'flex', gap: '10px'}}>
                  <input type="number" className="form-input" placeholder="Подходы" style={{flex: 1}} required
                    value={exerciseForm.sets} onChange={e => setExerciseForm({...exerciseForm, sets: e.target.value})} />
                  <input type="number" className="form-input" placeholder="Повторения" style={{flex: 1}} required
                    value={exerciseForm.reps} onChange={e => setExerciseForm({...exerciseForm, reps: e.target.value})} />
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  {editExerciseId && <button type="button" className="btn-delete" style={{flex: 1}} onClick={cancelEditExercise}>Отмена</button>}
                  <button type="submit" className="btn-blue" style={{flex: editExerciseId ? 1 : '1 1 auto', height: '40px'}}>{editExerciseId ? 'Сохранить' : 'Добавить'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="app-wrapper">
        <div className="header-section">
          <h1 className="main-title">Тренировки</h1>
          <div className="stats-box">
            <div className="stats-item">
              <span style={{fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold', marginBottom: '4px'}}>{user?.email} ({isAdmin ? 'Админ' : 'Пользователь'})</span>
            </div>
            {!loading && !error && (
              <>
                <div className="stats-item"><span>Всего:</span> <strong className="stats-value">{filteredWorkouts.length}</strong></div>
                <div className="stats-item"><span>Время:</span> <strong className="stats-value">{totalDuration} мин</strong></div>
              </>
            )}
            <button className="btn-delete" style={{ marginLeft: '10px' }} onClick={handleLogout}>Выйти</button>
          </div>
        </div>

        {loading ? (
          <div className="spinner">Загрузка данных с сервера...</div>
        ) : error ? (
          <div style={{ color: '#ef4444', textAlign: 'center', marginTop: '50px' }}>
            <h2>{error}</h2>
            <button className="btn-blue" onClick={() => window.location.reload()} style={{margin: '20px auto'}}>Повторить попытку</button>
          </div>
        ) : (
          <>
            <div className="controls-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isAdmin ? '20px' : '0' }}>
                <div className="form-group filter-section">
                  <label>Фильтр списка</label>
                  <select className="form-input filter-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="Все">Все тренировки</option>
                    <option value="Легкая">Только Легкие</option>
                    <option value="Средняя">Только Средние</option>
                    <option value="Тяжелая">Только Тяжелые</option>
                  </select>
                </div>
                {!isAdmin && <div style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'right' }}>Только администраторы могут управлять тренировками.</div>}
              </div>

              {isAdmin && (
                <form className="add-form" onSubmit={handleFormSubmit} style={{ borderTop: '1px dashed #e5e7eb', paddingTop: '20px' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#374151', width: '100%', fontSize: '1.25rem' }}>{editId ? 'Редактирование' : 'Новая тренировка'}</h3>
                  <div className="inputs-row">
                    <div className="form-group title-group"><label>Название</label><input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required /></div>
                    <div className="form-group"><label>Мин.</label><input type="number" name="duration" className="form-input" value={formData.duration} onChange={handleChange} required /></div>
                    <div className="form-group">
                      <label>Сложность</label>
                      <select name="difficulty" className="form-input" value={formData.difficulty} onChange={handleChange}>
                        <option value="Легкая">Легкая</option>
                        <option value="Средняя">Средняя</option>
                        <option value="Тяжелая">Тяжелая</option>
                      </select>
                    </div>
                  </div>
                  <div className="actions-row" style={{ justifyContent: 'flex-end', borderTop: 'none', paddingTop: 0 }}>
                    <div className="form-actions">
                      {editId && <button type="button" className="btn-delete" onClick={cancelEdit}>Отмена</button>}
                      <button type="submit" className={editId ? 'btn-outline-green' : 'btn-outline-blue'}>{editId ? 'Сохранить изменения' : 'Добавить'}</button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {filteredWorkouts.length === 0 ? (
              <div className="empty-state">Нет данных. Добавьте тренировку.</div>
            ) : (
              <div className="workouts-grid">
                {filteredWorkouts.length === 0 ? (
          <div className="empty-state">Нет данных. Добавьте тренировку.</div>
        ) : (
          <div className="workouts-grid">
            {filteredWorkouts.map((workout) => (
              <div key={workout.id} className="workout-card">

                {isAdmin && (
                  <div className="card-actions-minimal">
                    <button className="btn-icon-action" onClick={() => startEdit(workout)} title="Изменить">
                      ✎
                    </button>
                    <button className="btn-icon-action btn-icon-delete" onClick={() => handleDelete(workout.id)} title="Удалить">
                      ✖
                    </button>
                  </div>
                )}

                <span className={`badge ${getBadgeClass(workout.difficulty)}`} style={{position: 'static', display: 'inline-block', width: 'max-content', marginBottom: '10px'}}>
                  {workout.difficulty}
                </span>

                <h3 className="card-title" style={{paddingRight: '0'}}>{workout.title}</h3>
                
                <div className="card-info">
                  Длительность: <strong>{workout.duration} мин</strong>
                </div>

                <button className="btn-details" onClick={() => setSelectedWorkout(workout)}>
                  Упражнения ({workout.exercises ? workout.exercises.length : 0})
                </button>

              </div>
            ))}
          </div>
        )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;