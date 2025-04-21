// src/pages/UsersPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/auth/users", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("accessToken")
      }
    })
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Видимые пользователи</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.username}>
            <Link to={`/user/${user.username}/tasks`} className="text-blue-600 hover:underline">
              {user.username}
            </Link>
            {user.email && <span className="text-gray-500 ml-2">({user.email})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
