"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// import cookieParser from 'cookie-parser';
const users_1 = __importDefault(require("./routes/users"));
const properties_1 = __importDefault(require("./routes/properties"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const inquiries_1 = __importDefault(require("./routes/inquiries"));
const tours_1 = __importDefault(require("./routes/tours"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const cleanup_1 = __importDefault(require("./routes/cleanup"));
const connectDB_1 = require("./db/connectDB");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, connectDB_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
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
        }
        else {
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
app.use((0, cookie_parser_1.default)()); // Parse cookies from requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', async (_req, res) => {
    res.json({ message: 'Hello World' });
});
app.use('/api/users', users_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/inquiries', inquiries_1.default);
app.use('/api/tours', tours_1.default);
app.use('/api/uploads', uploads_1.default);
app.use('/api/cleanup', cleanup_1.default);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
