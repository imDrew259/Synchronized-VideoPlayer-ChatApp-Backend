import bcrypt from 'bcryptjs';
import { Err } from '../helpers/errorHandler.js';
import roomModel from '../models/roomModel.js';

export const createRoom = (req, res, next) => {
    
    var body = req.body;
    body.host = req.user._id;
    
    // check if password is enabled
    if(body.password)
    {
        body.isPassword = true;
        body.open = false;
    }
    
    bcrypt.hash(body.password, 4)
        .then((data) => {
            body.password = data;
            roomModel.create(body)
		        .then((room) => {
			        delete room.password;
                    return res.status(200).json({ room, message: "Room is created successfully." });
                })
                .catch((err) => {
                    next(err);
                });
            })
        .catch((err) => {
            next(err);
        });
};

export const patchRoom = async (req, res) => {

    const { roomId } = req.params;

};

export const delRoom = (req, res, next) => {
    const { roomId } = req.params;

    roomModel.findById(roomId)
        .then((data) => {
            if(data)
            {
                if(req.user._id == data.host)
                {
                    roomModel.findByIdAndDelete(roomId)
                        .then(() => {
                            return res.status(200).json({ message: 'Room deleted successfully.' });
                        })
                        .catch((err) => {
                            next(err);
                        });
                }
                else
                throw new Err("You are not authorized.", 401);
            }
            else
            throw new Err('You request is not valid.', 400);
        })
        .catch((err) => {
            next(err);
        });

};

export const getRooms = (req, res, next) => {

	roomModel.find({ open: true }, ["name", "host"])
		.populate("host", "username")
		.then((data) => {
			return res.status(200).json({ rooms: data });
		})
		.catch((err) => {
            next(err);
		});
};

export const getRoom = (req, res, next) => {
    const { roomId } = req.params;

	roomModel.findById(roomId, ["name", "host", "isPassword", 'open', 'lock'])
		.then((data) => {
			return res.status(200).json({ room: data });
		})
		.catch((err) => {
			next(err);
		});
};

export const myRoom = (req,res, next) => {
    
    roomModel.find({ host: req.user._id },["name"])
        .then((myrooms) => res.status(200).json({ myrooms }))
        .catch((err) => next(err));         
};