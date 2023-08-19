import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class GroupRoom extends Model {
    public id!: number;
    public adminId!: number;
    public otherAdminIs?: any;
    public groupName?: string;
    public lastSenderId!: number;
    public memberIds!: any;
    public lastText?: string;
    public recipientReadIds?: any;
    public numberOfUnreadText?: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

GroupRoom.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        otherAdminIds: {
            type: DataTypes.JSON,
        },
        groupName: {
            type: DataTypes.STRING,
        },
        lastSenderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        memberIds: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        lastText: {
            type: DataTypes.STRING,
        },
        recipientReadIds: {
            type: DataTypes.JSON,
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
        modelName: "GroupRoom",
        tableName: "GroupRooms",
    }
);

export default GroupRoom;
