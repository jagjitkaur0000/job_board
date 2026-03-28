import { Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import Dashboard from "./pages/Dashboard";
import CreateCompany from "./pages/CreateCompany";
import PostJob from "./pages/PostJob";
import MyApplications from "./pages/MyApplications";

function App() {
  return (
    <div>
      <nav style={{ padding: "10px", borderBottom: "1px solid gray" }}>
        <Link to="/">Jobs</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/register">Register</Link> |{" "}
        <Link to="/dashboard">Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/company" element={<CreateCompany />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/applications" element={<MyApplications />} />
      </Routes>
    </div>
  );
}

export default App;