import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import Room from "./models/Rooms";
import User from "../src/models/Users";
import { ChatReturnType } from "../src/types/types";
import { Server } from "socket.io";
import router from "./controllers/ChatController";
import proxyRouter from './controllers/ProxyController'
import Status from "./models/Status";
import Message from "./models/Messages";
import { Op } from "sequelize";
import authorizeApiAccess from "./middlewares/ApiAccess";
import { runUserConsumer } from "./events/consumers";
import NotificationService from "./services/notification_service";
import axios from "axios";

type NotificationData = {
    token: string;
    body: string;
    title: string;
    data: {
        url: string;
    };
};

const notification = new NotificationService()

dotenv.config();
// Create an Express app and HTTP server
const app = express();
app.use(express.json());
app.use(cors());
app.use(authorizeApiAccess)
app.use(router);
app.use(proxyRouter)


const server = http.createServer(app);

///// RUN USER CONSUMER FROM KAFKA BROKERS ////////

// runUserConsumer().catch(err =>{
//     console.log("Consumer Error from Server with Id",process.env.SERVER_ID,"=>",err)
// })

const socketIO = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    connectTimeout: 5000,
});

app.get("/", (req, res) => {
    res.status(200).json({ text: "Welcome" });
});

// socketIO.send("Hello client")



