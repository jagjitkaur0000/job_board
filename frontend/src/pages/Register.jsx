import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("applicant");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        email,
        password,
        role_name: role,
      });

      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h3>Register</h3>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="applicant">Applicant</option>
        <option value="recruiter">Recruiter</option>
      </select>

      <button type="submit">Register</button>
    </form>
  );
}

export default Register;