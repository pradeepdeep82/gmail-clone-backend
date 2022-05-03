import { createRequire } from "module";
import { MongoClient } from "mongodb";
const require = createRequire(import.meta.url);
import cors from "cors";
import jwt from "jsonwebtoken";
import { request } from "http";
import dotenv from "dotenv";
import { loginRouter } from "./loginPage.js";
import { signupRouter } from "./signupPage.js";
dotenv.config();
import { composeRouter } from "./composeMail.js";
import { inboxRouter } from "./inbox.js";
import { sentRouter } from "./sent.js";
import { response } from "express";
import { userRouter } from "./users.js";
import { forgotPasswordRouter } from "./forgot-password.js";
import { getUserByName } from "./loginPage.js";
import bcrypt from "bcrypt";

const express = require("express");
export const app = express();

//While putting in heroku give process.env.PORT || 5000   heroku will automatically assign it
const PORT = process.env.PORT || 7000;

// const MONGO_URL = "mongodb://localhost";
const MONGO_URL=process.env.MONGO_URL;
export async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("MongoDB connected");
  return client;
}

app.use(express.json());
app.use(cors());

app.get("/", (request, response) => {
  response.send("Hello world.....");
});

app.listen(PORT, () => {
  console.log("app is started with PORT " + PORT);
});
app.use("/", loginRouter);
app.use("/", signupRouter);
app.use("/", composeRouter);
app.use("/", inboxRouter);
app.use("/", sentRouter);
app.use("/", userRouter);
app.use("/", forgotPasswordRouter);


// app.get("/forgot-password", req, res, next)=>{

// }
export const JWT_SECRET=process.env.JWT_SECRET;

app.put("/reset-password/:username/:token", async(req, res, next)=>{
  const {username, token}= req.params;
  // res.send(req.params);
  const {password, confirmPassword}=req.body;
  const userFromDB = await getUserByName(username);

  const secret = JWT_SECRET + userFromDB[0].hashedPassword;
  try {
   jwt.verify(token, secret);
  //  res.send("verified");
   async function generatePassword(password) {
    const no_of_rounds = 10;
    const salt = await bcrypt.genSalt(no_of_rounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
   }

    if(password===confirmPassword){
      const hashedPassword = await generatePassword(password);
      const pattern = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?]).+$"
      );
      if (password.length < 8) {
        res.status(400).send({ message: "Password is too short",statusCode:400 });
      } else if (pattern.test(password)) {
        const client = await createConnection();
        const user = await client
          .db("gmail-clone")
          .collection("users")
          .updateOne({username:username},{$set:{password:password, hashedPassword:hashedPassword}});
          
        res.status(200).send({password:password, hashedPassword:hashedPassword, message:"Password has been changed successfully",statusCode:200 });
        console.log(user);
        return user;
      } else {
        res.status(400).send({
          message: "Given password is weak, please give strong password with one lower case, one uppercase, one numeric value and atleast one special character",
          statusCode:400
        });
      }
    }else{
      res.status(400).send({ message: "Enter same password",statusCode:400 });
    }
  } catch (error) {
    console.log(error.message);
    res.send( {errorMessage:error.message,message:"Password Reset link has been expired", statusCode:402});
  }
})