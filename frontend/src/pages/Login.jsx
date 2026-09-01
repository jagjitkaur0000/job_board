import { useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", email);
      formData.append("password", password);

      const response = await api.post("/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("LOGIN RESPONSE:", response.data);

      // Save authentication token
      localStorage.setItem(
        "token",
        response.data.access_token
      );

      // Save user role
      if (response.data.role_name) {
        localStorage.setItem(
          "role",
          response.data.role_name
        );
      }

      // Go to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        alert(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        alert(
          detail ||
            "Login failed. Please check your email and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Brand */}
        <div className="login-brand">
          JOB BOARD
        </div>

        {/* Heading */}
        <h1>Welcome back</h1>

        <p className="login-description">
          Sign in to continue finding opportunities
          and managing your applications.
        </p>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="login-form"
        >

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>

        </form>

        {/* Register Link */}
        <div className="login-footer">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Create account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;