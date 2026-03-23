import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Jobs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Job Details */}
      <Route path="/jobs/:id" element={<JobDetail />} />

      {/* Protected Route */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;