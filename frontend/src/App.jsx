import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import JobDetail from "./pages/JobDetail";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import CreateCompany from "./pages/CreateCompany";
import PostJob from "./pages/PostJob";
import Applicants from "./pages/Applicants";
import EditJob from "./pages/EditJob";
import Applications from "./pages/Applications";
import MyInterviews from "./pages/MyInterviews";
import ScheduleInterview from "./pages/ScheduleInterview";
import Notifications from "./pages/Notifications";

import "./App.css";


function App() {
  return (
    <div className="app">

      <Navbar />

      <main className="app-content">

        <Routes>

          {/* ================= PUBLIC ================= */}

          <Route
            path="/"
            element={<Jobs />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />


          {/* ================= JOBS ================= */}

          <Route
            path="/jobs/:id"
            element={<JobDetail />}
          />

          <Route
            path="/jobs/:id/edit"
            element={<EditJob />}
          />

          <Route
            path="/jobs/:jobId/applicants"
            element={<Applicants />}
          />


          {/* ================= DASHBOARD ================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* ================= PROFILE ================= */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* ================= RECRUITER ================= */}

          <Route
            path="/company"
            element={<CreateCompany />}
          />

          <Route
            path="/post-job"
            element={<PostJob />}
          />

          <Route
            path="/applications/:applicationId/interview"
            element={<ScheduleInterview />}
          />


          {/* ================= APPLICANT ================= */}

          <Route
            path="/applications"
            element={<Applications />}
          />

          <Route
            path="/interviews"
            element={<MyInterviews />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

        </Routes>

      </main>

    </div>
  );
}


export default App;