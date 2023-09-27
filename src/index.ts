import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import Room from "./models/Rooms";
import User from "../src/models/Users";
import { Server } from "socket.io";
import Message from "./models/Messages";
import { Op } from "sequelize";


interface ReturnBubbleMessage {
    messageId: string;
    userId: string;
    avatar: string;
    message: string;
    roomId?: string;
    username: string;
    date: string | Date;
  }
  
  interface BubbleMessage {
    senderId: string;
    recipientId:string;
    message: string;
    roomId: string;
  }

  
dotenv.config();
// Create an Express app and HTTP server
const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);



const socketIO = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    connectTimeout: 5000,
});


socketIO.on("connection", (socket) => {
    console.log("Client connected");
  
    let roomId = socket.handshake.query.roomId
    if(roomId) socket.join(roomId)
  
    socket.on("msg",async(data:BubbleMessage)=>{
          let createdMessage = await Message.create({
               ...data,
               createdAt:new Date()
          })
          let room = await Room.findByPk(data.roomId);
          if(!room){
               room = await Room.create({
                lastMessage:data.message,
                numberOfUnreadMessages:1,
                userOneId:data.senderId,
                userTwoId:data.recipientId,
              
               })
          }else{
            room = await room.update({
              lastMessage:data.message,
              numberOfUnreadMessages:1,
              userOneId:data.senderId,
              userTwoId:data.recipientId
              })
          }  
  
          let user = await User.findOne({where:{userId:data.senderId}})
          let returnMessage:ReturnBubbleMessage = {
              userId:data.senderId,
              messageId:createdMessage.getDataValue("messageId"),
              message:createdMessage.getDataValue("message"),
              avatar:user?.getDataValue("userId")||"",
              username:user?.getFullname()||"",
              roomId:createdMessage.getDataValue("roomId"),
              date:createdMessage.getDataValue("createdAt"),
             }
  
             socket.to(String(data.roomId || roomId)).emit(String(data.roomId || roomId),returnMessage)
             socket.to(String(data.roomId || roomId)).emit("conversation",returnMessage)
            })
   
  
    socket.on("typing",(data:any)=>{
      console.log("Typing",data)
      socket.broadcast.to(data.roomId || roomId).emit("typing",data)
    })
  
    socket.on("recording",(data:any)=>{
      console.log("Recording",data)
      socket.broadcast.to(data.roomId || roomId).emit("recording",data)
    })
  
  
    
    socket.on("activeRoom",(data:any)=>{
     
      socket.join(String(data.roomId))
      console.log(`User with it userId = ${data.userId} joins room ${data.roomId}`)
  
    })
  
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  



let PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log("Server started on port ", PORT);
});
