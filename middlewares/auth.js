import jwt from 'jsonwebtoken';
import { Err } from '../helpers/errorHandler.js';
import dotenv from "dotenv";
dotenv.config();

export const auth = (req, res, next) => {

    const token = req.headers.authorization?.split(' ')[1];

    if(token)
    req.user = jwt.verify(token, process.env.hashtoken);
    next();

};

export const socketAuth = (socket, next) => {

    const token = socket.handshake.headers.authorization?.split(' ')[1];

    try {
        if(token)
        socket.user = jwt.verify(token, process.env.hashtoken);
        else
        throw new Err("You are not loggedIn.", 403);
        next();
        
    } catch (err) {
        next(err);
    };


};
