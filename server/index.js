
const path = require('path');
require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.development",
});

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.options('*', cors());

mongoose.set("strictQuery", true);
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  family: 4,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB", process.env.DATABASE_URL);
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});


const authRouter = require("./routes/auth");
app.use("/api/auth", authRouter);
const tasksRouter = require("./routes/tasks");
app.use("/api", tasksRouter);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("Server listening the port " + port);
});
