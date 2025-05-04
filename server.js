import express from 'express';
import cors from 'cors';
import http from 'http';                      // ✅ שלב 1 – מודול http
import { Server } from 'socket.io';           // ✅ שלב 1 – socket.io

const app = express();
const port = process.env.PORT || 3001;


app.use(cors());
app.use(express.json());

const storeOrdersMap = new Map();



const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log("🟢 New client connected:", socket.id);

    socket.on("joinStoreRoom", (roomName) => {
        socket.join(roomName);
        console.log(`🏪 Socket ${socket.id} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log("🔴 Client disconnected:", socket.id);
    });
});

app.post('/sendOrder', (req, res) => {
    const {clientName, totalPrice, location, street, status, products } = req.body;
    const storeId = req.body.storeId;
    if(storeOrdersMap.has(storeId)){
        storeOrdersMap.set(storeId, storeOrdersMap.get(storeId) + 1);
    }
    else{
        storeOrdersMap.set(storeId, 1);
    }

    const newOrder = {
        id: storeOrdersMap.get(storeId),
        clientName,
        totalPrice,
        location,
        street,
        status,
        products
    };

    console.log('📦 New order received:', newOrder);
    io.to(`store-${storeId}`).emit('newOrder', newOrder);


    res.status(201).json(newOrder);
});

server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
