import express, { Request, Response } from "express";
import Room from "../models/Rooms";
import User from "../models/Users";
import { ChatReturnType, RUser } from "../types/types";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import { Op } from "sequelize";
import Status from "../models/Status";
import Message from "../models/Messages";

const router = express.Router();

////////////////////////// GET ALL USER MESSAGES ///////////////////
router.get(
    "/messages/:roomId/",
    async (req: Request, res: Response) => {
        try {
            let { roomId} = req.params;
            let { pageNumber = 1, numberOfRecord: numRec } = req.query;
            let numberOfRecord = Number(numRec || 100);
            let start = (Number(pageNumber) - 1) * numberOfRecord;

            const { rows: chats, count } =
                await Message.findAndCountAll({
                    where: { roomId },
                    order: [["RoomId", "DESC"]],
                    limit: numberOfRecord,
                    offset: start,
                });
            // console.log({chats:chats[0].dataValues})
            const formattedChats: any = await Promise.all(
                chats.map(async (chat) => {
                    const user: RUser = {
                        _id: chat.getDataValue("recipientId"),
                        name:
                            (
                                await User.findOne({
                                    where: {
                                        userId: chat.getDataValue("recipientId"),
                                    },
                                })
                            )?.getFullname() ?? "",
                        avatar:
                            (
                                await User.findOne({
                                    where: {
                                        userId: chat.getDataValue("recipientId"),
                                    },
                                })
                            )?.getDataValue("profileImage") ?? "",
                    };
                    const formattedChat: ChatReturnType = {
                        _id: chat.getDataValue("RoomId"),
                        text: chat.getDataValue("text"),
                        image: chat.getDataValue("image"),
                        audio: chat.getDataValue("audio"),
                        video: chat.getDataValue("video"),
                        sent: chat.getDataValue("sent") || false,
                        received: chat.getDataValue("received") || false,
                        pending: chat.getDataValue("pending") || false,
                        createdAt: chat.getDataValue("createdAt"),
                        user,
                    };
                    return formattedChat;
                })
            );
            res.status(200).json({ messages: formattedChats, count });
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                data: error,
                message: "Getting user chats Failed",
            });
        }
    }
);

//////////// DELETE A MESSAGE ////////////////////

router.delete(
    "/messages/:MessageId",
    async (req: Request, res: Response) => {
        try {
            let MessageId = req.params.messageId;
            let chat = await Message.findOne({
                where: { MessageId },
            });
            if (!chat) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Message with id ${MessageId} does not exist.`,
                            {}
                        )
                    );
            }
            let deleteRow = await Message.destroy({
                where: {MessageId},
            });
            if (deleteRow >= 1) {
                return res
                    .status(responseStatusCode.ACCEPTED)
                    .json(
                        getResponseBody(
                            responseStatus.SUCCESS,
                            "Delete Successfully",
                            { affectedNumber: deleteRow }
                        )
                    );
            } else {
                return res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.SUCCESS, "Delete Failed", {
                        affectedNumber: deleteRow,
                    })
                );
            }
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message:String(error)
            });
        }
    }
);

///////////////////////// GET ALL USER CHATS //////////////////////

router.get(
    "/rooms/",
    async (req: Request, res: Response) => {
        try {
            let {userId} = res.locals
            let {pageNumber = 1, numberOfRecord: numRec } = req.query;
            let numberOfRecord = Number(numRec || 100);
            let start = (Number(pageNumber) - 1) * numberOfRecord;
            const { rows: chats, count } =
                await Room.findAndCountAll({
                    where: {
                        [Op.and]: [
                            {
                                [Op.or]: [
                                    { recipientId: userId },
                                    { senderId: userId },
                                ],
                            },
                            { lastText: { [Op.not]: null } },
                        ],
                    },
                    order: [["updatedAt", "DESC"]],
                    limit: numberOfRecord,
                    offset: start,
                });
            res.status(200).json({ chats, count });
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message:String(error),
            });
        }
    }
);

/////////////////////// DELETE CONVERSATION OR CHAT CLEAR USER CHAT MESSAGES /////////////////////////////

router.delete(
    "/rooms/:RoomId",
    async (req: Request, res: Response) => {
        try {
            let {RoomId} = req.params;
            let chat = await Room.findOne({
                where: { RoomId },
            });
            if (!chat) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Chat with id ${RoomId} does not exist.`,
                            {}
                        )
                    );
            }
            let deleteRow = await Room.destroy({
                where: { RoomId },
            });
            if (deleteRow >= 1) {
                return res
                    .status(responseStatusCode.ACCEPTED)
                    .json(
                        getResponseBody(
                            responseStatus.SUCCESS,
                            "Delete Successfully",
                            { affectedNumber: deleteRow }
                        )
                    );
            } else {
                return res.status(responseStatusCode.BAD_REQUEST).json(
                    getResponseBody(responseStatus.SUCCESS, "Delete Failed", {
                        affectedNumber: deleteRow,
                    })
                );
            }
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message:String(error),
            });
        }
    }
);

////////////////////// READ CONVERSATION ///////////////////////////////
router.put(
    "/rooms/read/:roomId/",
    async (req: Request, res: Response) => {
        try {
            let { roomId} = req.params;
            let { userId} = res.locals;
            let conversation = await Room.findOne({
                where: { RoomId: roomId },
            });
            if (!conversation) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Chat with roomId ${roomId} does not exist`,
                            {}
                        )
                    );
            }
            if (conversation.getDataValue("recipientId") == userId) {
                conversation.setDataValue("recipientReadStatus", true);
                conversation.setDataValue("numberOfUnreadText", null);
            }

            await conversation.save();
            res.status(responseStatusCode.ACCEPTED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `recipient read messages`,
                    {}
                )
            );
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message:String(error),
            });
        }
    }
);

////////////////////// GET USER STATUS ////////////////////////////////

router.get("/status/:userId", async (req: Request, res: Response) => {
    try {
        let { userId } = req.params;
        const status = await Status.findOne({
            where: { userId },
        });
        if (status) {
            return res
                .status(responseStatusCode.OK)
                .json(getResponseBody(responseStatus.SUCCESS, "", status));
        }
        return res
            .status(responseStatusCode.NOT_FOUND)
            .json(
                getResponseBody(
                    responseStatus.ERROR,
                    `Status for userId ${userId} does not exist`,
                    {}
                )
            );
    } catch (error) {
        console.error(error);
        res.status(responseStatusCode.BAD_REQUEST).json({
            status: responseStatus.ERROR,
            message:String(error),
        });
    }
});

//////////////////////  GET OR CREATE ROOMID ////////////////////////////
router.get(
    "/room/:userIdOne/:userIdTwo",
    async (req: Request, res: Response) => {
        try {
            const { userIdOne, userIdTwo } = req.params;
            let chat = await Room.findOne({
                where: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { senderId: userIdOne },
                                { recipientId: userIdTwo },
                            ],
                        },
                        {
                            [Op.and]: [
                                { senderId: userIdTwo },
                                { recipientId: userIdOne },
                            ],
                        },
                    ],
                },
            });
            if (chat) {
                return res.status(responseStatusCode.OK).json(
                    getResponseBody(responseStatus.SUCCESS, "", {
                        roomId: chat.getDataValue("roomId"),
                    })
                );
            }
            let newChat = await Room.create({
                senderId: userIdOne,
                recipientId: userIdTwo,
            });
            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", {
                    roomId: newChat.getDataValue("roomId"),
                })
            );
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                message:String(error),
            });
        }
    }
);

export default router;
