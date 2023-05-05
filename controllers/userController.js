import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import sendMessage from "../mails/mail.js";
import userModel from "../models/userModel.js";
import { Err } from "../helpers/errorHandler.js";

export const userLogin = (req, res, next) => {
    const { username, password } = req.body;

    // check for user exsistance and token sign
    userModel.findOne({ username: username })
        .then((data) => {
            if (data) {
                bcrypt.compare(password, data.password)
                    .then((check) => {
                        if (check) {
                            const token = jwt.sign({ email: data.email, _id: data._id, username: data.username }, process.env.hashtoken);
                            return res.status(200).json({ token, username: data.username, _id: data._id, message: "You are logged in successfully." });
                        }
                        else
                            throw new Err('Invalid Credentials.', 403);
                    })
                    .catch((err) => {
                        next(err);
                    });
            }
            else
                throw new Err("Username does not exist.", 403);
        })
        .catch((err) => {
            next(err);
        });
};

export const userSignup = async (req, res, next) => {
    const { name, email, username, password, confirmPassword } = req.body;

    // check duplicate username
    await userModel.findOne({ $or: [{ username }, { email }] })
        .then((data) => {
            if (data) {
                if (data.email == email)
                    throw new Err("Email entered is already registered with us.", 403);
                else if (data.username == username)
                    throw new Err("Username already exsist choose another one.", 403);

                if (password !== confirmPassword)
                    throw new Err("Password and Confirm Password don't match.", 403);
            }
        })
        .catch((err) => {
            next(err);
        });

    // hashing password and creating user
    bcrypt.hash(password, 4)
        .then((hash) => {
            userModel.create({ name, email, username, password: hash })
                .then((data) => {
                    const token = jwt.sign(
                        { email: data.email, _id: data._id, username: data.username },
                        process.env.hashtoken
                    );

                    return res.status(200).json({ token, username: data.username, _id: data._id, message: "You are signuped successfully." });
                })
                .catch((err) => {
                    next(err);
                });
        })
        .catch((err) => {
            next(err);
        });
};

export const forgetpassword = (req, res, next) => {
    const { username, email } = req.body;

    userModel.findOne({ email: email, username: username })
        .then((user) => {
            if (!user)
                throw new Err("User not found with this Email", 404);
            else {
                const token = jwt.sign(
                    { _id: user._id, resetpassword: true },
                    process.env.hashtoken
                );

                const reset_link = `https://watch-party-project.web.app/resetpassword/${token}`;
                var mailOptions = {
                    from: {
                        name: "WatchParty: Password Recovery",
                        address: process.env.EMAIL,
                    },
                    to: user.email,
                    subject: `Reset Password`,
                    text: `Your reset password link is ${reset_link} . It link valid for only 15 mins.`,
                };

                sendMessage(mailOptions)
                    .then(() => res.status(200).json({ message: "Password reset link is sent on registered email." }))
                    .catch((err) => next(err));
            }
        })
        .catch((err) => next(err));
};

export const resetpassword = async (req, res, next) => {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    try {
        const user = jwt.verify(token, process.env.hashtoken);

        if (password !== confirmPassword) {
            throw new Err("Password and Confirm Password don't match.", 403);
        }

        var current_time = Date.now();

        if ((current_time / 1000 - user.iat) >= 900) {
            throw new Err("Token has expired.", 401);
        }

        bcrypt.hash(password, 4)
            .then(async (hash) => {
                userModel.findByIdAndUpdate(user._id, { password: hash })
                    .then(() => res.status(200).json({ message: "Password successfully updated. Please login with new password." }))
                    .catch((err) => next(err));
            });


    } catch (err) {
        next(err);
    }
};

export const changePassword = (req, res, next) => {

    const { currentPassword, password, confirmPassword } = req.body;

    userModel.findById(req.user._id)
        .then((user) => {
            if (!user)
                throw new Err("You request is not valid.", 400);
            else {

                if (password !== confirmPassword) {
                    throw new Err("Password and Confirm Password don't match.", 403);
                }

                if (currentPassword == password) {
                    throw new Err("Enter a new password.", 403);
                }

                bcrypt.compare(currentPassword, user.password)
                    .then((check) => {
                        if (check) {
                            bcrypt.hash(password, 4)
                                .then((hash) => {
                                    user.password = hash;
                                    user.save()
                                        .then(() => res.status(200).json({ message: "Password successfully updated." }))
                                        .catch((err) => {
                                            next(err);
                                        });
                                })
                                .catch((err) => {
                                    next(err);
                                });
                        }
                        else
                        throw new Err("You are not authorized.", 401);
                    })
            }
        })
        .catch((err) => {
            next(err);
        });
};
