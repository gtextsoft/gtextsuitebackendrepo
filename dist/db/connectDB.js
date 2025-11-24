"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    mongoose_1.default.set("strictQuery", true);
    try {
        const connect = await mongoose_1.default.connect(process.env.MONGOD_CONNECTION_STRING);
        console.log(`Database connected sucessfully: ${connect.connection.host}`);
    }
    catch (error) {
        console.log("Error connecting to MongoDB: ", error.message);
        process.exit(1); // 1 is failure, 0 status code is success
    }
};
exports.connectDB = connectDB;
// what is the use for mongomemoryserver in express
