import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiSave, FiEdit, FiEye, FiEyeOff } from 'react-icons/fi';
import Header from '../components/Header';
import '../style/AccountPage.css';

const AccountPage = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    visibility: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('http://localhost:5000/api/auth/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData({
          ...userData,
          username: response.data.username || '',
          email: response.data.email || '',
          visibility: response.data.visibility || false
        });
      } catch (err) {
        setError('Ошибка при загрузке данных');
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  const toggleVisibility = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const newVisibility = !userData.visibility;
      
      const response = await axios.put(
        'http://localhost:5000/api/auth/visibility',
        { visibility: newVisibility },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      setUserData({ ...userData, visibility: newVisibility });
      setMessage(response.data.msg);
    } catch (err) {
      setError(err.response?.data?.msg || 'Ошибка при изменении видимости');
      console.error('Ошибка:', err.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (isEditing && userData.newPassword !== userData.confirmPassword) {
      setError('Новые пароли не совпадают');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        'http://localhost:5000/api/auth/user',
        {
          username: userData.username,
          email: userData.email,
          currentPassword: isEditing ? userData.currentPassword : undefined,
          newPassword: isEditing ? userData.newPassword : undefined
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage('Данные успешно обновлены');
      setIsEditing(false);
      setUserData({
        ...userData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Ошибка при обновлении данных');
    }
  };

  return (
    <div className="account-page">
      <Header />
      <div className="account-container">
        <h1><FiUser /> Мой аккаунт</h1>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <form onSubmit={handleSubmit} className="account-form">
          <div className="form-group">
            <label><FiUser /> Имя пользователя</label>
            <input
              type="text"
              name="username"
              value={userData.username || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label><FiMail /> Email</label>
            <input
              type="email"
              name="email"
              value={userData.email || ''}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group visibility-toggle">
            <label>Видимость профиля:</label>
            <button
              type="button"
              className={`visibility-btn ${userData.visibility ? 'active' : ''}`}
              onClick={toggleVisibility}
              aria-label={userData.visibility ? 'Скрыть профиль' : 'Показать профиль'}
            >
              {userData.visibility ? <FiEye /> : <FiEyeOff />}
              {userData.visibility ? ' Виден всем' : ' Скрыт'}
            </button>
            {userData.visibility && (
              <span className="visibility-note">Ваш профиль виден другим пользователям</span>
            )}
        </div>

          {isEditing && (
            <>
              <div className="form-group">
                <label><FiLock /> Текущий пароль</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={userData.currentPassword || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label><FiLock /> Новый пароль</label>
                <input
                  type="password"
                  name="newPassword"
                  value={userData.newPassword || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label><FiLock /> Подтвердите пароль</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={userData.confirmPassword || ''}
                  onChange={handleInputChange}
                />
              </div>
            </>
          )}

          <div className="form-actions">
            {isEditing ? (
              <>
                <button type="submit" className="save-btn">
                  <FiSave /> Сохранить
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Отмена
                </button>
              </>
            ) : (
              <button
                type="button"
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                <FiEdit /> Редактировать
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;