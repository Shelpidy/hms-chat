import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../database/connection";

class Status extends Model {}
Status.init(
  {
    statusId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    lastSeen: {
      type: DataTypes.DATE,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
    },
    activeRoomId: {
      allowNull: false,
      type: DataTypes.UUID,
      references: {
        model: "Rooms",
        key: "roomId",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    userId: {
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
    modelName: "Status",
    tableName: "Status",
    timestamps: false,
    underscored: false,
  },
);

export default Status;
