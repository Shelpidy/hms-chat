import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class Status extends Model {
}

Status.init(
    {
        statusId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        gesture: {
            type: DataTypes.ENUM("typing","posting","recording","reading","unknown"),
        },
        online: {
            type: DataTypes.BOOLEAN,
        },
        activeRoom: {
            type: DataTypes.UUID,
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
        modelName: "Status",
        tableName: "Status",
    }
);

export default Status;
