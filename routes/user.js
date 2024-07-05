import express from "express";
import path from "path";

const router = express.Router();
const __dirname = path.resolve();

router.get("/login", (req, res) => {
  res.sendFile(__dirname + "/views/login.html");
});

router.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/views/signin.html");
});

router.get("/:userId", (req, res) => {
  res.sendFile(__dirname + "/views/member.html");
});

router.get("/:userId/password", (req, res) => {
  res.sendFile(__dirname + "/views/member_edit.html");
});

export default router;
