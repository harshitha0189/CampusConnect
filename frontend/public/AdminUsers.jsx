import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

function AdminUsers() {
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("Loading users...");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    loadUsers();
  }, []);

  async function loadUsers() {
    setMessage("Loading users...");

    try {
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(Array.isArray(response.data) ? response.data : []);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.status === 403
          ? "Access denied. Please log in with an Admin account."
          : error.response?.status === 404
          ? "Admin users API is not implemented in the backend yet."
          : "Unable to load users. Check your backend."
      );
    }
  }

  function logout() {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  }

  return (
    <main className="dashboard-container">
      <nav className="organizer-nav">
        <h2>CampusConnect</h2>
        <div className="nav-links">
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/events">Manage Events</Link>
          <Link to="/admin/users">Manage Users</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header>
        <p>CAMPUS / CONNECT</p>
        <h1>User Management</h1>
        <p>View registered students and organizers.</p>
      </header>

      <button onClick={loadUsers}>Refresh Users</button>
      {message && <p>{message}</p>}

      <section className="events-grid">
        {users.map((user) => (
          <article className="event-card" key={user.id}>
            <h2>{user.name || user.fullName || "User"}</h2>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </article>
        ))}
      </section>

      <footer>
        <p>CampusConnect © 2026</p>
      </footer>
    </main>
  );
}

export default AdminUsers;