import express from "express";
import { auth } from "./auth.js";
import { app, createConnection } from "./index.js";

const router=express.Router();

router.get("/users", auth, async (request, response) => {
 try{
  const client = await createConnection();
  const users = await client
    .db("gmail-clone")
    .collection("users")
    .find({})
    .toArray();


  response.status(200).send(users.map(user => user.username));
  return users;
 }catch(err){
   console.log(err)
 }
});

export const userRouter=router;