"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Messages", 
        {
          messageId: {
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
          text: {
              type: Sequelize.TEXT,
          },
          image: {
              type: Sequelize.STRING,
          },
          audio: {
              type: Sequelize.STRING,
          },
          video: {
              type: Sequelize.STRING,
          },
          otherFile: {
              type: Sequelize.STRING,
          },
          roomId: {
              type: Sequelize.UUID,
              references:{
                  model:"Rooms",
                  key:'roomId'
              },
              onDelete:"CASCADE",
              onUpdate:"CASCADE"
          },
          sent: {
              type: Sequelize.BOOLEAN,
          },
          received: {
              type: Sequelize.BOOLEAN,
          },
          pending: {
              type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable("Messages");
    },
};
