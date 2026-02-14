const { io } = require("socket.io-client");

const userId = "6985b6ed439ffc0aa5ecb9e2";
const chatId = "698f6098fab2c49ab6862a43";
const socket = io("http://localhost:3006", {
    auth: { userId }
});
let lastMessageTimestamp = null;

socket.on("connect", () => {
    socket.emit("join_chat", chatId);

    socket.emit("sync_messages", {
        lastMessageTimestamp
    });
});


socket.on("new_message", (msg) => {
    console.log(msg);
    lastMessageTimestamp = msg.createdAt;
});

socket.on("missed_messages", (msgs) => {
    console.log("missed messages");
    msgs.forEach(msg => {
        console.log(msg);
        lastMessageTimestamp = msg.createdAt;
    });
})

socket.io.on("reconnect", (attempt) => {
    console.log("Reconnected after", attempt);
});