const express = require("express");
const cors = require('cors');
const router = require("./routes/routes");
const { Server } = require("socket.io");
const fs = require('fs');
const logger = require('./logger')
require("dotenv").config();

logger.info('Environment: ' + process.env.NODE_ENV)

if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'prod') {
    const https = require('https');
    const app = express();
    const port = process.env.NODE_ENV==='prod' ? process.env.PROT_PROD : process.env.PORT_LOC_DEV

    let keyPath = process.env.NODE_ENV === 'dev' ? process.env.KEY_DEV : process.env.KEY_PROD;
    let certPath = process.env.NODE_ENV === 'dev' ? process.env.CERT_DEV : process.env.CERT_PROD;
    const options = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
    };

    let originURL = process.env.NODE_ENV==='dev' ? process.env.FRONTEND_URL_DEV : process.env.FRONTEND_URL_PROD
    const server = https.createServer(options, app);
    const io = new Server(server, {
        cors: {
            origin: originURL,
            methods: ["GET", "POST"]
        }
    })
    app.use(express.json())
    app.use(express.static('public'));
    const corsOptions = {
        exposedHeaders: ['successful', 'failed']
    }
    app.use(cors(corsOptions))
    app.use("/api/v1", router)
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
    app.set('socketio', io); // New: Make io instance accessible in routes/middleware
    server.listen(port, () => {
        console.log(`App running on ${port}...`);
    });
}

else {
    const http = require('http'); 
    const app = express();
    const server = http.createServer(app); 
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL_LOCAL, 
            methods: ["GET", "POST"]
        }
    });

    const port = process.env.PORT_LOC_DEV;
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
}

