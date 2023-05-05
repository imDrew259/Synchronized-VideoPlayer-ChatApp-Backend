import nodemailer from "nodemailer";
import { google } from "googleapis";
const OAuth2 = google.auth.OAuth2;
import dotenv from "dotenv";
dotenv.config();

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.CLIENT_ID2,
        process.env.CLIENT_SECRET2,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.REFRESH_TOKEN2
    });

    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
            if (err) {
                console.log('Failed to create access token :(');
                reject("Failed to create access token :(");
            }
            resolve(token);
        });
    });


    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: process.env.EMAIL,
            accessToken: accessToken,
            clientId: process.env.CLIENT_ID2,
            clientSecret: process.env.CLIENT_SECRET2,
            refreshToken: process.env.REFRESH_TOKEN2
        }
    });

    return transporter;
};

const sendMessage = async (mailOptions) => {
    let transporter = await createTransporter();
    transporter.sendMail(mailOptions, (error, info) => { 
        if(error)
        console.log(error);
    });
};

export default sendMessage;