import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import CommodityChatRoom from "../src/models/ComChatRooms";
import CommodityUser from "../src/models/ComUsers";
import { ChatReturnType } from "../src/types/types";
import { Server } from "socket.io";
import router from "./controllers/ChatController";
import CommodityUserStatus from "./models/ComUserStatus";
import CommodityChatRoomMessage from "./models/ComChatRoomMessages";
import { Op } from "sequelize";

dotenv.config();
// Create an Express app and HTTP server
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

const server = http.createServer(app);

const socketIO = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    connectTimeout: 5000,
});

app.get("/", (req, res) => {
    res.status(200).json({ text: "Welcome" });
});

// socketIO.send("Hello client")

socketIO.on("connection", async (socket) => {
    console.log("Client connected");
    let roomId = socket.handshake.query.roomId;
    let userId = socket.handshake.query.userId;
    let roomType = socket.handshake.query.roomType;
    console.log({ roomId,roomType,userId });
    if (roomId && roomType) {
        /// connect or join a room if users click on the chat button on the frontend///////////////
        socket.join(`${roomType}-${roomId}`);
    }

    if (userId) {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    online: true,
                    userId,
                });
                socket.broadcast.emit("online", createdStatus.dataValues);
            } else {
                let updatedStatus = await status.update({ online: true });
                socket.broadcast.emit("online", updatedStatus.dataValues);
            }
        } catch (err) {
            console.log(err);
        }
    }
    console.log(`User with Id ${userId} joins room c-${roomId}`);

    //// chat between users ////////////////////////////////////

    socket.on(`c-${roomId}`, async (msgData: any) => {
        try {
            console.log("From user 2");
            console.log(msgData);
            // Save the chat message to the database
            const message = await CommodityChatRoomMessage.create({
                senderId: msgData?.senderId,
                recipientId: msgData?.recipientId,
                text: msgData?.text,
                image: msgData?.image,
                audio: msgData?.audio,
                video: msgData?.video,
                otherFile: msgData?.otherFile,
                roomId: msgData?.roomId,
                sent: true,
                received: false,
                pending: true,
            });

            let chat = await CommodityChatRoom.findOne({
                where: { id: roomId },
            });
            if (chat) {
                let initialSenderId = chat.getDataValue("senderId");
                let initialrecipientId = chat.getDataValue("recipientId");
                let currentSenderStatus = await CommodityUserStatus.findOne({
                    where: { userId: initialSenderId },
                });
                let currentrecipientStatus = await CommodityUserStatus.findOne({
                    where: { userId: initialrecipientId },
                });
                // check if the receiver have not opened the chat screen or is not on the chat screen

                chat.setDataValue("recipientReadStatus", false);
                let unReadTextNo = chat.getDataValue("numberOfUnreadText");
                if (initialSenderId == msgData.senderId) {
                    console.log("From the same sender");

                    console.log("No of unread", unReadTextNo);
                    if (
                        currentrecipientStatus?.getDataValue("activeRoom") !==
                        `c-${roomId}`
                    ) {
                        if (unReadTextNo) {
                            chat = await chat.increment("numberOfUnreadText", {
                                by: 1,
                            });
                        } else {
                            chat.setDataValue("numberOfUnreadText", 1);
                        }

                        chat.setDataValue("recipientReadStatus", false);
                    } else {
                        chat.setDataValue("numberOfUnreadText", null);
                        chat.setDataValue("recipientReadStatus", true);
                    }
                } else {
                    if (
                        currentSenderStatus?.getDataValue("activeRoom") !==
                        `c-${roomId}`
                    ) {
                        if (unReadTextNo) {
                            chat = await chat.increment("numberOfUnreadText", {
                                by: 1,
                            });
                        } else {
                            chat.setDataValue("numberOfUnreadText", 1);
                        }
                    } else {
                        chat.setDataValue("numberOfUnreadText", null);
                        chat.setDataValue("recipientReadStatus", true);
                    }
                    chat.setDataValue("senderId", msgData.senderId);
                    chat.setDataValue("recipientId", initialSenderId);
                }

                chat.setDataValue("lastText", msgData.text);

                // chat.setDataValue("senderId",msgData.senderId)
            }

            let newChat = await chat?.save();
            const recipient = await CommodityUser.findByPk(msgData.recipientId);

            if (message && recipient) {
                const chatMessage: ChatReturnType = {
                    _id: message.getDataValue("id"),
                    text: message.getDataValue("text"),
                    image: message.getDataValue("image"),
                    audio: message.getDataValue("audio"),
                    video: message.getDataValue("video"),
                    sent: message.getDataValue("sent"),
                    received: message.getDataValue("received"),
                    pending: message.getDataValue("pending"),
                    createdAt: message.getDataValue("createdAt"),
                    user: {
                        _id: recipient?.getDataValue("id"),
                        name: recipient?.getFullname(),
                        avatar: recipient?.getDataValue("profileImage"),
                    },
                };
                socketIO.to(`c-${roomId}`).emit(`c-${roomId}`, chatMessage);
                console.log({ UpdatedConv: chat?.dataValues });
                socket.to(`c-${roomId}`).emit("conversation", newChat);
            }

            // socket.emit('test',JSON.stringify({text:"Welcome to my chat"}))
        } catch (err) {
            console.error(err);
        }
    });

    ///////////////////////listen for online status /////////////////////

    socket.on("online", async (data: any) => {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    online: data.online,
                    userId: data.userId,
                });
                socket.emit("online", createdStatus.dataValues);
            } else {
                let updatedStatus = await status.update({
                    online: data.online,
                });
                socket.emit("online", updatedStatus.dataValues);
            }

            console.log(data);
            socket.broadcast.emit("online", data);
        } catch (err) {
            console.log(err);
        }
    });

    //////////////////////// update typing status ///////////////////////
    socket.on("typing", async (data: any) => {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    typing: data.typing,
                    userId: data.userId,
                });
                socket.broadcast
                    .to(`c-${roomId}`)
                    .emit("typing", createdStatus.dataValues);
            } else {
                let updatedStatus = await status.update({
                    typing: data.typing,
                });
                socket.broadcast
                    .to(`c-${roomId}`)
                    .emit("typing", updatedStatus.dataValues);
            }
        } catch (err) {
            console.log(err);
        }
    });

    /////////////////////// listening for recording///////////////////////////////////////

    socket.on("recording", async (data: any) => {
        try {
            socket.broadcast.to(`c-${roomId}`).emit("recording", data);
        } catch (err) {
            console.log(err);
        }
    });

    /////////////////////// update and check if a user is on a particular ChatRoom ////////////////
    socket.on("activeRoom", async (data: any) => {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    activeRoom: data.activeRoom,
                    userId: data.userId,
                });
                console.log("created", {
                    activeRoom: createdStatus.getDataValue("activeRoom"),
                });
            } else {
                let updatedStatus = await status.update({
                    activeRoom: data.activeRoom,
                });
                console.log("updated", {
                    activeRoom: updatedStatus.getDataValue("activeRoom"),
                });
           
            }
            console.log(`User ${data.userId} is in room ${data.activeRoom}`);
        } catch (err) {
            console.log(err);
        }
    });
});

let PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("Server started on port ", PORT);
});
