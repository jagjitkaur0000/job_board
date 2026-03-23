import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    // Fetch single job by ID (backend must have GET /jobs/{id})
    api.get(`/jobs/${id}`)
      .then((res) => setJob(res.data))
      .catch(() => alert("Job not found"));
  }, [id]);

  const handleApply = async () => {
    try {
      await api.post(`/applications/jobs/${id}/apply`);
      alert("Applied successfully");
    } catch (error) {
      console.error("Apply error:", error.response ? error.response.data : error.message);
      alert(error.response?.data?.detail || "Apply failed");
    }
  };

  if (!job) return <p>Loading...</p>;

  return (
    <div>
      <h2>{job.title}</h2>
      <p>{job.description}</p>
      <button onClick={handleApply}>Apply</button>
    </div>
  );
}

export default JobDetail;