import { useState } from "react";
import api from "../api"; // use the axios instance
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
     
      const response = await api.post("/login", {
        email,
        password,
      });

      
      if (!response.data.access_token) {
        throw new Error("No token returned from backend");
      }

      console.log("Backend response:", response.data);

     
      localStorage.setItem("token", response.data.access_token);

     
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "Login error:",
        error.response ? error.response.data : error.message
      );
      alert(
        error.response?.data?.detail || "Login failed. Check credentials."
      );
    }
  };

  return (
    <form onSubmit={handleLogin}>
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
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;