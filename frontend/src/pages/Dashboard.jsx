import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // redirect if not logged in
    }
  }, [navigate]);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard</p>
      <p>
        You can browse jobs, apply, or manage postings depending on your role.
        (Role-based features will work once you implement role checks.)
      </p>
    </div>
  );
}

export default Dashboard;