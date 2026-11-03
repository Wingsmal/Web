const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 1 },
  reps: { type: Number, default: 10 }
});

const workoutSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  },
  difficulty: { 
    type: String, 
    enum: ['Легкая', 'Средняя', 'Тяжелая'], 
    default: 'Легкая' 
  },
  calories: {
    type: Number,
    default: 0
  },
  exercises: [exerciseSchema] 
}, { 
  timestamps: true 
});

workoutSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;