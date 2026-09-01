import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import "./VerifyEmail.css";

function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(
    location.state?.email || ""
  );

  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendOtp = async () => {
    if (!email) {
      setError("Enter your email address.");
      return;
    }

    setSending(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        "/email-verification/send",
        {
          email,
        }
      );

      console.log(
        "SEND OTP RESPONSE:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Verification code sent to your email."
      );
    } catch (err) {
      console.error(
        "SEND OTP ERROR:",
        err.response?.data || err.message
      );

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        setError(
          detail ||
            "Failed to send verification code."
        );
      }
    } finally {
      setSending(false);
    }
  };

  const verifyEmail = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email address is required.");
      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setVerifying(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post(
        "/email-verification/verify",
        {
          email,
          otp,
        }
      );

      console.log(
        "VERIFY EMAIL RESPONSE:",
        response.data
      );

      setMessage(
        response.data.message ||
          "Email verified successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(
        "VERIFY EMAIL ERROR:",
        err.response?.data || err.message
      );

      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => item.msg)
            .join(", ")
        );
      } else {
        setError(
          detail ||
            "Invalid or expired verification code."
        );
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">

        <div className="verify-brand">
          JOB BOARD
        </div>

        <h1>Verify your email</h1>

        <p className="verify-description">
          We sent a 6-digit verification code to
          your email address.
        </p>

        <div className="send-otp-section">

          <label htmlFor="email">
            Email address
          </label>

          <div className="email-row">

            <input
              id="email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <button
              type="button"
              className="secondary-button"
              onClick={sendOtp}
              disabled={sending}
            >
              {sending
                ? "Sending..."
                : "Resend code"}
            </button>

          </div>
        </div>

        <form onSubmit={verifyEmail}>

          <label htmlFor="otp">
            Verification code
          </label>

          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength="6"
            value={otp}
            placeholder="Enter 6-digit code"
            onChange={(e) => {
              const value =
                e.target.value.replace(/\D/g, "");

              setOtp(value);
            }}
            required
          />

          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="verify-button"
            disabled={verifying}
          >
            {verifying
              ? "Verifying..."
              : "Verify Email"}
          </button>

        </form>

        <button
          type="button"
          className="back-login-button"
          onClick={() => navigate("/login")}
        >
          Back to login
        </button>

      </div>
    </div>
  );
}

export default VerifyEmail;