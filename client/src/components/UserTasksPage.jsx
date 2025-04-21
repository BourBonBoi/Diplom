import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../style/MainPage.css";
export default function UserTasksPage() {
  const { username } = useParams();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/auth/user/${username}/tasks`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken")
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.msg) {
          setError(data.msg);
        } else {
          setTasks(data);
        }
      });
  }, [username]);

  if (error) return <div className="p-4 text-red-600">Ошибка: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Заметки пользователя: {username}</h2>
      {tasks.length === 0 ? (
        <p>Нет доступных заметок.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id} className="border p-3 rounded shadow">
              <h3 className="font-semibold">{task.title}</h3>
              <p>{task.description}</p>
              <p>Дедлайн: {new Date(task.deadline).toLocaleDateString()}</p>
              <p>Приоритет: {task.priority}</p>
              {task.photo && (
                <img src={`http://localhost:5000/${task.photo}`} alt="task" className="mt-2 max-w-xs" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
