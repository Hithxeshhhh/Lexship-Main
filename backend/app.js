//development
// const express = require("express");
// const cors = require('cors');
// const router = require("./routes/routes");
// require("dotenv").config();
// const app = express();
// const port = process.env.PORT
// app.use(express.json())
// app.use(express.static('public'));
// const corsOptions={
//     exposedHeaders:['successful','failed']
// }
// app.use(cors(corsOptions))
// app.use("/api/v1",router)
// app.listen(port, ()=>{console.log(`App running on ${port}`)})

//production
// const express = require("express");
// const cors = require('cors');
// const router = require("./routes/routes");
// const https = require('https');
// const fs = require('fs');
// require("dotenv").config();

// const app = express();
// const options = {
//     key: fs.readFileSync('/etc/letsencrypt/live/dev1.lexship.biz/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/dev1.lexship.biz/fullchain.pem')
// }
// const port = process.env.PORT

// app.use(express.json())
// app.use(express.static('public'));
// const corsOptions={
//     exposedHeaders:['successful','failed']
// }
// app.use(cors(corsOptions))
// app.use("/api/v1",router)

// https.createServer(options, app).listen(5000);

//socketio dev
const express = require("express");
const cors = require('cors');
const http = require('http'); // New: Import http module
const { Server } = require('socket.io'); // New: Import socket.io
const router = require("./routes/routes");
require("dotenv").config();

const app = express();
const server = http.createServer(app); // New: Create HTTP server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // replace with your frontend URL
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT;
app.use(express.json());
app.use(express.static('public'));

const corsOptions = {
    exposedHeaders: ['successful', 'failed']
};
app.use(cors(corsOptions));
app.use("/api/v1", router);

// New: Handle socket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

app.set('socketio', io); // New: Make io instance accessible in routes/middleware

server.listen(port, () => {
    console.log(`App running on ${port}`);
});


