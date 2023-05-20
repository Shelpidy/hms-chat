import express, { Request, Response } from "express";
import CommodityChatRoom from "../models/ComChatRooms";
import CommodityUser from "../models/ComUsers";
import { ChatReturnType, RUser } from "../types/types";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import { Op } from "sequelize";
import CommodityUserStatus from "../models/ComUserStatus";
import CommodityChatRoomMessage from "../models/ComChatRoomMessages";

const router = express.Router();

////////////////////////// GET ALL USER MESSAGES ///////////////////
router.get(
    "/api/messages/:roomId/:pageNumber/:numberOfRecord",
    async (req: Request, res: Response) => {
        try {
            let { roomId, pageNumber, numberOfRecord: numRec } = req.params;
            let numberOfRecord = Number(numRec);
            let start = (Number(pageNumber) - 1) * numberOfRecord;

            const { rows: chats, count } =
                await CommodityChatRoomMessage.findAndCountAll({
                    where: { roomId },
                    order: [["id", "DESC"]],
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
                                await CommodityUser.findOne({
                                    where: {
                                        id: chat.getDataValue("recipientId"),
                                    },
                                })
                            )?.getFullname() ?? "",
                        avatar:
                            (
                                await CommodityUser.findOne({
                                    where: {
                                        id: chat.getDataValue("recipientId"),
                                    },
                                })
                            )?.getDataValue("profileImage") ?? "",
                    };
                    const formattedChat: ChatReturnType = {
                        _id: chat.getDataValue("id"),
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
    "/api/messages/:messageId",
    async (req: Request, res: Response) => {
        try {
            let messageId = req.params.messageId;
            let chat = await CommodityChatRoomMessage.findOne({
                where: { id: messageId },
            });
            if (!chat) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Message with id ${messageId} does not exist.`,
                            {}
                        )
                    );
            }
            let deleteRow = await CommodityChatRoom.destroy({
                where: { id: messageId },
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
                data: error,
                message: "Delete Fail",
            });
        }
    }
);

///////////////////////// GET ALL USER CHATS //////////////////////

router.get(
    "/api/messages/chats/:userId/:pageNumber/:numberOfRecord",
    async (req: Request, res: Response) => {
        try {
            let { userId, pageNumber, numberOfRecord: numRec } = req.params;
            let numberOfRecord = Number(numRec);
            let start = (Number(pageNumber) - 1) * numberOfRecord;
            const { rows: chats, count } =
                await CommodityChatRoom.findAndCountAll({
                    where: {
                        [Op.or]: [
                            { recipientId: userId },
                            { senderId: userId },
                        ],
                    },
                    order: [["id", "DESC"]],
                    limit: numberOfRecord,
                    offset: start,
                });
            res.status(200).json({ chats, count });
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                data: error,
                message: "Getting chats Failed",
            });
        }
    }
);

/////////////////////// DELETE CONVERSATION OR CHAT CLEAR USER CHAT MESSAGES /////////////////////////////

router.delete(
    "/api/messages/chats/:id",
    async (req: Request, res: Response) => {
        try {
            let id = req.params.id;
            let chat = await CommodityChatRoom.findOne({
                where: { id },
            });
            if (!chat) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Chat with id ${id} does not exist.`,
                            {}
                        )
                    );
            }
            let deleteRow = await CommodityChatRoom.destroy({
                where: { id },
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
                data: error,
                message: "Delete Fail",
            });
        }
    }
);

////////////////////// READ CONVERSATION ///////////////////////////////
router.put(
    "/api/messages/chats/read/:roomId/:userId",
    async (req: Request, res: Response) => {
        try {
            let { roomId, userId } = req.params;
            let conversation = await CommodityChatRoom.findOne({
                where: { id: roomId },
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
                data: error,
                message: "Get Fail",
            });
        }
    }
);

////////////////////// GET USER STATUS ////////////////////////////////

router.get("/api/userstatus/:userId", async (req: Request, res: Response) => {
    try {
        let { userId } = req.params;
        const userStatus = await CommodityUserStatus.findOne({
            where: { userId },
        });
        if (userStatus) {
            return res
                .status(responseStatusCode.OK)
                .json(getResponseBody(responseStatus.SUCCESS, "", userStatus));
        }
        return res
            .status(responseStatusCode.NOT_FOUND)
            .json(
                getResponseBody(
                    responseStatus.ERROR,
                    `UserStatus for userId ${userId} does not exist`,
                    {}
                )
            );
    } catch (error) {
        console.error(error);
        res.status(responseStatusCode.BAD_REQUEST).json({
            status: responseStatus.ERROR,
            data: error,
            message: "Getting User-Status failed",
        });
    }
});

//////////////////////  GET OR CREATE ROOMID ////////////////////////////
router.get(
    "/api/room/:userIdOne/:userIdTwo",
    async (req: Request, res: Response) => {
        try {
            const { userIdOne, userIdTwo } = req.params;
            let chat = await CommodityChatRoom.findOne({
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
                return res
                    .status(responseStatusCode.OK)
                    .json(
                        getResponseBody(responseStatus.SUCCESS, "", {
                            roomId: chat.getDataValue("id"),
                        })
                    );
            }
            let newChat = await CommodityChatRoom.create({
                senderId: userIdOne,
                recipientId: userIdTwo,
            });
            res.status(responseStatusCode.OK).json(
                getResponseBody(responseStatus.SUCCESS, "", {
                    roomId: newChat.getDataValue("id"),
                })
            );
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                data: error,
                message: "Getting roomId failed.",
            });
        }
    }
);

export default router;
