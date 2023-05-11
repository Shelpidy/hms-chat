import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import CommodityChat from "../src/models/ComChats";
import CommodityUser from "../src/models/ComUsers";
import { ChatReturnType } from "../src/types/types";
import { Server } from "socket.io";
import router from "./controllers/ChatController";
import CommodityUserStatus from "./models/ComUserStatus";

dotenv.config();
// Create an Express app and HTTP server
const app = express();
app.use(express.json());
app.use(cors());
app.use(router);

const server = http.createServer(app);

const socketIO = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },connectTimeout:5000
});

app.get("/", (req, res) => {
    res.status(200).json({ text: "Welcome" });
});

// socketIO.send("Hello client")

socketIO.on("connection", async (socket) => {
    console.log("Client connected");
    let roomId = socket.handshake.query.roomId;
    let userId = socket.handshake.query.userId;
    if (roomId) {
        /// connect or join a room if users click on the chat button on the frontend///////////////
        socket.join(String(roomId));
    }
    if (userId) {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId: userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    online: true,
                    userId
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
    console.log(roomId, userId);

    //// chat between users ////////////////////////////////////

    socket.on(String(roomId), async (msgData: any) => {
        try {
            console.log("From user 2");
            console.log(msgData);
            // Save the chat message to the database
            const chat = await CommodityChat.create({
                senderId: msgData?.senderId,
                receipientId: msgData?.receipientId,
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

            const recipient = await CommodityUser.findByPk(
                msgData.receipientId
            );

            if (chat && recipient) {
                const chatMessage: ChatReturnType = {
                    _id: chat.getDataValue("id"),
                    text: chat.getDataValue("text"),
                    image: chat.getDataValue("image"),
                    audio: chat.getDataValue("audio"),
                    video: chat.getDataValue("video"),
                    sent: chat.getDataValue("sent"),
                    received: chat.getDataValue("received"),
                    pending: chat.getDataValue("pending"),
                    createdAt: chat.getDataValue("createdAt"),
                    user: {
                        _id: recipient?.getDataValue("id"),
                        name: recipient?.getFullname(),
                        avatar: recipient?.getDataValue("profileImage"),
                    },
                };
                
                    socketIO.to(String(roomId))
                    .emit(String(msgData.roomId), chatMessage);
            }

            // socket.emit('test',JSON.stringify({text:"Welcome to my chat"}))
        } catch (err) {
            console.error(err);
        }
    });

    ////listen for online status /////////////////////

    socket.on("online", async (data: any) => {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    online: data.online,
                    userId:data.userId
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

    //// update typing status ////////////////////

    socket.on("typing", async (data: any) => {
        try {
            let status = await CommodityUserStatus.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await CommodityUserStatus.create({
                    typing: data.typing,
                });
                socket.broadcast
                    .to(String(roomId))
                    .emit("typing", createdStatus.dataValues);
            } else {
                let updatedStatus = await status.update({
                    typing: data.typing,
                });
                socket.broadcast
                    .to(String(roomId))
                    .emit("typing", updatedStatus.dataValues);
            }
        } catch (err) {
            console.log(err);
        }
    });
});

let PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("Server started on port ", PORT);
});
