import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
// import cookieParser from 'cookie-parser';
import usersRouter from './routes/users';
// import propertiesRoutes from './routes/propertiesRoutes';
// import bookingsRoutes from './routes/bookingsRoutes';
// import inquiriesRoutes from './routes/inquiriesRoutes';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: ['http://localhost:3000', 'https://gtextsuite.com'],
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(cookieParser()); // Parse cookies from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (_req, res) => {
    res.json({ message: 'Hello World' });
});

app.use('/api/users', usersRouter);
// app.use('/api/properties', propertiesRoutes);
// app.use('/api/bookings', bookingsRoutes);
// app.use('/api/inquiries', inquiriesRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

