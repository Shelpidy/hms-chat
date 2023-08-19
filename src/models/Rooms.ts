import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class Room extends Model {
    public id!: number;
    public senderId!: number;
    public recipientId!: number;
    public lastText?: string;
    public recipientReadStatus?: boolean;
    public numberOfUnreadText?: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Room.init(
    {
        roomId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        senderId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        recipientId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        lastText: {
            type: DataTypes.STRING,
        },
        recipientReadStatus: {
            type: DataTypes.BOOLEAN,
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
        modelName: "Room",
        tableName: "Rooms",
    }
);

export default Room;
