import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

function MyRegistrations() {
  const navigate = useNavigate();
  const token = localStorage.getItem("Token");

  const [registrations, setRegistrations] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const qrUrls = useRef([]);

  useEffect(() => () => {
    qrUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const loadRegistrations = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setMessage("");
    }

    try {
      const response = await axios.get(`${API}/registrations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const results = Array.isArray(response.data) ? response.data : [];
      setRegistrations(results);

      qrUrls.current.forEach((url) => URL.revokeObjectURL(url));
      const qrEntries = await Promise.all(results.map(async (registration) => {
        const ticketCode = registration.ticketCode || registration.ticket_code;
        if (!ticketCode) return null;

        try {
          const qrResponse = await axios.get(
            `${API}/qr/${encodeURIComponent(ticketCode)}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "blob",
            },
          );
          const url = URL.createObjectURL(qrResponse.data);
          qrUrls.current.push(url);
          return [registration.id, url];
        } catch {
          return null;
        }
      }));
      setQrImages(Object.fromEntries(qrEntries.filter(Boolean)));
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load registrations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    loadRegistrations(false);
  }, [loadRegistrations, navigate, token]);

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
          <Link to="/dashboard">Home</Link>
          <Link to="/my-registrations">My Registrations</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header>
        <p>CAMPUS / CONNECT</p>
        <h1>My Event Tickets</h1>
        <p>View your registrations and QR tickets.</p>
      </header>

      {loading ? (
        <p>Loading your tickets...</p>
      ) : message ? (
        <section className="event-card">
          <p>{message}</p>
          <button onClick={() => loadRegistrations(true)}>Try Again</button>
        </section>
      ) : registrations.length === 0 ? (
        <section className="event-card">
          <h2>No registrations yet</h2>
          <p>Register for an event to get your ticket.</p>
          <Link to="/dashboard">Browse Events</Link>
        </section>
      ) : (
        <section className="events-grid">
          {registrations.map((registration) => {
            const event = registration.event || {};
            const ticketCode =
              registration.ticketCode ||
              registration.ticket_code ||
              "";

            return (
              <article
                className="event-card"
                key={registration.id}
              >
                <h2>{event.title || "College Event"}</h2>

                <p>
                  <strong>Venue:</strong>{" "}
                  {event.venue || "Not specified"}
                </p>

                <p>
                  <strong>Date:</strong>{" "}
                  {event.date || "Not specified"}
                </p>

                <p>
                  <strong>Time:</strong>{" "}
                  {event.time || "Not specified"}
                </p>

                <p>
                  <strong>Registration ID:</strong>{" "}
                  {registration.id}
                </p>

                <p>
                  <strong>Ticket Code:</strong>{" "}
                  {ticketCode || "No ticket code returned"}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {registration.status || "Registered"}
                </p>

                {ticketCode ? (
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    {qrImages[registration.id] ? (
                      <img
                        src={qrImages[registration.id]}
                        alt={`QR ticket for ${event.title || "college event"}`}
                        style={{
                          width: "200px",
                          maxWidth: "100%",
                          height: "200px",
                          objectFit: "contain",
                          background: "#ffffff",
                          padding: "10px",
                          borderRadius: "12px",
                        }}
                      />
                    ) : (
                      <p role="status">QR image unavailable. Refresh to try again.</p>
                    )}

                    <p>Show this QR code at the event entrance.</p>

                    {qrImages[registration.id] && (
                      <a
                        className="qr-open-link"
                        href={qrImages[registration.id]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open QR Code
                      </a>
                    )}
                  </div>
                ) : (
                  <p>
                    QR ticket unavailable because the registration
                    does not contain a ticket code.
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => loadRegistrations(true)} disabled={loading}>
          Refresh Tickets
        </button>
      </div>

      <footer>
        <p>CampusConnect © 2026</p>
      </footer>
    </main>
  );
}

export default MyRegistrations;