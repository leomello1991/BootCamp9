'use strict';

module.exports = {
  up: async  (queryInterface, Sequelize) => {
    return await queryInterface.addColumn('users', 'avatar_id',
    {
      type: Sequelize.INTEGER,
      references:{ model: 'files', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    })
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn('users', 'avatar_id')
  }
};
