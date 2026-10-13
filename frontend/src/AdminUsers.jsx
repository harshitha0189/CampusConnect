
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("Token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:8080/api/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? "Access denied. Please log in as an admin."
              : response.status === 401
              ? "Session expired. Please log in again."
              : `Request failed: ${response.status}`
          );
        }

        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [navigate]);

  function logout() {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
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
        <h1>Admin User Management</h1>
        <p>View registered students, organizers, and administrators.</p>
      </header>

      <section className="event-card">
        <h2>Total Users: {users.length}</h2>

        {loading && <p>Loading users...</p>}

        {error && <p role="alert">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p>No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                  <th style={{ padding: "12px", textAlign: "left" }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ padding: "12px" }}>{user.id}</td>
                    <td style={{ padding: "12px" }}>{user.name}</td>
                    <td style={{ padding: "12px" }}>{user.email}</td>
                    <td style={{ padding: "12px" }}>{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer>CampusConnect © 2026</footer>
    </main>
  );
}

export default AdminUsers;
