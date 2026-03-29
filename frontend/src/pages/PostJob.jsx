import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function PostJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get("/companies/me");
        setCompanyId(res.data.id);
      } catch (error) {
        console.error("Company fetch error:", error);
      }
    };

    fetchCompany();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/jobs/companies/${companyId}`, {
        title,
        description,
      });

      alert("Job posted successfully");
      navigate("/");
    } catch (error) {
      console.error("Post job error:", error.response?.data);
      alert(error.response?.data?.detail || "Failed to post job");
    }
  };

  return (
    <form onSubmit={handlePostJob}>
      <h3>Post Job</h3>

      <input
        type="text"
        placeholder="Job Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <button type="submit">Post Job</button>
    </form>
  );
}

export default PostJob;