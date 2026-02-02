import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
// import cookieParser from 'cookie-parser';
import usersRouter from './routes/users';
import propertiesRoutes from './routes/properties';
import bookingsRoutes from './routes/bookings';
import inquiriesRoutes from './routes/inquiries';
import toursRoutes from './routes/tours';
import uploadsRoutes from './routes/uploads';
import cleanupRoutes from './routes/cleanup';

import { connectDB } from './db/connectDB';
import dotenv from 'dotenv';
dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://gtextsuite.vercel.app',
            'https://www.gtextsuite.com',
            'https://gtextsuite.com',
            'https://www.gtextsuites.com',
            'https://gtextsuites.com',
            '*',
        ];
        
        // Check if the origin is in the allowed list
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log for debugging
            console.warn(`CORS: Blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

app.use(cookieParser()); // Parse cookies from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (_req, res) => {
    res.json({ message: 'Hello World' });
});

app.use('/api/users', usersRouter);
app.use('/api/properties', propertiesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/cleanup', cleanupRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

