const express = require("express");
const router = express.Router();
const RefreshTokens = require("../models/refresh");
const Users = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateAccessToken, authenticateToken } = require("../utils");
const cors = require('cors')



//src="http://localhost:5000/uploads/photo-1745165763510-111251271.jpg"
//src="http://localhost:5000//uploads/photo-1745202013691-753305960.jpg"
router.options('/visibility', cors());
router.put('/visibility', authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOneAndUpdate(
      { _id: req.user.userId }, // Используем userId из токена
      { visibility: req.body.visibility },
      { new: true }
    );
    
    if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });
    
    res.json({ 
      msg: `Видимость профиля ${user.visibility ? 'включена' : 'выключена'}`,
      visibility: user.visibility
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });
    
    res.json({
      username: user.username,
      email: user.email
    });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.put('/user', authenticateToken, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await Users.findOne({ username: req.user.username });

    if (!user) return res.status(404).json({ msg: 'Пользователь не найден' });

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ msg: 'Неверный текущий пароль' });
      
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
      }
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();
    res.json({ msg: 'Данные успешно обновлены' });
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get("/users", authenticateToken, async (req, res) => {
  try {
    const users = await Users.find({ visibility: true }).select("username email");
    res.json(users);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.get("/user/:username/tasks", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOne({ username: req.params.username });
    if (!user || user.visibility === false)
      return res.status(404).json({ msg: "Пользователь не найден или скрыт" });

    const tasks = await Tasks.find({ created_by: req.params.username });
    res.json(tasks);
  } catch (e) {
    res.status(500).json({ msg: e.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    if (!req.body.username || !req.body.password)
      return res
        .status(400)
        .send({ msg: "Введите логин и пароль" });
    const username = req.body.username;
    if (
      await Users.findOne({
        username: username,
      })
    )
      return res.status(400).send({ msg: "Такой пользователь существует" });
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userClient = { username: username, password: hashedPassword };
    const newUser = new Users(userClient);
    await newUser.save();
    res.status(201).json({ msg: "Пользователь создан" });
  } catch (e) {
    res.status(500);
  }
});

router.post("/login", async (req, res) => {
  try {
    const userClient = {
      username: req.body.username,
      password: req.body.password,
    };
    if (!userClient.username || !userClient.password)
      return res
        .status(400)
        .send({ msg: "Введите логин и пароль" });
    const user = await Users.findOne({
      username: req.body.username,
    });
    if (!user) {
      return res.status(400).send({ msg: "Такого пользователя не существует" });
    }
    const realPassword = await bcrypt.compare(req.body.password, user.password);
    if (!realPassword) {
      return res.status(400).send({ msg: "Неправильный пароль" });
    }
    const accessToken = generateAccessToken({
      username: userClient.username,
      userId: user._id,
    });
    const refreshToken = jwt.sign(
      { username: userClient.username },
      process.env.REFRESH_TOKEN_SECRET
    );
    const newRefreshToken = new RefreshTokens({
      username: userClient.username,
      refreshToken: refreshToken,
    });
    await newRefreshToken.save();
    res.json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (e) {
    res.status(500);
  }
});

router.post("/refresh_token", async (req, res) => {
  try {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    const user = await RefreshTokens.findOne({ refreshToken: refreshToken });
    if (!user._id) return res.sendStatus(403);
    const myUser = await Users.findOne({ username: user.username });
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      const accessToken = generateAccessToken({
        username: user.username,
      });
      res.json({ accessToken: accessToken, refreshToken: refreshToken });
    });
  } catch (e) {
    res.status(500);
  }
});

router.delete("/logout", async (req, res) => {
  try {
    const refreshToken = req.body.token;
    await RefreshTokens.deleteOne({ refreshToken: refreshToken });
    res.status(200).json({ msg: "Выход" });
  } catch (e) {
    res.status(500);
  }
});

module.exports = router;
