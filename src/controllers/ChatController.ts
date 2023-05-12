import express, { Request, Response } from "express";
import CommodityChat from "../models/ComChats";
import CommodityUser from "../models/ComUsers";
import { ChatReturnType, RUser } from "../types/types";

const router = express.Router();

router.get("/chats/:roomId/:pageNumber/:numberOfRecord", async (req: Request, res: Response) => {
    try {
        let {roomId,pageNumber,numberOfRecord:numRec} = req.params;
        let numberOfRecord = Number(numRec)
        let start = (Number(pageNumber) - 1)* numberOfRecord


        const {rows:chats,count} = await CommodityChat.findAndCountAll({ where: { roomId },order:[["id","DESC"]],limit:numberOfRecord,offset:start});
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
        res.status(200).json({chats:formattedChats,count});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

export default router;
