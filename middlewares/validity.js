import mongoose from "mongoose";
import { Err } from '../helpers/errorHandler.js';

export const isLoggedIn = (req, res, next) => {
    try {
        if(req.user)
        next();
        else
        throw new Err('You are not logged in.', 403);
        
    } catch (err) {
        next(err);
    };    

};

export const isValid = (req, res, next) => {

    const { roomId } = req.params;

    try {
        if(!mongoose.Types.ObjectId.isValid(roomId))
        throw new Err('Your request is not valid.', 400);
        else
        next();  
    } catch (err) {
        next(err);
    };
};