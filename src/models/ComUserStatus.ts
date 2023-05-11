import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class CommodityUserStatus extends Model {}

CommodityUserStatus.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "CommodityUsers",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        typing: {
            type: DataTypes.BOOLEAN,
        },
        online: {
            type: DataTypes.BOOLEAN,
        },
        reading: {
            type: DataTypes.BOOLEAN,
        },
        posting: {
            type: DataTypes.BOOLEAN,
        },
        lastSeen: {
            type: DataTypes.DATE,
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
        modelName: "CommodityUserStatus",
        tableName: "CommodityUserStatus",
        underscored: false, // Set to false to disable underscored naming conventions
    }
);

export default CommodityUserStatus;
