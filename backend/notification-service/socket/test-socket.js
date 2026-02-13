const { io } = require("socket.io-client");

const socket = io("http://localhost:3005");

const userId = "6985b6ed439ffc0aa5ecb9e2";

socket.on("connect", () => {
    console.log("Connected:", socket.id);
    socket.emit("register", userId);
});

socket.on("new_notification", (data) => {
    console.log("New notification:", data);
});
