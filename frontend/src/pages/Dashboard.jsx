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

  const role = localStorage.getItem("role");

  return (
    <div>
      <h1>Dashboard</h1>

      {role === "recruiter" && (
        <>
          <button onClick={() => navigate("/company")}>
            Create Company
          </button>
          <button onClick={() => navigate("/post-job")}>
            Post Job
          </button>
        </>
      )}

      {role === "applicant" && (
        <>
          <button onClick={() => navigate("/")}>
            View Jobs
          </button>
          <button onClick={() => navigate("/applications")}>
            My Applications
          </button>
        </>
      )}

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          navigate("/login");
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;