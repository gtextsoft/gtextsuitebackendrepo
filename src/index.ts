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
    origin: [
        'http://localhost:3000',
        'https://gtextsuite.vercel.app',
        'https://www.gtextsuite.com',
        'https://gtextsuite.com',
        'https://www.gtextsuites.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
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

