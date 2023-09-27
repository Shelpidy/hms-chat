import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../database/connection";

class Message extends Model {}
Message.init(
  {
    messageId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    message: {
      type: DataTypes.TEXT,
    },
    roomId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: "Rooms",
        key: "roomId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    senderId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "userId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    recipientId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "userId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Message",
    tableName: "Messages",
    timestamps: false,
    underscored: false,
  },
);

export default Message;
