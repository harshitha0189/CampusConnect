
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email: email.trim(),
          password
        }
      );

      const token =
        typeof response.data === "string"
          ? response.data
          : response.data?.token;

      if (!token) {
        setMessage("Login response did not contain a token.");
        return;
      }

      // Read the role claim from the JWT payload.
      const payloadPart = token.split(".")[1];

      if (!payloadPart) {
        setMessage("Invalid login token.");
        return;
      }

      const base64 = payloadPart
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split("")
            .map((char) =>
              "%" +
              char.charCodeAt(0)
                .toString(16)
                .padStart(2, "0")
            )
            .join("")
        )
      );

      localStorage.setItem("Token", token);

      const role = String(
        payload.role ||
        payload.roles?.[0] ||
        payload.authorities?.[0] ||
        ""
      )
        .replace(/^ROLE_/, "")
        .toUpperCase();

      if (role === "ORGANIZER") {
        navigate("/organizer");
      } else if (role === "STUDENT") {
        navigate("/dashboard");
      } else if (role === "ADMIN") {
        navigate("/admin");
      } else {
        setMessage(
          "Login succeeded, but the account role is not supported."
        );
        localStorage.removeItem("Token");
      }
    } catch (error) {
      localStorage.removeItem("Token");

      if (error.response) {
        setMessage(`Login failed: ${error.response.status}`);
      } else {
        setMessage("Cannot connect to the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={login}>
        <h1>CampusConnect</h1>
        <p>College Event Management System</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="error-message">{message}</p>}
      </form>
    </div>
  );
}

export default App;
