import { createRequire } from "module";
const require = createRequire(import.meta.url);
import { getUserByName } from "./loginPage.js";
import express from "express";
import jwt from 'jsonwebtoken';
import { app, JWT_SECRET } from "./index.js";
import dotenv from "dotenv";
dotenv.config();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const router=express.Router();

router.post("/login/forgot-password", async (req, res) => {
  try {


    const { username } = req.body;
    // check if this username exist in database
    const userFromDB = await getUserByName(username);



    if (userFromDB[0] === undefined) {
      res.status(400).send({ message: "User is not Registered", statusCode: 400 });
    } else {
      const secret = JWT_SECRET + userFromDB[0].hashedPassword;
      const payload = {
        email: userFromDB[0].username,
        id: userFromDB[0]._id
      };
      const token = jwt.sign(payload, secret, { expiresIn: '15m' });
      const link = `http://localhost:3000/reset-password/${userFromDB[0].username}/${token}`;

    var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Email,
    pass: process.env.Password
  }
});

var mailOptions = {
  from: process.env.Email,
  to: payload.email,
  subject: 'Reset Password',
  html: `<p>Hi, please click the below link to reset password for your Gmail clone app</p>
        <a href=${link} target="_blank">Click here to change the password</a>`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

      res.status(200).send({ link: link, statusCode: 200, message: "Password reset link sended to the given mail id" });
    }

  } catch (error) {

    console.log(error.message);
    res.send(error.message);
  }
});

export const forgotPasswordRouter= router;