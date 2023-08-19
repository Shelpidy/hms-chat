import User from "../models/Users";
import bcrypt from "bcrypt"


export async function hashData(_data: any) {
    let data = String(_data);
    let salt = await bcrypt.genSalt(10);
    let encryptedData = await bcrypt.hash(data, salt);
    return encryptedData;
}
export const getResponseBody = (
    status: string,
    message?: string,
    data?: any
) => {
    return {
        status,
        message,
        data,
    };
};

export const responseStatusCode = {
    UNATHORIZED: 401,
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NOT_FOUND: 404,
    BAD_REQUEST: 400,
    UNPROCESSIBLE_ENTITY: 422,
};

export const responseStatus = {
    SUCCESS: "success",
    ERROR: "error",
    UNATHORIZED: "unathorized",
    WARNING: "warning",
    UNPROCESSED: "unprocessed",
};

const SERVER_ID = process.env.SERVER_ID;

interface UserType {
    userId: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    profileImage?: string;
    password?: string;
    pinCode?: string;
    gender?: string;
    accountNumber?: string | null;
    dob?: string;
    email: string;
    createdAt: Date;
    updatedAt?: Date;
  }

export async function addUser(data:UserType) {
    try {
        let personal = data;
        let newPersonalInfo;
        let personalInfo = await User.create({
            ...personal,
        });
        newPersonalInfo = await personalInfo.save();
        let savePersonalData = await User.findOne({
            where: { email: personal?.email },
        });
        console.log(
            process.env.SERVER_ID,
            "User created successfully.",
            savePersonalData
        );
    } catch (err) { 
        throw err;
    }
}



export async function deleteUser(data:{userId:Pick<UserType,'userId'>}) {
    try {
        let { userId } = data;
        let deleteObj = await User.destroy({
            where: { userId },
        });
        if (deleteObj > 0) {
            console.log(process.env.SERVER_ID, "User deleted successfully.");
        }
    } catch (err) {
        throw err;
    }
}

export async function updateUserVerification(data:{verificationData:{verified:boolean,verificationRank:string},userId:string}) {
    try {
        let {verificationData,userId } = data;
        let personalInfo = await User.findOne({
            where: { userId },
        });
        if (personalInfo) {
            let upatedResponse = await User.update(verificationData,{where:{userId}})
            console.log(
                `Server with Id ${SERVER_ID} Row Affected:, ${upatedResponse[0]}`
            );
        } else {
            console.log("User doesnot exist.");
        }
    } catch (err) {
        throw err;
    }
}

export async function updateUser(data:{key:string,value:any,userId:string}) {
    try {
        let { key, value, userId } = data;
        let personalInfo = await User.findOne({
            where: { userId },
        });
        if (personalInfo) {
            if (key === "password") {
                personalInfo?.set(key, await hashData(value));
                let info = await personalInfo?.save();
                console.log(
                    `Server with Id ${SERVER_ID} Row Affected:, ${info}`
                );
            } else if (key === "pinCode") {
                personalInfo?.set(key, await hashData(value));
                let info = await personalInfo?.save();
                console.log(
                    `Server with Id ${SERVER_ID} Row Affected:, ${info}`
                );
            } else {
                personalInfo?.set(key, value);
                let info = await personalInfo?.save();
                console.log(
                    `Server with Id ${SERVER_ID} Row Affected:, ${info}`
                );
            }
        } else {
            console.log("User doesnot exist.");
        }
    } catch (err) {
        throw err;
    }
}
