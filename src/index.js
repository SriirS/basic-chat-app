const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const { generateMessage, generateLocationMessage } = require("./utils/helper");
const {
  addUser,
  getUsersInRoom,
  getUser,
  removeUser,
} = require("./utils/users");

const app = express();

const server = http.createServer(app);

const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirPath = path.join(__dirname, "../public");

app.use(express.static(publicDirPath));

io.on("connection", (socket) => {
  console.log("New connections received");

  socket.on("join", (options, cb) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return cb(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage("Admin", "Welcome"));
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    cb();
  });

  socket.on("sendMessage", (message, cb) => {
    const user = getUser(socket.id);
    if (user && user.room) {
      io.to(user.room).emit("message", generateMessage(user.username, message));
    }
    cb();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );
    }
  });

  socket.on("sendLocation", ({ longitude, latitude }, cb) => {
    const user = getUser(socket.id);
    if (user && user.room) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username,
          `https://google.com/maps?q=${latitude},${longitude}`
        )
      );
    }
    cb();
  });
});

server.listen(port, () => {
  console.log(`Chat Server is running on port ${port}!`);
});
