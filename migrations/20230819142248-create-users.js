"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Users", {
            userId: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            firstName: {
                type: Sequelize.STRING,
            },
            middleName: {
                type: Sequelize.STRING,
            },
            lastName: {
                type: Sequelize.STRING,
            },
            profileImage: {
                type: Sequelize.STRING,
            },
            password: {
                type: Sequelize.STRING,
            },
            pinCode: {
                type: Sequelize.STRING,
            },
            gender: {
                type: Sequelize.STRING,
            },
            accountNumber: {
                type: Sequelize.STRING,
                allowNull: true,
                unique: true,
            },
            dob: {
                type: Sequelize.STRING,
            },
            email: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            verified: {
                type: Sequelize.BOOLEAN,
                defaultValue:false
            },
            verificationRank:{
                type:Sequelize.ENUM("low","medium","high")
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Users");
    },
};
