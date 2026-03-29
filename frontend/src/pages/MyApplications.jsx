import { useEffect, useState } from "react";
import api from "../api";

function MyApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api.get("/applications/me")
      .then((res) => setApplications(res.data))
      .catch((err) => {
        console.error("Applications error:", err);
        alert("Failed to load applications");
      });
  }, []);

  return (
    <div>
      <h2>My Applications</h2>

      {applications.length === 0 ? (
        <p>No applications found</p>
      ) : (
        applications.map((app) => (
          <div key={app.id}>
            <p>Job ID: {app.job_id}</p>
            <p>Status: {app.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default MyApplications;