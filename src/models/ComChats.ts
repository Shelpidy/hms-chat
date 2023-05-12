import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class CommodityChat extends Model {}

CommodityChat.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receipientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
        },
        image: {
            type: DataTypes.STRING,
        },
        audio: {
            type: DataTypes.STRING,
        },
        video: {
            type: DataTypes.STRING,
        },
        otherFile: {
            type: DataTypes.STRING,
        },
        roomId: {
            type: DataTypes.INTEGER,
            references: {
                model: "CommodityConversations",
                key: "roomId",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        sent: {
            type: DataTypes.BOOLEAN,
        },
        received: {
            type: DataTypes.BOOLEAN,
        },
        pending: {
            type: DataTypes.BOOLEAN,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "CommodityChat",
        tableName: "CommodityChats",
        timestamps: true,
    }
);

export default CommodityChat;
