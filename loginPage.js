import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { app, createConnection } from "./index.js";

const router= express.Router();


export async function getUserByName(username) {
  const client = await createConnection();
  const userName = await client
    .db("gmail-clone")
    .collection("users")
    .find({ username: username }).toArray();
  return userName;
}


router.post("/login", async (request, response) => {
  try {
    const { username, password } = request.body;

   
    const userFromDB = await getUserByName(username);
    if (userFromDB[0] === undefined) {
      response.status(402).send({ message: "Not a user please signup", statusCode:402 });
    } else {
      const storedHashedPassword = userFromDB[0].hashedPassword;
      const isPasswordMatch = await bcrypt.compare(password, storedHashedPassword);

      if (isPasswordMatch) {
        const token = await jwt.sign({ id: userFromDB[0]._id }, process.env.SECRET_KEY);
        response.status(200).send({ message: "Login Successfull", token: token, statusCode:200 });
      } else {
        response.status(400).send({ message: "Invalid Credentials", statusCode:400 });
      }

    }
  } catch (err) {
    console.log(err);
  }

});

 export const loginRouter=router;