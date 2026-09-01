
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [profilePhoto, setProfilePhoto] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);

  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [error, setError] = useState("");
  const [jobsError, setJobsError] = useState("");

  const role = localStorage.getItem("role");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role === "applicant") {
      fetchApplicantProfile();
    }

    if (role === "recruiter") {
      fetchCompany();
      fetchMyJobs();
    }
  }, [navigate, role]);

  const fetchApplicantProfile = async () => {
    try {
      const res = await api.get("/profile/me");

      setProfilePhoto(res.data?.profile_photo_url || "");
      setFullName(res.data?.full_name || "");
    } catch (err) {
      console.error(
        "Profile error:",
        err.response?.data || err
      );
    }
  };

  const fetchCompany = async () => {
    setLoadingCompany(true);
    setError("");

    try {
      const res = await api.get("/companies/me");

      if (res.data?.id) {
        setCompany(res.data);
      } else {
        setCompany(null);
      }
    } catch (err) {
      console.error(
        "Company fetch error:",
        err.response?.data || err
      );

      if (err.response?.status === 404) {
        setCompany(null);
      } else {
        setError(
          err.response?.data?.detail ||
            "Failed to load company"
        );
      }
    } finally {
      setLoadingCompany(false);
    }
  };

  const fetchMyJobs = async () => {
    setLoadingJobs(true);
    setJobsError("");

    try {
      const res = await api.get("/jobs/my");

      setJobs(res.data?.items || []);
    } catch (err) {
      console.error(
        "Jobs fetch error:",
        err.response?.data || err
      );

      setJobsError(
        err.response?.data?.detail ||
          "Failed to load your jobs"
      );
    } finally {
      setLoadingJobs(false);
    }
  };

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

    return `${baseUrl.replace(
      /\/$/,
      ""
    )}/${url.replace(/^\//, "")}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/login");
  };

  const getInitial = () => {
    if (fullName) {
      return fullName.charAt(0).toUpperCase();
    }

    return "U";
  };

  const handleDeleteJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);

      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) => job.id !== jobId
        )
      );
    } catch (err) {
      console.error(
        "Delete job error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to delete job"
      );
    }
  };

  const handleCloseJob = async (jobId) => {
    const confirmed = window.confirm(
      "Are you sure you want to close this job?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const res = await api.patch(
        `/jobs/${jobId}/close`
      );

      setJobs((currentJobs) =>
        currentJobs.map((job) =>
          job.id === jobId
            ? res.data
            : job
        )
      );
    } catch (err) {
      console.error(
        "Close job error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to close job"
      );
    }
  };

  const formatSalary = (job) => {
    if (
      job.salary_min === null &&
      job.salary_max === null
    ) {
      return null;
    }

    const currency =
      job.salary_currency || "";

    const min =
      job.salary_min !== null &&
      job.salary_min !== undefined
        ? Number(job.salary_min).toLocaleString()
        : "";

    const max =
      job.salary_max !== null &&
      job.salary_max !== undefined
        ? Number(job.salary_max).toLocaleString()
        : "";

    if (min && max) {
      return `${min} - ${max} ${currency}`;
    }

    if (min) {
      return `${min}+ ${currency}`;
    }

    return `Up to ${max} ${currency}`;
  };

  if (!localStorage.getItem("token")) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* ================= HEADER ================= */}

        <div className="dashboard-header">
          <div className="dashboard-header-content">

            {role === "applicant" &&
            profilePhoto ? (
              <img
                src={getFileUrl(profilePhoto)}
                alt="Profile"
                className="dashboard-profile-photo"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            ) : role === "applicant" ? (
              <div className="dashboard-profile-placeholder">
                {getInitial()}
              </div>
            ) : (
              <div className="dashboard-profile-placeholder recruiter-avatar">
                R
              </div>
            )}

            <div>
              <p className="dashboard-label">
                JOB BOARD
              </p>

              <h1>
                {role === "recruiter"
                  ? "Recruiter Dashboard"
                  : fullName
                  ? `Welcome, ${fullName}`
                  : "Candidate Dashboard"}
              </h1>

              <p>
                {role === "recruiter"
                  ? "Manage your company, jobs and applicants."
                  : "Manage your job search and account."}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* ================= RECRUITER ================= */}

        {role === "recruiter" && (
          <>
            {/* ================= COMPANY ================= */}

            <div className="dashboard-section">
              <div className="section-heading">
                <div>
                  <p className="section-label">
                    COMPANY
                  </p>

                  <h2>Your company</h2>
                </div>
              </div>

              {loadingCompany ? (
                <div className="dashboard-message">
                  Loading company...
                </div>
              ) : error ? (
                <div className="dashboard-message dashboard-message-error">
                  {error}
                </div>
              ) : company ? (
                <div className="company-card">
                  <div className="company-card-icon">
                    {company.name
                      ?.charAt(0)
                      ?.toUpperCase() || "C"}
                  </div>

                  <div className="company-card-content">
                    <h3>{company.name}</h3>

                    <p>
                      Company ID: {company.id}
                    </p>
                  </div>

                  <span className="company-status">
                    Active
                  </span>
                </div>
              ) : (
                <div className="no-company-card">
                  <div>
                    <h3>
                      No company created
                    </h3>

                    <p>
                      Create your company before
                      posting jobs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/company")
                    }
                  >
                    Create Company
                  </button>
                </div>
              )}
            </div>

            {/* ================= MY JOBS ================= */}

            <div className="dashboard-section my-jobs-section">
              <div className="my-jobs-header">
                <div className="my-jobs-header-text">
                  <p className="section-label">
                    MY JOBS
                  </p>

                  <h2>
                    Jobs published by you
                  </h2>

                  <p>
                    Manage your jobs and review
                    candidate applications.
                  </p>
                </div>

                {company && (
                  <button
                    type="button"
                    className="post-job-button"
                    onClick={() =>
                      navigate("/post-job")
                    }
                  >
                    <span className="button-plus">
                      +
                    </span>
                    Post New Job
                  </button>
                )}
              </div>

              {loadingJobs ? (
                <div className="my-jobs-loading">
                  <div className="loading-spinner"></div>

                  <p>
                    Loading your jobs...
                  </p>
                </div>
              ) : jobsError ? (
                <div className="dashboard-message dashboard-message-error">
                  {jobsError}
                </div>
              ) : jobs.length === 0 ? (
                <div className="my-jobs-empty">
                  <div className="empty-jobs-icon">
                    +
                  </div>

                  <h3>
                    No jobs published yet
                  </h3>

                  <p>
                    Create your first job posting
                    to start receiving applications.
                  </p>

                  {company && (
                    <button
                      type="button"
                      className="empty-post-button"
                      onClick={() =>
                        navigate("/post-job")
                      }
                    >
                      Create Your First Job
                    </button>
                  )}
                </div>
              ) : (
                <div className="my-jobs-list">
                  {jobs.map((job) => {
                    const salary =
                      formatSalary(job);

                    return (
                      <article
                        className="my-job-card"
                        key={job.id}
                      >
                        {/* CARD TOP */}

                        <div className="my-job-top">
                          <div className="my-job-title-area">
                            <div className="my-job-icon">
                              {job.title
                                ?.charAt(0)
                                ?.toUpperCase() || "J"}
                            </div>

                            <div>
                              <h3 className="my-job-title">
                                {job.title}
                              </h3>

                              <p className="my-job-company">
                                {company?.name ||
                                  "Your Company"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={
                              job.is_active
                                ? "my-job-status"
                                : "my-job-status closed"
                            }
                          >
                            <span className="status-dot"></span>

                            {job.is_active
                              ? "Active"
                              : "Closed"}
                          </span>
                        </div>

                        {/* JOB META */}

                        <div className="my-job-meta">
                          {job.location && (
                            <span className="my-job-tag location">
                              Location:{" "}
                              {job.location}
                            </span>
                          )}

                          {job.work_mode && (
                            <span className="my-job-tag">
                              {job.work_mode}
                            </span>
                          )}

                          {job.employment_type && (
                            <span className="my-job-tag">
                              {job.employment_type}
                            </span>
                          )}

                          {job.experience_required && (
                            <span className="my-job-tag">
                              {job.experience_required}
                            </span>
                          )}
                        </div>

                        {/* SALARY */}

                        {salary && (
                          <div className="my-job-salary">
                            <span className="salary-label">
                              Salary
                            </span>

                            <strong>
                              {salary}
                            </strong>
                          </div>
                        )}

                        {/* DESCRIPTION */}

                        {job.description && (
                          <p className="my-job-description">
                            {job.description}
                          </p>
                        )}

                        {/* EXTRA INFO */}

                        <div className="my-job-extra">
                          {job.is_urgent && (
                            <span className="urgent-badge">
                              URGENT
                            </span>
                          )}

                          {job.expires_at && (
                            <span className="expiry-text">
                              Expires:{" "}
                              {new Date(
                                job.expires_at
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* ACTIONS */}

                        <div className="my-job-footer">
                          <button
                            type="button"
                            className="my-job-button view"
                            onClick={() =>
                              navigate(
                                `/jobs/${job.id}`
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            type="button"
                            className="my-job-button edit"
                            onClick={() =>
                              navigate(
                                `/jobs/${job.id}/edit`
                              )
                            }
                          >
                            Edit Job
                          </button>

                          {/* NEW: APPLICANTS */}

                          <button
                            type="button"
                            className="my-job-button applicants"
                            onClick={() =>
                              navigate(
                                `/jobs/${job.id}/applicants`
                              )
                            }
                          >
                            Applicants
                          </button>

                          {job.is_active && (
                            <button
                              type="button"
                              className="my-job-button close"
                              onClick={() =>
                                handleCloseJob(
                                  job.id
                                )
                              }
                            >
                              Close
                            </button>
                          )}

                          <button
                            type="button"
                            className="my-job-button delete"
                            onClick={() =>
                              handleDeleteJob(
                                job.id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= RECRUITER TOOLS ================= */}

            <div className="dashboard-section">
              <p className="section-label">
                RECRUITER TOOLS
              </p>

              <h2>
                Manage your recruitment
              </h2>

              <div className="dashboard-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/company")
                  }
                >
                  <span className="action-title">
                    Company
                  </span>

                  <span className="action-description">
                    Create or manage your company
                    profile.
                  </span>
                </button>

                <button
                  type="button"
                  disabled={!company}
                  onClick={() =>
                    navigate("/post-job")
                  }
                >
                  <span className="action-title">
                    Post a Job
                  </span>

                  <span className="action-description">
                    Publish a new opportunity for
                    candidates.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/")
                  }
                >
                  <span className="action-title">
                    Browse Jobs
                  </span>

                  <span className="action-description">
                    View jobs currently published
                    on the platform.
                  </span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= APPLICANT ================= */}

        {role === "applicant" && (
          <div className="dashboard-section">
            <p className="section-label">
              CANDIDATE TOOLS
            </p>

            <h2>
              Manage your job search
            </h2>

            <div className="dashboard-actions">

              <button
                type="button"
                onClick={() =>
                  navigate("/profile")
                }
              >
                <span className="action-title">
                  My Profile
                </span>

                <span className="action-description">
                  Update your profile, resume and
                  photo.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
              >
                <span className="action-title">
                  Browse Jobs
                </span>

                <span className="action-description">
                  Search and apply for available
                  positions.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/applications")
                }
              >
                <span className="action-title">
                  My Applications
                </span>

                <span className="action-description">
                  Track submitted applications,
                  statuses and interviews.
                </span>
              </button>

              {/* Interview access through applications */}

              <button
                type="button"
                onClick={() =>
                  navigate("/applications")
                }
              >
                <span className="action-title">
                  Interviews
                </span>

                <span className="action-description">
                  View interviews for accepted
                  applications.
                </span>
              </button>

              {/* Notification entry point */}

              <button
                type="button"
                onClick={() =>
                  navigate("/applications")
                }
              >
                <span className="action-title">
                  Notifications
                </span>

                <span className="action-description">
                  Check application status updates
                  and recruitment activity.
                </span>
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
