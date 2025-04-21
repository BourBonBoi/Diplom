import React, { useState } from "react";
import axios from "axios"; 
import { Link } from "react-router-dom";
import '../style/RegisterPage.css';

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); 
  const [photo, setPhoto] = useState(""); 
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const user = {
      username,
      password,
      email,
      photo,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", user);
      setMessage({ text: response.data.msg, type: "успешно" });
    } catch (error) {
      if (error.response) {
        setMessage({ text: error.response.data.msg, type: "ошибка" });
      } else {
        setMessage({ text: "При регистрации произошла ошибка.", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3 className="auth-title">Регистрация</h3>
        
        {message && (
          <div className={`error-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="input-group">
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
        </div>
        
        <div className="input-group">
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
        </div>

        <button 
          type="submit" 
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner"></span>
          ) : (
            "Register"
          )}
        </button>

        <p className="auth-p">
          Есть аккаунт? <Link to="/" className="auth-link">Войти</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;