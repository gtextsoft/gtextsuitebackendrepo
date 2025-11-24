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
// import propertiesRoutes from './routes/propertiesRoutes';
// import bookingsRoutes from './routes/bookingsRoutes';
// import inquiriesRoutes from './routes/inquiriesRoutes';
const connectDB_1 = require("./db/connectDB");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
(0, connectDB_1.connectDB)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'https://gtextsuite.com'],
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use((0, cookie_parser_1.default)()); // Parse cookies from requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', async (_req, res) => {
    res.json({ message: 'Hello World' });
});
app.use('/api/users', users_1.default);
// app.use('/api/properties', propertiesRoutes);
// app.use('/api/bookings', bookingsRoutes);
// app.use('/api/inquiries', inquiriesRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
