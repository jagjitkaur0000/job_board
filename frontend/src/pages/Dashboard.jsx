import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>

      <button onClick={() => navigate("/jobs")}>View Jobs</button>
      <button onClick={() => navigate("/company")}>Create Company</button>
      <button onClick={() => navigate("/post-job")}>Post Job</button>
      <button onClick={() => navigate("/applications")}>My Applications</button>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;