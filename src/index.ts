
import express from 'express';
import cors from 'cors'
import http from 'http';
import dotenv from "dotenv"
import CommodityChat from '../src/models/ComChats';
import CommodityUser from '../src/models/ComUsers';
import {ChatReturnType} from '../src/types/types';
import {Server} from "socket.io"
import router from './controllers/ChatController';


dotenv.config()
// Create an Express app and HTTP server
const app = express();
app.use(express.json())
app.use(cors())
app.use(router)

const server = http.createServer(app);


const socketIO = new Server(server,{cors:{origin:'*',methods:["GET","POST"]}});

app.get('/', (req, res) => {
  res.status(200).json({text:"Welcome"});
});

// socketIO.send("Hello client")

socketIO.on('connection',(socket)=>{
      console.log("Client connected")
      let roomId = socket.handshake.query.roomId
      socket.join(String(roomId))
      console.log(roomId)
      socket.send("Welcome")
      
 socket.on(String(roomId), async (msgData:any) => {
    try {
      console.log("From user 2")

      console.log(msgData)

      // Save the chat message to the database
      const chat = await CommodityChat.create({
        senderId:msgData?.senderId,
        receipientId: msgData?.receipientId,
        text: msgData?.text,
        image: msgData?.image,
        audio: msgData?.audio,
        video: msgData?.video,
        otherFile: msgData?.otherFile,
        roomId:msgData?.roomId,
        sent: true,
        received: false,
        pending: true,
      });

      const recipient = await CommodityUser.findByPk(msgData.receipientId);

      if(chat && recipient){
            const chatMessage: ChatReturnType = {
                _id: chat.getDataValue('id'),
                text: chat.getDataValue('text'),
                image: chat.getDataValue('image'),
                audio: chat.getDataValue('audio'),
                video: chat.getDataValue('video'),
                sent: chat.getDataValue('sent'),
                received: chat.getDataValue('received'),
                pending: chat.getDataValue('pending'),
                createdAt: chat.getDataValue('createdAt'),
                user: {
                _id: recipient?.getDataValue('id'),
                name: recipient?.getFullname(),
                avatar: recipient?.getDataValue('profileImage'),
                },
            };
             let socketAckResp = await socketIO.to(String(msgData.roomId)).emitWithAck(String(msgData.roomId), chatMessage);
          
 }

    // socket.emit('test',JSON.stringify({text:"Welcome to my chat"})) 
 
    } catch (err) {
      console.error(err);
    }
  });

  })

let PORT = process.env.PORT
server.listen(PORT, () => {
  console.log('Server started on port ',PORT);
});