socketIO.on("connection", async (socket) => {
    let roomId = socket.handshake.query.roomId || "" satisfies string;
    let userId = socket.handshake.query.userId;
    let roomType = socket.handshake.query.roomType || "";
    console.log({ roomId,roomType,userId });

    if (roomId) {
        /// connect or join a room if users click on the chat button on the frontend///////////////
        socket.join(String(roomId));
        console.log(`User with Id ${userId} is joins room ${roomId}`);

    }

    if (userId) {
        try {
            let status = await Status.findOne({
                where: { userId },
            });
            if (!status) {
                let createdStatus = await Status.create({
                    online: true,
                    userId,
                });
                socket.emit(String(userId), createdStatus.dataValues);
            } else {
                let updatedStatus = await status.update({
                    online: true,
                });
                socket.emit(String(userId), updatedStatus.dataValues);
            }
            console.log(`User with Id ${userId} is online`);
        } catch (err) {
            console.log(err);
        }
    }

    /////////////////// JOIN A ROOM //////////////////////

    socket.on("joinRoom", (data: any) => {
        socket.join(data.room);
        console.log(`User with Id ${data.userId} joins room ${data.room}`);
    });

    //// chat between users ////////////////////////////////////

    type MessagePayload = {
        senderId:string
        recipientId:string
        image?:string
        audio?:string
        video?:string
        text?:string
        roomId:string
        otherFile:string
    }

    socket.on(String(roomId), async (msgData:MessagePayload) => {
        try {
            // console.log("From user 2");
            console.log(msgData);
            // Save the chat message to the database
            const message = await Message.create({
                senderId: msgData?.senderId,
                recipientId: msgData?.recipientId,
                text: msgData?.text,
                image: msgData?.image,
                audio: msgData?.audio,
                video: msgData?.video,
                otherFile: msgData?.otherFile,
                roomId: msgData?.roomId || roomId,
                sent: true,
                received: false,  
                pending: true,
            });

            let chat = await Room.findOne({
                where: {roomId:msgData?.roomId || roomId},
            });
            if (chat) {
                let initialSenderId = chat.getDataValue("senderId");
                let initialrecipientId = chat.getDataValue("recipientId");
                let currentSenderStatus = await Status.findOne({
                    where: { userId: initialSenderId },
                });
                let currentrecipientStatus = await Status.findOne({
                    where: { userId: initialrecipientId },
                });
                // check if the receiver have not opened the chat screen or is not on the chat screen

                await chat.update({"recipientReadStatus":false});

                let unReadTextNo = chat.getDataValue("numberOfUnreadText");
                if (initialSenderId === msgData.senderId) {
                    console.log("From the same sender");

                    console.log("No of unread", unReadTextNo);
                    if (
                        currentrecipientStatus?.getDataValue("activeRoom") !==
                        roomId
                    ) {
                        if (unReadTextNo) {
                            chat = await chat.increment("numberOfUnreadText", {
                                by: 1,
                            });
                        } else {
                            await chat.update({"numberOfUnreadText": 1});
                        }
                        await chat.update({"recipientReadStatus":false});
                    } else {
                        await chat.update({"numberOfUnreadText":null,"recipientReadStatus":null});
                    }
                } else {
                    if (
                        currentSenderStatus?.getDataValue("activeRoom") !==
                        roomId
                    ) {
                        if (unReadTextNo) {
                            chat = await chat.increment("numberOfUnreadText", {
                                by: 1,
                            });
                        } else {
                            await chat.update({"numberOfUnreadText":1});
                        }
                    } else {
                        await chat.update({"numberOfUnreadText":null,"recipientReadStatus":null});
                    }

                    await chat.update({"senderId":msgData.senderId,"recipientId":initialSenderId});
                    // chat.setDataValue("recipientId", initialSenderId);
                }

                await chat.update({"lastText":msgData.text});

                // chat.setDataValue("senderId",msgData.senderId)
            }

            let newChat = await chat?.save();
            const recipient = await User.findByPk(msgData.recipientId);

            if (message && recipient) {
                const chatMessage: ChatReturnType = {
                    _id: message.getDataValue("messageId"),
                    text: message.getDataValue("text"),
                    image: message.getDataValue("image"),
                    audio: message.getDataValue("audio"),
                    video: message.getDataValue("video"),
                    sent: message.getDataValue("sent"),
                    received: message.getDataValue("received"),
                    pending: message.getDataValue("pending"),
                    createdAt: message.getDataValue("createdAt"),
                    user: {
                        _id: recipient?.getDataValue("userId"),
                        name: recipient?.getFullname(),
                        avatar: recipient?.getDataValue("profileImage"),
                    },
                };
                socketIO.to(roomId).emit(String(roomId), chatMessage);
                console.log({ UpdatedConv: chat?.dataValues });
                socket.to(String(roomId)).emit("conversation", newChat);
                
                let {data,status} = await axios.get(`http://192.168.1.98:5000/notifications/token/${msgData.recipientId}`)
                if(status === 200){
                    let notificationTokens = data.data
                    let notificationMsgs:NotificationData[] = []
                    for(let notificationToken of notificationTokens){
                        let notificationMsg:NotificationData = {
                            body:chatMessage.text,
                            title:'',
                            token:notificationToken,
                            data:{
                                url:`com.commodity.sl:/chat`}}
                        notificationMsgs.push(notificationMsg)
                    }
    
                    notification.sendNotification(notificationMsgs).then(()=>{
                        console.log("Notifaction Sent")
                    }).catch((err)=>{
                        console.log(err)
                    })

                }
              
            }

            // socket.emit('test',JSON.stringify({text:"Welcome to my chat"}))
        } catch (err) {
            console.error(err);
        }
    });

    ///////////////////////listen for online status /////////////////////

    socket.on("online", async (data: any) => {
        try {
            let status = await Status.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await Status.create({
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
            // let status = await Status.findOne({
            //     where: { userId: data.userId },
            // });
            // if (!status) {
            //     let createdStatus = await Status.create({
            //         status:"typing",
            //         userId: data.userId,
            //     });
            //     socket.broadcast
            //         .to(roomId)
            //         .emit("typing", createdStatus.dataValues);
            // } else {
            //     let updatedStatus = await status.update({
            //         status:"typing",
            //     });
            //     socket.broadcast
            //         .to(roomId)
            //         .emit("typing", updatedStatus.dataValues);
            // }

            socket.broadcast
            .to(roomId)
            .emit("typing",data);
        } catch (err) {
            console.log(err);
        }
    });

    /////////////////////// listening for recording///////////////////////////////////////

    socket.on("recording", async (data: any) => {
        try {
            socket.broadcast.to(roomId).emit("recording", data);
        } catch (err) {
            console.log(err);
        }
    });

    /////////////////////// update and check if a user is on a particular Room ////////////////

    socket.on("activeRoom", async (data: any) => {
        try {
            console.log("ACTIVE ROOM", data);
            roomId = data.roomId
            console.log(`User with Id ${data.userId} joins room ${data.roomId}`);
            let status = await Status.findOne({
                where: { userId: data.userId },
            });
            if (!status) {
                let createdStatus = await Status.create({
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
            console.log(
                `User ${data.userId} is active in room ${data.activeRoom}`
            );
        } catch (err) {
            console.log(err);
        }
    });

    //////////////////////// LISTEN FOR DISCONNECTION /////////////////////////////////////////////
    socket.on("disconnect", async () => {
        try {
            let status = await Status.findOne({
                where: { userId },
            });

            if (status) {
                let updatedStatus = await status.update({
                    online: false,
                    activeRoom: null,
                });
                console.log(`User with Id ${userId} is offline`);
                socket.broadcast.emit(String(userId), updatedStatus.dataValues);
            } else {
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
