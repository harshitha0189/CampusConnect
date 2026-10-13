
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

function OrganizerDashboard() {
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
          <Link to="/organizer">Home</Link>
          <Link to="/organizer/events">Manage Events</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/organizer/registrations">
            Registrations
          </Link>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header>
        <p>CAMPUS / CONNECT</p>
        <h1>Organizer Dashboard</h1>
        <p>
          Manage college events, student registrations,
          and attendance from one place.
        </p>
      </header>

      <section className="events-grid">
        <article className="event-card">
          <h2>Event Management</h2>
          <p>Create, edit, view, and delete college events.</p>
          <button
            onClick={() => navigate("/organizer/events")}
          >
            Manage Events
          </button>
        </article>

        <article className="event-card">
          <h2>Attendance Management</h2>
          <p>Mark student attendance using ticket codes.</p>
          <button
            onClick={() => navigate("/attendance")}
          >
            Manage Attendance
          </button>
        </article>

        <article className="event-card">
          <h2>Student Registrations</h2>
          <p>Open the organizer registrations section.</p>
          <button
            onClick={() => navigate("/organizer/registrations")}
          >
            View Registrations
          </button>
        </article>
      </section>

      <footer>
        <p>CampusConnect © 2026</p>
      </footer>
    </main>
  );
}

export default OrganizerDashboard;
