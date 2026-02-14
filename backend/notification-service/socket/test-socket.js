const { io } = require("socket.io-client");

const socket = io("http://localhost:3005");

const userId = "6985c03a68151d33ab8458dd";

socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.emit("register", userId);
});

socket.on("new_notification", (data) => {
    console.log("New notification:", data);
});
