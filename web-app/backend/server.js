import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import { MongoClient } from "mongodb";
import http from "http";

let envPath;
switch (process.env.NODE_ENV) {
  case "production":
    envPath = ".env.prod";
    break;
  case "development":
    envPath = ".env.dev";
    break;
  case "test":
    envPath = ".env.test";
    break;
  default:
    envPath = ".env.dev";
}

dotenv.config({ path: envPath });
console.log(`Environment: ${process.env.NODE_ENV}`);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to connect to MySQL

const connectMySQL = async () => {
  try {
    const uri = `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_PASSWORD}@${process.env.MYSQL_HOST}:${process.env.MYSQL_PORT}/${process.env.MYSQL_DB_NAME}`;
    const pool = mysql.createPool(uri);

    const connection = await pool.getConnection();

    console.log(`MySQL Connected: ${process.env.MYSQL_HOST} ✅`);
    return { connection, pool, host: process.env.MYSQL_HOST };
  } catch (error) {
    console.error(`Error from MySQL: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}`);
    throw error;
  }
};

// Function to connect to MongoDB

const connectMongoDB = async () => {
  try {
    const uri = `mongodb://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_NAME}?authSource=admin&authMechanism=SCRAM-SHA-256`;
    const client = new MongoClient(uri);

    await client.connect();

    const db = client.db(process.env.MONGODB_NAME);

    console.log(`MongoDB Connected: ${process.env.MONGODB_HOST} ✅`);
    return { connection: client, db, host: process.env.MONGODB_HOST };
  } catch (error) {
    console.error(`Error from MongoDB: ${error.message}`);
    console.error(`Stack Trace: ${error.stack}`);
    throw error;
  }
};

// Connect to MySQL
connectMySQL();

// Connect to MongoDB
connectMongoDB();

const app = express();
const port = process.env.PORT || 5000;

// CORS and other middleware configurations
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Add a route handler for the root ("/") path
app.get("/", (req, res) => {
  res.status(200).send("Index page");
});

// Handling static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Export the app for testing
export { app, connectMySQL, connectMongoDB, port };

// Check if the server is already running or start a new server
if (process.env.NODE_ENV !== "test") {
  const server = http.createServer(app);
  server.listen(port, () => console.log(`Server running on port ${port} ✅`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${port} is already in use`);
    } else {
      throw err;
    }
  });
}
