const { io } = require("socket.io-client");

const userId = "69793be30b9c99952641e822";
const chatId = "698f6098fab2c49ab6862a43";
const socket = io("http://localhost:3006", {
    auth: { userId },
    reconnection : true
});
let lastMessageTimestamp = null;

socket.on("connect", () => {
    setTimeout(() => {
            socket.emit("sync_messages", {
            lastMessageTimestamp
        });
    }, 50);
});



socket.on("new_message", (msg) => {
    console.log(msg);
    lastMessageTimestamp = msg.createdAt;
});

socket.on("missed_messages", (msgs) => {
    console.log("primljena missed_messages");
    msgs.forEach(msg => {
        console.log(msg);
        lastMessageTimestamp = msg.createdAt;
    });
})

const readline = require('node:readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


function input(){
    rl.question(``, x => {
        socket.emit("send_message", {chatId, text : x});
        if (x == 0) rl.close();
        else input();
    });
}

socket.io.on("reconnect", (attempt) => {
    console.log("Reconnected after", attempt);
});

input();

