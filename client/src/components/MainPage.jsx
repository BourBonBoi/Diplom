import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { FiTrash2, FiEdit, FiClock, FiFlag, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../style/MainPage.css";

const MainPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPosts(response.data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.msg || "Ошибка при загрузке постов");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:5000/api/tasks/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(posts.filter((post) => post._id !== postId));
    } catch (err) {
      setError(err.response?.data?.msg || "Ошибка при удалении поста");
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("ru-RU", options);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent-important": return "#ff4d4f";
      case "not-urgent-important": return "#1890ff";
      case "urgent-not-important": return "#faad14";
      case "not-urgent-not-important": return "#52c41a";
      default: return "#d9d9d9";
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="main-page">
      <Header />
      <div className="container">
        {posts.length === 0 ? (
          <div className="no-projects-container">
            <div className="no-projects">
              <h2>У вас пока нет проектов</h2>
              <p>Начните с создания нового проекта</p>
              <button 
                className="create-button large"
                onClick={() => navigate("/create")}
              >
                <FiPlus /> Создать первый проект
              </button>
            </div>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post._id} className="post-card">
                <div className="post-image-wrapper">

                {post.photo && (
                    <img 
                      src={`http://localhost:5000/${post.photo.replace(/\\/g, '/')}`}
                      alt={post.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.error('Failed to load image:', post.photo);
                      }}
                    />
                  )}

                </div>
                <div className="post-content">
                  <div className="post-header">
                    <h3>{post.title}</h3>
                    <div className="post-actions">
                      <button className="edit-btn">
                        <FiEdit />
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(post._id)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <p className="post-description">{post.description}</p>
                  
                  <div className="post-footer">
                    <div className="post-deadline">
                      <FiClock />
                      <span>{formatDate(post.deadline)}</span>
                    </div>
                    
                    <div 
                      className="post-priority"
                      style={{ backgroundColor: getPriorityColor(post.priority) }}
                    >
                      <FiFlag />
                      <span className="important">
                        {post.priority === "urgent-important" && "Срочное и важное"}
                        {post.priority === "not-urgent-important" && "Не срочное, но важное"}
                        {post.priority === "urgent-not-important" && "Срочное, но не важное"}
                        {post.priority === "not-urgent-not-important" && "Не срочное и не важное"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;