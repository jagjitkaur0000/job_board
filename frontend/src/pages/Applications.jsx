import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api";

import "./Applications.css";

function Applications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "applicant") {
      navigate("/dashboard");
      return;
    }

    fetchApplications();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        applicationsResponse,
        interviewsResponse,
      ] = await Promise.all([
        api.get("/applications"),
        api.get("/interviews/my"),
      ]);

      const applicationData =
        applicationsResponse.data || [];

      const interviewData =
        interviewsResponse.data || [];

      const applicationsWithInterviews =
        applicationData.map((application) => {
          const interview = interviewData.find(
            (item) =>
              item.application_id ===
              application.id
          );

          return {
            ...application,
            interview: interview || null,
          };
        });

      setApplications(
        applicationsWithInterviews
      );
    } catch (err) {
      console.error(
        "Applications error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (
    applicationId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to withdraw this application?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.patch(
        `/applications/${applicationId}/withdraw`
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId
            ? {
                ...application,
                status: "withdrawn",
              }
            : application
        )
      );
    } catch (err) {
      console.error(
        "Withdraw error:",
        err.response?.data || err
      );

      window.alert(
        err.response?.data?.detail ||
          "Failed to withdraw application."
      );
    }
  };

  const statusClass = (status) => {
    return `application-status status-${status}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
    ) {
      return "Unknown";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatInterviewDate = (date) => {
    if (!date) {
      return "Unknown";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(parsedDate.getTime())
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
      <div className="applications-page">
        <div className="applications-container">
          <p>
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="applications-container">

        <div className="applications-header">

          <div>
            <p className="section-label">
              CANDIDATE
            </p>

            <h1>
              My Applications
            </h1>

            <p>
              Track the status of every job
              you have applied for.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Browse Jobs
          </button>

        </div>

        {error && (
          <div className="applications-error">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="applications-empty">

            <h2>
              No applications yet
            </h2>

            <p>
              Apply to a job to start
              tracking your applications here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/")}
            >
              Browse Jobs
            </button>

          </div>
        ) : (
          <div className="applications-list">

            {applications.map(
              (application) => (
                <article
                  className="application-card"
                  key={application.id}
                >

                  <div className="application-card-top">

                    <div>
                      <p className="application-id">
                        APPLICATION #
                        {application.id}
                      </p>

                      <h2>
                        Job #
                        {application.job_id}
                      </h2>
                    </div>

                    <span
                      className={statusClass(
                        application.status
                      )}
                    >
                      {application.status}
                    </span>

                  </div>

                  <div className="application-meta">

                    <span>
                      Applied:{" "}
                      {formatDate(
                        application.created_at
                      )}
                    </span>

                  </div>

                  {application.interview && (
                    <div className="application-interview-info">

                      <strong>
                        Interview scheduled
                      </strong>

                      <span>
                        {formatInterviewDate(
                          application
                            .interview
                            .scheduled_at
                        )}
                      </span>

                      {application.interview
                        .meeting_link && (
                        <a
                          href={
                            application
                              .interview
                              .meeting_link
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Interview
                        </a>
                      )}

                      {application.interview
                        .message && (
                        <p>
                          {
                            application
                              .interview
                              .message
                          }
                        </p>
                      )}

                    </div>
                  )}

                  <div className="application-actions">

                    {application.interview && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            "/interviews"
                          )
                        }
                      >
                        View Interview
                      </button>
                    )}

                    {application.status !==
                      "withdrawn" &&
                      application.status !==
                        "rejected" &&
                      application.status !==
                        "hired" && (
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            withdrawApplication(
                              application.id
                            )
                          }
                        >
                          Withdraw
                        </button>
                      )}

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Applications;