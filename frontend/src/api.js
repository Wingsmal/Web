import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (email, password) => api.post('/auth/login', { email, password });

export const fetchWorkouts = (signal) => api.get('/workouts', { signal }); 
export const createWorkout = (workout) => api.post('/workouts', workout);
export const updateWorkout = (id, workout) => api.put(`/workouts/${id}`, workout);
export const deleteWorkout = (id) => api.delete(`/workouts/${id}`);

export default api;