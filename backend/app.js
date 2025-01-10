const express = require("express");
const cors = require("cors");
const router = require("./routes/routes");
const { Server } = require("socket.io");
const logger = require("./logger");
require("dotenv").config();

logger.info("Environment: " + process.env.NODE_ENV);

// Create HTTP server for all environments
const http = require("http");
const app = express();
const server = http.createServer(app);

// Configure Socket.IO with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL_LOCAL || "http://localhost:3000", // Default to localhost frontend
        methods: ["GET", "POST"],
    },
});

// Define port based on environment
const port =
    process.env.NODE_ENV === "prod"
        ? process.env.PORT_PROD
        : process.env.PORT_LOC_DEV || 4000; // Default to 4000 if not set

// Middleware
app.use(express.json());
app.use(express.static("public"));

const corsOptions = {
    exposedHeaders: ["successful", "failed"],
};
app.use(cors(corsOptions));

// Use routes
app.use("/api/v1", router);

// Handle Socket.IO connection
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Expose Socket.IO instance for routes/middleware
app.set("socketio", io);

// Start the server
server.listen(port, () => {
    console.log(`App running on http://localhost:${port}`);
});
