import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import App from "./App.jsx";

import Dashboard from "./Dashboard.jsx";
import EventDetails from "./EventDetails.jsx";
import MyRegistrations from "./MyRegistrations.jsx";
import Profile from "./Profile.jsx";

import OrganizerDashboard from "./OrganizerDashboard.jsx";
import OrganizerEvents from "./OrganizerEvents.jsx";
import OrganizerRegistrations from "./OrganizerRegistrations.jsx";

import Attendance from "./Attendance.jsx";
import Chatbot from "./Chatbot.jsx";

import AdminDashboard from "./AdminDashboard.jsx";
import AdminEvents from "./AdminEvents.jsx";
import AdminUsers from "./AdminUsers.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/my-registrations" element={<MyRegistrations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chatbot" element={<Chatbot />} />

        <Route path="/organizer" element={<OrganizerDashboard />} />
        <Route path="/organizer/events" element={<OrganizerEvents />} />
        <Route
          path="/organizer/registrations"
          element={<OrganizerRegistrations />}
        />

        <Route path="/attendance" element={<Attendance />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/users" element={<AdminUsers />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);