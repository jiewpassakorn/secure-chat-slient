const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const proxy = require("express-http-proxy");
const cors = require('cors')
const path = require("path");

dotenv.config();

connectDB();
const app = express();

app.use(express.json()); // to accept JSON Data

const corsOptions = {
  origin: [
"https://glowing-macaron-ccddf0.netlify.app" // Add the URL of your Netlify app
  ],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("API is Running Successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Add catch-all route for React application
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.use(
  "/api", // Path to proxy
  proxy("http://localhost:5000") // URL of your server
);

const server = app.listen(
  PORT,
  console.log(`Server Start on PORT ${PORT}`.yellow.bold)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://glowing-macaron-ccddf0.netlify.app", // for react dev http://localhost:3000
  },
});

// create a connection
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room:" + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
});
