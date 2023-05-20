import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class CommodityChatRoom extends Model {
    public id!: number;
    public senderId!: number;
    public recipientId!: number;
    public lastText?: string;
    public recipientReadStatus?: boolean;
    public numberOfUnreadText?: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

CommodityChatRoom.init(
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
        recipientId: {
            type: DataTypes.INTEGER,
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
        modelName: "CommodityChatRoom",
        tableName: "CommodityChatRooms",
    }
);

export default CommodityChatRoom;
