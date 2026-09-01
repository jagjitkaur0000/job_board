import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api";
import "./JobDetail.css";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err) {
        console.error("Job fetch error:", err);
        setError(
          err.response?.data?.detail ||
            "Job not found or no longer available."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    if (role !== "applicant") {
      alert("Only applicants can apply for jobs.");
      return;
    }

    try {
      await api.post(`/applications/jobs/${id}/apply`);
      alert("Applied successfully.");
    } catch (error) {
      console.error(
        "Apply error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.detail ||
          "Apply failed."
      );
    }
  };

  const formatEmploymentType = (value) => {
    if (!value) return "Not specified";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatWorkMode = (value) => {
    if (!value) return "Not specified";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatDate = (value) => {
    if (!value) return "Not specified";

    return new Date(value).toLocaleString();
  };

  const formatSalary = () => {
    if (
      job.salary_min == null &&
      job.salary_max == null
    ) {
      return "Not specified";
    }

    const currency = job.salary_currency || "INR";

    if (
      job.salary_min != null &&
      job.salary_max != null
    ) {
      return `${currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
    }

    if (job.salary_min != null) {
      return `${currency} ${job.salary_min.toLocaleString()}+`;
    }

    return `Up to ${currency} ${job.salary_max.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-container">
          <div className="job-detail-message">
            Loading job...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-page">
        <div className="job-detail-container">
          <div className="job-detail-error">
            {error}
          </div>

          <button
            type="button"
            className="job-detail-back-button"
            onClick={() => navigate("/")}
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <div className="job-detail-page">
      <div className="job-detail-container">
        <button
          type="button"
          className="job-detail-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Jobs
        </button>

        <div className="job-detail-header">
          <div className="job-detail-header-main">
            <div className="job-detail-company-icon">
              {job.company?.name
                ?.charAt(0)
                ?.toUpperCase() || "C"}
            </div>

            <div>
              <p className="job-detail-label">
                JOB OPPORTUNITY
              </p>

              <h1>{job.title}</h1>

              <p className="job-detail-company">
                {job.company?.name ||
                  "Company not specified"}
              </p>
            </div>
          </div>

          {job.is_urgent && (
            <span className="job-detail-urgent">
              Urgent Hiring
            </span>
          )}
        </div>

        <div className="job-detail-grid">
          <div className="job-detail-main-card">
            <div className="job-detail-section">
              <h2>Job Description</h2>

              <p className="job-detail-description">
                {job.description}
              </p>
            </div>

            <div className="job-detail-section">
              <h2>Job Information</h2>

              <div className="job-info-grid">
                <div className="job-info-item">
                  <span className="job-info-label">
                    Location
                  </span>

                  <span className="job-info-value">
                    {job.location ||
                      "Not specified"}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Employment Type
                  </span>

                  <span className="job-info-value">
                    {formatEmploymentType(
                      job.employment_type
                    )}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Work Mode
                  </span>

                  <span className="job-info-value">
                    {formatWorkMode(
                      job.work_mode
                    )}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Experience Required
                  </span>

                  <span className="job-info-value">
                    {job.experience_required ||
                      "Not specified"}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Salary
                  </span>

                  <span className="job-info-value">
                    {formatSalary()}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Preferred Gender
                  </span>

                  <span className="job-info-value">
                    {job.preferred_gender ||
                      "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="job-detail-section">
              <h2>Benefits</h2>

              <p className="job-detail-description">
                {job.benefits ||
                  "No benefits specified."}
              </p>
            </div>

            <div className="job-detail-section">
              <h2>Application & Contact Information</h2>

              <div className="job-contact-grid">
                <div className="job-contact-item">
                  <span className="job-info-label">
                    Contact Email
                  </span>

                  <span className="job-info-value">
                    {job.contact_email ||
                      "Not specified"}
                  </span>
                </div>

                <div className="job-contact-item">
                  <span className="job-info-label">
                    Contact Phone
                  </span>

                  <span className="job-info-value">
                    {job.contact_phone ||
                      "Not specified"}
                  </span>
                </div>
              </div>
            </div>

            <div className="job-detail-section">
              <h2>Posting Details</h2>

              <div className="job-info-grid">
                <div className="job-info-item">
                  <span className="job-info-label">
                    Posted
                  </span>

                  <span className="job-info-value">
                    {formatDate(job.created_at)}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Application Deadline
                  </span>

                  <span className="job-info-value">
                    {formatDate(job.expires_at)}
                  </span>
                </div>

                <div className="job-info-item">
                  <span className="job-info-label">
                    Job Status
                  </span>

                  <span className="job-info-value">
                    {job.is_active
                      ? "Active"
                      : "Closed"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="job-detail-sidebar">
            <div className="job-apply-card">
              <h2>Interested in this job?</h2>

              {role === "applicant" ? (
                <button
                  type="button"
                  className="job-apply-button"
                  onClick={handleApply}
                  disabled={!job.is_active}
                >
                  {job.is_active
                    ? "Apply for this Job"
                    : "Job Closed"}
                </button>
              ) : role === "recruiter" ? (
                <p className="job-sidebar-message">
                  Recruiter accounts cannot apply
                  for jobs.
                </p>
              ) : (
                <>
                  <p className="job-sidebar-message">
                    Login as an applicant to apply
                    for this job.
                  </p>

                  <button
                    type="button"
                    className="job-apply-button"
                    onClick={() =>
                      navigate("/login")
                    }
                  >
                    Login to Apply
                  </button>
                </>
              )}
            </div>

            <div className="job-company-card">
              <p className="job-detail-label">
                COMPANY
              </p>

              <h2>
                {job.company?.name ||
                  "Company"}
              </h2>

              <p>
                Company ID:{" "}
                {job.company_id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;