import bcrypt from 'bcryptjs';
import { addUser, removeUser, getUser, getUsersInRoom, closeRoom, checkUser } from "./logic.js";
import roomModel from "../models/roomModel.js";

const handleSocket = (io, socket) => {

    socket.on('new-member', (room, password) => {
        roomModel.findById(room)
            .then(async (data) => {
                var isHost = false;
                var isAdmin = false;

                if(data.host == socket.user._id)
                {
                    isHost = true;
                    isAdmin = true;
                }

                if(!data.lock || isHost)
                {
                    if(data.isPassword && !isHost )
                    {
                        if(password == '' || password === undefined)
                        {
                            io.to(socket.id).emit('error', { message: 'Wrong password entered!' });
                        }
                        else
                        {
                            await bcrypt.compare(password, data.password)
                                .then(async (check) => {
                                    if(check)
                                    {
                                        const checkUr = checkUser(socket.user._id);
                                        if(checkUr)
                                        {
                                            socket.to(socket.id).emit('error', { message: 'You are Joined in some other room' });
                                        }
                                        else
                                        {
                                            const user = await addUser({  _id: socket.user._id, socketId: socket.id, username: socket.user.username, isAdmin, isHost, room });
                                            socket.join(user.room);
                                            const users = getUsersInRoom(user.room);
                    
                                            socket.emit('alert',`Welcome ${user.username}`);
                                            socket.broadcast.to(user.room).emit('alert', `${user.username} has joined!` );
                                            io.to(user.room).emit('member-connected', users );
                                            
                                        }
                                       
                                    }
                                    else
                                    {
                                        io.to(socket.id).emit('error', { message: 'Wrong password entered!' });
                                    }
                                })
                                .catch((error) => {
                                    console.log(error);
                                    io.to(socket.id).emit('error', { message: error.message });
                                });
                        }
                    }
                    else
                    {
                        const checkUr = checkUser(socket.user._id);
                        if(checkUr)
                        {
                            io.to(socket.id).emit('error', { message: 'You are Joined in some other room' });
                        }
                        else
                        {
                            const user = await addUser({  _id: socket.user._id, socketId: socket.id, username: socket.user.username, isAdmin, isHost, room });
                            socket.join(user.room);
                            const users = getUsersInRoom(user.room);
                    
                            socket.emit('alert',`Welcome ${user.username}`);
                            socket.broadcast.to(user.room).emit('alert', `${user.username} has joined!` );
                            io.to(user.room).emit('member-connected', users );
                        }
                       
                    }                    
                }
                else
                {
                    io.to(socket.id).emit('error', { message: 'The room is locked by Host.'});
                }
            })
            .catch((error) => {
                console.log(error);
                io.to(socket.id).emit('error', { message: error.message });
            });
        
    });

    socket.on('message', ({ value, date, roomId }) => {
        const message = value;
        socket.to(roomId).emit('message', { username: socket.user.username, message, date })
    });

    socket.on('request-sync', (socketId) => {
        io.to(socketId).emit('request-sync');
    });

    socket.on('play-pause', ({ playing, roomId }) => {
        io.to(roomId).emit('play-pause', playing);
    });

    socket.on('url', ({ roomId, val }) => {
        const user = getUser(socket.user.username, roomId);
        if(user.isAdmin)
        io.to(roomId).emit('url', val);
        else
        io.to(socket.id).emit('error', { message: 'You are not admin.' });

    });

    socket.on('seek', (data) => { 
        io.to(data.roomId).emit('seek', data)
    });

    socket.on('voice', ({ roomId, blob }) => {
        socket.to(roomId).emit('voice', blob);
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.user._id);
        if(user) {
            const users = getUsersInRoom(user.room);
            io.to(user.room).emit('alert', `${user.username} has left.` );
            io.to(user.room).emit('member-connected', users);
          }        
    });

    socket.on('add-admin', (user) => {
        roomModel.findById(user.room)
            .then(async (data) => {
                if(data.host == socket.user._id)
                {
                    await removeUser(user._id);
                    user.isAdmin = true;
                    user = await addUser(user);

                    const users = getUsersInRoom(user.room);
                    io.to(user.room).emit('member-connected', users);
                }
                else
                io.to(socket.id).emit('error', { message: 'You are not host.'});
            })
            .catch((error) => {
                console.log(error);
                io.to(socket.id).emit('error', { message: error.message });
            });
    });

    socket.on('remove-admin', (user) => {
        roomModel.findById(user.room)
            .then(async (data) => {
                if(data.host == socket.user._id)
                {
                    await removeUser(user._id);
                    user.isAdmin = false;
                    user = await addUser(user);

                    const users = getUsersInRoom(user.room);
                    io.to(user.room).emit('member-connected', users);
                }
                else
                io.to(socket.id).emit('error', { message: 'You are not host.'});
            })
            .catch((error) => {
                console.log(error);
                io.to(socket.id).emit('error', { message: error.message });
            });
    });

    socket.on('remove-member', (user) => {
        roomModel.findById(user.room)
            .then((data) => {
                if(data.host == socket.user._id)
                {
                    removeUser(user._id);
                    io.sockets.sockets.forEach((soc) => {
                        if(soc.id === user.socketId)
                        {
                            io.to(soc.id).emit('error', { message: 'Host removed you.' });
                            soc.disconnect();
                            const users = getUsersInRoom(user.room);
                            io.to(user.room).emit('member-connected', users);
                        }
                    });

                }
                else
                io.to(socket.id).emit('error', { message: 'You are not host.'});
            })
            .catch((error) => {
                console.log(error);
                io.to(socket.id).emit('error', { message: error.message });
            });
    });

    socket.on('lock-room', (roomId, value) => {
        roomModel.findById(roomId)
            .then(async (data) => {
                if(socket.user._id == data.host)
                {
                    data.lock = value;
                    await data.save()
                        .then((data) => {
                            if(value)
                            socket.broadcast.to(roomId).emit('alert', 'Room is locked by host.');
                            else
                            socket.broadcast.to(roomId).emit('alert', 'Room is unlocked by host.');
                            io.to(roomId).emit('room-update', data);
                        })
                        .catch((error) => {
                            console.log(error);
                            io.to(socket.id).emit('error', { message: error.message });
                        });
                }
                else
                io.to(socket.id).emit('error', { message: "You are not host." });
            })
            .catch((error) => {
                console.log(error);
                io.to(socket.id).emit('error', { message: error.message });
            });
    });

    socket.on('close-room', (roomId) => {
        roomModel.findById(roomId)
            .then((data) => {
                if(socket.user._id == data.host)
                {
                    const users = getUsersInRoom(roomId);
                    users.map((user) => {
                        io.sockets.sockets.forEach((soc) => {
                            if(soc.id === user.socketId)
                            {   
                                io.to(soc.id).emit('error', { message: 'Host closed room.' });
                                soc.disconnect();
                            }
                        });
                    });
                    closeRoom(roomId);
                }
                else
                io.to(socket.id).emit('error', { message: "You are not host." });
            })
            .catch((error) => {
                console.log(error);
                io.to(socket.id).emit('error', { message: error.message });
            });
    });

};

export default handleSocket;