require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.API_GATEWAY_PORT || 3000;
const {authProxy} = require("./middlewares/auth-proxy.js");

app.use("/api/auth", authProxy);

app.post('/api/auth/', (req, res) => {

})

app.listen(port, ()=> console.log(`Api-Gateway listening on port ${port}!`))