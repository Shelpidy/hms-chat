import express, { Request, Response } from "express";
import CommodityChat from "../models/ComChats";
import CommodityUser from "../models/ComUsers";
import { ChatReturnType, RUser } from "../types/types";
import CommodityConversation from "../models/ComConversations";
import {
    getResponseBody,
    responseStatus,
    responseStatusCode,
} from "../utils/utils";
import { Op } from "sequelize";
import CommodityUserStatus from "../models/ComUserStatus";

const router = express.Router();

////////////////////////// GET ALL USER CHATS ///////////////////
router.get(
    "/chats/:roomId/:pageNumber/:numberOfRecord",
    async (req: Request, res: Response) => {
        try {
            let { roomId, pageNumber, numberOfRecord: numRec } = req.params;
            let numberOfRecord = Number(numRec);
            let start = (Number(pageNumber) - 1) * numberOfRecord;

            const { rows: chats, count } = await CommodityChat.findAndCountAll({
                where: { roomId },
                order: [["id", "DESC"]],
                limit: numberOfRecord,
                offset: start,
            });
            const formattedChats = await Promise.all(
                chats.map(async (chat) => {
                    const user: RUser = {
                        _id: chat.getDataValue("receipientId"),
                        name:
                            (
                                await CommodityUser.findOne({
                                    where: {
                                        id: chat.getDataValue("receipientId"),
                                    },
                                })
                            )?.getFullname() ?? "",
                        avatar:
                            (
                                await CommodityUser.findOne({
                                    where: {
                                        id: chat.getDataValue("receipientId"),
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
            res.status(200).json({ chats: formattedChats, count });
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

//////////// DELETE A MESSAGE ////////////////////

router.delete("/chats/:messageId", async (req: Request, res: Response) => {
    try {
        let messageId = req.params.messageId;
        let chat = await CommodityChat.findOne({ where: { id: messageId } });
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
        let deleteRow = await CommodityChat.destroy({
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
});

///////////////////////// GET ALL CONVERSATIONS //////////////////////

router.get(
    "/conversations/:userId/:pageNumber/:numberOfRecord",
    async (req: Request, res: Response) => {
        try {
            let { userId, pageNumber, numberOfRecord: numRec } = req.params;
            let numberOfRecord = Number(numRec);
            let start = (Number(pageNumber) - 1) * numberOfRecord;
            const { rows: conversations, count } =
                await CommodityConversation.findAndCountAll({
                    where: {
                        [Op.or]: [
                            { senderId: userId },
                            { receipientId: userId },
                        ],
                    },
                    order: [["id", "DESC"]],
                    limit: numberOfRecord,
                    offset: start,
                });
            res.status(200).json({ conversations, count });
        } catch (error) {
            console.error(error);
            res.status(responseStatusCode.BAD_REQUEST).json({
                status: responseStatus.ERROR,
                data: error,
                message: "Getting conversations Failed",
            });
        }
    }
);

/////////////////////// DELETE CONVERSATION OR CLEAR CHATS /////////////////////////////

router.delete("/conversations/:roomId", async (req: Request, res: Response) => {
    try {
        let roomId = req.params.roomId;
        let chat = await CommodityConversation.findOne({
            where: { roomId: roomId },
        });
        if (!chat) {
            return res
                .status(responseStatusCode.NOT_FOUND)
                .json(
                    getResponseBody(
                        responseStatus.ERROR,
                        `Conversation with id ${roomId} does not exist.`,
                        {}
                    )
                );
        }
        let deleteRow = await CommodityConversation.destroy({
            where: { roomId: roomId },
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
});

////////////////////// READ CONVERSATION ///////////////////////////////
router.put(
    "/conversations/read/:roomId/:userId",
    async (req: Request, res: Response) => {
        try {
            let { roomId, userId } = req.params;
            let conversation = await CommodityConversation.findOne({
                where: { roomId },
            });
            if (!conversation) {
                return res
                    .status(responseStatusCode.NOT_FOUND)
                    .json(
                        getResponseBody(
                            responseStatus.ERROR,
                            `Conversation with roomId ${roomId} does not exist`,
                            {}
                        )
                    );
            }
            if (conversation.getDataValue("receipientId") == userId) {
                conversation.setDataValue("receipientReadStatus", true);
                conversation.setDataValue("numberOfUnreadText", null);
            }

            await conversation.save();
            res.status(responseStatusCode.ACCEPTED).json(
                getResponseBody(
                    responseStatus.SUCCESS,
                    `Receipient read messages`,
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

router.get("/userstatus/:userId", async (req: Request, res: Response) => {
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

export default router;
