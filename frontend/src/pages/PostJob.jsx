import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function PostJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const navigate = useNavigate();

  const handlePostJob = async (e) => {
    e.preventDefault();

    try {
      await api.post("/jobs", {
        title,
        description,
        company_id: companyId,
      });

      alert("Job posted successfully");
      navigate("/jobs");
    } catch (error) {
      console.error(
        "Post job error:",
        error.response ? error.response.data : error.message
      );
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

      <input
        type="number"
        placeholder="Company ID"
        value={companyId}
        onChange={(e) => setCompanyId(e.target.value)}
        required
      />

      <button type="submit">Post Job</button>
    </form>
  );
}

export default PostJob;