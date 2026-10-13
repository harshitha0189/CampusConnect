import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

function Attendance() {
  const navigate = useNavigate();
  const scannerRef = useRef(null);
  const processingRef = useRef(false);

  const [ticketCode, setTicketCode] = useState("");
  const [eventId, setEventId] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("Token");

  useEffect(() => {
    if (!token) navigate("/");

    return () => {
      const scanner = scannerRef.current;
      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  async function markAttendance(code) {
    const cleanCode = code.trim();

    if (!cleanCode) {
      setMessage("No ticket code was detected.");
      return;
    }

    setLoading(true);
    setMessage(`Ticket detected: ${cleanCode}. Checking attendance...`);

    try {
      await axios.post(
        `${API}/attendance/mark/${encodeURIComponent(cleanCode)}`,
        {},
        config
      );

      setMessage(`Success! Attendance marked for ${cleanCode}.`);
      setTicketCode("");
    } catch (error) {
      const data = error.response?.data;
      setMessage(
        typeof data === "string"
          ? data
          : data?.message || "Attendance failed. Check the ticket code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function startScanner() {
    try {
      setMessage("Starting camera...");

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: [0],
          verbose: false,
        });
      }

      if (scannerRef.current.isScanning) return;

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.floor(
              Math.min(width, height, 300) * 0.85
            );
            return { width: size, height: size };
          },
          aspectRatio: 1,
          disableFlip: false,
        },
        async (decodedText) => {
          if (processingRef.current) return;

          processingRef.current = true;
          setTicketCode(decodedText);
          setMessage(`QR detected: ${decodedText}`);

          try {
            await scannerRef.current.stop();
            setScanning(false);
            await markAttendance(decodedText);
          } catch (error) {
            setMessage(
              "QR was detected, but processing failed. Try entering the ticket code manually."
            );
          } finally {
            processingRef.current = false;
          }
        },
        () => {
          // Ignore normal frames where no QR code is found.
        }
      );

      setScanning(true);
      setMessage("Camera ready. Hold the QR code steady inside the box.");
    } catch (error) {
      setMessage(
        `Scanner error: ${error?.message || "Unable to start camera."}`
      );
    }
  }

  async function stopScanner() {
    try {
      if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (error) {
      console.error("Scanner stop error:", error);
    }

    setScanning(false);
    setMessage("Scanner stopped.");
  }

  async function viewAttendance(e) {
    e.preventDefault();

    try {
      const response = await axios.get(
        `${API}/attendance/event/${encodeURIComponent(eventId.trim())}`,
        config
      );

      setAttendance(Array.isArray(response.data) ? response.data : []);
      setMessage(`Attendance records loaded for event ${eventId}.`);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to load attendance for this event."
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
          <Link to="/organizer">Home</Link>
          <Link to="/organizer/events">Manage Events</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/organizer/registrations">Registrations</Link>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header>
        <p>CAMPUS / CONNECT</p>
        <h1>QR Attendance Scanner</h1>
        <p>Scan the QR ticket shown on the student's registration page.</p>
      </header>

      <section className="events-grid">
        <article className="event-card">
          <h2>Scan QR Ticket</h2>

          <div
            id="qr-reader"
            style={{ width: "100%", maxWidth: "450px", margin: "20px auto" }}
          />

          {!scanning ? (
            <button onClick={startScanner}>Start QR Scanner</button>
          ) : (
            <button onClick={stopScanner}>Stop Scanner</button>
          )}

          <p>Or enter the ticket code manually:</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              markAttendance(ticketCode);
            }}
          >
            <div className="form-group">
              <label htmlFor="ticketCode">Ticket code</label>
              <input
                id="ticketCode"
                value={ticketCode}
                onChange={(e) => setTicketCode(e.target.value)}
                placeholder="Enter ticket code"
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Checking..." : "Mark Present"}
            </button>
          </form>
        </article>

        <article className="event-card">
          <h2>View Event Attendance</h2>

          <form onSubmit={viewAttendance}>
            <div className="form-group">
              <label htmlFor="eventId">Event ID</label>
              <input
                id="eventId"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                onChangeCapture={() => {}}
                onInput={(e) => setEventId(e.currentTarget.value)}
                placeholder="Enter event ID"
                required
              />
            </div>

            <button type="submit">View Attendance</button>
          </form>
        </article>
      </section>

      {message && (
        <section className="event-card" style={{ marginTop: "20px" }}>
          <p role="status">{message}</p>
        </section>
      )}

      {attendance.length > 0 && (
        <section className="event-card" style={{ marginTop: "24px" }}>
          <h2>Attendance Records</h2>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Ticket Code</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record, index) => (
                  <tr key={record.id ?? index}>
                    <td>
                      {record.student?.name ??
                        record.studentName ??
                        record.student?.email ??
                        "Student"}
                    </td>
                    <td>
                      {record.registration?.ticketCode ??
                        record.ticketCode ??
                        "—"}
                    </td>
                    <td>{record.status ?? "Present"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer>
        <p>CampusConnect © 2026</p>
      </footer>
    </main>
  );
}

export default Attendance;