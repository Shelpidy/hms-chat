import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../database/connection";

class User extends Model {
    public getFullname() {
        return (
            this.get("firstName") +
            " " +
            this.get("middleName") +
            " " +
            this.get("lastName")
        );
    }
}

User.init(
    {
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        firstName: {
            type: DataTypes.STRING,
        },
        middleName: {
            type: DataTypes.STRING,
        },
        lastName: {
            type: DataTypes.STRING,
        },
        profileImage: {
            type: DataTypes.STRING,
        },
        password: {
            type: DataTypes.STRING,
        },
        pinCode: {
            type: DataTypes.STRING,
        },
        gender: {
            type: DataTypes.STRING,
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        dob: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        verified: {
            type: DataTypes.BOOLEAN,
            defaultValue:false
        },
        verificationRank:{
            type:DataTypes.ENUM("low","medium","high")
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
        },
    },
    {
        sequelize,
        modelName: "User",
        tableName: "Users",
        timestamps: true,
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    }
);

export default User;
