
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

const API = "http://localhost:8080/api";

function OrganizerEvents({ adminMode = false }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    description: "",
    venue: "",
    date: "",
    time: "",
    capacity: 100,
    category: "Technical",
    status: "UPCOMING",
  };

  const [form, setForm] = useState(emptyForm);

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  async function loadEvents() {
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.get(`${API}/events`, {
        headers,
      });

      setEvents(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      setMessage(
        `Could not load events (${error.response?.status || "network error"}). Check your login and backend permissions.`
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadEvents();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const data = {
        ...form,
        capacity: Number(form.capacity),
      };

      if (editingId !== null) {
        await axios.put(`${API}/events/${editingId}`, data, {
          headers,
        });
        setMessage("Event updated successfully!");
      } else {
        await axios.post(`${API}/events`, data, {
          headers,
        });
        setMessage("Event created successfully!");
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadEvents();
    } catch (error) {
      setMessage(
        typeof error.response?.data === "string"
          ? error.response.data
          : error.response?.data?.message ||
              `Unable to save event (${error.response?.status || "network error"}).`
      );
    }
  }

  function editEvent(event) {
    setEditingId(event.id);

    setForm({
      title: event.title || "",
      description: event.description || "",
      venue: event.venue || "",
      date: event.date || "",
      time: event.time || "",
      capacity: event.capacity ?? 100,
      category: event.category || "Technical",
      status: event.status || "UPCOMING",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteEvent(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`${API}/events/${id}`, { headers });
      setMessage("Event deleted successfully!");
      await loadEvents();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          `Unable to delete event (${error.response?.status || "network error"}).`
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
          <Link to={adminMode ? "/admin" : "/organizer"}>
            {adminMode ? "Admin Dashboard" : "Organizer Home"}
          </Link>
          <Link to={adminMode ? "/admin/events" : "/organizer/events"}>
            Manage Events
          </Link>
          {adminMode ? (
            <Link to="/admin/users">Manage Users</Link>
          ) : (
            <>
              <Link to="/attendance">Attendance</Link>
              <Link to="/my-registrations">Registrations</Link>
            </>
          )}
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <h1>Event Management</h1>
      <p>Create, update, and manage college events.</p>

      <section className="event-card">
        <h2>{editingId !== null ? "Edit Event" : "Create New Event"}</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Event title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Event description"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            name="venue"
            placeholder="Venue"
            value={form.venue}
            onChange={handleChange}
            required
          />

          <label>
            Event date
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Event time
            <input
              name="time"
              type="time"
              value={form.time}
              onChange={handleChange}
              required
            />
          </label>

          <input
            name="capacity"
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option>Technical</option>
            <option>Cultural</option>
            <option>Workshop</option>
            <option>Sports</option>
            <option>Seminar</option>
            <option>Other</option>
          </select>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="UPCOMING">UPCOMING</option>
            <option value="ONGOING">ONGOING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <button type="submit">
            {editingId !== null ? "Update Event" : "Create Event"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </section>

      {message && <p>{message}</p>}

      <section>
        <h2>All Events ({events.length})</h2>

        <button onClick={loadEvents}>Refresh Events</button>

        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div className="events-grid">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <p>Venue: {event.venue}</p>
                <p>Date: {event.date}</p>
                <p>Time: {event.time}</p>
                <p>Category: {event.category}</p>
                <p>Capacity: {event.capacity}</p>
                <p>Status: {event.status}</p>

                <button onClick={() => editEvent(event)}>
                  Edit
                </button>

                <button onClick={() => deleteEvent(event.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <button onClick={() => navigate("/organizer")}>
        Back to Organizer Dashboard
      </button>
    </main>
  );
}

export default OrganizerEvents;
