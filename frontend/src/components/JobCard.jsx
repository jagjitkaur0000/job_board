import { Link } from "react-router-dom";

import "./JobCard.css";

function JobCard({ job, onApply }) {
  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) {
      return "Salary not specified";
    }

    const currency = job.salary_currency || "";

    if (job.salary_min && job.salary_max) {
      return `${currency} ${job.salary_min.toLocaleString()}–${job.salary_max.toLocaleString()}`;
    }

    if (job.salary_min) {
      return `From ${currency} ${job.salary_min.toLocaleString()}`;
    }

    return `Up to ${currency} ${job.salary_max.toLocaleString()}`;
  };

  const employmentType =
    job.employment_type
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const workMode =
    job.work_mode
      ?.replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <article className="job-card">
      <div className="job-card-main">
        <div className="job-card-info">
          <div className="job-card-heading">
            <div>
              <Link
                to={`/jobs/${job.id}`}
                className="job-title"
              >
                {job.title}
              </Link>

              <p className="company-name">
                {job.company?.name || "Company not specified"}
              </p>
            </div>

            {job.is_urgent && (
              <span className="urgent-badge">
                Urgent Hiring
              </span>
            )}
          </div>

          <div className="job-meta">
            <span>
              {job.location || "Location not specified"}
            </span>

            {job.work_mode && (
              <span>
                · {workMode}
              </span>
            )}
          </div>

          <div className="job-details">
            <span>{formatSalary()}</span>

            {job.experience_required && (
              <span>
                {job.experience_required}
              </span>
            )}
          </div>

          {job.description && (
            <p className="job-description">
              {job.description.length > 220
                ? `${job.description.substring(0, 220)}...`
                : job.description}
            </p>
          )}

          <div className="job-tags">
            {job.work_mode && (
              <span className="job-tag">
                {workMode}
              </span>
            )}

            {job.employment_type && (
              <span className="job-tag">
                {employmentType}
              </span>
            )}

            {job.is_urgent && (
              <span className="job-tag urgent">
                Urgent Hiring
              </span>
            )}
          </div>
        </div>

        <div className="job-actions">
          <Link
            to={`/jobs/${job.id}`}
            className="view-job-button"
          >
            View details
          </Link>

          <button
            className="apply-button"
            onClick={() => onApply(job.id)}
          >
            Apply now
          </button>
        </div>
      </div>
    </article>
  );
}

export default JobCard;