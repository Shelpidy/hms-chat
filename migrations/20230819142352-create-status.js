"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Status", 
        {
          statusId: {
              type: Sequelize.UUID,
              allowNull: false,
              primaryKey: true,
              defaultValue:Sequelize.UUIDV4
          },
          userId: {
              type: Sequelize.UUID,
              allowNull: false,
          },
          gesture: {
              type: Sequelize.ENUM("typing","posting","recording","reading","unknown"),
          },
          online: {
              type: Sequelize.BOOLEAN,
          },
          activeRoom: {
              type: Sequelize.UUID,
          },
          lastSeen: {
              type: Sequelize.DATE,
          },
          createdAt: {
              allowNull: false,
              type: Sequelize.DATE,
          },
          updatedAt: {
              allowNull: true,
              type: Sequelize.DATE,
          },
      });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Status");
    },
};
