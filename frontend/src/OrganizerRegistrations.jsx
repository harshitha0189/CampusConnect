import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

function OrganizerRegistrations() {
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Loading registrations...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    setLoading(true);
    setMessage("");

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const eventResponse = await axios.get(`${API}/events`, config);
      const eventList = Array.isArray(eventResponse.data)
        ? eventResponse.data
        : [];

      setEvents(eventList);

      const results = await Promise.all(
        eventList.map(async (event) => {
          try {
            const response = await axios.get(
              `${API}/registrations/event/${event.id}`,
              config
            );

            const list = Array.isArray(response.data)
              ? response.data
              : [];

            return list.map((registration) => ({
              ...registration,
              eventTitle: event.title,
              eventId: event.id,
            }));
          } catch {
            return [];
          }
        })
      );

      setRegistrations(results.flat());
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not load events. Check that the backend is running and you are logged in."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  }

  const filteredRegistrations = registrations.filter((registration) => {
    const studentName =
      registration.student?.name ??
      registration.student?.fullName ??
      registration.studentName ??
      "";

    const email =
      registration.student?.email ??
      registration.email ??
      "";

    const ticketCode =
      registration.ticketCode ??
      registration.ticket_code ??
      "";

    const matchesEvent =
      selectedEvent === "all" ||
      String(registration.eventId) === selectedEvent;

    const searchText =
      `${studentName} ${email} ${ticketCode} ${registration.eventTitle}`
        .toLowerCase();

    return matchesEvent && searchText.includes(search.toLowerCase());
  });

  return (
    <main className="dashboard-container">
      <nav className="organizer-nav">
        <h2>CampusConnect</h2>
        <div className="nav-links">
          <Link to="/organizer">Home</Link>
          <Link to="/organizer/events">Manage Events</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/organizer/registrations">Registrations</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header>
        <p>CAMPUS / CONNECT</p>
        <h1>Student Registrations</h1>
        <p>View registrations across your college events.</p>
      </header>

      <section className="event-card">
        <h2>Registration List</h2>

        <div className="form-group">
          <label htmlFor="eventFilter">Filter by event</label>
          <select
            id="eventFilter"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="all">All events</option>
            {events.map((event) => (
              <option key={event.id} value={String(event.id)}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="search">Search registrations</label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, email, ticket code..."
          />
        </div>

        <p>Total registrations: {filteredRegistrations.length}</p>

        {loading ? (
          <p>Loading...</p>
        ) : message ? (
          <p>{message}</p>
        ) : filteredRegistrations.length === 0 ? (
          <p>No registrations found for the selected event.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Event</th>
                  <th>Ticket Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration, index) => (
                  <tr key={registration.id ?? index}>
                    <td>
                      {registration.student?.name ??
                        registration.student?.fullName ??
                        registration.studentName ??
                        "Student"}
                    </td>
                    <td>
                      {registration.student?.email ??
                        registration.email ??
                        "—"}
                    </td>
                    <td>{registration.eventTitle}</td>
                    <td>{registration.ticketCode ?? "—"}</td>
                    <td>{registration.status ?? "Registered"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button onClick={loadRegistrations} disabled={loading}>
          Refresh Registrations
        </button>
      </section>

      <footer>
        <p>CampusConnect © 2026</p>
      </footer>
    </main>
  );
}

export default OrganizerRegistrations;