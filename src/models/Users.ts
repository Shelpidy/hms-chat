import { Model, DataTypes, Optional, Sequelize } from "sequelize";
import sequelize from "../database/connection";

interface UserAttributes {
  userId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  profileImage?: string | null;
  contactNumber: string;
  gender: "male" | "female" | "other";
  dateOfBirth?: string | null;
  address?: string;
  password: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "userId" | "createdAt" | "updatedAt"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public userId!: string;
  public firstName!: string;
  public middleName?: string;
  public lastName!: string;
  public profileImage?: string;
  public contactNumber!: string;
  public gender!: "male" | "female" | "other";
  public dateOfBirth?: string;
  public address?: string;
  public password!: string;
  public email!: string;
  public role!: "patient" | "doctor" | "admin";
  public createdAt?: Date;
  public updatedAt?: Date;

  public getFullname() {
    return this.firstName + " " + this.middleName + " " + this.lastName;
  }
}

User.init(
  {
    userId: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    firstName: {
      allowNull: false,
      type: DataTypes.STRING(50),
    },
    middleName: {
      type: DataTypes.STRING(50),
    },
    lastName: {
      allowNull: false,
      type: DataTypes.STRING(50),
    },
    profileImage: {
      type: DataTypes.STRING(8000),
    },
    contactNumber: {
      allowNull: false,
      type: DataTypes.STRING(15),
    },
    gender: {
      allowNull: false,
      type: DataTypes.ENUM("male", "female", "other"),
      defaultValue: "other",
    },
    dateOfBirth: {
      type: DataTypes.STRING(20),
    },
    address: {
      type: DataTypes.STRING(100),
    },
    password: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    email: {
      allowNull: false,
      unique: true,
      type: DataTypes.STRING(50),
    },
    role: {
      allowNull: false,
      type: DataTypes.ENUM("patient", "doctor", "admin", "user"),
      defaultValue: "user",
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: false,
    underscored: false,
  },
);

export default User;
