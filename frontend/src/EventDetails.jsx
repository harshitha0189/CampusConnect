
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./App.css";

const API = "http://localhost:8080/api";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("Token");

  useEffect(() => {
    const fetchEvent = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await axios.get(
          `${API}/student/events`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const events = Array.isArray(response.data)
          ? response.data
          : [];

        const foundEvent = events.find(
          (item) => String(item.id) === String(id)
        );

        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          setMessage("Event not found.");
        }
      } catch (error) {
        console.error(error);
        setMessage("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, token]);

  const registerEvent = async () => {
    try {
      await axios.post(
        `${API}/registrations/event/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.alert("Registration successful!");
      navigate("/my-registrations");
    } catch (error) {
      const data = error.response?.data;

      window.alert(
        typeof data === "string"
          ? data
          : data?.message || "Registration failed."
      );
    }
  };

  if (loading) {
    return (
      <main className="dashboard-container">
        <p>Loading event details...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="dashboard-container">
        <h2>{message || "Event not found."}</h2>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <button onClick={() => navigate("/dashboard")}>
        ← Back to Events
      </button>

      <article
        className="event-card"
        style={{ marginTop: "25px" }}
      >
        <p>EVENT DETAILS</p>
        <h1>{event.title}</h1>

        <p>{event.description}</p>

        <hr />

        <p>📍 Venue: {event.venue || "To be announced"}</p>
        <p>📅 Date: {event.date || "To be announced"}</p>
        <p>🕒 Time: {event.time || "To be announced"}</p>
        <p>🏷️ Category: {event.category || "General"}</p>
        <p>Status: {event.status || "UPCOMING"}</p>

        {event.capacity != null && (
          <p>Capacity: {event.capacity}</p>
        )}

        <button onClick={registerEvent}>
          Register for Event
        </button>
      </article>
    </main>
  );
}

export default EventDetails;
