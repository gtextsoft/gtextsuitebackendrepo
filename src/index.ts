import cookieParser from 'cookie-parser';
import express from 'express';

// import cookieParser from 'cookie-parser';
// import usersRoutes from './routes/usersRoutes';
// import propertiesRoutes from './routes/propertiesRoutes';
// import bookingsRoutes from './routes/bookingsRoutes';
// import inquiriesRoutes from './routes/inquiriesRoutes';

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cookieParser()); // Parse cookies from requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (_req, res) => {
    res.json({ message: 'Hello World' });
});

// app.use('/api/users', usersRoutes);
// app.use('/api/properties', propertiesRoutes);
// app.use('/api/bookings', bookingsRoutes);
// app.use('/api/inquiries', inquiriesRoutes);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

