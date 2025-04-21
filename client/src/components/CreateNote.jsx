import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import '../style/CreateNote.css'
import { FiPlusCircle, FiUpload } from 'react-icons/fi'
import Header from '../components/Header'

axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:5000/api/auth/refresh_token', { 
          token: refreshToken 
        });
        
        localStorage.setItem('accessToken', response.data.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
        return axios(originalRequest);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

const CreateNote = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('')
  const [photo, setPhoto] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // Варианты приоритетов
  const priorityOptions = [
    { value: 'urgent-important', label: 'Срочное и важное' },
    { value: 'not-urgent-important', label: 'Не срочное, но важное' },
    { value: 'urgent-not-important', label: 'Срочное, но не важное' },
    { value: 'not-urgent-not-important', label: 'Не срочное и не важное' }
  ]

  const handleCreateNote = async (e) => {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('deadline', deadline);
    formData.append('priority', priority);
    if (photo) formData.append('photo', photo);
  
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setMessage('Ошибка: требуется авторизация');
        navigate('/');
        return;
      }
  
      const res = await axios.post('http://localhost:5000/api/tasks', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setMessage('Заметка успешно создана!');
      navigate('/MainPage');
    } catch (err) {
      setMessage(err.response?.data?.msg || 'Ошибка при создании проекта');
      console.error('Ошибка запроса:', err.response);
    }
  };

  return (
    <div>
      <Header />
      <div className='create-note'>
        <h3>Создание Проекта</h3>

        {message && (
          <div
            className={`message ${
              message.includes('успешно') ? 'success' : 'error'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleCreateNote}>
          <label htmlFor='title'>Заголовок</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />

          <label htmlFor='description'>Описание</label>
          <textarea
            id='description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          ></textarea>

          <label htmlFor='deadline'>Дедлайн</label>
          <input
            type='date'
            id='deadline'
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            required
          />

          <label htmlFor='priority'>Приоритет</label>
          <select
            id='priority'
            value={priority}
            onChange={e => setPriority(e.target.value)}
            required
          >
            <option value="">Выберите приоритет</option>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor='photo'>Фото (необязательно)</label>
          <div className='file-input-container'>
            <label htmlFor='photo' className='file-input-button'>
              <FiUpload style={{ marginRight: '8px' }} />
              {photo ? photo.name : 'Загрузить фото'}
            </label>
            <input
              type='file'
              id='photo'
              onChange={e => setPhoto(e.target.files[0])}
            />
          </div>

          <button type='submit'>
            <FiPlusCircle style={{ marginRight: '8px' }} />
            Создать Проект
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateNote