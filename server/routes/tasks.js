const express = require("express");
const router = express.Router();
const Users = require("../models/users");
const Tasks = require("../models/tasks");
const { authenticateToken } = require("../utils");
const multer = require("multer");
const fs = require("fs");
const path = require("path");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Можно загружать только изображения'), false);
    }
  }
});
const PRIORITY_TYPES = [
  "urgent-important",    
  "not-urgent-important",
  "urgent-not-important",
  "not-urgent-not-important" 
];

router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await Tasks.find({
      created_by: req.user.username,
    });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get("/task/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Tasks.findOne({
      _id: req.params.id,
      created_by: req.user.username,
    });
    if (task == null) {
      return res.status(404).json({ msg: "Проект не найден" });
    }
    res.json(task);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.post("/tasks", upload.single("photo"), authenticateToken, async (req, res) => {
  try {
    const { title, description, deadline, priority } = req.body;
    const photo = req.file ? req.file.path : null;

    if (!title || !description || !deadline) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(422).json({ 
        msg: "Укажите заголовок, описание и дедлайн" 
      });
    }

    if (priority && !PRIORITY_TYPES.includes(priority)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(422).json({
        msg: `Неверный приоритет. Допустимые значения: ${PRIORITY_TYPES.join(", ")}`
      });
    }

    const task = new Tasks({
      title,
      description,
      deadline,
      created_by: req.user.username,
      priority: priority || "not-urgent-not-important", 
      photo: req.file ? `uploads/${req.file.filename}` : null,
    });

    await task.save();
    
    res.status(201).json({ 
      msg: "Заметка успешно создана",
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        photo: task.photo ? path.basename(task.photo) : null,
        created_by: task.created_by
      }
    });

  } catch (e) {
    if (req.file) fs.unlinkSync(req.file.path);
    
    console.error("Ошибка при создании задачи:", e);
    res.status(500).json({ 
      msg: "Произошла ошибка при создании задачи",
      error: process.env.NODE_ENV === "development" ? e.message : null
    });
  }
});

router.put("/tasks/:id", authenticateToken, async (req, res) => {
  const task = req.body.task;
  if (task === undefined)
    return res
      .status(422)
      .json({ msg: "Пожалуйста, введите допустимую задачу в текст запроса" });
  try {
    const currentTask = await Tasks.findOne({
      _id: req.params.id,
      created_by: req.user.username,
    });
    if (currentTask == null) {
      return res.status(404).json({ msg: "Проект не найден" });
    }
    if (task.title !== null) currentTask.title = task.title;
    if (task.description !== null) currentTask.description = task.description;
    if (task.status !== null) currentTask.status = task.status;
    if (task.deadline !== null) currentTask.deadline = task.deadline;
    await currentTask.save();
    res.json(currentTask);
  } catch (e) {
    res.status(400).json({ msg: e.message });
  }
});

router.delete("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const targetTask = await Tasks.findOne({
      _id: req.params.id,
      created_by: req.user.username,
    });
    if (targetTask) {
      targetTask.deleteOne();
      res.status(200).json({ msg: "Проект удален" });
    } else res.status(404).json({ msg: "Проект не найден" });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

module.exports = router;
