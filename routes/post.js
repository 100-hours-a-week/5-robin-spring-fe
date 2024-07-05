import express from "express";
import path from "path";

const router = express.Router();
const __dirname = path.resolve();

router.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/list.html");
});

router.get("/new", (req, res) => {
  res.sendFile(__dirname + "/views/write.html");
});

router.get("/:postId", (req, res) => {
  res.sendFile(__dirname + "/views/view.html");
});
router.post("/:postId", (req, res) => {
  res.sendFile(__dirname + "/views/write.html");
});

export default router;
