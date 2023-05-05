import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

import { auth, socketAuth } from "./middlewares/auth.js";
import { errorHandler } from "./helpers/errorHandler.js";
import handleSocket from "./controllers/socketController.js";
import userRoute from "./routes/userRoute.js";
import roomRoute from "./routes/roomRoute.js";
import videoSearchRoute from "./routes/videoSearchRoute.js";
import { logCheck, logErr, logReq } from "./helpers/debugger.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(auth);
app.use("/user", userRoute);
app.use("/room", roomRoute);
app.post("/videoSearch", videoSearchRoute);
app.use((err, req, res, next) => errorHandler(err, req, res, next));

io.use(socketAuth);
io.on("connection", (socket) => handleSocket(io, socket));

const PORT = process.env.PORT;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    server.listen(PORT, () =>
      console.log(`The server is running on port: ${PORT}`)
    )
  )
  .catch((error) => console.log(error.message));

  logCheck("Check is here.");
  logErr("Error is here.");
  logReq("Request is here.");
