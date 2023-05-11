import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class CommodityConversation extends Model {}

CommodityConversation.init(
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
                model: "CommodityUsers",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        recipientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "CommodityUsers",
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
        modelName: "CommodityConversation",
        tableName: "CommodityConversations",
        underscored: false, // Set to false to disable underscored naming conventions
    }
);

export default CommodityConversation;
