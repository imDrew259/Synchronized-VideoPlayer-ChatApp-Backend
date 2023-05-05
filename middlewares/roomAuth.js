import roomModel from '../models/roomModel.js';
import { Err } from '../helpers/errorHandler.js';
import bcrypt from 'bcryptjs';

const roomAuth = async (req, res, next) => {

    const { roomId } = req.params;

    await roomModel.findById(roomId)
        .then((room) => {
            if(room.open)
            next();
            else if(room.isPassword)
            {
                const { password } = req.body;
                bcrypt.compare(password, room.password)
                    .then((check) => {
                        if(check)
                        next();
                        else
                        throw new Err("Wrong Password Entered.", 403)
                    })
                    .catch((err) => {
                        next(err);
                    });

            }
            else
            {
                if(room.allowedUsers.indexOf(req.user.username) === -1)
                throw new Err('You are not allowed to join this room contact host.', 401);
                else
                next();
            }
        })
        .catch((err) => {
            next(err);
        });
};

export default roomAuth;