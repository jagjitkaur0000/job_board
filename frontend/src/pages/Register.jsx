import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("applicant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      // 1. Create account
      const registerResponse = await api.post(
        "/auth/register",
        {
          email,
          password,
          role_name: role,
          full_name: fullName,
        }
      );

      console.log(
        "REGISTER RESPONSE:",
        registerResponse.data
      );

      // If backend says email is already verified,
      // go directly to login.
      if (registerResponse.data.email_verified) {
        navigate("/login");
        return;
      }

      // 2. Send OTP to user's email
      const otpResponse = await api.post(
        "/email-verification/send",
        {
          email,
        }
      );

      console.log(
        "OTP RESPONSE:",
        otpResponse.data
      );

      // 3. Open verification page
      // Pass email using React Router state.
      navigate("/verify-email", {
        state: {
          email: email,
        },
      });

    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error.response?.data || error.message
      );

      const detail = error.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        setError(
          detail ||
          "Registration failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* LEFT SIDE */}
        <div className="register-left">

          <div className="register-brand">
            JOB BOARD
          </div>

          <h1>Join Job Board</h1>

          <p>
            Create your account and take the next
            step in your career.
          </p>

          <div className="register-benefits">

            <div className="benefit">
              <div className="benefit-icon">
                ▣
              </div>

              <div>
                <strong>
                  Find the right job
                </strong>

                <span>
                  Explore opportunities that match
                  your skills.
                </span>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                ♡
              </div>

              <div>
                <strong>
                  Save your favorites
                </strong>

                <span>
                  Save jobs you like and apply easily
                  later.
                </span>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">
                ↗
              </div>

              <div>
                <strong>
                  Track your progress
                </strong>

                <span>
                  Manage applications and track your
                  career journey.
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="register-right">

          <div className="form-brand">
            JOB BOARD
          </div>

          <h2>Create your account</h2>

          <p className="form-description">
            Join Job Board and start finding your next
            opportunity.
          </p>

          <form onSubmit={handleRegister}>

            {/* NAME */}
            <div className="form-group">

              <label htmlFor="fullName">
                {role === "recruiter"
                  ? "Company / Profile name"
                  : "Profile name"}
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  id="fullName"
                  type="text"
                  placeholder={
                    role === "recruiter"
                      ? "Enter company or profile name"
                      : "Enter your name"
                  }
                  value={fullName}
                  onChange={(e) =>
                    setFullName(e.target.value)
                  }
                  maxLength={255}
                  required
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="form-group">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ✉
                </span>

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

            </div>

            {/* PASSWORD */}
            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  minLength={6}
                  maxLength={72}
                  required
                />

              </div>

              <small>
                Password must be at least 6 characters
                long.
              </small>

            </div>

            {/* ROLE */}
            <div className="form-group">

              <label htmlFor="role">
                Account type
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  ♙
                </span>

                <select
                  id="role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value)
                  }
                >
                  <option value="applicant">
                    Candidate
                  </option>

                  <option value="recruiter">
                    Recruiter
                  </option>
                </select>

              </div>

            </div>

            {/* ERROR */}
            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

          <div className="login-link">
            Already have an account?{" "}

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
            >
              Log in
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Register;