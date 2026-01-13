import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import gigRoutes from './routes/gigRoutes.js';
import bidRoutes from './routes/bidRoutes.js';

const app= express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ENV.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

app.use(cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("Hello from Gigflow Backend Server");
});

// Test endpoint to check cookies
app.get("/api/test-cookies", (req, res) => {
    console.log('🍪 Test Cookies - Received cookies:', req.cookies);
    console.log('🍪 Test Cookies - Cookie header:', req.headers.cookie);
    res.json({
        cookies: req.cookies,
        cookieHeader: req.headers.cookie,
        message: 'Cookie test endpoint'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/gigs', gigRoutes);
app.use('/api/bids', bidRoutes);

const startServer = async()=>{
    try{
        await connectDB();
        httpServer.listen(ENV.PORT, () => {
            console.log(`Server is running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
        });

        // Socket.io connection handler
        io.on('connection', (socket) => {
            console.log(`✓ User connected: ${socket.id}`);

            // Join user to a room with their userId
            socket.on('join', (userId) => {
                if (userId) {
                    socket.join(`user:${userId}`);
                    console.log(`✓ User ${userId} joined their room`);
                }
            });

            socket.on('error', (error) => {
                console.error(`Socket error for ${socket.id}:`, error);
            });

            socket.on('disconnect', () => {
                console.log(`✗ User disconnected: ${socket.id}`);
            });
        });
    }catch(error){
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();

// Export io for use in other modules
export { io };

// Error handling middleware (must be last)
app.use(errorHandler);



