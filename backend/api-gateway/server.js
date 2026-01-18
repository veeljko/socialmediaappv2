require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.API_GATEWAY_PORT || 3000;

app.get('/', (req, res) => {
    res.send("Server is running");
})

app.listen(port, ()=> console.log(`Dolphin app listening on port ${port}!`))