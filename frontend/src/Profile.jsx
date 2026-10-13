
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("Token");

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        navigate("/");
        return;
      }

      // Use profile information saved during login, if available.
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setProfile(user);
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem("user");
        }
      }

      // No saved profile: show a safe fallback.
      // A dedicated backend profile endpoint can be connected later.
      setProfile({
        email: localStorage.getItem("email") || "Not available",
        role: localStorage.getItem("role") || "STUDENT",
      });

      setLoading(false);
    };

    loadProfile();
  }, [navigate, token]);

  const logout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <main className="dashboard-container">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="dashboard-container">
      <header>
        <p style={{ color: "#999", letterSpacing: "4px" }}>
          CAMPUS / CONNECT
        </p>

        <h1>My Profile</h1>

        <p className="dashboard-subtitle">
          Manage and view your account information.
        </p>
      </header>

      <section
        className="event-card"
        style={{ maxWidth: "650px", marginTop: "30px" }}
      >
        <div
          style={{
            width: "85px",
            height: "85px",
            display: "grid",
            placeItems: "center",
            background: "#111",
            color: "#fff",
            borderRadius: "50%",
            fontSize: "32px",
            marginBottom: "20px",
          }}
        >
          {(profile?.name || profile?.fullName || profile?.email || "S")
            .charAt(0)
            .toUpperCase()}
        </div>

        <h2 style={{ color: "#000" }}>
          {profile?.name ||
            profile?.fullName ||
            "CampusConnect Student"}
        </h2>

        <p>
          <strong>Email:</strong>{" "}
          {profile?.email || "Not available"}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {profile?.role || "STUDENT"}
        </p>

        {error && <p className="error-message">{error}</p>}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "25px",
          }}
        >
          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate("/my-registrations")}
          >
            My Registrations
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </section>
    </main>
  );
}

export default Profile;
