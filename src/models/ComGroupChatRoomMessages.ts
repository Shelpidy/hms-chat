import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class GroupMessage extends Model {
    public id!: number;
    public senderId!: number;
    public text?: string;
    public image?: string;
    public audio?: string;
    public video?: string;
    public otherFile?: string;
    public chatId!: number;
    public sent?: boolean;
    public received?: boolean;
    public pending?: boolean;
    public createdAt!: Date;
    public updatedAt!: Date;
}

GroupMessage.init(
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
        modelName: "GroupMessage",
        tableName: "GroupMessages",
    }
);

export default GroupMessage;
