import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";

import "./MyInterviews.css";


function MyInterviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const token =
      localStorage.getItem("token");

    const role =
      localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "applicant") {
      navigate("/dashboard");
      return;
    }

    fetchInterviews();
  }, [navigate]);


  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/interviews/my");

      setInterviews(
        response.data || []
      );
    } catch (err) {
      console.error(
        "Interview error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load interviews."
      );
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Unknown";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };


  if (loading) {
    return (
      <div className="interviews-page">
        <div className="interviews-container">
          Loading interviews...
        </div>
      </div>
    );
  }


  return (
    <div className="interviews-page">
      <div className="interviews-container">

        <div className="interviews-header">
          <div>
            <p className="section-label">
              CANDIDATE
            </p>

            <h1>
              My Interviews
            </h1>

            <p>
              Your scheduled interviews
              and meeting details.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>
        </div>


        {error && (
          <div className="interviews-error">
            {error}
          </div>
        )}


        {interviews.length === 0 ? (
          <div className="interviews-empty">

            <h2>
              No interviews scheduled
            </h2>

            <p>
              When a recruiter schedules
              an interview, it will appear
              here.
            </p>

          </div>
        ) : (
          <div className="interviews-list">

            {interviews.map(
              (interview) => (
                <article
                  className="interview-card"
                  key={interview.id}
                >

                  <div className="interview-card-header">

                    <div>
                      <p className="interview-label">
                        INTERVIEW
                      </p>

                      <h2>
                        Interview #
                        {interview.id}
                      </h2>
                    </div>

                    <span className="interview-status">
                      {interview.status}
                    </span>

                  </div>


                  <div className="interview-details">

                    <div>
                      <strong>
                        Date & Time
                      </strong>

                      <span>
                        {formatDate(
                          interview.scheduled_at
                        )}
                      </span>
                    </div>


                    <div>
                      <strong>
                        Application
                      </strong>

                      <span>
                        #
                        {
                          interview.application_id
                        }
                      </span>
                    </div>

                  </div>


                  {interview.message && (
                    <div className="interview-message">

                      <strong>
                        Recruiter message
                      </strong>

                      <p>
                        {interview.message}
                      </p>

                    </div>
                  )}


                  {interview.meeting_link && (
                    <a
                      className="meeting-link"
                      href={
                        interview.meeting_link
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Interview
                    </a>
                  )}

                </article>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}


export default MyInterviews;