import express, { response } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
const app = express();
const __dirname = path.resolve();
dotenv.config();

console.log("API_BASE_URL:", process.env.API_BASE_URL);

import postRouter from "./routes/post.js";
import userRouter from "./routes/user.js";

app.use(express.static("public"));
app.use(cors());

app.get("/config", (req, res) => {
  const BACKEND_IP = process.env.API_BASE_URL;
  res.json({ BACKEND_IP });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});
app.use("/posts", postRouter);
app.use("/users", userRouter);
app.listen(8081, () => {
  console.log("실행");
});
