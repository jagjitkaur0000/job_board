import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function CreateCompany() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    try {
      await api.post("/companies", {
        name,
        description,
      });

      alert("Company created successfully");
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Create company error:",
        error.response ? error.response.data : error.message
      );
      alert(error.response?.data?.detail || "Failed to create company");
    }
  };

  return (
    <form onSubmit={handleCreateCompany}>
      <h3>Create Company</h3>

      <input
        type="text"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <button type="submit">Create Company</button>
    </form>
  );
}

export default CreateCompany;