import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function AdminDashboard() {
  const navigate = useNavigate();

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
        <h1>Admin Dashboard</h1>
        <p>Manage your college event management platform.</p>
      </header>

      <section className="events-grid">
        <article className="event-card">
          <h2>Event Management</h2>
          <p>Review and manage college events.</p>
          <Link to="/admin/events">Manage Events →</Link>
        </article>

        <article className="event-card">
          <h2>User Management</h2>
          <p>View and manage registered users.</p>
          <Link to="/admin/users">Manage Users →</Link>
        </article>

        <article className="event-card">
          <h2>Attendance</h2>
          <p>Review attendance recorded through QR tickets.</p>
          <Link to="/attendance">View Attendance →</Link>
        </article>
      </section>

      <footer>
        <p>CampusConnect © 2026</p>
      </footer>
    </main>
  );
}

export default AdminDashboard;