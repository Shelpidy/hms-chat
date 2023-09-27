import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../database/connection";

class Room extends Model {}
Room.init(
  {
    roomId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    lastMessage: {
      type: DataTypes.TEXT,
    },
    numberOfUnreadMessages: {
      type: DataTypes.INTEGER,
    },
    userOneId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: "Users",
        key: "userId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userTwoId: {
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
    modelName: "Room",
    tableName: "Rooms",
    timestamps: false,
    underscored: false,
  },
);

export default Room;
