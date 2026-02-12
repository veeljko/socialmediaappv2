const { io } = require("socket.io-client");

const socket = io("http://localhost:3005");

const userId = "696cb7c17ba782bf6900a677";

socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.emit("register", userId);
});

socket.on("new_notification", (data) => {
    console.log("New notification:", data);
});
