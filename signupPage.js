import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";
import { app, createConnection } from "./index.js";

const router= express.Router();

router.post("/signup", async (request, response) => {
  try {
    const { firstName, lastName, username, password, confirmPassword } = request.body;
    console.log({ username, password });
    // response.send({username, password});
    async function generatePassword(password) {
      const no_of_rounds = 10;
      const salt = await bcrypt.genSalt(no_of_rounds);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    }
    if (password === confirmPassword) {
      const hashedPassword = await generatePassword(password);
      console.log({ hashedPassword });
      // response.send({ hashedPassword });
      async function getUserByName(username) {
        const client = await createConnection();
        const userName = await client
          .db("gmail-clone")
          .collection("users")
          .find({ username: username })
          .toArray();
        return userName;
      }
      const userFromDB = await getUserByName(username);

      if (userFromDB[0] === undefined) {
        const pattern = new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[-+_!@#$%^&*.,?]).+$"
        );
        if (password.length < 8) {
          response.status(400).send({ message: "Password is too short",statusCode:400 });
        } else if (pattern.test(password)) {
          const client = await createConnection();
          const user = await client
            .db("gmail-clone")
            .collection("users")
            .insertOne({ firstName, lastName, username, password, hashedPassword });
          response.status(200).send({ firstName, lastName, username, password, hashedPassword,message:"User have been created please login",statusCode:200 });
          console.log(user);
          return user;
        } else {
          response.status(400).send({
            message: "Given password is weak, please give strong password with one lower case, one uppercase, one numeric value and atleast one special character",
            statusCode:400
          });
        }
      } else{
        response.status(200).send({message:"email already registered please login",
        statusCode:200
      });
      }
      // else {
      //   const storedHashedPassword = userFromDB[0].hashedPassword;
      //   const isPasswordMatch = await bcrypt.compare(
      //     password,
      //     storedHashedPassword
      //   );
      //   console.log(isPasswordMatch);

      //   if (isPasswordMatch) {
      //     const token = jwt.sign(
      //       { id: userFromDB[0]._id },
      //       process.env.SECRET_KEY
      //     );
      //     response
      //       .status(200)
      //       .send({ message: "successfull login", token: token });
      //   } else {
      //     response.status(400).send({ message: "Invalid Credentials" });
      //   }
      // }
    } else {
      response.status(400).send({ message: "Enter same password",statusCode:400 });
    }
  } catch (err) {
    console.log(err.message);
  }
});
 export const signupRouter= router;