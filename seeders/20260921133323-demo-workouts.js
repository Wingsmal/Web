'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Workouts', [
      {
        title: "Утренняя разминка",
        duration: 15,
        difficulty: "Легкая",
        calories: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: "Силовая тренировка на ноги",
        duration: 45,
        difficulty: "Тяжелая",
        calories: 300,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Workouts', null, {});
  }
};