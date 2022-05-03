import express from "express";
import { auth } from "./auth.js";
import { app, createConnection } from "./index.js";

const router= express.Router();

router.get("/sent", auth, async (request, response) => {
  try {
    const { username } = request.headers;

    const client = await createConnection();
    const data = await client
      .db("gmail-clone")
      .collection("users")
      .find({ username: username })
      .toArray();

      const sentMessage=data[0].sentMessage;
    response.status(200).send(sentMessage);
    // console.log(message[0].sentMessage)
    // return message[0].sentMessage;
  } catch (err) {
    console.log(err);
  }
});
router.put("/sent", auth, async(request, response)=>{
  try{
    const {index, username}=request.headers;
    const client= await createConnection();
     await client
    .db("gmail-clone")
    .collection("users")
    .updateOne({ username: username },{$unset:{["sentMessage."+ index]:1}});

     await client
    .db("gmail-clone")
    .collection("users")
    .updateOne({ username: username },{$pull:{"sentMessage":null}});
    
    const data = await client
    .db("gmail-clone")
    .collection("users")
    .find({ username: username })
    .toArray();

    const sentMessage=data[0].sentMessage;
    response.status(200).send(sentMessage);
  }catch(err){
    console.log(err);
  }
})
export const sentRouter=router;