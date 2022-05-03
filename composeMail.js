import express from "express";
import { auth } from "./auth.js";
import { app, createConnection } from "./index.js";

const router= express.Router();

router.post("/compose", auth, async (request, response) => {
  try {
    const { to, from, subject, message } = request.body;
    const client = await createConnection();

    const isUserExist= await client
          .db("gmail-clone")
          .collection("users")
          .find({username:to}).toArray();
          console.log(isUserExist[0])
    if(isUserExist[0]===undefined){
      response.status(400).send({message:"The receiver doesn't have an account in our app", statusCode:400})
    } else{    
    const sentMessage = await client
      .db("gmail-clone")
      .collection("users")
      .updateOne({ username: from }, { $push: {sentMessage:{subject:subject,sentMessage: message, to:to}}});

    const receivedMessage = await client
      .db("gmail-clone")
      .collection("users")
      .updateOne({ username: to }, { $push: {receivedMessage:{subject:subject, receivedMessage: message, from:from }} });

    response.status(200).send({ message: "Message has been sent",statusCode:200 });
    return sentMessage, receivedMessage;
    }
  } catch (err) {
    console.log(err);
  }
});
 export const composeRouter=router;