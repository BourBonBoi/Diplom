import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";  // Импорт useNavigate
import "../style/AuthPage.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();  // Инициализация useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      localStorage.setItem("accessToken", res.data.accessToken);  // Сохраняем токен
      setMessage(res.data.msg || "Вход");

      // Перенаправляем на страницу MainPage после успешного входа
      navigate("/MainPage");

    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.msg);
      } else {
        setMessage("Ошибка входа");
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <form className="auth-form" onSubmit={handleLogin}>
        <h3>Вход</h3>

        {message && (
          <div className="success-message">
            <p>{message}</p>
          </div>
        )}

        <label className="auth-label" htmlFor="username">
          Логин
        </label>
        <input
          type="text"
          id="username"
          className="auth-input"
          placeholder="Введите логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="auth-label" htmlFor="password">
          Пароль
        </label>
        <input
          type="password"
          id="password"
          className="auth-input"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">
          Войти
        </button>

        <p className="auth-p">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
