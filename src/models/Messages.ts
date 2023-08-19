import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

class Message extends Model {
}

Message.init(
    {
        messageId: {
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
        text: {
            type: DataTypes.TEXT,
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
            type: DataTypes.UUID,
            references:{
                model:"Rooms",
                key:'roomId'
            },
            onDelete:"CASCADE",
            onUpdate:"CASCADE"
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
        modelName: "Message",
        tableName: "Messages",
    }
);

export default Message;
