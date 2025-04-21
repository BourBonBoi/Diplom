import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <header className="app-header">
      <nav className="nav-links">
        <Link to="/MainPage">Проекты</Link>
        <Link to="/create-note">Создать проект</Link>
        <Link to="/Users">Пользователи</Link>
        <Link to="/account" className="nav-link">Мой аккаунт</Link>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Выйти
      </button>
    </header>
  );
};

export default Header;
