import { Routes, Route } from "react-router-dom";
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
  );
}

export default App;