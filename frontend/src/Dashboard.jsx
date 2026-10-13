
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

const API = "http://localhost:8080/api";

function Dashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const token = localStorage.getItem("Token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const loadDashboard = async () => {
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const [eventResponse, registrationResponse] =
        await Promise.all([
          axios.get(`${API}/student/events`, authHeaders),
          axios.get(`${API}/registrations/my`, authHeaders),
        ]);

      setEvents(
        Array.isArray(eventResponse.data)
          ? eventResponse.data
          : []
      );

      setRegistrations(
        Array.isArray(registrationResponse.data)
          ? registrationResponse.data
          : []
      );
    } catch (error) {
      console.error("Dashboard loading error:", error);

      setMessage(
        error.response?.status === 401
          ? "Session expired. Please log in again."
          : "Could not load dashboard. Please refresh."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const registerEvent = async (eventId) => {
    if (!token) {
      navigate("/");
      return;
    }

    setRegisteringId(eventId);

    try {
      await axios.post(
        `${API}/registrations/event/${eventId}`,
        {},
        authHeaders
      );

      window.alert("Registration successful!");
      await loadDashboard();
    } catch (error) {
      console.error("Registration error:", error);

      const data = error.response?.data;

      window.alert(
        typeof data === "string"
          ? data
          : data?.message ||
              "Registration failed. You may already be registered."
      );
    } finally {
      setRegisteringId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const registeredEventIds = registrations
    .map((registration) =>
      registration.event?.id ??
      registration.eventId ??
      null
    )
    .filter((id) => id !== null)
    .map(String);

  const registeredCount = registrations.length;

  const availableCount = Math.max(
    0,
    events.length - registeredCount
  );

  const categories = [
    "All",
    ...new Set(
      events
        .map((event) => event.category)
        .filter(Boolean)
    ),
  ];

  const filteredEvents = events.filter((event) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      (event.title || "").toLowerCase().includes(searchText) ||
      (event.venue || "").toLowerCase().includes(searchText) ||
      (event.description || "").toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "All" ||
      event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const statStyle = {
    padding: "22px",
    background: "#fff",
    color: "#000",
    borderRadius: "18px",
    border: "1px solid #ddd",
  };

  const inputStyle = {
    width: "100%",
    minWidth: 0,
    padding: "14px 16px",
    color: "#111",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "12px",
  };

  return (
    <main className="dashboard-container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "20px",
          paddingBottom: "25px",
          borderBottom: "1px solid #444",
        }}
      >
        <div>
          <p style={{ color: "#999", letterSpacing: "4px" }}>
            CAMPUS / CONNECT
          </p>

          <h1>Discover what's next.</h1>

          <p className="dashboard-subtitle">
            Your campus. Your people. Your experiences.
          </p>
        </div>

        <div className="dashboard-actions">
          <button
            type="button"
            onClick={() => navigate("/profile")}
          >
            My Profile
          </button>

          <button
            type="button"
            onClick={() => navigate("/my-registrations")}
          >
            My Registrations
          </button>

          <button
            type="button"
            onClick={() => navigate("/chatbot")}
          >
            Event Assistant
          </button>

          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {loading ? (
        <p style={{ color: "#fff" }}>
          Loading dashboard...
        </p>
      ) : (
        <>
          {message && (
            <p className="error-message">{message}</p>
          )}

          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "16px",
              margin: "30px 0",
            }}
          >
            <div style={statStyle}>
              <p style={{ color: "#666", margin: 0 }}>
                Total Events
              </p>
              <h2 style={{ color: "#000", fontSize: "32px" }}>
                {events.length}
              </h2>
            </div>

            <div style={statStyle}>
              <p style={{ color: "#666", margin: 0 }}>
                My Registrations
              </p>
              <h2 style={{ color: "#000", fontSize: "32px" }}>
                {registeredCount}
              </h2>
            </div>

            <div style={statStyle}>
              <p style={{ color: "#666", margin: 0 }}>
                Not Yet Registered
              </p>
              <h2 style={{ color: "#000", fontSize: "32px" }}>
                {availableCount}
              </h2>
            </div>
          </section>

          <section
            style={{
              marginBottom: "30px",
              padding: "22px",
              background: "#171717",
              border: "1px solid #333",
              borderRadius: "18px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Find Your Event</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 230px), 1fr))",
                gap: "14px",
              }}
            >
              <input
                type="text"
                placeholder="Search title, venue or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search events"
                style={inputStyle}
              />

              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value)
                }
                aria-label="Filter by category"
                style={inputStyle}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "All"
                      ? "All Categories"
                      : category}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <p style={{ color: "#bbb", margin: 0 }}>
                Showing {filteredEvents.length} of {events.length} events
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          </section>

          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <h2>Upcoming Events</h2>

              <button type="button" onClick={loadDashboard}>
                Refresh ↻
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="event-card">
                <h3>
                  {events.length === 0
                    ? "No events yet."
                    : "No matching events found."}
                </h3>
                <p>
                  {events.length === 0
                    ? "Check back soon for upcoming events."
                    : "Try another search or clear your filters."}
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
                  gap: "20px",
                }}
              >
                {filteredEvents.map((event, index) => {
                  const isRegistered =
                    registeredEventIds.includes(String(event.id));

                  return (
                    <article
                      key={event.id}
                      className="event-card"
                      onClick={() =>
                        navigate(`/events/${event.id}`)
                      }
                      style={{
                        cursor: "pointer",
                        background: "#fff",
                        color: "#000",
                      }}
                    >
                      <p>
                        EVENT {String(index + 1).padStart(2, "0")}
                      </p>

                      <h3>{event.title}</h3>
                      <p>{event.description}</p>

                      <p>
                        📍 Venue: {event.venue || "To be announced"}
                      </p>
                      <p>
                        📅 Date: {event.date || "To be announced"}
                      </p>
                      <p>
                        🕒 Time: {event.time || "To be announced"}
                      </p>
                      <p>
                        Category: {event.category || "General"}
                      </p>
                      <p>
                        Status: {event.status || "UPCOMING"}
                      </p>

                      {event.capacity != null && (
                        <p>Capacity: {event.capacity}</p>
                      )}

                      <button
                        type="button"
                        disabled={
                          isRegistered ||
                          registeringId === event.id
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          registerEvent(event.id);
                        }}
                      >
                        {isRegistered
                          ? "Already Registered ✓"
                          : registeringId === event.id
                          ? "Registering..."
                          : "Register for Event"}
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <footer
        style={{
          marginTop: "50px",
          paddingTop: "20px",
          borderTop: "1px solid #333",
          color: "#888",
          fontSize: "12px",
        }}
      >
        CAMPUSCONNECT © 2026
      </footer>
    </main>
  );
}

export default Dashboard;
