import { Kafka, Consumer } from "kafkajs";
import dotenv from "dotenv";
import { addUser, deleteUser, updateUser, updateUserVerification } from "../utils/utils";

dotenv.config();

const BROKER_1 = process.env.BROKER_1 || "";
const BROKER_2 = process.env.BROKER_2 || "";
const BROKER_3 = process.env.BROKER_3 || "";
const SERVER_ID = process.env.SERVER_ID || "";

const kafka: Kafka = new Kafka({
  brokers: [BROKER_1,BROKER_2],
  clientId: SERVER_ID,
});



export async function runUserConsumer() {
  try {
    const consumer: Consumer = kafka.consumer({ groupId: SERVER_ID });
    console.log("Connecting consumer...");
    await consumer.connect();
    console.log("Subscribing to topics...");
    await consumer.subscribe({
      topics: ["ADD_USER", "DELETE_USER", "UPDATE_USER","UPDATE_USER_VERIFICATION"],
      fromBeginning: true,
    });
    console.log("Successfully subscribed to topics!");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { serverId, ...data } = JSON.parse(message.value?.toString() || "{}");

        console.log("User Data from producer", { topic, partition,data,serverId });

        if (serverId === SERVER_ID) {
          // Do nothing if the message originated from this server
        } else {
          switch (topic) {
            case "ADD_USER":
               await addUser(data)
              // await transferCommodity(data as TransferCommodityParams);
              break;
            case "DELETE_USER":
              await deleteUser(data)
              break;
            case "UPDATE_USER":
              await updateUser(data)
              break; 
            case "UPDATE_USER_VERIFICATION":
              await updateUserVerification(data)
              break; 
            default:
              // Handle other topics if necessary
              break;
          }
        }
      },
    });
  } catch (err) {
    console.error("Failed to run commodity consumer:", err);
  }
}
