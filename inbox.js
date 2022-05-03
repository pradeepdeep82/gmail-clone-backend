import express from "express";
import { auth } from "./auth.js";
import { app, createConnection } from "./index.js";
import cors from "cors";

const router= express.Router();

router.get("/inbox", auth, async (request, response) => {
  try {
    const { username } = request.headers;

    const client = await createConnection();
    const data = await client
      .db("gmail-clone")
      .collection("users")
      .find({ username: username })
      .toArray();
   const receivedMessage=data[0].receivedMessage;
    response.status(200).send(receivedMessage);
    // return message[0].receivedMessage;
  } catch (err) {
    console.log(err);
  }
});

router.put("/inbox", auth, async(request, response)=>{
  try{
    const {index, username}=request.headers;
    const client= await createConnection();
     await client
    .db("gmail-clone")
    .collection("users")
    .updateOne({ username: username },{$unset:{["receivedMessage."+ index]:1}});

     await client
    .db("gmail-clone")
    .collection("users")
    .updateOne({ username: username },{$pull:{"receivedMessage":null}});
    
    const data = await client
    .db("gmail-clone")
    .collection("users")
    .find({ username: username })
    .toArray();

    const receivedMessage=data[0].receivedMessage;
    response.status(200).send(receivedMessage);
  }catch(err){
    console.log(err);
  }
})

export const inboxRouter=router;