# Synchronized-VideoPlayer-ChatApp-Backend
## Description
On this web app, new users can register by creating an account. Existing users can log in using their credentials. After authentication, the user will land on a join room page. Here, he/she has to enter the room id and password. If a room with that id already exists, then the password will be checked. If the entered password is correct, then he/she will get connected to the room else error will be shown. If the room with that id doesn't exist, then a new room with the given id and password will be created. Users having the room credentials can join in that room. They can chat with each other, watch any video using its URL. The video will be in sync with all the users. If anyone pauses the video, then the video will get paused for all the users. If someone seeks the video to a particular timestamp, then the video will get seeked to that timestamp for all the users. Users can log out also.

## Getting Started
To get started with the project, you need to clone this repository on your local machine and install all the dependencies. You also need to create a MongoDB database and configure it in the backend of the project.

After configuring the backend, you can start the server using the command:

![image](https://github.com/imDrew259/Synchronized-VideoPlayer-ChatApp-Frontend/assets/87925003/037e2b3b-ba45-4ccc-8139-e682929f8aa8)

You can start the frontend using the command:
![image](https://github.com/imDrew259/Synchronized-VideoPlayer-ChatApp-Frontend/assets/87925003/253255ec-800d-4687-957a-f43bf637ba81)

After starting the frontend, you can register as a new user or login with your credentials. Once you are authenticated, you can join a room by entering the room id and password. If the room already exists, you will be asked to enter the password. If the password is correct, you will be connected to the room. If the room does not exist, a new room with the given id and password will be created.

You can chat with other users in the room and watch any video by entering its URL. The video will be in sync with all the users. If someone pauses the video, it will be paused for all the users. If someone seeks the video to a particular timestamp, the video will be seeked to that timestamp for all the users.

## Main features
1. Authentication (Login/signup)
2. Chatting feature
3. Keeping the user logged in for a period of time using JWT and cookies
4. Playing video in sync with all the users
5. Every room will be secured with a password
6. Also incorporated emojis feature to keep the chat interesting. i.e. users can create emoji in the chat box using their keyboard only. Like when a user will send this " :)" in the chat box it will automatically get converted to a smiley emoji.

## Tech stacks and concepts
1. React - For creating the frontend of the project
2. Express - Creating the server
3. MongoDB - creating the database for our project
4. Node.js - For creating the backend
5. Json WebToken - For creating the authToken for the logged-in user
6. Cookies - Storing the authToken in the cookies so that the user does not have to login every time he visits the website
7. bcrypt.js - For hashing the password before storing it in the database for security reasons
8. Websocket - For creating the socket for the users to get connected with each other in a room. They can chat and share the video URL they want to watch. When any user clicks on play, pause, or seeks the video to a timestamp, then these instructions will be sent via websocket to all the users present in that room so that their video will also come in that condition
9. React player - For playing the video using URL on the frontend
10. Material UI - for creating beautiful frontend
11. React-emoji library - for creating emoji using keyboard keys

## Thought behind the project
The main thought behind the project is to provide a platform on which friends can join in a room and chat with each other. The most important feature of this project is that they can watch any video together and that too in sync. The project uses various technologies and concepts to provide a seamless and secure experience to its users.







