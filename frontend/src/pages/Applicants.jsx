import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api";

import "./Applicants.css";


function Applicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "recruiter") {
      navigate("/dashboard");
      return;
    }

    fetchApplicants();
  }, [jobId, navigate]);


  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/applications/jobs/${jobId}/applicants`
      );

      setApplicants(response.data || []);

    } catch (err) {
      console.error(
        "Applicants error:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to load applicants."
      );

    } finally {
      setLoading(false);
    }
  };


  const updateStatus = async (
    applicationId,
    newStatus
  ) => {
    try {
      const response = await api.patch(
        `/applications/${applicationId}/status`,
        {
          status: newStatus,
        }
      );

      setApplicants((current) =>
        current.map((applicant) =>
          applicant.id === applicationId
            ? {
                ...applicant,
                status: response.data.status,
              }
            : applicant
        )
      );

    } catch (err) {
      alert(
        err.response?.data?.detail ||
          "Failed to update application."
      );
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


  if (loading) {
    return (
      <div className="applicants-page">
        <div className="applicants-container">
          Loading applicants...
        </div>
      </div>
    );
  }


  return (
    <div className="applicants-page">

      <div className="applicants-container">

        <div className="applicants-header">

          <div>

            <p className="section-label">
              RECRUITMENT
            </p>

            <h1>
              Applicants
            </h1>

            <p>
              Review candidates and manage their
              application status.
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
          <div className="applicants-error">
            {error}
          </div>
        )}


        {applicants.length === 0 ? (

          <div className="applicants-empty">

            <h2>
              No applicants yet
            </h2>

            <p>
              Applications for this job will appear
              here.
            </p>

          </div>

        ) : (

          <div className="applicants-list">

            {applicants.map((applicant) => (

              <article
                className="applicant-card"
                key={applicant.id}
              >

                <div className="applicant-header">

                  <div className="applicant-profile">

                    {applicant.profile_photo_url ? (

                      <img
                        src={getFileUrl(
                          applicant.profile_photo_url
                        )}
                        alt={
                          applicant.applicant_name ||
                          "Applicant"
                        }
                      />

                    ) : (

                      <div className="applicant-avatar">

                        {(
                          applicant.applicant_name ||
                          "A"
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                    )}

                    <div>

                      <h2>
                        {applicant.applicant_name ||
                          "Candidate"}
                      </h2>

                      <p>
                        {applicant.applicant_email}
                      </p>

                    </div>

                  </div>


                  <span
                    className={`applicant-status status-${applicant.status}`}
                  >
                    {applicant.status}
                  </span>

                </div>


                <div className="applicant-details">

                  {applicant.applicant_phone && (
                    <div>
                      <strong>
                        Phone
                      </strong>

                      <span>
                        {applicant.applicant_phone}
                      </span>
                    </div>
                  )}

                  <div>
                    <strong>
                      Applied
                    </strong>

                    <span>
                      {new Date(
                        applicant.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>

                </div>


                {applicant.resume_url && (
                  <a
                    href={getFileUrl(
                      applicant.resume_url
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-button"
                  >
                    View Resume
                  </a>
                )}


                <div className="applicant-actions">

                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        applicant.id,
                        "reviewing"
                      )
                    }
                  >
                    Review
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        applicant.id,
                        "shortlisted"
                      )
                    }
                  >
                    Shortlist
                  </button>


                  <button
                    type="button"
                    className="accept-button"
                    onClick={() =>
                      updateStatus(
                        applicant.id,
                        "accepted"
                      )
                    }
                  >
                    Accept
                  </button>


                  <button
                    type="button"
                    className="reject-button"
                    onClick={() =>
                      updateStatus(
                        applicant.id,
                        "rejected"
                      )
                    }
                  >
                    Reject
                  </button>


                  {/* =======================================
                      SCHEDULE INTERVIEW
                     ======================================= */}

                  {applicant.status === "shortlisted" && (

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/applications/${applicant.id}/interview`
                        )
                      }
                    >
                      Schedule Interview
                    </button>

                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}


export default Applicants;