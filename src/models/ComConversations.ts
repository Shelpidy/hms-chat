import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class Conversation extends Model {}

Conversation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        recipientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        lastText: {
            type: DataTypes.STRING,
        },
        recipientReadStatus: {
            type: DataTypes.BOOLEAN,
        },
        roomId: {
            type: DataTypes.INTEGER,
            unique: true,
        },
        numberOfUnreadText: {
            type: DataTypes.INTEGER,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: true,
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "Conversation",
        tableName: "Conversations",
        underscored: false, // Set to false to disable underscored naming conventions
    }
);

export default Conversation;
