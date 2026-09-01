import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api";

import "./Navbar.css";


function Navbar() {
  const navigate = useNavigate();

  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");


  // ==========================================================
  // LOAD NAVBAR DATA
  // ==========================================================

  useEffect(() => {
    if (!token) {
      setProfilePhoto("");
      setFullName("");
      setUnreadCount(0);
      return;
    }

    // --------------------------------------------------------
    // Load applicant profile
    // --------------------------------------------------------

    if (role === "applicant") {
      api
        .get("/profile/me")
        .then((res) => {
          setProfilePhoto(
            res.data.profile_photo_url || ""
          );

          setFullName(
            res.data.full_name || ""
          );
        })
        .catch((err) => {
          console.error(
            "Navbar profile error:",
            err
          );
        });
    }

    // --------------------------------------------------------
    // Load unread notification count
    // --------------------------------------------------------

    api
      .get("/notifications/unread-count")
      .then((res) => {
        setUnreadCount(
          Number(res.data.count || 0)
        );
      })
      .catch((err) => {
        console.error(
          "Notification count error:",
          err
        );
      });
  }, [token, role]);


  // ==========================================================
  // PROFILE IMAGE URL
  // ==========================================================

  const getFileUrl = (url) => {
    if (!url) {
      return "";
    }

    if (
      url.startsWith("http://") ||
      url.startsWith("https://")
    ) {
      return url;
    }

    const baseUrl =
      api.defaults.baseURL ||
      "http://localhost:8000";

    return `${baseUrl.replace(/\/$/, "")}/${url.replace(
      /^\//,
      ""
    )}`;
  };


  // ==========================================================
  // PROFILE INITIAL
  // ==========================================================

  const getInitial = () => {
    if (fullName) {
      return fullName
        .charAt(0)
        .toUpperCase();
    }

    return "U";
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Remove other commonly stored authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("user_id");

    setProfilePhoto("");
    setFullName("");
    setUnreadCount(0);

    navigate("/login");
  };


  return (
    <nav className="navbar">

      <div className="navbar-container">

        {/* ==================================================
            LOGO
        ================================================== */}

        <Link
          to="/"
          className="navbar-logo"
        >
          JOB <span>BOARD</span>
        </Link>


        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <div className="navbar-links">

          <Link
            to="/"
            className="navbar-link"
          >
            Find Jobs
          </Link>


          <Link
            to="/dashboard"
            className="navbar-link"
          >
            Dashboard
          </Link>


          {/* ==================================================
              APPLICANT NAVIGATION
          ================================================== */}

          {token &&
            role === "applicant" && (
              <>
                <Link
                  to="/applications"
                  className="navbar-link"
                >
                  Applications
                </Link>


                <Link
                  to="/interviews"
                  className="navbar-link"
                >
                  Interviews
                </Link>


                {/* ==========================================
                    NOTIFICATIONS
                ========================================== */}

                <Link
                  to="/notifications"
                  className="navbar-icon-link"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <span className="notification-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  </span>

                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </Link>


                {/* ==========================================
                    PROFILE
                ========================================== */}

                <Link
                  to="/profile"
                  className="navbar-profile"
                >
                  {profilePhoto ? (
                    <img
                      src={getFileUrl(
                        profilePhoto
                      )}
                      alt="Profile"
                      className="navbar-profile-photo"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <span className="navbar-profile-placeholder">
                      {getInitial()}
                    </span>
                  )}

                  <span className="navbar-profile-name">
                    {fullName || "Profile"}
                  </span>
                </Link>


                {/* ==========================================
                    LOGOUT
                ========================================== */}

                <button
                  type="button"
                  className="navbar-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            )}


          {/* ==================================================
              LOGGED OUT
          ================================================== */}

          {!token && (
            <>
              <Link
                to="/login"
                className="navbar-login"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-register"
              >
                Create account
              </Link>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}


export default Navbar;