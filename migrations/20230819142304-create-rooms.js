"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Rooms", 
        {
          roomId: {
              type: Sequelize.UUID,
              allowNull: false,
              primaryKey: true,
              defaultValue:Sequelize.UUIDV4
          },
          senderId: {
              type: Sequelize.UUID,
              allowNull: false,
          },
          recipientId: {
              type: Sequelize.UUID,
              allowNull: false,
          },
          lastText: {
              type: Sequelize.STRING,
          },
          recipientReadStatus: {
              type: Sequelize.BOOLEAN,
          },
          numberOfUnreadText: {
              type: Sequelize.INTEGER,
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
        await queryInterface.dropTable("Rooms");
    },
};
